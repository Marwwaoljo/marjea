import pg from "pg";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

// Explicit development-only operation. Never imported by app startup or publish.
if (process.env.NODE_ENV === "production" || process.env.MARJEA_APPLY_DEV_MIGRATION !== "1") {
  throw new Error("Requires explicit MARJEA_APPLY_DEV_MIGRATION=1 outside production.");
}
if (!process.env.DATABASE_URL) throw new Error("Development DATABASE_URL is required.");
const schema = await readFile(new URL("./migrations/20261002_phase2a.sql", import.meta.url), "utf8");
const guards = await readFile(new URL("./migrations/20261002_phase2a_guards.sql", import.meta.url), "utf8");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
async function apply(name, sql) {
  const checksum = createHash("sha256").update(sql).digest("hex");
  await client.query("BEGIN");
  try {
    const existing = await client.query("SELECT checksum FROM marjea_schema_migrations WHERE name=$1", [name]);
    if (existing.rows.length) {
      if (existing.rows[0].checksum !== checksum) throw new Error("Migration checksum mismatch; create a new migration.");
      console.info(`${name}: already applied.`);
    } else {
      await client.query(sql);
      await client.query("INSERT INTO marjea_schema_migrations(name,checksum) VALUES($1,$2)", [name, checksum]);
      console.info(`${name}: applied to development.`);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
try {
  await client.query("SELECT pg_advisory_lock(hashtext('marjea-schema-migrations'))");
  // PostgreSQL requires committing a new enum value before using it in checks.
  await apply("phase2a_review_enum", "ALTER TYPE marjea_review_decision ADD VALUE IF NOT EXISTS 'reject';");
  await apply("phase2a", schema + "\n" + guards);
} catch (error) {
  console.error("Development migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await client.query("SELECT pg_advisory_unlock(hashtext('marjea-schema-migrations'))");
  await client.end();
}