package com.marjea.service.agent;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.net.URI;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.marjea.service.agent.PublicAnswerPolicy.OfficialSource;
import com.marjea.service.agent.PublicAnswerPolicy.Subscriber;

class PublicAnswerPolicyTests {

    private final PublicAnswerPolicy policy = new PublicAnswerPolicy();

    @Test
    void returnsOnlyActiveSubscribersWithPublicationApproval() {
        List<Subscriber> subscribers = List.of(
                new Subscriber("Approved Subscriber", true, true),
                new Subscriber("Inactive Subscriber", false, true),
                new Subscriber("Unapproved Subscriber", true, false),
                new Subscriber("Inactive And Unapproved", false, false));

        assertEquals(
                List.of("Approved Subscriber"),
                policy.publicSubscribers(subscribers));
    }

    @Test
    void returnsNoSubscribersForAnEmptyList() {
        assertEquals(List.of(), policy.publicSubscribers(List.of()));
    }

    @Test
    void returnsOnlyVerifiedPublicHttpsSources() {
        OfficialSource trusted = source(
                "Trusted Agency",
                URI.create("https://agency.gov.sa/statement"),
                true,
                true);
        List<OfficialSource> matches = List.of(
                trusted,
                source("Unverified", URI.create("https://agency.gov.sa/a"), false, true),
                source("Not Public", URI.create("https://agency.gov.sa/b"), true, false),
                source("Insecure Scheme", URI.create("http://agency.gov.sa/c"), true, true),
                source("No URL", null, true, true));

        PublicAnswerPolicy.Answer answer = policy.officialStatement(matches);

        assertEquals("SOURCES_FOUND", answer.status());
        assertEquals("وجدت مصادر موثقة مرتبطة بالاستفسار", answer.message());
        assertEquals(List.of(trusted), answer.sources());
    }

    @Test
    void returnsNotVerifiedAndNoSourcesWhenNothingMeetsPolicy() {
        PublicAnswerPolicy.Answer answer = policy.officialStatement(List.of(
                source("Unverified", URI.create("https://agency.gov.sa/a"), false, true),
                source("Unapproved", URI.create("https://agency.gov.sa/b"), true, false)));

        assertEquals("NOT_VERIFIED", answer.status());
        assertEquals("لم أتمكن من التحقق من البيان", answer.message());
        assertEquals(List.of(), answer.sources());
    }

    @Test
    void acceptsHttpsSchemeWithoutCaseSensitivity() {
        OfficialSource source = source(
                "Trusted Agency",
                URI.create("HTTPS://agency.gov.sa/statement"),
                true,
                true);

        assertEquals(
                List.of(source),
                policy.officialStatement(List.of(source)).sources());
    }

    private static OfficialSource source(
            String organization,
            URI officialUrl,
            boolean verified,
            boolean publicApproved) {
        return new OfficialSource(
                organization,
                "Public statement",
                officialUrl,
                Instant.parse("2026-11-02T00:00:00Z"),
                verified,
                publicApproved);
    }
}
