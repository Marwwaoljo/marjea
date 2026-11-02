-- Additive, transaction-bound migration. Existing institutions receive PENDING;
-- no institution, user, membership, or existing record is deleted or promoted.
ALTER TABLE marjea_institutions
  ADD COLUMN legal_verification_status TEXT NOT NULL DEFAULT 'PENDING',
  ADD CONSTRAINT marjea_institution_legal_verification_status_check
    CHECK (legal_verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'));

ALTER TABLE marjea_institution_memberships
  ADD COLUMN revoked_at TIMESTAMPTZ;

CREATE TABLE marjea_institution_verification_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES marjea_institutions(id),
  reviewer_clerk_user_id VARCHAR(255) NOT NULL,
  previous_status TEXT NOT NULL CHECK (previous_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
  new_status TEXT NOT NULL CHECK (new_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX marjea_institution_verification_reviews_institution_idx
  ON marjea_institution_verification_reviews (institution_id, reviewed_at);

ALTER TABLE marjea_institution_verification_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE marjea_institution_verification_reviews FORCE ROW LEVEL SECURITY;
CREATE POLICY marjea_institution_verification_reviews_tenant_policy
  ON marjea_institution_verification_reviews
  FOR ALL
  USING (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid)
  WITH CHECK (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid);
