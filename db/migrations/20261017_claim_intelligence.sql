-- Additive tenant-scoped claim intelligence. This migration is source only;
-- it must be applied through the approved development migration workflow.
CREATE TABLE marjea_claim_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES marjea_institutions(id) ON DELETE CASCADE,
  title varchar(180) NOT NULL,
  normalized_key varchar(200) NOT NULL,
  created_by varchar(255) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT marjea_claim_topic_tenant_id_unique UNIQUE (institution_id,id),
  CONSTRAINT marjea_claim_topic_key_unique UNIQUE (institution_id,normalized_key),
  CONSTRAINT marjea_claim_topic_title_check CHECK (length(trim(title)) BETWEEN 1 AND 180),
  CONSTRAINT marjea_claim_topic_creator_fk FOREIGN KEY (institution_id,created_by)
    REFERENCES marjea_institution_memberships(tenant_id,clerk_user_id)
);
CREATE INDEX marjea_claim_topic_created_idx ON marjea_claim_topics(institution_id,created_at);

CREATE TABLE marjea_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES marjea_institutions(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL,
  canonical_text text NOT NULL,
  created_by varchar(255) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT marjea_claim_tenant_id_unique UNIQUE (institution_id,id),
  CONSTRAINT marjea_claim_text_check CHECK (length(trim(canonical_text)) BETWEEN 1 AND 4000),
  CONSTRAINT marjea_claim_topic_fk FOREIGN KEY (institution_id,topic_id)
    REFERENCES marjea_claim_topics(institution_id,id),
  CONSTRAINT marjea_claim_creator_fk FOREIGN KEY (institution_id,created_by)
    REFERENCES marjea_institution_memberships(tenant_id,clerk_user_id)
);
CREATE INDEX marjea_claim_topic_idx ON marjea_claims(institution_id,topic_id,created_at);

CREATE TABLE marjea_claim_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES marjea_institutions(id) ON DELETE CASCADE,
  claim_id uuid NOT NULL,
  variant_text text NOT NULL,
  language varchar(12) NOT NULL DEFAULT 'ar',
  created_by varchar(255) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT marjea_claim_variant_tenant_id_unique UNIQUE (institution_id,id),
  CONSTRAINT marjea_claim_variant_text_unique UNIQUE (institution_id,claim_id,variant_text),
  CONSTRAINT marjea_claim_variant_text_check CHECK (length(trim(variant_text)) BETWEEN 1 AND 4000),
  CONSTRAINT marjea_claim_variant_language_check CHECK (language IN ('ar','en','und')),
  CONSTRAINT marjea_claim_variant_claim_fk FOREIGN KEY (institution_id,claim_id)
    REFERENCES marjea_claims(institution_id,id),
  CONSTRAINT marjea_claim_variant_creator_fk FOREIGN KEY (institution_id,created_by)
    REFERENCES marjea_institution_memberships(tenant_id,clerk_user_id)
);
CREATE INDEX marjea_claim_variant_claim_idx ON marjea_claim_variants(institution_id,claim_id,created_at);

CREATE TABLE marjea_claim_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES marjea_institutions(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL,
  observed_content_id uuid NOT NULL,
  dataset_scope varchar(160) NOT NULL,
  relation varchar(24) NOT NULL DEFAULT 'related',
  observed_at timestamptz NOT NULL,
  recorded_by varchar(255) NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marjea_claim_observation_tenant_id_unique UNIQUE (institution_id,id),
  CONSTRAINT marjea_claim_observation_pair_unique UNIQUE (institution_id,variant_id,observed_content_id,dataset_scope),
  CONSTRAINT marjea_claim_observation_scope_check CHECK (dataset_scope IN ('ordinary','simulated')),
  CONSTRAINT marjea_claim_observation_relation_check CHECK (relation IN ('related','similar','quotes','contradicts')),
  CONSTRAINT marjea_claim_observation_variant_fk FOREIGN KEY (institution_id,variant_id)
    REFERENCES marjea_claim_variants(institution_id,id),
  CONSTRAINT marjea_claim_observation_content_fk FOREIGN KEY (institution_id,observed_content_id)
    REFERENCES marjea_observed_content(tenant_id,id),
  CONSTRAINT marjea_claim_observation_recorder_fk FOREIGN KEY (institution_id,recorded_by)
    REFERENCES marjea_institution_memberships(tenant_id,clerk_user_id)
);
CREATE INDEX marjea_claim_observation_order_idx ON marjea_claim_observations(institution_id,variant_id,observed_at,id);

CREATE TABLE marjea_claim_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES marjea_institutions(id) ON DELETE CASCADE,
  claim_id uuid NOT NULL,
  reference_id uuid,
  reference_version_number integer,
  observed_content_id uuid,
  case_id uuid,
  semantic_analysis_id uuid,
  note text,
  recorded_by varchar(255) NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marjea_claim_evidence_tenant_id_unique UNIQUE (institution_id,id),
  CONSTRAINT marjea_claim_evidence_target_check CHECK (
    (CASE WHEN reference_id IS NULL THEN 0 ELSE 1 END +
     CASE WHEN observed_content_id IS NULL THEN 0 ELSE 1 END +
     CASE WHEN case_id IS NULL THEN 0 ELSE 1 END +
     CASE WHEN semantic_analysis_id IS NULL THEN 0 ELSE 1 END) = 1),
  CONSTRAINT marjea_claim_evidence_claim_fk FOREIGN KEY (institution_id,claim_id)
    REFERENCES marjea_claims(institution_id,id),
  CONSTRAINT marjea_claim_evidence_reference_fk FOREIGN KEY (institution_id,reference_id,reference_version_number)
    REFERENCES marjea_official_reference_versions(tenant_id,reference_id,version_number),
  CONSTRAINT marjea_claim_evidence_observation_fk FOREIGN KEY (institution_id,observed_content_id)
    REFERENCES marjea_observed_content(tenant_id,id),
  CONSTRAINT marjea_claim_evidence_case_fk FOREIGN KEY (institution_id,case_id)
    REFERENCES marjea_cases(tenant_id,id),
  CONSTRAINT marjea_claim_evidence_analysis_fk FOREIGN KEY (institution_id,semantic_analysis_id)
    REFERENCES marjea_semantic_analyses(institution_id,id),
  CONSTRAINT marjea_claim_evidence_recorder_fk FOREIGN KEY (institution_id,recorded_by)
    REFERENCES marjea_institution_memberships(tenant_id,clerk_user_id)
);
CREATE INDEX marjea_claim_evidence_claim_idx ON marjea_claim_evidence(institution_id,claim_id,recorded_at);

CREATE TABLE marjea_claim_lineage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES marjea_institutions(id) ON DELETE CASCADE,
  from_variant_id uuid NOT NULL,
  to_variant_id uuid NOT NULL,
  relation varchar(32) NOT NULL,
  evidence_id uuid,
  reason text NOT NULL,
  recorded_by varchar(255) NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marjea_claim_lineage_tenant_id_unique UNIQUE (institution_id,id),
  CONSTRAINT marjea_claim_lineage_pair_unique UNIQUE (institution_id,from_variant_id,to_variant_id,relation),
  CONSTRAINT marjea_claim_lineage_relation_check CHECK (relation IN ('chronology','similarity','confirmed_propagation') AND from_variant_id <> to_variant_id),
  CONSTRAINT marjea_claim_lineage_reason_check CHECK (length(trim(reason)) BETWEEN 1 AND 2000 AND (relation <> 'confirmed_propagation' OR evidence_id IS NOT NULL)),
  CONSTRAINT marjea_claim_lineage_from_fk FOREIGN KEY (institution_id,from_variant_id)
    REFERENCES marjea_claim_variants(institution_id,id),
  CONSTRAINT marjea_claim_lineage_to_fk FOREIGN KEY (institution_id,to_variant_id)
    REFERENCES marjea_claim_variants(institution_id,id),
  CONSTRAINT marjea_claim_lineage_evidence_fk FOREIGN KEY (institution_id,evidence_id)
    REFERENCES marjea_claim_evidence(institution_id,id),
  CONSTRAINT marjea_claim_lineage_recorder_fk FOREIGN KEY (institution_id,recorded_by)
    REFERENCES marjea_institution_memberships(tenant_id,clerk_user_id)
);
CREATE INDEX marjea_claim_lineage_from_idx ON marjea_claim_lineage(institution_id,from_variant_id,recorded_at);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['marjea_claim_topics','marjea_claims','marjea_claim_variants','marjea_claim_observations','marjea_claim_evidence','marjea_claim_lineage'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY %I ON %I USING (institution_id = NULLIF(current_setting(''marjea.tenant_id'', true), '''')::uuid) WITH CHECK (institution_id = NULLIF(current_setting(''marjea.tenant_id'', true), '''')::uuid)', t || '_tenant_policy', t);
  END LOOP;
END $$;
