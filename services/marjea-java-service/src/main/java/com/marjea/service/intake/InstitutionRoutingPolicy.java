package com.marjea.service.intake;

import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public final class InstitutionRoutingPolicy {

    public enum Source {
        PUBLIC_WHATSAPP,
        PUBLIC_TELEGRAM,
        PUBLIC_WEB,
        X_MONITOR,
        TELEGRAM_MONITOR,
        WEB_MONITOR,
        INSTITUTION_CHANNEL
    }

    public enum Status {
        ROUTE_TO_INSTITUTION,
        HOLD_FOR_TRIAGE
    }

    /**
     * These attributes must come from the trusted institution repository,
     * never from an intake request.
     */
    public record Institution(
            UUID id,
            boolean active,
            boolean legallyVerified) {
    }

    /**
     * Channel identity and verification must be established by a trusted
     * server-side integration before constructing this record.
     */
    public record Intake(
            Source source,
            UUID institutionIdFromVerifiedChannel,
            boolean channelVerified) {
    }

    public record Decision(
            Status status,
            UUID destinationInstitutionId,
            String reason) {
    }

    public Decision decide(Intake intake, Institution institution) {
        if (intake == null || intake.source() == null) {
            return hold("INVALID_INTAKE");
        }

        /*
         * Public reports and monitoring results require triage.
         * AI suggestions are not authorization.
         */
        if (intake.source() != Source.INSTITUTION_CHANNEL) {
            return hold("PUBLIC_REPORT_REQUIRES_TRIAGE");
        }

        /*
         * These values are meaningful only when populated by a trusted
         * server-side channel integration, never from a request body.
         */
        if (!intake.channelVerified()) {
            return hold("CHANNEL_NOT_VERIFIED");
        }

        UUID channelInstitutionId = intake.institutionIdFromVerifiedChannel();
        if (channelInstitutionId == null) {
            return hold("CHANNEL_HAS_NO_INSTITUTION");
        }

        if (institution == null || institution.id() == null) {
            return hold("INSTITUTION_NOT_FOUND");
        }

        if (!channelInstitutionId.equals(institution.id())) {
            return hold("INSTITUTION_MISMATCH");
        }

        if (!institution.active()) {
            return hold("INSTITUTION_INACTIVE");
        }

        if (!institution.legallyVerified()) {
            return hold("INSTITUTION_NOT_VERIFIED");
        }

        return new Decision(
                Status.ROUTE_TO_INSTITUTION,
                institution.id(),
                "VERIFIED_INSTITUTION_CHANNEL");
    }

    private Decision hold(String reason) {
        return new Decision(Status.HOLD_FOR_TRIAGE, null, reason);
    }
}
