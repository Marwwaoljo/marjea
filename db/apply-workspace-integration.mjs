// Development reconciliation only. Never invoked at production startup/build.
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import pg from "pg";
if (process.env.NODE_ENV === "production" || process.env.MARJEA_APPLY_DEV_MIGRATION !== "1") {
  throw new Error("Requires explicit MARJEA_APPLY_DEV_MIGRATION=1 outside production.");
}
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
const name = "workspace_integration";
const ddl = await readFile(new URL("./migrations/20261003_workspace_integration.sql", import.meta.url), "utf8");
const checksum = createHash("sha256").update(ddl).digest("hex");
try {
  await client.connect();
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(hashtext('marjea-schema-migrations'))");
  await client.query("CREATE TABLE IF NOT EXISTS marjea_schema_migrations(name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())");
  const { rows } = await client.query("SELECT checksum FROM marjea_schema_migrations WHERE name=$1", [name]);
  if (rows.length && rows[0].checksum !== checksum) throw new Error("Migration checksum mismatch");
  if (!rows.length) {
    await client.query(ddl);
    await client.query("INSERT INTO marjea_schema_migrations(name,checksum) VALUES($1,$2)", [name, checksum]);
  }
  await client.query("COMMIT");
  console.info("Development workspace integration schema is ready; data and feature activation unchanged.");
} catch {
  await client.query("ROLLBACK").catch(() => {});
  console.error("Development workspace schema reconciliation failed; no partial migration was committed.");
  process.exitCode = 1;
} finally { await client.end(); }