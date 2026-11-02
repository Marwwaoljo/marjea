package com.marjea.service.institutions;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import com.marjea.service.institutions.InstitutionAccessPolicy.Membership;
import com.marjea.service.institutions.InstitutionAccessPolicy.Permission;
import com.marjea.service.institutions.InstitutionAccessPolicy.Role;
import com.marjea.service.institutions.InstitutionAccessPolicy.Status;

class InstitutionAccessPolicyTests {
    private static final String USER_ID = "user_test_123";

    private InstitutionAccessPolicy policy;
    private UUID institutionId;

    @BeforeEach
    void setUp() {
        policy = new InstitutionAccessPolicy();
        institutionId = UUID.randomUUID();
    }

    @Test
    void verifiedActiveTenantAdminCanWriteReferences() {
        assertDoesNotThrow(() -> policy.requireAccess(
                USER_ID,
                institutionId,
                institutionId,
                Status.VERIFIED,
                membership(Role.TENANT_ADMIN, true),
                Permission.WRITE_REFERENCE));
    }

    @Test
    void verifiedAnalystCanReadOwnInstitution() {
        assertDoesNotThrow(() -> policy.requireAccess(
                USER_ID,
                institutionId,
                institutionId,
                Status.VERIFIED,
                membership(Role.ANALYST, true),
                Permission.READ));
    }

    @Test
    void referenceManagerCanWriteReferencesButCannotManageMembers() {
        assertDoesNotThrow(() -> policy.requireAccess(
                USER_ID, institutionId, institutionId, Status.VERIFIED,
                membership(Role.REFERENCE_MANAGER, true), Permission.WRITE_REFERENCE));

        assertDenied(() -> policy.requireAccess(
                USER_ID, institutionId, institutionId, Status.VERIFIED,
                membership(Role.REFERENCE_MANAGER, true), Permission.MANAGE_MEMBERS));
    }

    @Test
    void onlyReviewerCanReview() {
        assertDoesNotThrow(() -> policy.requireAccess(
                USER_ID, institutionId, institutionId, Status.VERIFIED,
                membership(Role.REVIEWER, true), Permission.REVIEW));

        assertDenied(() -> policy.requireAccess(
                USER_ID, institutionId, institutionId, Status.VERIFIED,
                membership(Role.ANALYST, true), Permission.REVIEW));
    }

    @Test
    void analystCannotManageMembers() {
        assertDenied(() -> policy.requireAccess(
                USER_ID, institutionId, institutionId, Status.VERIFIED,
                membership(Role.ANALYST, true), Permission.MANAGE_MEMBERS));
    }

    @Test
    void rejectsUnverifiedInstitutionAndInactiveMembership() {
        assertDenied(() -> policy.requireAccess(
                USER_ID, institutionId, institutionId, Status.PENDING,
                membership(Role.TENANT_ADMIN, true), Permission.READ));

        assertDenied(() -> policy.requireAccess(
                USER_ID, institutionId, institutionId, Status.VERIFIED,
                membership(Role.TENANT_ADMIN, false), Permission.READ));
    }

    @Test
    void rejectsDifferentUserOrCrossInstitutionResource() {
        assertDenied(() -> policy.requireAccess(
                "another_user", institutionId, institutionId, Status.VERIFIED,
                membership(Role.TENANT_ADMIN, true), Permission.READ));

        assertDenied(() -> policy.requireAccess(
                USER_ID, institutionId, UUID.randomUUID(), Status.VERIFIED,
                membership(Role.TENANT_ADMIN, true), Permission.READ));
    }

    @Test
    void rejectsMissingIdentityMembershipAndPermission() {
        assertDenied(() -> policy.requireAccess(
                " ", institutionId, institutionId, Status.VERIFIED,
                membership(Role.TENANT_ADMIN, true), Permission.READ));

        assertDenied(() -> policy.requireAccess(
                USER_ID, institutionId, institutionId, Status.VERIFIED,
                null, Permission.READ));

        assertDenied(() -> policy.requireAccess(
                USER_ID, institutionId, institutionId, Status.VERIFIED,
                membership(Role.TENANT_ADMIN, true), null));
    }

    private Membership membership(Role role, boolean active) {
        return new Membership(institutionId, USER_ID, role, active);
    }

    private void assertDenied(Runnable action) {
        assertThrows(AccessDeniedException.class, action::run);
    }
}
