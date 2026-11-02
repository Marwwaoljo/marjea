package com.marjea.service.monitoring;

import java.net.IDN;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public final class OfficialFeedSettings {

    private static final int MAX_SOURCES = 30;
    private static final int MAX_CONFIG_LENGTH = 65_536;
    private static final int MAX_URL_LENGTH = 2_048;

    private final List<URI> approvedFeeds;
    private final Set<String> approvedHosts;

    public OfficialFeedSettings(
            @Value("${MARJEA_APPROVED_RSS_FEEDS:}") String configuredFeeds) {
        this.approvedFeeds = parseSources(configuredFeeds);
        Set<String> hosts = new HashSet<>();
        for (URI feed : approvedFeeds) {
            hosts.add(normalizeHost(feed.getHost()));
        }
        this.approvedHosts = Set.copyOf(hosts);
    }

    public List<URI> approvedFeeds() {
        return approvedFeeds;
    }

    public Set<String> approvedHosts() {
        return approvedHosts;
    }

    public static List<URI> parseSources(String configuredFeeds) {
        if (configuredFeeds == null || configuredFeeds.isBlank()) {
            return List.of();
        }
        if (configuredFeeds.length() > MAX_CONFIG_LENGTH) {
            throw new IllegalArgumentException("RSS source configuration is too large.");
        }

        String[] entries = configuredFeeds.split("[;\\r\\n]+");
        Map<String, URI> uniqueFeeds = new LinkedHashMap<>();
        for (String entry : entries) {
            String value = entry.trim();
            if (value.isEmpty()) {
                continue;
            }
            URI uri = validateSource(value);
            uniqueFeeds.putIfAbsent(canonicalKey(uri), uri);
            if (uniqueFeeds.size() > MAX_SOURCES) {
                throw new IllegalArgumentException("Too many RSS sources.");
            }
        }
        return List.copyOf(new ArrayList<>(uniqueFeeds.values()));
    }

    static String normalizeHost(String host) {
        if (host == null || host.isBlank() || host.contains(":")
                || host.matches("[0-9.]+")) {
            throw new IllegalArgumentException("A DNS hostname is required.");
        }
        String value = host.endsWith(".") ? host.substring(0, host.length() - 1) : host;
        String ascii = IDN.toASCII(value, IDN.USE_STD3_ASCII_RULES).toLowerCase(Locale.ROOT);
        if (ascii.length() > 253 || !ascii.contains(".")
                || ascii.equals("localhost")
                || ascii.endsWith(".localhost")
                || ascii.endsWith(".local")
                || ascii.endsWith(".internal")) {
            throw new IllegalArgumentException("Restricted RSS host.");
        }
        for (String label : ascii.split("\\.", -1)) {
            if (label.isEmpty() || label.length() > 63) {
                throw new IllegalArgumentException("Invalid RSS host.");
            }
        }
        return ascii;
    }

    private static URI validateSource(String value) {
        if (value.length() > MAX_URL_LENGTH) {
            throw new IllegalArgumentException("RSS source URL is too long.");
        }

        final URI uri;
        try {
            uri = URI.create(value).normalize();
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid RSS source URL.");
        }

        if (!"https".equalsIgnoreCase(uri.getScheme())
                || uri.getHost() == null
                || uri.getUserInfo() != null
                || uri.getFragment() != null
                || (uri.getPort() != -1 && uri.getPort() != 443)) {
            throw new IllegalArgumentException("Invalid RSS source URL.");
        }

        try {
            normalizeHost(uri.getHost());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Restricted RSS host.");
        }
        return uri;
    }

    private static String canonicalKey(URI uri) {
        String host = normalizeHost(uri.getHost());
        String port = uri.getPort() == -1 || uri.getPort() == 443
                ? ""
                : ":" + uri.getPort();
        String path = uri.getRawPath() == null ? "" : uri.getRawPath();
        String query = uri.getRawQuery() == null ? "" : "?" + uri.getRawQuery();
        return "https://" + host + port + path + query;
    }
}
