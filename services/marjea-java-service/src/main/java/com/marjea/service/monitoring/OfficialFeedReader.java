package com.marjea.service.monitoring;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.ErrorHandler;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;

@Service
public final class OfficialFeedReader {

    static final int MAX_BYTES = 1_000_000;
    private static final int MAX_ITEMS = 500;
    private static final int MAX_URL_LENGTH = 2_048;
    private static final int MAX_TITLE_LENGTH = 2_000;

    private final HttpClient client;
    private final Set<String> approvedHosts;
    private final HostResolver hostResolver;

    @Autowired
    public OfficialFeedReader(OfficialFeedSettings settings) {
        this(
                HttpClient.newBuilder()
                        .followRedirects(HttpClient.Redirect.NEVER)
                        .connectTimeout(Duration.ofSeconds(5))
                        .build(),
                settings.approvedHosts(),
                InetAddress::getAllByName);
    }

    OfficialFeedReader(
            HttpClient client,
            Set<String> approvedHosts,
            HostResolver hostResolver) {
        this.client = client;
        this.approvedHosts = normalizeHosts(approvedHosts);
        this.hostResolver = hostResolver;
    }

    public record FeedEntry(
            String title,
            URI sourceUrl,
            Instant observedAt) {
    }

    @FunctionalInterface
    interface HostResolver {
        InetAddress[] resolve(String host) throws IOException;
    }

    public List<FeedEntry> fetch(URI feedUrl)
            throws IOException, InterruptedException, ParserConfigurationException, SAXException {
        URI safeUrl = validateFeedUrl(feedUrl);
        HttpRequest request = HttpRequest.newBuilder(safeUrl)
                .timeout(Duration.ofSeconds(10))
                .header("Accept", "application/rss+xml, application/atom+xml, application/xml, text/xml")
                .GET()
                .build();

        HttpResponse<InputStream> response = client.send(
                request,
                HttpResponse.BodyHandlers.ofInputStream());

        try (InputStream stream = response.body()) {
            if (response.statusCode() != 200) {
                throw new IllegalStateException("Feed request failed.");
            }
            if (!isXmlContentType(response)) {
                throw new IllegalStateException("Feed response is not an approved XML content type.");
            }

            byte[] data = stream.readNBytes(MAX_BYTES + 1);
            if (data.length > MAX_BYTES) {
                throw new IllegalStateException("Feed exceeds the maximum size.");
            }
            return parseFeed(data, Instant.now());
        }
    }

    URI validateFeedUrl(URI url) throws IOException {
        String host = validateUrlShape(url);
        if (!approvedHosts.contains(host)) {
            throw new SecurityException("Feed host is not approved.");
        }

        // This preflight blocks private-address resolutions. Production deployment
        // must also enforce outbound egress rules to prevent DNS rebinding.
        InetAddress[] addresses = hostResolver.resolve(host);
        if (addresses == null || addresses.length == 0) {
            throw new SecurityException("Feed host did not resolve to an approved address.");
        }
        for (InetAddress address : addresses) {
            if (!isPublicAddress(address)) {
                throw new SecurityException("Feed host resolved to a prohibited address.");
            }
        }
        return url;
    }

    List<FeedEntry> parseFeed(byte[] data, Instant observedAt)
            throws ParserConfigurationException, IOException, SAXException {
        DocumentBuilderFactory factory = secureDocumentBuilderFactory();
        var builder = factory.newDocumentBuilder();
        builder.setErrorHandler(new ErrorHandler() {
            @Override
            public void warning(SAXParseException exception) throws SAXException {
                throw exception;
            }

            @Override
            public void error(SAXParseException exception) throws SAXException {
                throw exception;
            }

            @Override
            public void fatalError(SAXParseException exception) throws SAXException {
                throw exception;
            }
        });

        Document document = builder.parse(new ByteArrayInputStream(data));
        Element root = document.getDocumentElement();
        String rootName = localName(root);
        boolean rss = "rss".equals(rootName) || "rdf".equals(rootName);
        boolean atom = "feed".equals(rootName);
        if (!rss && !atom) {
            throw new IllegalArgumentException("Unsupported feed document.");
        }

        List<Element> entries = descendants(root, rss ? "item" : "entry");
        if (entries.size() > MAX_ITEMS) {
            throw new IllegalStateException("Feed contains too many entries.");
        }

        List<FeedEntry> results = new ArrayList<>();
        for (Element entry : entries) {
            String title = directChildText(entry, "title");
            URI itemUrl = atom ? atomLink(entry) : rssLink(entry);
            if (title.isBlank()
                    || title.length() > MAX_TITLE_LENGTH
                    || itemUrl == null
                    || !isApprovedItemUrl(itemUrl)) {
                continue;
            }
            results.add(new FeedEntry(title, itemUrl, observedAt));
        }
        return List.copyOf(results);
    }

    private String validateUrlShape(URI url) {
        if (url == null || url.toString().length() > MAX_URL_LENGTH
                || !url.isAbsolute() || url.isOpaque()
                || !"https".equalsIgnoreCase(url.getScheme())
                || url.getHost() == null
                || url.getUserInfo() != null
                || url.getFragment() != null
                || (url.getPort() != -1 && url.getPort() != 443)) {
            throw new SecurityException("Feed URL is not permitted.");
        }
        try {
            return OfficialFeedSettings.normalizeHost(url.getHost());
        } catch (IllegalArgumentException exception) {
            throw new SecurityException("Feed URL host is not permitted.");
        }
    }

    private boolean isApprovedItemUrl(URI url) {
        try {
            String host = validateUrlShape(url);
            return approvedHosts.contains(host);
        } catch (SecurityException exception) {
            return false;
        }
    }

    private static boolean isXmlContentType(HttpResponse<?> response) {
        return response.headers()
                .firstValue("Content-Type")
                .map(value -> value.split(";", 2)[0].trim().toLowerCase(Locale.ROOT))
                .map(Set.of(
                        "application/rss+xml",
                        "application/atom+xml",
                        "application/xml",
                        "application/rdf+xml",
                        "text/xml")::contains)
                .orElse(false);
    }

    private static DocumentBuilderFactory secureDocumentBuilderFactory()
            throws ParserConfigurationException {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
        factory.setXIncludeAware(false);
        factory.setExpandEntityReferences(false);
        factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
        factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
        return factory;
    }

    private static List<Element> descendants(Element root, String expectedName) {
        NodeList nodes = root.getElementsByTagName("*");
        List<Element> results = new ArrayList<>();
        for (int index = 0; index < nodes.getLength(); index++) {
            Node node = nodes.item(index);
            if (node instanceof Element element && expectedName.equals(localName(element))) {
                results.add(element);
            }
        }
        return results;
    }

    private static String directChildText(Element parent, String expectedName) {
        NodeList children = parent.getChildNodes();
        for (int index = 0; index < children.getLength(); index++) {
            Node node = children.item(index);
            if (node instanceof Element element && expectedName.equals(localName(element))) {
                return element.getTextContent().trim();
            }
        }
        return "";
    }

    private URI rssLink(Element item) {
        String link = directChildText(item, "link");
        return parseItemUrl(link);
    }

    private URI atomLink(Element entry) {
        NodeList children = entry.getChildNodes();
        for (int index = 0; index < children.getLength(); index++) {
            Node node = children.item(index);
            if (!(node instanceof Element element) || !"link".equals(localName(element))) {
                continue;
            }
            String relation = element.getAttribute("rel");
            if (relation.isBlank() || "alternate".equalsIgnoreCase(relation)) {
                return parseItemUrl(element.getAttribute("href").trim());
            }
        }
        return null;
    }

    private static URI parseItemUrl(String value) {
        if (value.isBlank() || value.length() > MAX_URL_LENGTH) {
            return null;
        }
        try {
            return URI.create(value);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private static String localName(Element element) {
        String name = element.getLocalName();
        if (name == null) {
            name = element.getTagName();
        }
        int separator = name.indexOf(':');
        return (separator >= 0 ? name.substring(separator + 1) : name)
                .toLowerCase(Locale.ROOT);
    }

    private static Set<String> normalizeHosts(Set<String> hosts) {
        Set<String> normalized = new HashSet<>();
        for (String host : hosts) {
            normalized.add(OfficialFeedSettings.normalizeHost(host));
        }
        return Set.copyOf(normalized);
    }

    private static boolean isPublicAddress(InetAddress address) {
        if (address.isAnyLocalAddress()
                || address.isLoopbackAddress()
                || address.isLinkLocalAddress()
                || address.isSiteLocalAddress()
                || address.isMulticastAddress()) {
            return false;
        }

        byte[] bytes = address.getAddress();
        if (address instanceof Inet4Address) {
            int first = Byte.toUnsignedInt(bytes[0]);
            int second = Byte.toUnsignedInt(bytes[1]);
            int third = Byte.toUnsignedInt(bytes[2]);
            return first != 0
                    && first != 10
                    && first != 127
                    && first < 224
                    && !(first == 100 && second >= 64 && second <= 127)
                    && !(first == 169 && second == 254)
                    && !(first == 172 && second >= 16 && second <= 31)
                    && !(first == 192 && (second == 0 || second == 168))
                    && !(first == 192 && second == 88 && third == 99)
                    && !(first == 198 && (second == 18 || second == 19 || second == 51))
                    && !(first == 203 && second == 0 && third == 113);
        }

        if (address instanceof Inet6Address) {
            boolean globalUnicastRange = (bytes[0] & 0xe0) == 0x20;
            boolean documentationRange = bytes[0] == 0x20
                    && bytes[1] == 0x01
                    && bytes[2] == 0x0d
                    && bytes[3] == (byte) 0xb8;
            return globalUnicastRange && !documentationRange;
        }
        return false;
    }
}
