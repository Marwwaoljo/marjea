package com.marjea.service.monitoring;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.InetAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.jupiter.api.Test;

class OfficialFeedReaderTests {

    private static final URI APPROVED_URL = URI.create("https://feeds.example.gov/rss.xml");
    private static final Instant OBSERVED_AT = Instant.parse("2026-11-02T00:00:00Z");

    @Test
    void fetchesApprovedRssFeedAndReturnsOnlyApprovedHttpsItems() throws Exception {
        HttpClient client = mock(HttpClient.class);
        whenSend(client, response(200, "application/rss+xml; charset=utf-8", """
                <rss version="2.0">
                  <channel>
                    <item>
                      <title>Official notice</title>
                      <link>https://feeds.example.gov/notices/1</link>
                    </item>
                    <item>
                      <title>Unapproved link</title>
                      <link>https://outside.example.net/notices/2</link>
                    </item>
                  </channel>
                </rss>
                """));

        OfficialFeedReader reader = reader(client, "93.184.216.34");

        List<OfficialFeedReader.FeedEntry> entries = reader.fetch(APPROVED_URL);

        assertEquals(1, entries.size());
        assertEquals("Official notice", entries.getFirst().title());
        assertEquals(URI.create("https://feeds.example.gov/notices/1"), entries.getFirst().sourceUrl());
        assertTrue(entries.getFirst().observedAt() != null);
        verify(client).send(any(HttpRequest.class), any());
    }

    @Test
    void parsesNamespacedAtomFeed() throws Exception {
        OfficialFeedReader reader = reader(mock(HttpClient.class), "93.184.216.34");
        byte[] atom = """
                <feed xmlns="http://www.w3.org/2005/Atom">
                  <entry>
                    <title>Atom notice</title>
                    <link rel="alternate" href="https://feeds.example.gov/notices/atom-1"/>
                  </entry>
                </feed>
                """.getBytes(StandardCharsets.UTF_8);

        List<OfficialFeedReader.FeedEntry> entries = reader.parseFeed(atom, OBSERVED_AT);

        assertEquals(1, entries.size());
        assertEquals("Atom notice", entries.getFirst().title());
        assertEquals(URI.create("https://feeds.example.gov/notices/atom-1"), entries.getFirst().sourceUrl());
        assertEquals(OBSERVED_AT, entries.getFirst().observedAt());
    }

    @Test
    void rejectsUnapprovedHostWithoutMakingHttpRequest() throws Exception {
        HttpClient client = mock(HttpClient.class);
        OfficialFeedReader reader = reader(client, "93.184.216.34");

        assertThrows(
                SecurityException.class,
                () -> reader.fetch(URI.create("https://other.example.net/feed.xml")));

        verify(client, never()).send(any(HttpRequest.class), any());
    }

    @Test
    void rejectsHttpUserInfoAndNonstandardPortUrls() throws Exception {
        OfficialFeedReader reader = reader(mock(HttpClient.class), "93.184.216.34");

        assertThrows(SecurityException.class,
                () -> reader.validateFeedUrl(URI.create("http://feeds.example.gov/feed")));
        assertThrows(SecurityException.class,
                () -> reader.validateFeedUrl(URI.create("https://user@feeds.example.gov/feed")));
        assertThrows(SecurityException.class,
                () -> reader.validateFeedUrl(URI.create("https://feeds.example.gov:8443/feed")));
    }

    @Test
    void rejectsPrivateResolvedAddressBeforeSendingRequest() throws Exception {
        HttpClient client = mock(HttpClient.class);
        OfficialFeedReader reader = new OfficialFeedReader(
                client,
                Set.of("feeds.example.gov"),
                host -> new InetAddress[] { InetAddress.getByName("10.0.0.4") });

        assertThrows(SecurityException.class, () -> reader.fetch(APPROVED_URL));

        verify(client, never()).send(any(HttpRequest.class), any());
    }

    @Test
    void failsClosedWhenApprovedHostConfigurationIsEmpty() {
        OfficialFeedReader reader = new OfficialFeedReader(
                mock(HttpClient.class),
                Set.of(),
                host -> new InetAddress[] { InetAddress.getByName("93.184.216.34") });

        assertThrows(SecurityException.class, () -> reader.fetch(APPROVED_URL));
    }

    @Test
    void rejectsUnexpectedContentTypeAndRedirectResponses() throws Exception {
        HttpClient wrongTypeClient = mock(HttpClient.class);
        whenSend(wrongTypeClient, response(200, "text/html", "<html/>"));
        OfficialFeedReader wrongTypeReader = reader(wrongTypeClient, "93.184.216.34");
        assertThrows(IllegalStateException.class, () -> wrongTypeReader.fetch(APPROVED_URL));

        HttpClient redirectClient = mock(HttpClient.class);
        whenSend(redirectClient, response(302, "application/rss+xml", "<rss/>"));
        OfficialFeedReader redirectReader = reader(redirectClient, "93.184.216.34");
        assertThrows(IllegalStateException.class, () -> redirectReader.fetch(APPROVED_URL));
    }

    @Test
    void rejectsDoctypeAndExternalEntityDeclarations() throws Exception {
        OfficialFeedReader reader = reader(mock(HttpClient.class), "93.184.216.34");
        byte[] maliciousXml = """
                <!DOCTYPE rss [<!ENTITY external SYSTEM "file:///etc/passwd">]>
                <rss><channel><item><title>&external;</title>
                <link>https://feeds.example.gov/item</link></item></channel></rss>
                """.getBytes(StandardCharsets.UTF_8);

        assertThrows(Exception.class, () -> reader.parseFeed(maliciousXml, OBSERVED_AT));
    }

    @Test
    void rejectsOversizedFeedBodyBeforeParsing() throws Exception {
        HttpClient client = mock(HttpClient.class);
        whenSend(client, response(
                200,
                "application/xml",
                "<rss>" + "x".repeat(OfficialFeedReader.MAX_BYTES) + "</rss>"));
        OfficialFeedReader reader = reader(client, "93.184.216.34");

        assertThrows(IllegalStateException.class, () -> reader.fetch(APPROVED_URL));
    }

    private static OfficialFeedReader reader(HttpClient client, String resolvedAddress)
            throws Exception {
        return new OfficialFeedReader(
                client,
                Set.of("FEEDS.EXAMPLE.GOV"),
                host -> new InetAddress[] { InetAddress.getByName(resolvedAddress) });
    }

    @SuppressWarnings("unchecked")
    private static void whenSend(HttpClient client, HttpResponse<InputStream> response)
            throws Exception {
        when(client.send(
                any(HttpRequest.class),
                org.mockito.ArgumentMatchers.<HttpResponse.BodyHandler<InputStream>>any()))
                .thenReturn(response);
    }

    @SuppressWarnings("unchecked")
    private static HttpResponse<InputStream> response(
            int status,
            String contentType,
            String body) {
        HttpResponse<InputStream> response = mock(HttpResponse.class);
        when(response.statusCode()).thenReturn(status);
        when(response.headers()).thenReturn(HttpHeaders.of(
                Map.of("Content-Type", List.of(contentType)),
                (name, value) -> true));
        when(response.body()).thenReturn(new ByteArrayInputStream(body.getBytes(StandardCharsets.UTF_8)));
        return response;
    }
}
