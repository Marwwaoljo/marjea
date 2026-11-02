package com.marjea.service.monitoring;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.net.URI;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;

class OfficialFeedMonitorTests {

    private static final URI FIRST_FEED = URI.create("https://first.example.gov/rss");
    private static final URI SECOND_FEED = URI.create("https://second.example.gov/rss");
    private static final Instant OBSERVED_AT = Instant.parse("2026-11-02T00:00:00Z");

    @Test
    void emptySourceListPerformsNoFetch() throws Exception {
        OfficialSourceRegistry registry = mock(OfficialSourceRegistry.class);
        when(registry.getApprovedFeeds()).thenReturn(List.of());
        OfficialFeedMonitor monitor = new OfficialFeedMonitor(registry);

        OfficialFeedMonitor.PollSummary result = monitor.pollOnce();

        assertEquals(0, result.successfulFeeds());
        assertEquals(0, result.failedFeeds());
        assertEquals(0, result.newItems());
        assertFalse(result.skippedBecauseAlreadyRunning());
    }

    @Test
    void createsBaselineThenReportsOnlyNewFeedItems() throws Exception {
        OfficialSourceRegistry registry = mock(OfficialSourceRegistry.class);
        OfficialFeedReader.FeedEntry existing = entry("https://first.example.gov/item/1");
        OfficialFeedReader.FeedEntry added = entry("https://first.example.gov/item/2");
        when(registry.getApprovedFeeds()).thenReturn(List.of(FIRST_FEED));
        when(registry.fetchApprovedFeed(FIRST_FEED))
                .thenReturn(List.of(existing))
                .thenReturn(List.of(existing, added));
        OfficialFeedMonitor monitor = new OfficialFeedMonitor(registry);

        OfficialFeedMonitor.PollSummary baseline = monitor.pollOnce();
        OfficialFeedMonitor.PollSummary nextPoll = monitor.pollOnce();

        assertEquals(1, baseline.successfulFeeds());
        assertEquals(0, baseline.newItems());
        assertEquals(1, nextPoll.successfulFeeds());
        assertEquals(1, nextPoll.newItems());
        assertFalse(nextPoll.skippedBecauseAlreadyRunning());
        verify(registry, org.mockito.Mockito.times(2)).fetchApprovedFeed(FIRST_FEED);
    }

    @Test
    void continuesPollingOtherSourcesWhenOneSourceFails() throws Exception {
        OfficialSourceRegistry registry = mock(OfficialSourceRegistry.class);
        when(registry.getApprovedFeeds()).thenReturn(List.of(FIRST_FEED, SECOND_FEED));
        when(registry.fetchApprovedFeed(FIRST_FEED)).thenThrow(new IOException("test failure"));
        when(registry.fetchApprovedFeed(SECOND_FEED)).thenReturn(
                List.of(entry("https://second.example.gov/item/1")));
        OfficialFeedMonitor monitor = new OfficialFeedMonitor(registry);

        OfficialFeedMonitor.PollSummary result = monitor.pollOnce();

        assertEquals(1, result.successfulFeeds());
        assertEquals(1, result.failedFeeds());
        assertEquals(0, result.newItems());
        verify(registry).fetchApprovedFeed(SECOND_FEED);
    }

    @Test
    void stopsPollingAndPreservesInterruptWhenARequestIsInterrupted() throws Exception {
        OfficialSourceRegistry registry = mock(OfficialSourceRegistry.class);
        when(registry.getApprovedFeeds()).thenReturn(List.of(FIRST_FEED, SECOND_FEED));
        when(registry.fetchApprovedFeed(FIRST_FEED))
                .thenThrow(new InterruptedException("test interruption"));
        OfficialFeedMonitor monitor = new OfficialFeedMonitor(registry);

        try {
            OfficialFeedMonitor.PollSummary result = monitor.pollOnce();

            assertEquals(0, result.successfulFeeds());
            assertEquals(1, result.failedFeeds());
            org.junit.jupiter.api.Assertions.assertTrue(Thread.currentThread().isInterrupted());
            verify(registry, org.mockito.Mockito.never()).fetchApprovedFeed(SECOND_FEED);
        } finally {
            Thread.interrupted();
        }
    }

    private static OfficialFeedReader.FeedEntry entry(String url) {
        return new OfficialFeedReader.FeedEntry(
                "Test item",
                URI.create(url),
                OBSERVED_AT);
    }
}
