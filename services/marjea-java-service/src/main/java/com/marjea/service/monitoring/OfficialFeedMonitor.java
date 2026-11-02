package com.marjea.service.monitoring;

import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicBoolean;

import javax.xml.parsers.ParserConfigurationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.xml.sax.SAXException;

@Service
@ConditionalOnProperty(
        name = "marjea.monitoring.enabled",
        havingValue = "true")
public final class OfficialFeedMonitor {

    private static final Logger log = LoggerFactory.getLogger(OfficialFeedMonitor.class);

    private final OfficialSourceRegistry registry;
    private final FeedChangeTracker tracker = new FeedChangeTracker(2_000);
    private final AtomicBoolean running = new AtomicBoolean(false);

    public OfficialFeedMonitor(OfficialSourceRegistry registry) {
        this.registry = registry;
    }

    public record PollSummary(
            int successfulFeeds,
            int failedFeeds,
            int newItems,
            boolean skippedBecauseAlreadyRunning) {
    }

    @Scheduled(
            initialDelayString = "${marjea.monitoring.initial-delay-ms:30000}",
            fixedDelayString = "${marjea.monitoring.fixed-delay-ms:900000}")
    public void runScheduled() {
        pollOnce();
    }

    public PollSummary pollOnce() {
        if (!running.compareAndSet(false, true)) {
            return new PollSummary(0, 0, 0, true);
        }

        try {
            List<URI> feeds = registry.getApprovedFeeds();
            if (feeds.isEmpty()) {
                log.info("MARJEA monitoring has no approved feeds");
                return new PollSummary(0, 0, 0, false);
            }

            int successful = 0;
            int failed = 0;
            int newItems = 0;
            for (URI feed : feeds) {
                String host = feed.getHost().toLowerCase(Locale.ROOT);
                try {
                    var entries = registry.fetchApprovedFeed(feed);
                    var changes = tracker.observe(feed, entries);
                    successful++;
                    if (changes.baseline()) {
                        log.info(
                                "MARJEA feed baseline created host={} entries={}",
                                host,
                                entries.size());
                    } else {
                        int additions = changes.newEntries().size();
                        newItems += additions;
                        log.info(
                                "MARJEA feed checked host={} new_entries={}",
                                host,
                                additions);
                    }
                } catch (IOException
                        | InterruptedException
                        | ParserConfigurationException
                        | SAXException
                        | RuntimeException error) {
                    failed++;
                    boolean interrupted = error instanceof InterruptedException;
                    if (interrupted) {
                        Thread.currentThread().interrupt();
                    }
                    log.warn(
                            "MARJEA feed check failed host={} type={}",
                            host,
                            error.getClass().getSimpleName());
                    if (interrupted) {
                        break;
                    }
                }
            }

            log.info(
                    "MARJEA monitoring cycle completed successful={} failed={} new_items={}",
                    successful,
                    failed,
                    newItems);
            return new PollSummary(successful, failed, newItems, false);
        } finally {
            running.set(false);
        }
    }
}
