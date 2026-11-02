-- TEST DATABASE ONLY. This is not an operational migration.
-- Apply only to marjea_institution_test_20261102 through an authorized
-- schema-administration connection. Do not run against Development/Production.
BEGIN;

ALTER TABLE public.marjea_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marjea_institutions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.marjea_institution_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marjea_institution_memberships FORCE ROW LEVEL SECURITY;
ALTER TABLE public.marjea_institution_verification_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marjea_institution_verification_reviews FORCE ROW LEVEL SECURITY;

DO $policies$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='marjea_institutions'
      AND policyname='marjea_test_institution_tenant_scope'
  ) THEN
    CREATE POLICY marjea_test_institution_tenant_scope
      ON public.marjea_institutions FOR ALL
      USING (id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid)
      WITH CHECK (id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='marjea_institutions'
      AND policyname='marjea_test_institution_member_read'
  ) THEN
    CREATE POLICY marjea_test_institution_member_read
      ON public.marjea_institutions FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.marjea_institution_memberships m
        WHERE m.tenant_id = marjea_institutions.id
          AND m.clerk_user_id = NULLIF(current_setting('marjea.user_id', true), '')
          AND m.revoked_at IS NULL
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='marjea_institution_memberships'
      AND policyname='marjea_test_membership_tenant_scope'
  ) THEN
    CREATE POLICY marjea_test_membership_tenant_scope
      ON public.marjea_institution_memberships FOR ALL
      USING (tenant_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid)
      WITH CHECK (tenant_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='marjea_institution_memberships'
      AND policyname='marjea_test_membership_owner_read'
  ) THEN
    CREATE POLICY marjea_test_membership_owner_read
      ON public.marjea_institution_memberships FOR SELECT
      USING (
        clerk_user_id = NULLIF(current_setting('marjea.user_id', true), '')
        AND revoked_at IS NULL
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='marjea_institutions'
      AND policyname='marjea_test_platform_pending_read'
  ) THEN
    CREATE POLICY marjea_test_platform_pending_read
      ON public.marjea_institutions FOR SELECT
      USING (
        legal_verification_status = 'PENDING'
        AND current_setting('marjea.platform_review_access', true) = 'true'
      );
  END IF;
END
$policies$;

-- Preserve the existing tenant policy on the review log. Platform review
-- visibility remains enforced by the authenticated API allowlist.
-- Existing policy name: marjea_institution_verification_reviews_tenant_policy.
COMMIT;
