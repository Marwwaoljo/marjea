-- Generated additive schema diff. Development only; enum is committed separately.
CREATE TABLE "marjea_audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"institution_id" uuid NOT NULL,
	"actor_id" varchar(255) NOT NULL,
	"action" varchar(120) NOT NULL,
	"entity_kind" varchar(80) NOT NULL,
	"entity_id" uuid NOT NULL,
	"reason" text,
	"request_id" uuid NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "marjea_audit_events" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "marjea_demo_scenarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"institution_id" uuid NOT NULL,
	"scenario_key" varchar(80) NOT NULL,
	"generation" integer DEFAULT 1 NOT NULL,
	"base_input_ids" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"reset_by" varchar(255),
	"reset_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "marjea_demo_tenant_id_unique" UNIQUE("institution_id","id"),
	CONSTRAINT "marjea_demo_tenant_key_unique" UNIQUE("institution_id","scenario_key"),
	CONSTRAINT "marjea_demo_generation_check" CHECK ("marjea_demo_scenarios"."generation" >= 1)
);

ALTER TABLE "marjea_demo_scenarios" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "marjea_first_observed_deviations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"institution_id" uuid NOT NULL,
	"official_reference_id" uuid NOT NULL,
	"official_reference_version_number" integer NOT NULL,
	"observed_content_id" uuid NOT NULL,
	"semantic_analysis_id" uuid NOT NULL,
	"dataset_scope" varchar(160) NOT NULL,
	"engine_version" varchar(160) NOT NULL,
	"status" varchar(30) DEFAULT 'candidate' NOT NULL,
	"observed_order_at" timestamp with time zone NOT NULL,
	"coverage_snapshot" jsonb,
	"coverage_hash" varchar(64),
	"nominated_by" varchar(255) NOT NULL,
	"decided_by" varchar(255),
	"decided_at" timestamp with time zone,
	"decision_reason" text,
	"demo_scenario_id" uuid,
	"demo_generation" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"superseded_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	CONSTRAINT "marjea_deviation_status_check" CHECK ("marjea_first_observed_deviations"."status" IN ('candidate','confirmed','rejected')),
	CONSTRAINT "marjea_deviation_decision_check" CHECK ("marjea_first_observed_deviations"."status" = 'candidate' OR ("marjea_first_observed_deviations"."decided_by" IS NOT NULL AND "marjea_first_observed_deviations"."decided_at" IS NOT NULL AND "marjea_first_observed_deviations"."decision_reason" IS NOT NULL AND length(trim("marjea_first_observed_deviations"."decision_reason")) > 0)),
	CONSTRAINT "marjea_deviation_coverage_check" CHECK ("marjea_first_observed_deviations"."status" <> 'confirmed' OR ("marjea_first_observed_deviations"."coverage_snapshot" IS NOT NULL AND jsonb_typeof("marjea_first_observed_deviations"."coverage_snapshot") = 'object' AND "marjea_first_observed_deviations"."coverage_hash" IS NOT NULL AND "marjea_first_observed_deviations"."coverage_hash" ~ '^[0-9a-f]{64}$')),
	CONSTRAINT "marjea_deviation_demo_check" CHECK (("marjea_first_observed_deviations"."demo_scenario_id" IS NULL AND "marjea_first_observed_deviations"."demo_generation" IS NULL) OR ("marjea_first_observed_deviations"."demo_scenario_id" IS NOT NULL AND "marjea_first_observed_deviations"."demo_generation" IS NOT NULL AND "marjea_first_observed_deviations"."demo_generation" >= 1))
);

ALTER TABLE "marjea_first_observed_deviations" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "marjea_institution_feature_flags" (
	"institution_id" uuid PRIMARY KEY NOT NULL,
	"phase2_semantic_analysis_enabled" boolean DEFAULT false NOT NULL,
	"updated_by" varchar(255) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"change_reason" text NOT NULL
);

ALTER TABLE "marjea_institution_feature_flags" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "marjea_reference_observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"institution_id" uuid NOT NULL,
	"official_reference_id" uuid NOT NULL,
	"official_reference_version_number" integer NOT NULL,
	"observed_content_id" uuid NOT NULL,
	"dataset_scope" varchar(160) NOT NULL,
	"eligibility_status" varchar(30) DEFAULT 'eligible' NOT NULL,
	"linked_by" varchar(255) NOT NULL,
	"linked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"excluded_by" varchar(255),
	"excluded_at" timestamp with time zone,
	"exclusion_reason" text,
	"demo_scenario_id" uuid,
	"demo_generation" integer,
	CONSTRAINT "marjea_ref_observation_scope_unique" UNIQUE("institution_id","official_reference_id","official_reference_version_number","observed_content_id","dataset_scope"),
	CONSTRAINT "marjea_ref_observation_eligibility_check" CHECK ("marjea_reference_observations"."eligibility_status" IN ('eligible','excluded') AND ("marjea_reference_observations"."eligibility_status" <> 'excluded' OR ("marjea_reference_observations"."excluded_by" IS NOT NULL AND "marjea_reference_observations"."excluded_at" IS NOT NULL AND "marjea_reference_observations"."exclusion_reason" IS NOT NULL AND length(trim("marjea_reference_observations"."exclusion_reason")) > 0))),
	CONSTRAINT "marjea_ref_observation_demo_check" CHECK (("marjea_reference_observations"."demo_scenario_id" IS NULL AND "marjea_reference_observations"."demo_generation" IS NULL) OR ("marjea_reference_observations"."demo_scenario_id" IS NOT NULL AND "marjea_reference_observations"."demo_generation" IS NOT NULL AND "marjea_reference_observations"."demo_generation" >= 1))
);

ALTER TABLE "marjea_reference_observations" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "marjea_semantic_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"institution_id" uuid NOT NULL,
	"official_reference_id" uuid NOT NULL,
	"official_reference_version_number" integer NOT NULL,
	"observed_content_id" uuid NOT NULL,
	"case_id" uuid,
	"requested_by" varchar(255) NOT NULL,
	"analysis_status" varchar(40) DEFAULT 'queued' NOT NULL,
	"engine_version" varchar(160) NOT NULL,
	"model" varchar(100) NOT NULL,
	"schema_version" varchar(80) NOT NULL,
	"prompt_version" varchar(80) NOT NULL,
	"dataset_scope" varchar(160) NOT NULL,
	"analyzed_at" timestamp with time zone,
	"reviewed_by" varchar(255),
	"reviewed_at" timestamp with time zone,
	"suggested_route" varchar(40),
	"confidence" double precision,
	"structured_result" jsonb,
	"official_reference_snapshot" jsonb NOT NULL,
	"observed_content_snapshot" jsonb NOT NULL,
	"input_hash" varchar(64) NOT NULL,
	"reviewed_result" jsonb,
	"review_round" integer DEFAULT 1 NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"lease_token" uuid,
	"lease_expires_at" timestamp with time zone,
	"error_code" varchar(80),
	"failed_at" timestamp with time zone,
	"demo_scenario_id" uuid,
	"demo_generation" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "marjea_analysis_tenant_id_unique" UNIQUE("institution_id","id"),
	CONSTRAINT "marjea_analysis_tenant_case_id_unique" UNIQUE("institution_id","case_id","id"),
	CONSTRAINT "marjea_analysis_pair_unique" UNIQUE("institution_id","official_reference_id","official_reference_version_number","observed_content_id","dataset_scope","engine_version","id"),
	CONSTRAINT "marjea_analysis_input_unique" UNIQUE("institution_id","official_reference_id","observed_content_id","input_hash","engine_version"),
	CONSTRAINT "marjea_analysis_status_check" CHECK ("marjea_semantic_analyses"."analysis_status" IN ('queued','processing','pending_human_review','approved','revision_requested','rejected','escalated','failed')),
	CONSTRAINT "marjea_analysis_confidence_check" CHECK ("marjea_semantic_analyses"."confidence" IS NULL OR ("marjea_semantic_analyses"."confidence" >= 0 AND "marjea_semantic_analyses"."confidence" <= 1)),
	CONSTRAINT "marjea_analysis_hash_check" CHECK ("marjea_semantic_analyses"."input_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "marjea_analysis_snapshot_check" CHECK (jsonb_typeof("marjea_semantic_analyses"."official_reference_snapshot") = 'object' AND jsonb_typeof("marjea_semantic_analyses"."observed_content_snapshot") = 'object' AND jsonb_typeof("marjea_semantic_analyses"."official_reference_snapshot"->'contentText') IS NOT DISTINCT FROM 'string' AND jsonb_typeof("marjea_semantic_analyses"."observed_content_snapshot"->'contentText') IS NOT DISTINCT FROM 'string'),
	CONSTRAINT "marjea_analysis_result_check" CHECK ("marjea_semantic_analyses"."analysis_status" NOT IN ('pending_human_review','approved','revision_requested','rejected','escalated') OR ("marjea_semantic_analyses"."structured_result" IS NOT NULL AND jsonb_typeof("marjea_semantic_analyses"."structured_result") = 'object' AND "marjea_semantic_analyses"."analyzed_at" IS NOT NULL AND "marjea_semantic_analyses"."confidence" IS NOT NULL AND "marjea_semantic_analyses"."suggested_route" IS NOT NULL)),
	CONSTRAINT "marjea_analysis_route_check" CHECK ("marjea_semantic_analyses"."suggested_route" IS NULL OR "marjea_semantic_analyses"."suggested_route" IN ('no_material_deviation','human_review','escalation_recommended','insufficient_evidence')),
	CONSTRAINT "marjea_analysis_review_check" CHECK (("marjea_semantic_analyses"."reviewed_by" IS NULL) = ("marjea_semantic_analyses"."reviewed_at" IS NULL) AND ("marjea_semantic_analyses"."reviewed_by" IS NULL OR "marjea_semantic_analyses"."reviewed_by" <> "marjea_semantic_analyses"."requested_by") AND ("marjea_semantic_analyses"."analysis_status" NOT IN ('approved','rejected') OR ("marjea_semantic_analyses"."reviewed_by" IS NOT NULL AND "marjea_semantic_analyses"."reviewed_result" IS NOT NULL))),
	CONSTRAINT "marjea_analysis_attempt_check" CHECK ("marjea_semantic_analyses"."attempt_count" >= 0 AND "marjea_semantic_analyses"."review_round" >= 1 AND ("marjea_semantic_analyses"."lease_token" IS NULL) = ("marjea_semantic_analyses"."lease_expires_at" IS NULL)),
	CONSTRAINT "marjea_analysis_failed_check" CHECK ("marjea_semantic_analyses"."analysis_status" <> 'failed' OR ("marjea_semantic_analyses"."failed_at" IS NOT NULL AND "marjea_semantic_analyses"."error_code" IS NOT NULL)),
	CONSTRAINT "marjea_analysis_demo_check" CHECK (("marjea_semantic_analyses"."demo_scenario_id" IS NULL AND "marjea_semantic_analyses"."demo_generation" IS NULL) OR ("marjea_semantic_analyses"."demo_scenario_id" IS NOT NULL AND "marjea_semantic_analyses"."demo_generation" IS NOT NULL AND "marjea_semantic_analyses"."demo_generation" >= 1))
);

ALTER TABLE "marjea_semantic_analyses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "marjea_review_steps" ALTER COLUMN "draft_id" DROP NOT NULL;
ALTER TABLE "marjea_cases" ADD COLUMN "demo_scenario_id" uuid;
ALTER TABLE "marjea_cases" ADD COLUMN "demo_generation" integer;
ALTER TABLE "marjea_monitor_sources" ADD COLUMN "demo_scenario_id" uuid;
ALTER TABLE "marjea_monitor_sources" ADD COLUMN "demo_generation" integer;
ALTER TABLE "marjea_observed_content" ADD COLUMN "demo_scenario_id" uuid;
ALTER TABLE "marjea_observed_content" ADD COLUMN "demo_generation" integer;
ALTER TABLE "marjea_official_reference_versions" ADD COLUMN "demo_scenario_id" uuid;
ALTER TABLE "marjea_official_reference_versions" ADD COLUMN "demo_generation" integer;
ALTER TABLE "marjea_official_references" ADD COLUMN "demo_scenario_id" uuid;
ALTER TABLE "marjea_official_references" ADD COLUMN "demo_generation" integer;
ALTER TABLE "marjea_response_drafts" ADD COLUMN "demo_scenario_id" uuid;
ALTER TABLE "marjea_response_drafts" ADD COLUMN "demo_generation" integer;
ALTER TABLE "marjea_review_steps" ADD COLUMN "target_kind" varchar(30) DEFAULT 'response_draft' NOT NULL;
ALTER TABLE "marjea_review_steps" ADD COLUMN "semantic_analysis_id" uuid;
ALTER TABLE "marjea_review_steps" ADD COLUMN "review_round" integer DEFAULT 1 NOT NULL;
ALTER TABLE "marjea_review_steps" ADD COLUMN "demo_scenario_id" uuid;
ALTER TABLE "marjea_review_steps" ADD COLUMN "demo_generation" integer;
ALTER TABLE "marjea_cases" ADD CONSTRAINT "marjea_case_pair_unique" UNIQUE("tenant_id","id","reference_id","observed_content_id");
ALTER TABLE "marjea_audit_events" ADD CONSTRAINT "marjea_audit_events_institution_id_marjea_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."marjea_institutions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_audit_events" ADD CONSTRAINT "marjea_audit_actor_fk" FOREIGN KEY ("institution_id","actor_id") REFERENCES "public"."marjea_institution_memberships"("tenant_id","clerk_user_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_demo_scenarios" ADD CONSTRAINT "marjea_demo_scenarios_institution_id_marjea_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."marjea_institutions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_demo_scenarios" ADD CONSTRAINT "marjea_demo_creator_fk" FOREIGN KEY ("institution_id","created_by") REFERENCES "public"."marjea_institution_memberships"("tenant_id","clerk_user_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_demo_scenarios" ADD CONSTRAINT "marjea_demo_resetter_fk" FOREIGN KEY ("institution_id","reset_by") REFERENCES "public"."marjea_institution_memberships"("tenant_id","clerk_user_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_first_observed_deviations" ADD CONSTRAINT "marjea_first_observed_deviations_institution_id_marjea_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."marjea_institutions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_first_observed_deviations" ADD CONSTRAINT "marjea_deviation_analysis_pair_fk" FOREIGN KEY ("institution_id","official_reference_id","official_reference_version_number","observed_content_id","dataset_scope","engine_version","semantic_analysis_id") REFERENCES "public"."marjea_semantic_analyses"("institution_id","official_reference_id","official_reference_version_number","observed_content_id","dataset_scope","engine_version","id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_first_observed_deviations" ADD CONSTRAINT "marjea_deviation_nominator_fk" FOREIGN KEY ("institution_id","nominated_by") REFERENCES "public"."marjea_institution_memberships"("tenant_id","clerk_user_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_first_observed_deviations" ADD CONSTRAINT "marjea_deviation_decider_fk" FOREIGN KEY ("institution_id","decided_by") REFERENCES "public"."marjea_institution_memberships"("tenant_id","clerk_user_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_first_observed_deviations" ADD CONSTRAINT "marjea_deviation_demo_fk" FOREIGN KEY ("institution_id","demo_scenario_id") REFERENCES "public"."marjea_demo_scenarios"("institution_id","id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_institution_feature_flags" ADD CONSTRAINT "marjea_institution_feature_flags_institution_id_marjea_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."marjea_institutions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_institution_feature_flags" ADD CONSTRAINT "marjea_flag_updater_fk" FOREIGN KEY ("institution_id","updated_by") REFERENCES "public"."marjea_institution_memberships"("tenant_id","clerk_user_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_reference_observations" ADD CONSTRAINT "marjea_reference_observations_institution_id_marjea_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."marjea_institutions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_reference_observations" ADD CONSTRAINT "marjea_ref_observation_version_fk" FOREIGN KEY ("institution_id","official_reference_id","official_reference_version_number") REFERENCES "public"."marjea_official_reference_versions"("tenant_id","reference_id","version_number") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_reference_observations" ADD CONSTRAINT "marjea_ref_observation_content_fk" FOREIGN KEY ("institution_id","observed_content_id") REFERENCES "public"."marjea_observed_content"("tenant_id","id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_reference_observations" ADD CONSTRAINT "marjea_ref_observation_linker_fk" FOREIGN KEY ("institution_id","linked_by") REFERENCES "public"."marjea_institution_memberships"("tenant_id","clerk_user_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_reference_observations" ADD CONSTRAINT "marjea_ref_observation_excluder_fk" FOREIGN KEY ("institution_id","excluded_by") REFERENCES "public"."marjea_institution_memberships"("tenant_id","clerk_user_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_reference_observations" ADD CONSTRAINT "marjea_ref_observation_demo_fk" FOREIGN KEY ("institution_id","demo_scenario_id") REFERENCES "public"."marjea_demo_scenarios"("institution_id","id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_semantic_analyses" ADD CONSTRAINT "marjea_semantic_analyses_institution_id_marjea_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."marjea_institutions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_semantic_analyses" ADD CONSTRAINT "marjea_analysis_version_fk" FOREIGN KEY ("institution_id","official_reference_id","official_reference_version_number") REFERENCES "public"."marjea_official_reference_versions"("tenant_id","reference_id","version_number") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_semantic_analyses" ADD CONSTRAINT "marjea_analysis_observation_fk" FOREIGN KEY ("institution_id","observed_content_id") REFERENCES "public"."marjea_observed_content"("tenant_id","id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_semantic_analyses" ADD CONSTRAINT "marjea_analysis_case_pair_fk" FOREIGN KEY ("institution_id","case_id","official_reference_id","observed_content_id") REFERENCES "public"."marjea_cases"("tenant_id","id","reference_id","observed_content_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_semantic_analyses" ADD CONSTRAINT "marjea_analysis_requester_fk" FOREIGN KEY ("institution_id","requested_by") REFERENCES "public"."marjea_institution_memberships"("tenant_id","clerk_user_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_semantic_analyses" ADD CONSTRAINT "marjea_analysis_reviewer_fk" FOREIGN KEY ("institution_id","reviewed_by") REFERENCES "public"."marjea_institution_memberships"("tenant_id","clerk_user_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_semantic_analyses" ADD CONSTRAINT "marjea_analysis_demo_fk" FOREIGN KEY ("institution_id","demo_scenario_id") REFERENCES "public"."marjea_demo_scenarios"("institution_id","id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "marjea_audit_entity_idx" ON "marjea_audit_events" USING btree ("institution_id","entity_kind","entity_id","created_at");
CREATE INDEX "marjea_audit_request_idx" ON "marjea_audit_events" USING btree ("institution_id","request_id");
CREATE UNIQUE INDEX "marjea_deviation_current_unique" ON "marjea_first_observed_deviations" USING btree ("institution_id","official_reference_id","official_reference_version_number","dataset_scope","engine_version") WHERE "marjea_first_observed_deviations"."status" = 'confirmed' AND "marjea_first_observed_deviations"."superseded_at" IS NULL AND "marjea_first_observed_deviations"."archived_at" IS NULL;
CREATE INDEX "marjea_deviation_order_idx" ON "marjea_first_observed_deviations" USING btree ("institution_id","official_reference_id","dataset_scope","observed_order_at");
CREATE INDEX "marjea_deviation_demo_idx" ON "marjea_first_observed_deviations" USING btree ("institution_id","demo_scenario_id","demo_generation");
CREATE INDEX "marjea_ref_observation_coverage_idx" ON "marjea_reference_observations" USING btree ("institution_id","official_reference_id","official_reference_version_number","dataset_scope","eligibility_status");
CREATE INDEX "marjea_ref_observation_demo_idx" ON "marjea_reference_observations" USING btree ("institution_id","demo_scenario_id","demo_generation");
CREATE INDEX "marjea_analysis_created_idx" ON "marjea_semantic_analyses" USING btree ("institution_id","analysis_status","created_at");
CREATE INDEX "marjea_analysis_due_idx" ON "marjea_semantic_analyses" USING btree ("analysis_status","next_attempt_at") WHERE "marjea_semantic_analyses"."archived_at" IS NULL;
CREATE INDEX "marjea_analysis_lease_idx" ON "marjea_semantic_analyses" USING btree ("lease_expires_at") WHERE "marjea_semantic_analyses"."analysis_status" = 'processing';
CREATE INDEX "marjea_analysis_pair_idx" ON "marjea_semantic_analyses" USING btree ("institution_id","official_reference_id","observed_content_id","engine_version");
CREATE INDEX "marjea_analysis_demo_idx" ON "marjea_semantic_analyses" USING btree ("institution_id","demo_scenario_id","demo_generation");
ALTER TABLE "marjea_cases" ADD CONSTRAINT "marjea_case_demo_fk" FOREIGN KEY ("tenant_id","demo_scenario_id") REFERENCES "public"."marjea_demo_scenarios"("institution_id","id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_monitor_sources" ADD CONSTRAINT "marjea_source_demo_fk" FOREIGN KEY ("tenant_id","demo_scenario_id") REFERENCES "public"."marjea_demo_scenarios"("institution_id","id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_observed_content" ADD CONSTRAINT "marjea_observed_content_demo_fk" FOREIGN KEY ("tenant_id","demo_scenario_id") REFERENCES "public"."marjea_demo_scenarios"("institution_id","id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_official_reference_versions" ADD CONSTRAINT "marjea_reference_version_demo_fk" FOREIGN KEY ("tenant_id","demo_scenario_id") REFERENCES "public"."marjea_demo_scenarios"("institution_id","id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_official_references" ADD CONSTRAINT "marjea_reference_demo_fk" FOREIGN KEY ("tenant_id","demo_scenario_id") REFERENCES "public"."marjea_demo_scenarios"("institution_id","id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_response_drafts" ADD CONSTRAINT "marjea_response_draft_demo_fk" FOREIGN KEY ("tenant_id","demo_scenario_id") REFERENCES "public"."marjea_demo_scenarios"("institution_id","id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_review_steps" ADD CONSTRAINT "marjea_review_step_demo_fk" FOREIGN KEY ("tenant_id","demo_scenario_id") REFERENCES "public"."marjea_demo_scenarios"("institution_id","id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marjea_review_steps" ADD CONSTRAINT "marjea_review_analysis_case_fk" FOREIGN KEY ("tenant_id","case_id","semantic_analysis_id") REFERENCES "public"."marjea_semantic_analyses"("institution_id","case_id","id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "marjea_case_demo_idx" ON "marjea_cases" USING btree ("tenant_id","demo_scenario_id","demo_generation");
CREATE INDEX "marjea_source_demo_idx" ON "marjea_monitor_sources" USING btree ("tenant_id","demo_scenario_id","demo_generation");
CREATE INDEX "marjea_observed_content_demo_idx" ON "marjea_observed_content" USING btree ("tenant_id","demo_scenario_id","demo_generation");
CREATE INDEX "marjea_reference_version_demo_idx" ON "marjea_official_reference_versions" USING btree ("tenant_id","demo_scenario_id","demo_generation");
CREATE INDEX "marjea_reference_demo_idx" ON "marjea_official_references" USING btree ("tenant_id","demo_scenario_id","demo_generation");
CREATE INDEX "marjea_response_draft_demo_idx" ON "marjea_response_drafts" USING btree ("tenant_id","demo_scenario_id","demo_generation");
CREATE INDEX "marjea_review_step_demo_idx" ON "marjea_review_steps" USING btree ("tenant_id","demo_scenario_id","demo_generation");
ALTER TABLE "marjea_review_steps" ADD CONSTRAINT "marjea_review_analysis_sequence_unique" UNIQUE("tenant_id","semantic_analysis_id","review_round","sequence_number");
ALTER TABLE "marjea_cases" ADD CONSTRAINT "marjea_case_demo_check" CHECK (("marjea_cases"."demo_scenario_id" IS NULL AND "marjea_cases"."demo_generation" IS NULL) OR ("marjea_cases"."demo_scenario_id" IS NOT NULL AND "marjea_cases"."demo_generation" IS NOT NULL AND "marjea_cases"."demo_generation" >= 1));
ALTER TABLE "marjea_monitor_sources" ADD CONSTRAINT "marjea_source_demo_check" CHECK (("marjea_monitor_sources"."demo_scenario_id" IS NULL AND "marjea_monitor_sources"."demo_generation" IS NULL) OR ("marjea_monitor_sources"."demo_scenario_id" IS NOT NULL AND "marjea_monitor_sources"."demo_generation" IS NOT NULL AND "marjea_monitor_sources"."demo_generation" >= 1));
ALTER TABLE "marjea_observed_content" ADD CONSTRAINT "marjea_observed_content_demo_check" CHECK (("marjea_observed_content"."demo_scenario_id" IS NULL AND "marjea_observed_content"."demo_generation" IS NULL) OR ("marjea_observed_content"."demo_scenario_id" IS NOT NULL AND "marjea_observed_content"."demo_generation" IS NOT NULL AND "marjea_observed_content"."demo_generation" >= 1));
ALTER TABLE "marjea_official_reference_versions" ADD CONSTRAINT "marjea_reference_version_demo_check" CHECK (("marjea_official_reference_versions"."demo_scenario_id" IS NULL AND "marjea_official_reference_versions"."demo_generation" IS NULL) OR ("marjea_official_reference_versions"."demo_scenario_id" IS NOT NULL AND "marjea_official_reference_versions"."demo_generation" IS NOT NULL AND "marjea_official_reference_versions"."demo_generation" >= 1));
ALTER TABLE "marjea_official_references" ADD CONSTRAINT "marjea_reference_demo_check" CHECK (("marjea_official_references"."demo_scenario_id" IS NULL AND "marjea_official_references"."demo_generation" IS NULL) OR ("marjea_official_references"."demo_scenario_id" IS NOT NULL AND "marjea_official_references"."demo_generation" IS NOT NULL AND "marjea_official_references"."demo_generation" >= 1));
ALTER TABLE "marjea_response_drafts" ADD CONSTRAINT "marjea_response_draft_demo_check" CHECK (("marjea_response_drafts"."demo_scenario_id" IS NULL AND "marjea_response_drafts"."demo_generation" IS NULL) OR ("marjea_response_drafts"."demo_scenario_id" IS NOT NULL AND "marjea_response_drafts"."demo_generation" IS NOT NULL AND "marjea_response_drafts"."demo_generation" >= 1));
ALTER TABLE "marjea_review_steps" ADD CONSTRAINT "marjea_review_step_demo_check" CHECK (("marjea_review_steps"."demo_scenario_id" IS NULL AND "marjea_review_steps"."demo_generation" IS NULL) OR ("marjea_review_steps"."demo_scenario_id" IS NOT NULL AND "marjea_review_steps"."demo_generation" IS NOT NULL AND "marjea_review_steps"."demo_generation" >= 1));
ALTER TABLE "marjea_review_steps" ADD CONSTRAINT "marjea_review_target_check" CHECK (("marjea_review_steps"."target_kind" = 'response_draft' AND "marjea_review_steps"."draft_id" IS NOT NULL AND "marjea_review_steps"."semantic_analysis_id" IS NULL AND "marjea_review_steps"."decision" IS DISTINCT FROM 'reject') OR ("marjea_review_steps"."target_kind" = 'semantic_analysis' AND "marjea_review_steps"."draft_id" IS NULL AND "marjea_review_steps"."semantic_analysis_id" IS NOT NULL));
ALTER TABLE "marjea_review_steps" ADD CONSTRAINT "marjea_review_round_check" CHECK ("marjea_review_steps"."review_round" >= 1 AND "marjea_review_steps"."sequence_number" >= 1);
CREATE POLICY "marjea_audit_select_policy" ON "marjea_audit_events" AS PERMISSIVE FOR SELECT TO public USING (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid);
CREATE POLICY "marjea_audit_insert_policy" ON "marjea_audit_events" AS PERMISSIVE FOR INSERT TO public WITH CHECK (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid);
CREATE POLICY "marjea_demo_tenant_policy" ON "marjea_demo_scenarios" AS PERMISSIVE FOR ALL TO public USING (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid) WITH CHECK (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid);
CREATE POLICY "marjea_deviation_tenant_policy" ON "marjea_first_observed_deviations" AS PERMISSIVE FOR ALL TO public USING (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid) WITH CHECK (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid);
CREATE POLICY "marjea_flag_tenant_policy" ON "marjea_institution_feature_flags" AS PERMISSIVE FOR ALL TO public USING (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid) WITH CHECK (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid);
CREATE POLICY "marjea_ref_observation_tenant_policy" ON "marjea_reference_observations" AS PERMISSIVE FOR ALL TO public USING (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid) WITH CHECK (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid);
CREATE POLICY "marjea_analysis_tenant_policy" ON "marjea_semantic_analyses" AS PERMISSIVE FOR ALL TO public USING (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid) WITH CHECK (institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid);
