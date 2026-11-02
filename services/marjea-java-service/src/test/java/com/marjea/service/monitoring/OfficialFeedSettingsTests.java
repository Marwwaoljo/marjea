package com.marjea.service.monitoring;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.util.Set;
import java.util.stream.IntStream;

import org.junit.jupiter.api.Test;

class OfficialFeedSettingsTests {

    @Test
    void emptyConfigurationDisablesAllFeeds() {
        OfficialFeedSettings settings = new OfficialFeedSettings("");

        assertTrue(settings.approvedFeeds().isEmpty());
        assertTrue(settings.approvedHosts().isEmpty());
    }

    @Test
    void normalizesHostsAndDeduplicatesEquivalentFeedUrls() {
        OfficialFeedSettings settings = new OfficialFeedSettings(
                "https://FEEDS.EXAMPLE.GOV/rss.xml;\nhttps://feeds.example.gov/rss.xml");

        assertEquals(1, settings.approvedFeeds().size());
        assertEquals(Set.of("feeds.example.gov"), settings.approvedHosts());
    }

    @Test
    void permitsOnlyHttpsWithNoCredentialsFragmentOrNonstandardPort() {
        assertThrows(IllegalArgumentException.class,
                () -> OfficialFeedSettings.parseSources("http://feeds.example.gov/rss"));
        assertThrows(IllegalArgumentException.class,
                () -> OfficialFeedSettings.parseSources("https://user@feeds.example.gov/rss"));
        assertThrows(IllegalArgumentException.class,
                () -> OfficialFeedSettings.parseSources("https://feeds.example.gov/rss#part"));
        assertThrows(IllegalArgumentException.class,
                () -> OfficialFeedSettings.parseSources("https://feeds.example.gov:8443/rss"));
    }

    @Test
    void rejectsLocalAndIpLiteralHosts() {
        assertThrows(IllegalArgumentException.class,
                () -> OfficialFeedSettings.parseSources("https://localhost/rss"));
        assertThrows(IllegalArgumentException.class,
                () -> OfficialFeedSettings.parseSources("https://internal.example.local/rss"));
        assertThrows(IllegalArgumentException.class,
                () -> OfficialFeedSettings.parseSources("https://127.0.0.1/rss"));
    }

    @Test
    void rejectsInvalidAndOverlongSourceUrls() {
        assertThrows(IllegalArgumentException.class,
                () -> OfficialFeedSettings.parseSources("not a URL"));
        assertThrows(IllegalArgumentException.class,
                () -> OfficialFeedSettings.parseSources(
                        "https://feeds.example.gov/" + "x".repeat(2_048)));
    }

    @Test
    void limitsConfiguredFeedCount() {
        String sources = IntStream.range(0, 31)
                .mapToObj(index -> "https://feed" + index + ".example.gov/rss")
                .collect(java.util.stream.Collectors.joining(";"));

        assertThrows(IllegalArgumentException.class,
                () -> OfficialFeedSettings.parseSources(sources));
    }

    @Test
    void returnsImmutableCanonicalSourceList() {
        OfficialFeedSettings settings = new OfficialFeedSettings(
                "https://feeds.example.gov/rss/../current");

        assertEquals(
                URI.create("https://feeds.example.gov/current"),
                settings.approvedFeeds().getFirst());
        assertThrows(UnsupportedOperationException.class,
                () -> settings.approvedFeeds().add(URI.create("https://other.example.gov/rss")));
    }
}
