CREATE TABLE marjea_telegram_webhook_updates (
  update_id bigint PRIMARY KEY,
  received_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  outcome varchar(32) NOT NULL DEFAULT 'received',
  CONSTRAINT marjea_tg_update_outcome_check CHECK (outcome IN ('received','processed','ignored','failed'))
);
CREATE INDEX marjea_tg_update_received_idx ON marjea_telegram_webhook_updates(received_at);
ALTER TABLE marjea_telegram_webhook_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY marjea_tg_updates_service_policy ON marjea_telegram_webhook_updates
  USING (current_setting('marjea.telegram_service', true) = 'verified')
  WITH CHECK (current_setting('marjea.telegram_service', true) = 'verified');

CREATE TABLE marjea_telegram_chat_routes (
  chat_id bigint PRIMARY KEY,
  institution_id uuid NOT NULL REFERENCES marjea_institutions(id) ON DELETE CASCADE,
  consent_at timestamptz,
  consent_version varchar(40),
  flow_state varchar(32) NOT NULL DEFAULT 'idle',
  rate_window_started_at timestamptz NOT NULL DEFAULT now(),
  rate_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marjea_tg_flow_state_check CHECK (flow_state IN ('idle','awaiting_consent','awaiting_report')),
  CONSTRAINT marjea_tg_rate_count_check CHECK (rate_count >= 0)
);
CREATE INDEX marjea_tg_routes_institution_idx ON marjea_telegram_chat_routes(institution_id);
ALTER TABLE marjea_telegram_chat_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY marjea_tg_routes_service_policy ON marjea_telegram_chat_routes
  USING (current_setting('marjea.telegram_service', true) = 'verified')
  WITH CHECK (current_setting('marjea.telegram_service', true) = 'verified');

CREATE TABLE marjea_telegram_institution_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES marjea_institutions(id) ON DELETE CASCADE,
  generation integer NOT NULL DEFAULT 1,
  token_hash varchar(64) NOT NULL,
  created_by varchar(255) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  CONSTRAINT marjea_tg_link_tenant_unique UNIQUE (institution_id),
  CONSTRAINT marjea_tg_link_hash_unique UNIQUE (token_hash),
  CONSTRAINT marjea_tg_link_generation_check CHECK (generation >= 1),
  CONSTRAINT marjea_tg_link_creator_fk FOREIGN KEY (institution_id, created_by)
    REFERENCES marjea_institution_memberships(tenant_id, clerk_user_id)
);
ALTER TABLE marjea_telegram_institution_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY marjea_tg_link_tenant_policy ON marjea_telegram_institution_links
  USING (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid)
  WITH CHECK (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid);

CREATE TABLE marjea_telegram_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES marjea_institutions(id) ON DELETE CASCADE,
  update_id bigint NOT NULL,
  chat_id bigint NOT NULL,
  report_text text NOT NULL,
  source_url text,
  consent_at timestamptz NOT NULL,
  consent_version varchar(40) NOT NULL,
  status varchar(24) NOT NULL DEFAULT 'new',
  reviewed_by varchar(255),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marjea_tg_report_update_unique UNIQUE (update_id),
  CONSTRAINT marjea_tg_report_text_check CHECK (length(trim(report_text)) BETWEEN 1 AND 4000),
  CONSTRAINT marjea_tg_report_status_check CHECK (status IN ('new','reviewed','accepted','rejected')),
  CONSTRAINT marjea_tg_report_reviewer_fk FOREIGN KEY (institution_id, reviewed_by)
    REFERENCES marjea_institution_memberships(tenant_id, clerk_user_id)
);
CREATE INDEX marjea_tg_report_inbox_idx ON marjea_telegram_reports(institution_id,status,created_at);
CREATE INDEX marjea_tg_report_owner_idx ON marjea_telegram_reports(institution_id,chat_id,created_at);
ALTER TABLE marjea_telegram_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY marjea_tg_report_tenant_policy ON marjea_telegram_reports
  USING (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid)
  WITH CHECK (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid);
