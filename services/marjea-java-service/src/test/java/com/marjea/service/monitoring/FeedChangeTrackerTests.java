package com.marjea.service.monitoring;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;

class FeedChangeTrackerTests {

    private static final URI FEED = URI.create("https://feeds.example.gov/rss.xml");
    private static final Instant OBSERVED_AT = Instant.parse("2026-11-02T00:00:00Z");

    @Test
    void firstObservationCreatesBaselineWithoutReportingItemsAsNew() {
        FeedChangeTracker tracker = new FeedChangeTracker(10);

        FeedChangeTracker.ChangeSet result = tracker.observe(FEED, List.of(entry("/item/1")));

        assertTrue(result.baseline());
        assertTrue(result.newEntries().isEmpty());
    }

    @Test
    void reportsEachNewUrlOnce() {
        FeedChangeTracker tracker = new FeedChangeTracker(10);
        tracker.observe(FEED, List.of(entry("/item/1")));

        FeedChangeTracker.ChangeSet result = tracker.observe(
                FEED,
                List.of(entry("/item/1"), entry("/item/2"), entry("/item/2")));

        assertFalse(result.baseline());
        assertEquals(1, result.newEntries().size());
        assertEquals("/item/2", result.newEntries().getFirst().sourceUrl().getPath());
    }

    @Test
    void doesNotReportPreviouslySeenUrlAfterItDisappearsAndReturns() {
        FeedChangeTracker tracker = new FeedChangeTracker(10);
        tracker.observe(FEED, List.of(entry("/item/1")));
        tracker.observe(FEED, List.of());

        FeedChangeTracker.ChangeSet result = tracker.observe(FEED, List.of(entry("/item/1")));

        assertTrue(result.newEntries().isEmpty());
    }

    @Test
    void normalizesDotSegmentsBeforeComparingUrls() {
        FeedChangeTracker tracker = new FeedChangeTracker(10);
        tracker.observe(FEED, List.of(entry("/archive/../item/1")));

        FeedChangeTracker.ChangeSet result = tracker.observe(FEED, List.of(entry("/item/1")));

        assertTrue(result.newEntries().isEmpty());
    }

    @Test
    void ignoresEntriesWithoutUrls() {
        FeedChangeTracker tracker = new FeedChangeTracker(10);
        OfficialFeedReader.FeedEntry missingUrl =
                new OfficialFeedReader.FeedEntry("No link", null, OBSERVED_AT);

        FeedChangeTracker.ChangeSet result = tracker.observe(FEED, List.of(missingUrl));

        assertTrue(result.baseline());
        assertTrue(result.newEntries().isEmpty());
    }

    @Test
    void evictsOldestEntryWhenPerFeedLimitIsReached() {
        FeedChangeTracker tracker = new FeedChangeTracker(2);
        tracker.observe(FEED, List.of(entry("/item/1"), entry("/item/2")));
        tracker.observe(FEED, List.of(entry("/item/3")));

        FeedChangeTracker.ChangeSet result = tracker.observe(FEED, List.of(entry("/item/1")));

        assertEquals(1, result.newEntries().size());
        assertEquals("/item/1", result.newEntries().getFirst().sourceUrl().getPath());
    }

    @Test
    void rejectsNonPositiveTrackingLimit() {
        assertThrows(IllegalArgumentException.class, () -> new FeedChangeTracker(0));
    }

    @Test
    void keepsSeenItemsSeparatePerFeed() {
        FeedChangeTracker tracker = new FeedChangeTracker(10);
        URI anotherFeed = URI.create("https://other.example.gov/rss.xml");
        tracker.observe(FEED, List.of(entry("/item/1")));

        FeedChangeTracker.ChangeSet result = tracker.observe(
                anotherFeed,
                List.of(new OfficialFeedReader.FeedEntry(
                        "Same path",
                        URI.create("https://other.example.gov/item/1"),
                        OBSERVED_AT)));

        assertTrue(result.baseline());
        assertTrue(result.newEntries().isEmpty());
    }

    private static OfficialFeedReader.FeedEntry entry(String path) {
        return new OfficialFeedReader.FeedEntry(
                "Test item",
                URI.create("https://feeds.example.gov" + path),
                OBSERVED_AT);
    }
}
