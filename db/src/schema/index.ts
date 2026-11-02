import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { demoColumns, demoScenarios, semanticAnalyses } from "./semantic";

const demoConstraints = (table: { tenantId: AnyPgColumn; demoScenarioId: AnyPgColumn; demoGeneration: AnyPgColumn }, prefix: string) => [
  check(`${prefix}_demo_check`, sql`(${table.demoScenarioId} IS NULL AND ${table.demoGeneration} IS NULL) OR (${table.demoScenarioId} IS NOT NULL AND ${table.demoGeneration} IS NOT NULL AND ${table.demoGeneration} >= 1)`),
  foreignKey({ name: `${prefix}_demo_fk`, columns: [table.tenantId, table.demoScenarioId], foreignColumns: [demoScenarios.institutionId, demoScenarios.id] }),
  index(`${prefix}_demo_idx`).on(table.tenantId, table.demoScenarioId, table.demoGeneration),
];

const tenantPolicy = (name: string) =>
  pgPolicy(name, {
    for: "all",
    using: sql`tenant_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid`,
    withCheck: sql`tenant_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid`,
  });

export const institutionRoleEnum = pgEnum("marjea_institution_role", [
  "tenant_admin",
  "reference_manager",
  "analyst",
  "reviewer",
  "auditor",
]);
export const referenceStatusEnum = pgEnum("marjea_reference_status", [
  "sari",
  "muaddal",
  "mulgha",
]);
export const monitorAdapterKindEnum = pgEnum("marjea_monitor_adapter_kind", [
  "manual_submission",
  "rss_local_test",
]);
export const captureModeEnum = pgEnum("marjea_capture_mode", [
  "manual_submission",
  "rss_local_test",
]);
export const caseStatusEnum = pgEnum("marjea_case_status", [
  "new",
  "analysis",
  "review",
  "approved",
  "referred",
]);
export const caseInitiationModeEnum = pgEnum("marjea_case_initiation_mode", [
  "manual",
]);
export const draftAuthorshipEnum = pgEnum("marjea_draft_authorship", [
  "human_authored",
]);
export const draftStatusEnum = pgEnum("marjea_draft_status", [
  "draft",
  "in_review",
  "approved",
  "revision_requested",
  "referred",
]);
export const reviewDecisionEnum = pgEnum("marjea_review_decision", [
  "approve",
  "request_revision",
  "escalate",
  "reject",
]);

export const institutions = pgTable("marjea_institutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  institutionType: varchar("institution_type", { length: 30 }),
  legalVerificationStatus: text("legal_verification_status").notNull().default("PENDING"),
  contactName: varchar("contact_name", { length: 160 }),
  contactEmail: varchar("contact_email", { length: 254 }),
  phone: varchar("phone", { length: 40 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  check("marjea_institution_type_check", sql`${table.institutionType} IS NULL OR ${table.institutionType} IN ('government', 'semi_government', 'enterprise', 'other')`),
  check("marjea_institution_legal_verification_status_check", sql`${table.legalVerificationStatus} IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')`),
]);

// The membership bridge deliberately stays queryable across an owner's
// institutions so the user can choose a tenant. Every lookup is still scoped
// by the authenticated Clerk user ID and the requested institution ID.
export const institutionMemberships = pgTable(
  "marjea_institution_memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "cascade" }),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
    role: institutionRoleEnum("role").notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("marjea_membership_tenant_user_unique").on(
      table.tenantId,
      table.clerkUserId,
    ),
    index("marjea_membership_user_idx").on(table.clerkUserId),
  ],
);

export const institutionVerificationReviews = pgTable(
  "marjea_institution_verification_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    institutionId: uuid("institution_id")
      .notNull()
      .references(() => institutions.id),
    reviewerClerkUserId: varchar("reviewer_clerk_user_id", { length: 255 }).notNull(),
    previousStatus: text("previous_status").notNull(),
    newStatus: text("new_status").notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("marjea_institution_verification_previous_status_check", sql`${table.previousStatus} IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')`),
    check("marjea_institution_verification_new_status_check", sql`${table.newStatus} IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')`),
    index("marjea_institution_verification_reviews_institution_idx").on(table.institutionId, table.reviewedAt),
    pgPolicy("marjea_institution_verification_reviews_tenant_policy", {
      for: "all",
      using: sql`institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid`,
      withCheck: sql`institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid`,
    }),
  ],
).enableRLS();

export const officialReferences = pgTable(
  "marjea_official_references",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 240 }).notNull(),
    issuingEntity: varchar("issuing_entity", { length: 240 }).notNull(),
    sourceUrl: text("source_url").notNull(),
    publishedAt: timestamp("published_at", { mode: "date" }),
    status: referenceStatusEnum("status").notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...demoColumns(),
    verificationStatus: varchar("verification_status", { length: 40 })
      .notNull()
      .default("user_recorded_unverified"),
    createdByClerkUserId: varchar("created_by_clerk_user_id", {
      length: 255,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    ...demoConstraints(table, "marjea_reference"),
    unique("marjea_reference_tenant_id_unique").on(table.tenantId, table.id),
    index("marjea_reference_tenant_created_idx").on(
      table.tenantId,
      table.createdAt,
    ),
    foreignKey({
      name: "marjea_reference_creator_membership_fk",
      columns: [table.tenantId, table.createdByClerkUserId],
      foreignColumns: [
        institutionMemberships.tenantId,
        institutionMemberships.clerkUserId,
      ],
    }),
    tenantPolicy("marjea_reference_tenant_policy"),
  ],
).enableRLS();

export const officialReferenceVersions = pgTable(
  "marjea_official_reference_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "cascade" }),
    referenceId: uuid("reference_id").notNull(),
    versionNumber: integer("version_number").notNull(),
    contentText: text("content_text").notNull(),
    ...demoColumns(),
    createdByClerkUserId: varchar("created_by_clerk_user_id", {
      length: 255,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    ...demoConstraints(table, "marjea_reference_version"),
    unique("marjea_reference_version_number_unique").on(
      table.tenantId,
      table.referenceId,
      table.versionNumber,
    ),
    foreignKey({
      name: "marjea_reference_version_reference_fk",
      columns: [table.tenantId, table.referenceId],
      foreignColumns: [officialReferences.tenantId, officialReferences.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "marjea_reference_version_creator_membership_fk",
      columns: [table.tenantId, table.createdByClerkUserId],
      foreignColumns: [
        institutionMemberships.tenantId,
        institutionMemberships.clerkUserId,
      ],
    }),
    tenantPolicy("marjea_reference_version_tenant_policy"),
  ],
).enableRLS();

export const monitorSources = pgTable(
  "marjea_monitor_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 180 }).notNull(),
    ...demoColumns(),
    sourceUrl: text("source_url"),
    adapterKind: monitorAdapterKindEnum("adapter_kind")
      .notNull()
      .default("manual_submission"),
    monitoringEnabled: boolean("monitoring_enabled").notNull().default(false),
    createdByClerkUserId: varchar("created_by_clerk_user_id", {
      length: 255,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    ...demoConstraints(table, "marjea_source"),
    unique("marjea_source_tenant_id_unique").on(table.tenantId, table.id),
    foreignKey({
      name: "marjea_source_creator_membership_fk",
      columns: [table.tenantId, table.createdByClerkUserId],
      foreignColumns: [
        institutionMemberships.tenantId,
        institutionMemberships.clerkUserId,
      ],
    }),
    tenantPolicy("marjea_source_tenant_policy"),
  ],
).enableRLS();

export const observedContent = pgTable(
  "marjea_observed_content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "cascade" }),
    sourceId: uuid("source_id").notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    manualClassification: varchar("manual_classification", { length: 40 }).notNull().default("unclassified"),
    recordVersion: integer("record_version").notNull().default(1),
    ...demoColumns(),
    observedUrl: text("observed_url"),
    contentText: text("content_text").notNull(),
    sourceObservedAt: timestamp("source_observed_at", { withTimezone: true }),
    firstCapturedAt: timestamp("first_captured_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    captureMode: captureModeEnum("capture_mode")
      .notNull()
      .default("manual_submission"),
    isSimulated: boolean("is_simulated").notNull().default(false),
    createdByClerkUserId: varchar("created_by_clerk_user_id", {
      length: 255,
    }).notNull(),
  },
  (table) => [
    ...demoConstraints(table, "marjea_observed_content"),
    check("marjea_manual_classification_check", sql`${table.manualClassification} IN ('unclassified', 'potential-discrepancy', 'supportive-circulation')`),
    check("marjea_observation_record_version_check", sql`${table.recordVersion} >= 1`),
    unique("marjea_observed_content_tenant_id_unique").on(
      table.tenantId,
      table.id,
    ),
    index("marjea_observed_content_tenant_captured_idx").on(
      table.tenantId,
      table.firstCapturedAt,
    ),
    foreignKey({
      name: "marjea_observed_content_source_fk",
      columns: [table.tenantId, table.sourceId],
      foreignColumns: [monitorSources.tenantId, monitorSources.id],
    }),
    foreignKey({
      name: "marjea_observed_content_creator_membership_fk",
      columns: [table.tenantId, table.createdByClerkUserId],
      foreignColumns: [
        institutionMemberships.tenantId,
        institutionMemberships.clerkUserId,
      ],
    }),
    tenantPolicy("marjea_observed_content_tenant_policy"),
  ],
).enableRLS();

export const monitorSourceItems = pgTable(
  "marjea_monitor_source_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "cascade" }),
    sourceId: uuid("source_id").notNull(),
    itemKey: varchar("item_key", { length: 128 }).notNull(),
    itemUrl: text("item_url"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
    contentHash: varchar("content_hash", { length: 64 }).notNull(),
    observedContentId: uuid("observed_content_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("marjea_source_item_tenant_source_key_unique").on(
      table.tenantId,
      table.sourceId,
      table.itemKey,
    ),
    foreignKey({
      name: "marjea_source_item_source_fk",
      columns: [table.tenantId, table.sourceId],
      foreignColumns: [monitorSources.tenantId, monitorSources.id],
    }),
    foreignKey({
      name: "marjea_source_item_observation_fk",
      columns: [table.tenantId, table.observedContentId],
      foreignColumns: [observedContent.tenantId, observedContent.id],
    }),
    tenantPolicy("marjea_source_item_tenant_policy"),
  ],
).enableRLS();

export const cases = pgTable(
  "marjea_cases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 240 }).notNull(),
    ...demoColumns(),
    referenceId: uuid("reference_id"),
    observedContentId: uuid("observed_content_id"),
    status: caseStatusEnum("status").notNull().default("new"),
    initiationMode: caseInitiationModeEnum("initiation_mode")
      .notNull()
      .default("manual"),
    createdByClerkUserId: varchar("created_by_clerk_user_id", {
      length: 255,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    ...demoConstraints(table, "marjea_case"),
    unique("marjea_case_pair_unique").on(table.tenantId, table.id, table.referenceId, table.observedContentId),
    unique("marjea_case_tenant_id_unique").on(table.tenantId, table.id),
    index("marjea_case_tenant_created_idx").on(table.tenantId, table.createdAt),
    foreignKey({
      name: "marjea_case_reference_tenant_fk",
      columns: [table.tenantId, table.referenceId],
      foreignColumns: [officialReferences.tenantId, officialReferences.id],
    }),
    foreignKey({
      name: "marjea_case_observed_content_tenant_fk",
      columns: [table.tenantId, table.observedContentId],
      foreignColumns: [observedContent.tenantId, observedContent.id],
    }),
    foreignKey({
      name: "marjea_case_creator_membership_fk",
      columns: [table.tenantId, table.createdByClerkUserId],
      foreignColumns: [
        institutionMemberships.tenantId,
        institutionMemberships.clerkUserId,
      ],
    }),
    tenantPolicy("marjea_case_tenant_policy"),
  ],
).enableRLS();

export const responseDrafts = pgTable(
  "marjea_response_drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "cascade" }),
    caseId: uuid("case_id").notNull(),
    ...demoColumns(),
    draftText: text("draft_text").notNull(),
    authorship: draftAuthorshipEnum("authorship")
      .notNull()
      .default("human_authored"),
    status: draftStatusEnum("status").notNull().default("draft"),
    createdByClerkUserId: varchar("created_by_clerk_user_id", {
      length: 255,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    ...demoConstraints(table, "marjea_response_draft"),
    unique("marjea_response_draft_tenant_id_unique").on(
      table.tenantId,
      table.id,
    ),
    unique("marjea_response_draft_tenant_case_id_unique").on(
      table.tenantId,
      table.caseId,
      table.id,
    ),
    index("marjea_response_draft_case_created_idx").on(
      table.tenantId,
      table.caseId,
      table.createdAt,
    ),
    foreignKey({
      name: "marjea_response_draft_case_fk",
      columns: [table.tenantId, table.caseId],
      foreignColumns: [cases.tenantId, cases.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "marjea_response_draft_creator_membership_fk",
      columns: [table.tenantId, table.createdByClerkUserId],
      foreignColumns: [
        institutionMemberships.tenantId,
        institutionMemberships.clerkUserId,
      ],
    }),
    tenantPolicy("marjea_response_draft_tenant_policy"),
  ],
).enableRLS();

export const reviewSteps = pgTable(
  "marjea_review_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "cascade" }),
    caseId: uuid("case_id").notNull(),
    draftId: uuid("draft_id"),
    targetKind: varchar("target_kind", { length: 30 }).notNull().default("response_draft"),
    semanticAnalysisId: uuid("semantic_analysis_id"),
    reviewRound: integer("review_round").notNull().default(1),
    ...demoColumns(),
    sequenceNumber: integer("sequence_number").notNull(),
    reviewerClerkUserId: varchar("reviewer_clerk_user_id", {
      length: 255,
    }).notNull(),
    decision: reviewDecisionEnum("decision"),
    note: text("note"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    createdByClerkUserId: varchar("created_by_clerk_user_id", {
      length: 255,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    ...demoConstraints(table, "marjea_review_step"),
    check("marjea_review_target_check", sql`(${table.targetKind} = 'response_draft' AND ${table.draftId} IS NOT NULL AND ${table.semanticAnalysisId} IS NULL AND ${table.decision} IS DISTINCT FROM 'reject') OR (${table.targetKind} = 'semantic_analysis' AND ${table.draftId} IS NULL AND ${table.semanticAnalysisId} IS NOT NULL)`),
    check("marjea_review_round_check", sql`${table.reviewRound} >= 1 AND ${table.sequenceNumber} >= 1`),
    unique("marjea_review_analysis_sequence_unique").on(table.tenantId, table.semanticAnalysisId, table.reviewRound, table.sequenceNumber),
    foreignKey({
      name: "marjea_review_analysis_case_fk",
      columns: [table.tenantId, table.caseId, table.semanticAnalysisId],
      foreignColumns: [semanticAnalyses.institutionId, semanticAnalyses.caseId, semanticAnalyses.id],
    }),
    unique("marjea_review_step_tenant_id_unique").on(table.tenantId, table.id),
    unique("marjea_review_step_sequence_unique").on(
      table.tenantId,
      table.draftId,
      table.sequenceNumber,
    ),
    index("marjea_review_step_reviewer_idx").on(
      table.tenantId,
      table.reviewerClerkUserId,
      table.decidedAt,
    ),
    foreignKey({
      name: "marjea_review_step_draft_fk",
      columns: [table.tenantId, table.caseId, table.draftId],
      foreignColumns: [
        responseDrafts.tenantId,
        responseDrafts.caseId,
        responseDrafts.id,
      ],
    }).onDelete("cascade"),
    foreignKey({
      name: "marjea_review_step_reviewer_membership_fk",
      columns: [table.tenantId, table.reviewerClerkUserId],
      foreignColumns: [
        institutionMemberships.tenantId,
        institutionMemberships.clerkUserId,
      ],
    }),
    foreignKey({
      name: "marjea_review_step_creator_membership_fk",
      columns: [table.tenantId, table.createdByClerkUserId],
      foreignColumns: [
        institutionMemberships.tenantId,
        institutionMemberships.clerkUserId,
      ],
    }),
    tenantPolicy("marjea_review_step_tenant_policy"),
  ],
).enableRLS();

export type InstitutionRole =
  (typeof institutionRoleEnum.enumValues)[number];
export type Institution = typeof institutions.$inferSelect;
export type InstitutionMembership = typeof institutionMemberships.$inferSelect;
export * from "./subscriptions";
export * from "./semantic";
export type OfficialReference = typeof officialReferences.$inferSelect;
export type OfficialReferenceVersion =
  typeof officialReferenceVersions.$inferSelect;
export type MonitorSource = typeof monitorSources.$inferSelect;
export type ObservedContent = typeof observedContent.$inferSelect;
export type MarjeaCase = typeof cases.$inferSelect;
export * from "./telegram";
export * from "./claims";
export type ResponseDraft = typeof responseDrafts.$inferSelect;
export type ReviewStep = typeof reviewSteps.$inferSelect;