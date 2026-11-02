import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
export type DatabaseTransaction = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];

/**
 * Pin every tenant-owned query in a request to a transaction-local PostgreSQL
 * setting. Tenant services still include explicit tenant predicates and verify
 * membership; the setting is an additional boundary for the schema's RLS rules.
 */
export async function withTenantContext<T>(
  tenantId: string,
  operation: (tx: DatabaseTransaction) => Promise<T>,
  verifiedUserId?: string,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('marjea.tenant_id', ${tenantId}, true)`,
    );
    if (verifiedUserId) {
      await tx.execute(
        sql`select set_config('marjea.user_id', ${verifiedUserId}, true)`,
      );
    }
    return operation(tx);
  });
}

export async function withUserContext<T>(
  verifiedUserId: string,
  operation: (tx: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('marjea.user_id', ${verifiedUserId}, true)`,
    );
    return operation(tx);
  });
}

export async function withPlatformReviewContext<T>(
  verifiedReviewerId: string,
  operation: (tx: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('marjea.user_id', ${verifiedReviewerId}, true)`,
    );
    await tx.execute(
      sql`select set_config('marjea.platform_review_access', 'true', true)`,
    );
    return operation(tx);
  });
}

export * from "./schema";
