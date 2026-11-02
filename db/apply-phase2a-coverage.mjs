import pg from "pg";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

if (process.env.NODE_ENV === "production" || process.env.MARJEA_APPLY_DEV_MIGRATION !== "1") {
  throw new Error("Requires explicit development migration opt-in.");
}
if (!process.env.DATABASE_URL) throw new Error("Development DATABASE_URL required.");
const sql = await readFile(new URL("./migrations/20261003_phase2a_coverage.sql", import.meta.url), "utf8");
const checksum = createHash("sha256").update(sql).digest("hex");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(hashtext('marjea-schema-migrations'))");
  const existing = await client.query("SELECT checksum FROM marjea_schema_migrations WHERE name=$1", ["phase2a_coverage"]);
  if (existing.rows.length) {
    if (existing.rows[0].checksum !== checksum) throw new Error("Applied migration checksum mismatch.");
    console.info("Coverage migration already applied.");
  } else {
    await client.query(sql);
    await client.query("INSERT INTO marjea_schema_migrations(name,checksum) VALUES($1,$2)", ["phase2a_coverage", checksum]);
    console.info("Coverage migration applied to development.");
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  console.error("Development coverage migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}