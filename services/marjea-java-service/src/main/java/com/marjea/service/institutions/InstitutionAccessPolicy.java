package com.marjea.service.institutions;

import java.util.Objects;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public final class InstitutionAccessPolicy {

    public enum Status {
        PENDING,
        VERIFIED,
        REJECTED,
        SUSPENDED
    }

    public enum Role {
        TENANT_ADMIN,
        REFERENCE_MANAGER,
        ANALYST,
        REVIEWER,
        AUDITOR
    }

    public enum Permission {
        READ,
        WRITE_REFERENCE,
        MANAGE_MEMBERS,
        REVIEW
    }

    public record Membership(
            UUID institutionId,
            String userId,
            Role role,
            boolean active) {
    }

    public void requireAccess(
            String authenticatedUserId,
            UUID requestedInstitutionId,
            UUID resourceInstitutionId,
            Status institutionStatus,
            Membership membership,
            Permission permission) {

        if (authenticatedUserId == null
                || authenticatedUserId.isBlank()
                || requestedInstitutionId == null
                || resourceInstitutionId == null
                || institutionStatus != Status.VERIFIED
                || membership == null
                || !membership.active()
                || !Objects.equals(membership.userId(), authenticatedUserId)
                || !Objects.equals(membership.institutionId(), requestedInstitutionId)
                || !Objects.equals(requestedInstitutionId, resourceInstitutionId)
                || !isRoleAllowed(membership.role(), permission)) {
            throw new AccessDeniedException("Access denied");
        }
    }

    private boolean isRoleAllowed(Role role, Permission permission) {
        if (role == null || permission == null) {
            return false;
        }

        return switch (permission) {
            case READ -> true;
            case WRITE_REFERENCE ->
                    role == Role.TENANT_ADMIN || role == Role.REFERENCE_MANAGER;
            case MANAGE_MEMBERS -> role == Role.TENANT_ADMIN;
            case REVIEW -> role == Role.REVIEWER;
        };
    }
}
