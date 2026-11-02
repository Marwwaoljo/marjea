import pg from "pg";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

// Explicit development migration; never called automatically at server start.
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const sql = await readFile(new URL("./migrations/20261002_phase15.sql", import.meta.url), "utf8");
const checksum = createHash("sha256").update(sql).digest("hex");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(hashtext('marjea-schema-migrations'))");
  await client.query(`CREATE TABLE IF NOT EXISTS marjea_schema_migrations (
    name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const existing = await client.query("SELECT checksum FROM marjea_schema_migrations WHERE name=$1", ["phase15"]);
  if (existing.rows.length) {
    if (existing.rows[0].checksum !== checksum) throw new Error("Applied migration checksum mismatch; create a new migration.");
    console.info("Phase 1.5 migration is already applied.");
  } else {
    await client.query(sql);
    await client.query("INSERT INTO marjea_schema_migrations(name,checksum) VALUES($1,$2)", ["phase15", checksum]);
    console.info("Phase 1.5 additive migration applied.");
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}