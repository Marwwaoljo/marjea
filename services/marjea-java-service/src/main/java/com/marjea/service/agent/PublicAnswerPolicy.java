package com.marjea.service.agent;

import java.net.URI;
import java.time.Instant;
import java.util.List;

public final class PublicAnswerPolicy {

    public record OfficialSource(
            String organization,
            String title,
            URI officialUrl,
            Instant publishedAt,
            boolean verified,
            boolean publicApproved) {
    }

    public record Subscriber(
            String name,
            boolean active,
            boolean publicationApproved) {
    }

    public record Answer(
            String status,
            String message,
            List<OfficialSource> sources) {
    }

    public List<String> publicSubscribers(List<Subscriber> subscribers) {
        return subscribers.stream()
                .filter(Subscriber::active)
                .filter(Subscriber::publicationApproved)
                .map(Subscriber::name)
                .toList();
    }

    public Answer officialStatement(List<OfficialSource> matches) {
        List<OfficialSource> trusted = matches.stream()
                .filter(OfficialSource::verified)
                .filter(OfficialSource::publicApproved)
                .filter(source -> source.officialUrl() != null
                        && "https".equalsIgnoreCase(
                                source.officialUrl().getScheme()))
                .toList();

        if (trusted.isEmpty()) {
            return new Answer(
                    "NOT_VERIFIED",
                    "لم أتمكن من التحقق من البيان",
                    List.of());
        }

        return new Answer(
                "SOURCES_FOUND",
                "وجدت مصادر موثقة مرتبطة بالاستفسار",
                trusted);
    }
}
