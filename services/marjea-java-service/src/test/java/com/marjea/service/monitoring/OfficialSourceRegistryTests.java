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

class OfficialSourceRegistryTests {

    @Test
    void acceptsWellFormedHttpsFeedConfiguration() {
        var feeds = OfficialFeedSettings.parseSources("https://example.org/rss");

        assertEquals(1, feeds.size());
    }

    @Test
    void rejectsHttpSourceConfiguration() {
        assertThrows(
                IllegalArgumentException.class,
                () -> OfficialFeedSettings.parseSources("http://example.org/rss"));
    }

    @Test
    void rejectsLocalhostSourceConfiguration() {
        assertThrows(
                IllegalArgumentException.class,
                () -> OfficialFeedSettings.parseSources("https://localhost/rss"));
    }

    @Test
    void rejectsDuplicateSourceConfiguration() {
        var feeds = OfficialFeedSettings.parseSources(
                "https://example.org/rss;https://example.org/rss");

        assertEquals(1, feeds.size());
    }

    @Test
    void emptyConfigurationHasNoSources() {
        var feeds = OfficialFeedSettings.parseSources("");

        assertTrue(feeds.isEmpty());
    }

    @Test
    void rejectsFeedUrlThatWasNotRegistered() throws Exception {
        HttpClient client = mock(HttpClient.class);
        OfficialFeedSettings settings = new OfficialFeedSettings(
                "https://feeds.example.gov/rss.xml");
        OfficialFeedReader reader = reader(client, settings);
        OfficialSourceRegistry registry = new OfficialSourceRegistry(reader, settings);

        assertThrows(
                SecurityException.class,
                () -> registry.fetchApprovedFeed(
                        URI.create("https://feeds.example.gov/unregistered.xml")));
        verify(client, never()).send(any(HttpRequest.class), any());
    }

    @Test
    void emptyConfigurationDoesNotMakeNetworkRequests() throws Exception {
        HttpClient client = mock(HttpClient.class);
        OfficialFeedSettings settings = new OfficialFeedSettings("");
        OfficialFeedReader reader = reader(client, settings);
        OfficialSourceRegistry registry = new OfficialSourceRegistry(reader, settings);

        assertEquals(List.of(), registry.collectOnce());
        verify(client, never()).send(any(HttpRequest.class), any());
    }

    @Test
    @SuppressWarnings("unchecked")
    void collectsOnlyConfiguredFeedThroughSharedAllowlist() throws Exception {
        String xml = """
                <rss version="2.0">
                  <channel>
                    <item>
                      <title>Approved item</title>
                      <link>https://feeds.example.gov/notices/1</link>
                    </item>
                  </channel>
                </rss>
                """;
        HttpClient client = mock(HttpClient.class);
        HttpResponse<InputStream> response = mock(HttpResponse.class);
        when(response.statusCode()).thenReturn(200);
        when(response.headers()).thenReturn(HttpHeaders.of(
                Map.of("Content-Type", List.of("application/rss+xml")),
                (name, value) -> true));
        when(response.body()).thenReturn(
                new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));
        when(client.send(
                any(HttpRequest.class),
                org.mockito.ArgumentMatchers.<HttpResponse.BodyHandler<InputStream>>any()))
                .thenReturn(response);

        OfficialFeedSettings settings = new OfficialFeedSettings(
                "https://feeds.example.gov/rss.xml");
        OfficialFeedReader reader = reader(client, settings);
        OfficialSourceRegistry registry = new OfficialSourceRegistry(reader, settings);

        List<OfficialFeedReader.FeedEntry> entries = registry.collectOnce();

        assertEquals(1, entries.size());
        assertEquals("Approved item", entries.getFirst().title());
        assertEquals(
                URI.create("https://feeds.example.gov/notices/1"),
                entries.getFirst().sourceUrl());
        verify(client).send(any(HttpRequest.class), any());
    }

    private static OfficialFeedReader reader(HttpClient client, OfficialFeedSettings settings)
            throws Exception {
        return new OfficialFeedReader(
                client,
                settings.approvedHosts(),
                host -> new InetAddress[] { InetAddress.getByName("93.184.216.34") });
    }
}
