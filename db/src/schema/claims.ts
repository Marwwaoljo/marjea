import { sql } from "drizzle-orm";
import {
  check, foreignKey, index, integer, pgPolicy, pgTable, text, timestamp,
  unique, uuid, varchar,
} from "drizzle-orm/pg-core";
import {
  cases, institutionMemberships, institutions, observedContent,
  officialReferenceVersions,
} from "./index";
import { semanticAnalyses } from "./semantic";

const time = (name: string) => timestamp(name, { withTimezone: true });
const tenantPolicy = (name: string) => pgPolicy(name, {
  for: "all",
  using: sql`institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid`,
  withCheck: sql`institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid`,
});

export const claimTopics = pgTable("marjea_claim_topics", {
  id: uuid("id").primaryKey().defaultRandom(),
  institutionId: uuid("institution_id").notNull().references(() => institutions.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 180 }).notNull(),
  normalizedKey: varchar("normalized_key", { length: 200 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: time("created_at").notNull().defaultNow(),
  archivedAt: time("archived_at"),
}, (t) => [
  unique("marjea_claim_topic_tenant_id_unique").on(t.institutionId, t.id),
  unique("marjea_claim_topic_key_unique").on(t.institutionId, t.normalizedKey),
  check("marjea_claim_topic_title_check", sql`length(trim(${t.title})) BETWEEN 1 AND 180`),
  foreignKey({ name: "marjea_claim_topic_creator_fk", columns: [t.institutionId, t.createdBy], foreignColumns: [institutionMemberships.tenantId, institutionMemberships.clerkUserId] }),
  index("marjea_claim_topic_created_idx").on(t.institutionId, t.createdAt),
  tenantPolicy("marjea_claim_topic_tenant_policy"),
]).enableRLS();

export const claims = pgTable("marjea_claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  institutionId: uuid("institution_id").notNull().references(() => institutions.id, { onDelete: "cascade" }),
  topicId: uuid("topic_id").notNull(),
  canonicalText: text("canonical_text").notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: time("created_at").notNull().defaultNow(),
  archivedAt: time("archived_at"),
}, (t) => [
  unique("marjea_claim_tenant_id_unique").on(t.institutionId, t.id),
  check("marjea_claim_text_check", sql`length(trim(${t.canonicalText})) BETWEEN 1 AND 4000`),
  foreignKey({ name: "marjea_claim_topic_fk", columns: [t.institutionId, t.topicId], foreignColumns: [claimTopics.institutionId, claimTopics.id] }),
  foreignKey({ name: "marjea_claim_creator_fk", columns: [t.institutionId, t.createdBy], foreignColumns: [institutionMemberships.tenantId, institutionMemberships.clerkUserId] }),
  index("marjea_claim_topic_idx").on(t.institutionId, t.topicId, t.createdAt),
  tenantPolicy("marjea_claim_tenant_policy"),
]).enableRLS();

export const claimVariants = pgTable("marjea_claim_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  institutionId: uuid("institution_id").notNull().references(() => institutions.id, { onDelete: "cascade" }),
  claimId: uuid("claim_id").notNull(),
  variantText: text("variant_text").notNull(),
  language: varchar("language", { length: 12 }).notNull().default("ar"),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: time("created_at").notNull().defaultNow(),
  archivedAt: time("archived_at"),
}, (t) => [
  unique("marjea_claim_variant_tenant_id_unique").on(t.institutionId, t.id),
  unique("marjea_claim_variant_text_unique").on(t.institutionId, t.claimId, t.variantText),
  check("marjea_claim_variant_text_check", sql`length(trim(${t.variantText})) BETWEEN 1 AND 4000`),
  check("marjea_claim_variant_language_check", sql`${t.language} IN ('ar','en','und')`),
  foreignKey({ name: "marjea_claim_variant_claim_fk", columns: [t.institutionId, t.claimId], foreignColumns: [claims.institutionId, claims.id] }),
  foreignKey({ name: "marjea_claim_variant_creator_fk", columns: [t.institutionId, t.createdBy], foreignColumns: [institutionMemberships.tenantId, institutionMemberships.clerkUserId] }),
  index("marjea_claim_variant_claim_idx").on(t.institutionId, t.claimId, t.createdAt),
  tenantPolicy("marjea_claim_variant_tenant_policy"),
]).enableRLS();

export const claimObservations = pgTable("marjea_claim_observations", {
  id: uuid("id").primaryKey().defaultRandom(),
  institutionId: uuid("institution_id").notNull().references(() => institutions.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").notNull(),
  observedContentId: uuid("observed_content_id").notNull(),
  datasetScope: varchar("dataset_scope", { length: 160 }).notNull(),
  relation: varchar("relation", { length: 24 }).notNull().default("related"),
  observedAt: time("observed_at").notNull(),
  recordedBy: varchar("recorded_by", { length: 255 }).notNull(),
  recordedAt: time("recorded_at").notNull().defaultNow(),
}, (t) => [
  unique("marjea_claim_observation_tenant_id_unique").on(t.institutionId, t.id),
  unique("marjea_claim_observation_pair_unique").on(t.institutionId, t.variantId, t.observedContentId, t.datasetScope),
  check("marjea_claim_observation_scope_check", sql`${t.datasetScope} IN ('ordinary','simulated')`),
  check("marjea_claim_observation_relation_check", sql`${t.relation} IN ('related','similar','quotes','contradicts')`),
  foreignKey({ name: "marjea_claim_observation_variant_fk", columns: [t.institutionId, t.variantId], foreignColumns: [claimVariants.institutionId, claimVariants.id] }),
  foreignKey({ name: "marjea_claim_observation_content_fk", columns: [t.institutionId, t.observedContentId], foreignColumns: [observedContent.tenantId, observedContent.id] }),
  foreignKey({ name: "marjea_claim_observation_recorder_fk", columns: [t.institutionId, t.recordedBy], foreignColumns: [institutionMemberships.tenantId, institutionMemberships.clerkUserId] }),
  index("marjea_claim_observation_order_idx").on(t.institutionId, t.variantId, t.observedAt, t.id),
  tenantPolicy("marjea_claim_observation_tenant_policy"),
]).enableRLS();

export const claimEvidence = pgTable("marjea_claim_evidence", {
  id: uuid("id").primaryKey().defaultRandom(),
  institutionId: uuid("institution_id").notNull().references(() => institutions.id, { onDelete: "cascade" }),
  claimId: uuid("claim_id").notNull(),
  referenceId: uuid("reference_id"),
  referenceVersionNumber: integer("reference_version_number"),
  observedContentId: uuid("observed_content_id"),
  caseId: uuid("case_id"),
  semanticAnalysisId: uuid("semantic_analysis_id"),
  note: text("note"),
  recordedBy: varchar("recorded_by", { length: 255 }).notNull(),
  recordedAt: time("recorded_at").notNull().defaultNow(),
}, (t) => [
  unique("marjea_claim_evidence_tenant_id_unique").on(t.institutionId, t.id),
  check("marjea_claim_evidence_target_check", sql`(CASE WHEN ${t.referenceId} IS NULL THEN 0 ELSE 1 END + CASE WHEN ${t.observedContentId} IS NULL THEN 0 ELSE 1 END + CASE WHEN ${t.caseId} IS NULL THEN 0 ELSE 1 END + CASE WHEN ${t.semanticAnalysisId} IS NULL THEN 0 ELSE 1 END) = 1`),
  check("marjea_claim_evidence_reference_version_pair_check", sql`(${t.referenceId} IS NULL) = (${t.referenceVersionNumber} IS NULL)`),
  foreignKey({ name: "marjea_claim_evidence_claim_fk", columns: [t.institutionId, t.claimId], foreignColumns: [claims.institutionId, claims.id] }),
  foreignKey({ name: "marjea_claim_evidence_reference_fk", columns: [t.institutionId, t.referenceId, t.referenceVersionNumber], foreignColumns: [officialReferenceVersions.tenantId, officialReferenceVersions.referenceId, officialReferenceVersions.versionNumber] }),
  foreignKey({ name: "marjea_claim_evidence_observation_fk", columns: [t.institutionId, t.observedContentId], foreignColumns: [observedContent.tenantId, observedContent.id] }),
  foreignKey({ name: "marjea_claim_evidence_case_fk", columns: [t.institutionId, t.caseId], foreignColumns: [cases.tenantId, cases.id] }),
  foreignKey({ name: "marjea_claim_evidence_analysis_fk", columns: [t.institutionId, t.semanticAnalysisId], foreignColumns: [semanticAnalyses.institutionId, semanticAnalyses.id] }),
  foreignKey({ name: "marjea_claim_evidence_recorder_fk", columns: [t.institutionId, t.recordedBy], foreignColumns: [institutionMemberships.tenantId, institutionMemberships.clerkUserId] }),
  index("marjea_claim_evidence_claim_idx").on(t.institutionId, t.claimId, t.recordedAt),
  tenantPolicy("marjea_claim_evidence_tenant_policy"),
]).enableRLS();

export const claimLineage = pgTable("marjea_claim_lineage", {
  id: uuid("id").primaryKey().defaultRandom(),
  institutionId: uuid("institution_id").notNull().references(() => institutions.id, { onDelete: "cascade" }),
  fromVariantId: uuid("from_variant_id").notNull(),
  toVariantId: uuid("to_variant_id").notNull(),
  relation: varchar("relation", { length: 32 }).notNull(),
  evidenceId: uuid("evidence_id"),
  reason: text("reason").notNull(),
  recordedBy: varchar("recorded_by", { length: 255 }).notNull(),
  recordedAt: time("recorded_at").notNull().defaultNow(),
}, (t) => [
  unique("marjea_claim_lineage_tenant_id_unique").on(t.institutionId, t.id),
  unique("marjea_claim_lineage_pair_unique").on(t.institutionId, t.fromVariantId, t.toVariantId, t.relation),
  check("marjea_claim_lineage_relation_check", sql`${t.relation} IN ('chronology','similarity','confirmed_propagation') AND ${t.fromVariantId} <> ${t.toVariantId}`),
  check("marjea_claim_lineage_reason_check", sql`length(trim(${t.reason})) BETWEEN 1 AND 2000 AND (${t.relation} <> 'confirmed_propagation' OR ${t.evidenceId} IS NOT NULL)`),
  foreignKey({ name: "marjea_claim_lineage_from_fk", columns: [t.institutionId, t.fromVariantId], foreignColumns: [claimVariants.institutionId, claimVariants.id] }),
  foreignKey({ name: "marjea_claim_lineage_to_fk", columns: [t.institutionId, t.toVariantId], foreignColumns: [claimVariants.institutionId, claimVariants.id] }),
  foreignKey({ name: "marjea_claim_lineage_evidence_fk", columns: [t.institutionId, t.evidenceId], foreignColumns: [claimEvidence.institutionId, claimEvidence.id] }),
  foreignKey({ name: "marjea_claim_lineage_recorder_fk", columns: [t.institutionId, t.recordedBy], foreignColumns: [institutionMemberships.tenantId, institutionMemberships.clerkUserId] }),
  index("marjea_claim_lineage_from_idx").on(t.institutionId, t.fromVariantId, t.recordedAt),
  tenantPolicy("marjea_claim_lineage_tenant_policy"),
]).enableRLS();
