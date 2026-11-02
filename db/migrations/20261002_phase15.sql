ALTER TABLE marjea_institutions
  ADD COLUMN IF NOT EXISTS institution_type varchar(30),
  ADD COLUMN IF NOT EXISTS contact_name varchar(160),
  ADD COLUMN IF NOT EXISTS contact_email varchar(254),
  ADD COLUMN IF NOT EXISTS phone varchar(40),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE marjea_institutions ADD CONSTRAINT marjea_institution_type_check
  CHECK (institution_type IS NULL OR institution_type IN ('government','semi_government','enterprise','other'));

CREATE TABLE marjea_institution_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES marjea_institutions(id) ON DELETE CASCADE,
  plan_key varchar(30) NOT NULL,
  subscription_status varchar(30) NOT NULL DEFAULT 'requested',
  requested_by varchar(255) NOT NULL,
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marjea_subscription_plan_check CHECK (plan_key IN ('explore','institutional','partnership')),
  CONSTRAINT marjea_subscription_status_check CHECK (subscription_status IN ('requested','pilot','pending_contract','active','suspended','cancelled')),
  CONSTRAINT marjea_subscription_requester_membership_fk
    FOREIGN KEY (institution_id, requested_by) REFERENCES marjea_institution_memberships(tenant_id, clerk_user_id)
);
CREATE UNIQUE INDEX marjea_subscription_open_unique ON marjea_institution_subscriptions(institution_id)
  WHERE subscription_status <> 'cancelled';
CREATE INDEX marjea_subscription_institution_idx ON marjea_institution_subscriptions(institution_id);
ALTER TABLE marjea_institution_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY marjea_subscription_tenant_policy ON marjea_institution_subscriptions
  FOR ALL USING (institution_id = NULLIF(current_setting('marjea.tenant_id',true),'')::uuid)
  WITH CHECK (institution_id = NULLIF(current_setting('marjea.tenant_id',true),'')::uuid);

CREATE TABLE marjea_onboarding_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id varchar(255) NOT NULL,
  request_key uuid NOT NULL,
  request_hash text NOT NULL,
  institution_id uuid NOT NULL REFERENCES marjea_institutions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marjea_onboarding_user_key_unique UNIQUE (clerk_user_id, request_key),
  CONSTRAINT marjea_onboarding_creator_membership_fk
    FOREIGN KEY (institution_id, clerk_user_id) REFERENCES marjea_institution_memberships(tenant_id, clerk_user_id)
);