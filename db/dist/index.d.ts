import * as schema from "./schema";
export declare const pool: import("pg").Pool;
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
    $client: import("pg").Pool;
};
export type DatabaseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
/**
 * Pin every tenant-owned query in a request to a transaction-local PostgreSQL
 * setting. Tenant services still include explicit tenant predicates and verify
 * membership; the setting is an additional boundary for the schema's RLS rules.
 */
export declare function withTenantContext<T>(tenantId: string, operation: (tx: DatabaseTransaction) => Promise<T>, verifiedUserId?: string): Promise<T>;
export declare function withUserContext<T>(verifiedUserId: string, operation: (tx: DatabaseTransaction) => Promise<T>): Promise<T>;
export declare function withPlatformReviewContext<T>(verifiedReviewerId: string, operation: (tx: DatabaseTransaction) => Promise<T>): Promise<T>;
export * from "./schema";
//# sourceMappingURL=index.d.ts.map