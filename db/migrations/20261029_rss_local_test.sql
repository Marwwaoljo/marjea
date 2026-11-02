ALTER TYPE marjea_monitor_adapter_kind ADD VALUE IF NOT EXISTS 'rss_local_test';
ALTER TYPE marjea_capture_mode ADD VALUE IF NOT EXISTS 'rss_local_test';

CREATE TABLE marjea_monitor_source_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES marjea_institutions(id) ON DELETE CASCADE,
  source_id uuid NOT NULL,
  item_key varchar(128) NOT NULL,
  item_url text,
  published_at timestamptz,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  content_hash varchar(64) NOT NULL,
  observed_content_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marjea_source_item_tenant_source_key_unique
    UNIQUE (tenant_id, source_id, item_key),
  CONSTRAINT marjea_source_item_source_fk
    FOREIGN KEY (tenant_id, source_id)
    REFERENCES marjea_monitor_sources(tenant_id, id) ON DELETE CASCADE,
  CONSTRAINT marjea_source_item_observation_fk
    FOREIGN KEY (tenant_id, observed_content_id)
    REFERENCES marjea_observed_content(tenant_id, id) ON DELETE RESTRICT
);

ALTER TABLE marjea_monitor_source_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE marjea_monitor_source_items FORCE ROW LEVEL SECURITY;
CREATE POLICY marjea_source_item_tenant_policy ON marjea_monitor_source_items
  USING (tenant_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid);
CREATE INDEX marjea_source_item_observation_idx
  ON marjea_monitor_source_items (tenant_id, observed_content_id);
