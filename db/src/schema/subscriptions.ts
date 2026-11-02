import { sql } from "drizzle-orm";
import { check, foreignKey, index, pgPolicy, pgTable, text, timestamp, unique, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { institutionMemberships, institutions } from "./index";

// Keep the migration ledger in the declared schema so a subsequent schema push
// does not mistake it for an obsolete application table.
export const schemaMigrations = pgTable("marjea_schema_migrations", {
  name: text("name").primaryKey(),
  checksum: text("checksum").notNull(),
  appliedAt: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow(),
});

export const institutionSubscriptions = pgTable("marjea_institution_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  institutionId: uuid("institution_id").notNull().references(() => institutions.id, { onDelete: "cascade" }),
  planKey: varchar("plan_key", { length: 30 }).notNull(),
  subscriptionStatus: varchar("subscription_status", { length: 30 }).notNull().default("requested"),
  requestedBy: varchar("requested_by", { length: 255 }).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check("marjea_subscription_plan_check", sql`${table.planKey} IN ('explore', 'institutional', 'partnership')`),
  check("marjea_subscription_status_check", sql`${table.subscriptionStatus} IN ('requested', 'pilot', 'pending_contract', 'active', 'suspended', 'cancelled')`),
  uniqueIndex("marjea_subscription_open_unique").on(table.institutionId).where(sql`${table.subscriptionStatus} <> 'cancelled'`),
  index("marjea_subscription_institution_idx").on(table.institutionId),
  foreignKey({
    name: "marjea_subscription_requester_membership_fk",
    columns: [table.institutionId, table.requestedBy],
    foreignColumns: [institutionMemberships.tenantId, institutionMemberships.clerkUserId],
  }),
  pgPolicy("marjea_subscription_tenant_policy", {
    for: "all",
    using: sql`institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid`,
    withCheck: sql`institution_id = NULLIF(current_setting('marjea.tenant_id', true), '')::uuid`,
  }),
]).enableRLS();

// Like the membership bridge, receipts are looked up across institutions by
// authenticated identity. They contain no contact data; every query scopes user+key.
export const onboardingRequests = pgTable("marjea_onboarding_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
  requestKey: uuid("request_key").notNull(),
  requestHash: text("request_hash").notNull(),
  institutionId: uuid("institution_id").notNull().references(() => institutions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("marjea_onboarding_user_key_unique").on(table.clerkUserId, table.requestKey),
  foreignKey({
    name: "marjea_onboarding_creator_membership_fk",
    columns: [table.institutionId, table.clerkUserId],
    foreignColumns: [institutionMemberships.tenantId, institutionMemberships.clerkUserId],
  }),
]);