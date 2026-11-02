package com.marjea.service.intake;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.UUID;

import org.junit.jupiter.api.Test;

class InstitutionRoutingPolicyTests {

    private static final UUID INSTITUTION_ID =
            UUID.fromString("00000000-0000-4000-8000-000000000101");

    private final InstitutionRoutingPolicy policy = new InstitutionRoutingPolicy();

    @Test
    void publicReportsAndMonitoringSourcesAlwaysGoToTriage() {
        for (InstitutionRoutingPolicy.Source source : InstitutionRoutingPolicy.Source.values()) {
            if (source == InstitutionRoutingPolicy.Source.INSTITUTION_CHANNEL) {
                continue;
            }

            var decision = policy.decide(
                    new InstitutionRoutingPolicy.Intake(source, INSTITUTION_ID, true),
                    verifiedInstitution());

            assertHeld(decision, "PUBLIC_REPORT_REQUIRES_TRIAGE");
        }
    }

    @Test
    void nullIntakeOrSourceIsHeld() {
        assertHeld(policy.decide(null, verifiedInstitution()), "INVALID_INTAKE");
        assertHeld(
                policy.decide(
                        new InstitutionRoutingPolicy.Intake(null, INSTITUTION_ID, true),
                        verifiedInstitution()),
                "INVALID_INTAKE");
    }

    @Test
    void unverifiedInstitutionChannelIsHeld() {
        var decision = policy.decide(
                new InstitutionRoutingPolicy.Intake(
                        InstitutionRoutingPolicy.Source.INSTITUTION_CHANNEL,
                        INSTITUTION_ID,
                        false),
                verifiedInstitution());

        assertHeld(decision, "CHANNEL_NOT_VERIFIED");
    }

    @Test
    void verifiedChannelWithoutInstitutionIdIsHeld() {
        var decision = policy.decide(
                new InstitutionRoutingPolicy.Intake(
                        InstitutionRoutingPolicy.Source.INSTITUTION_CHANNEL,
                        null,
                        true),
                verifiedInstitution());

        assertHeld(decision, "CHANNEL_HAS_NO_INSTITUTION");
    }

    @Test
    void missingOrMismatchedInstitutionIsHeld() {
        var intake = verifiedIntake(INSTITUTION_ID);

        assertHeld(policy.decide(intake, null), "INSTITUTION_NOT_FOUND");
        assertHeld(
                policy.decide(
                        intake,
                        new InstitutionRoutingPolicy.Institution(
                                UUID.fromString("00000000-0000-4000-8000-000000000102"),
                                true,
                                true)),
                "INSTITUTION_MISMATCH");
        assertHeld(
                policy.decide(
                        intake,
                        new InstitutionRoutingPolicy.Institution(null, true, true)),
                "INSTITUTION_NOT_FOUND");
    }

    @Test
    void inactiveOrUnverifiedInstitutionIsHeld() {
        var intake = verifiedIntake(INSTITUTION_ID);

        assertHeld(
                policy.decide(
                        intake,
                        new InstitutionRoutingPolicy.Institution(INSTITUTION_ID, false, true)),
                "INSTITUTION_INACTIVE");
        assertHeld(
                policy.decide(
                        intake,
                        new InstitutionRoutingPolicy.Institution(INSTITUTION_ID, true, false)),
                "INSTITUTION_NOT_VERIFIED");
    }

    @Test
    void verifiedActiveInstitutionChannelRoutesToItsInstitution() {
        var decision = policy.decide(verifiedIntake(INSTITUTION_ID), verifiedInstitution());

        assertEquals(
                InstitutionRoutingPolicy.Status.ROUTE_TO_INSTITUTION,
                decision.status());
        assertEquals(INSTITUTION_ID, decision.destinationInstitutionId());
        assertEquals("VERIFIED_INSTITUTION_CHANNEL", decision.reason());
    }

    private static InstitutionRoutingPolicy.Intake verifiedIntake(UUID institutionId) {
        return new InstitutionRoutingPolicy.Intake(
                InstitutionRoutingPolicy.Source.INSTITUTION_CHANNEL,
                institutionId,
                true);
    }

    private static InstitutionRoutingPolicy.Institution verifiedInstitution() {
        return new InstitutionRoutingPolicy.Institution(INSTITUTION_ID, true, true);
    }

    private static void assertHeld(
            InstitutionRoutingPolicy.Decision decision,
            String expectedReason) {
        assertEquals(InstitutionRoutingPolicy.Status.HOLD_FOR_TRIAGE, decision.status());
        assertNull(decision.destinationInstitutionId());
        assertEquals(expectedReason, decision.reason());
    }
}
