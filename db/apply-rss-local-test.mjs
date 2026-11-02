import pg from "pg";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

if (process.env.NODE_ENV === "production" || process.env.MARJEA_APPLY_DEV_MIGRATION !== "1") {
  throw new Error("Requires explicit development migration opt-in.");
}
if (!process.env.DATABASE_URL) throw new Error("Development DATABASE_URL required.");

const name = "rss_local_test";
const migrationSql = await readFile(new URL("./migrations/20261029_rss_local_test.sql", import.meta.url), "utf8");
const checksum = createHash("sha256").update(migrationSql).digest("hex");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(hashtext('marjea-schema-migrations'))");
  const database = await client.query("SELECT current_database() AS name");
  const targetName = String(database.rows[0]?.name ?? "");
  if (!targetName || /prod/i.test(targetName)) throw new Error("Refusing non-development database target.");
  await client.query("CREATE TABLE IF NOT EXISTS marjea_schema_migrations(name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())");
  const existing = await client.query("SELECT checksum FROM marjea_schema_migrations WHERE name=$1", [name]);
  if (existing.rows.length && existing.rows[0].checksum !== checksum) throw new Error("Applied migration checksum mismatch.");
  if (!existing.rows.length) {
    await client.query(migrationSql);
    await client.query("INSERT INTO marjea_schema_migrations(name,checksum) VALUES($1,$2)", [name, checksum]);
  }
  await client.query("COMMIT");
  console.info("Additive RSS local-test schema is ready; existing rows were not changed.");
} catch {
  await client.query("ROLLBACK").catch(() => {});
  console.error("RSS local-test development migration failed; transaction rolled back.");
  process.exitCode = 1;
} finally {
  await client.end();
}
