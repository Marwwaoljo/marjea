package com.marjea.service.monitoring;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import javax.xml.parsers.ParserConfigurationException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.xml.sax.SAXException;

@Service
public final class OfficialSourceRegistry {

    private final OfficialFeedReader feedReader;
    private final OfficialFeedSettings settings;

    @Autowired
    public OfficialSourceRegistry(
            OfficialFeedReader feedReader,
            OfficialFeedSettings settings) {
        this.feedReader = feedReader;
        this.settings = settings;
    }

    public List<URI> getApprovedFeeds() {
        return settings.approvedFeeds();
    }

    public List<OfficialFeedReader.FeedEntry> fetchApprovedFeed(URI feed)
            throws IOException, InterruptedException, ParserConfigurationException, SAXException {
        if (!settings.approvedFeeds().contains(feed)) {
            throw new SecurityException("Feed is not registered as an approved source.");
        }
        return feedReader.fetch(feed);
    }

    public List<OfficialFeedReader.FeedEntry> collectOnce()
            throws IOException, InterruptedException, ParserConfigurationException, SAXException {
        List<OfficialFeedReader.FeedEntry> results = new ArrayList<>();
        for (URI feed : settings.approvedFeeds()) {
            results.addAll(fetchApprovedFeed(feed));
        }
        return List.copyOf(results);
    }
}
