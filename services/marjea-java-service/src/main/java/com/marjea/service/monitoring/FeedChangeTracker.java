package com.marjea.service.monitoring;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

public final class FeedChangeTracker {

    private final int maxEntriesPerFeed;
    private final Map<URI, LinkedHashSet<URI>> seen = new HashMap<>();

    public FeedChangeTracker(int maxEntriesPerFeed) {
        if (maxEntriesPerFeed < 1) {
            throw new IllegalArgumentException("Invalid tracking limit.");
        }
        this.maxEntriesPerFeed = maxEntriesPerFeed;
    }

    public record ChangeSet(
            boolean baseline,
            List<OfficialFeedReader.FeedEntry> newEntries) {
    }

    public synchronized ChangeSet observe(
            URI feed,
            List<OfficialFeedReader.FeedEntry> entries) {
        boolean baseline = !seen.containsKey(feed);
        LinkedHashSet<URI> known = seen.computeIfAbsent(
                feed,
                ignored -> new LinkedHashSet<>());
        List<OfficialFeedReader.FeedEntry> fresh = new ArrayList<>();

        for (OfficialFeedReader.FeedEntry entry : entries) {
            if (entry == null || entry.sourceUrl() == null) {
                continue;
            }

            URI normalized = entry.sourceUrl().normalize();
            boolean firstObservation = known.add(normalized);
            if (firstObservation && !baseline) {
                fresh.add(entry);
            }

            while (known.size() > maxEntriesPerFeed) {
                Iterator<URI> iterator = known.iterator();
                iterator.next();
                iterator.remove();
            }
        }

        return new ChangeSet(baseline, List.copyOf(fresh));
    }
}
