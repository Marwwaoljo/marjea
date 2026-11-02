import { sql } from "drizzle-orm";
import { bigint, boolean, check, foreignKey, index, integer, pgPolicy, pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { institutionMemberships, institutions } from "./index";

const tenantPolicy = (name: string) => pgPolicy(name, {
  for: "all",
  using: sql`institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid`,
  withCheck: sql`institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid`,
});
const webhookPolicy = (name: string) => pgPolicy(name, {
  for: "all",
  using: sql`current_setting('marjea.telegram_service', true) = 'verified'`,
  withCheck: sql`current_setting('marjea.telegram_service', true) = 'verified'`,
});
const time = (name: string) => timestamp(name, { withTimezone: true });

// Global service-only dedupe ledger. The webhook stores identifiers and status,
// never Telegram update bodies or report text.
export const telegramWebhookUpdates = pgTable("marjea_telegram_webhook_updates", {
  updateId: bigint("update_id", { mode: "number" }).primaryKey(),
  receivedAt: time("received_at").notNull().defaultNow(),
  completedAt: time("completed_at"),
  outcome: varchar("outcome", { length: 32 }).notNull().default("received"),
}, (t) => [
  check("marjea_tg_update_outcome_check", sql`${t.outcome} IN ('received','processed','ignored','failed')`),
  index("marjea_tg_update_received_idx").on(t.receivedAt),
  webhookPolicy("marjea_tg_updates_service_policy"),
]).enableRLS();

// Internal routing index used only by the signed webhook path.
export const telegramChatRoutes = pgTable("marjea_telegram_chat_routes", {
  chatId: bigint("chat_id", { mode: "number" }).primaryKey(),
  institutionId: uuid("institution_id").notNull().references(() => institutions.id, { onDelete: "cascade" }),
  consentAt: time("consent_at"),
  consentVersion: varchar("consent_version", { length: 40 }),
  flowState: varchar("flow_state", { length: 32 }).notNull().default("idle"),
  rateWindowStartedAt: time("rate_window_started_at").notNull().defaultNow(),
  rateCount: integer("rate_count").notNull().default(0),
  updatedAt: time("updated_at").notNull().defaultNow(),
}, (t) => [
  check("marjea_tg_flow_state_check", sql`${t.flowState} IN ('idle','awaiting_consent','awaiting_report')`),
  check("marjea_tg_rate_count_check", sql`${t.rateCount} >= 0`),
  index("marjea_tg_routes_institution_idx").on(t.institutionId),
  webhookPolicy("marjea_tg_routes_service_policy"),
]).enableRLS();

export const telegramInstitutionLinks = pgTable("marjea_telegram_institution_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  institutionId: uuid("institution_id").notNull().references(() => institutions.id, { onDelete: "cascade" }),
  generation: integer("generation").notNull().default(1),
  tokenHash: varchar("token_hash", { length: 64 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: time("created_at").notNull().defaultNow(),
  revokedAt: time("revoked_at"),
}, (t) => [
  unique("marjea_tg_link_tenant_unique").on(t.institutionId),
  unique("marjea_tg_link_hash_unique").on(t.tokenHash),
  check("marjea_tg_link_generation_check", sql`${t.generation} >= 1`),
  foreignKey({ name: "marjea_tg_link_creator_fk", columns: [t.institutionId, t.createdBy], foreignColumns: [institutionMemberships.tenantId, institutionMemberships.clerkUserId] }),
  tenantPolicy("marjea_tg_link_tenant_policy"),
]).enableRLS();

export const telegramReports = pgTable("marjea_telegram_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  institutionId: uuid("institution_id").notNull().references(() => institutions.id, { onDelete: "cascade" }),
  updateId: bigint("update_id", { mode: "number" }).notNull(),
  chatId: bigint("chat_id", { mode: "number" }).notNull(),
  reportText: text("report_text").notNull(),
  sourceUrl: text("source_url"),
  consentAt: time("consent_at").notNull(),
  consentVersion: varchar("consent_version", { length: 40 }).notNull(),
  status: varchar("status", { length: 24 }).notNull().default("new"),
  reviewedBy: varchar("reviewed_by", { length: 255 }),
  reviewedAt: time("reviewed_at"),
  createdAt: time("created_at").notNull().defaultNow(),
}, (t) => [
  unique("marjea_tg_report_update_unique").on(t.updateId),
  check("marjea_tg_report_text_check", sql`length(trim(${t.reportText})) BETWEEN 1 AND 4000`),
  check("marjea_tg_report_status_check", sql`${t.status} IN ('new','reviewed','accepted','rejected')`),
  foreignKey({ name: "marjea_tg_report_reviewer_fk", columns: [t.institutionId, t.reviewedBy], foreignColumns: [institutionMemberships.tenantId, institutionMemberships.clerkUserId] }),
  tenantPolicy("marjea_tg_report_tenant_policy"),
  index("marjea_tg_report_inbox_idx").on(t.institutionId, t.status, t.createdAt),
  index("marjea_tg_report_owner_idx").on(t.institutionId, t.chatId, t.createdAt),
]).enableRLS();
