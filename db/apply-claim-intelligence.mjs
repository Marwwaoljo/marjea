// Explicit development-only reconciliation. Never run at server startup/build.
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import pg from "pg";

if (
  process.env.NODE_ENV === "production" ||
  process.env.MARJEA_APPLY_DEV_MIGRATION !== "1" ||
  process.env.MARJEA_DATABASE_ENVIRONMENT !== "development"
) {
  throw new Error("Requires an explicit development target and MARJEA_APPLY_DEV_MIGRATION=1.");
}
if (!process.env.DATABASE_URL || !process.env.MARJEA_DEV_DATABASE_NAME) {
  throw new Error("Development database configuration is incomplete.");
}

const migrations = [
  {
    name: "claim_intelligence",
    path: "./migrations/20261017_claim_intelligence.sql",
  },
  {
    name: "claim_evidence_reference_version_pair",
    path: "./migrations/20261028_claim_evidence_reference_version_pair.sql",
  },
];
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  const target = await client.query("SELECT current_database() AS name");
  if (target.rows[0]?.name !== process.env.MARJEA_DEV_DATABASE_NAME) {
    throw new Error("Connected database does not match the configured development database.");
  }

  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(hashtext('marjea-schema-migrations'))");
  await client.query(
    "CREATE TABLE IF NOT EXISTS marjea_schema_migrations(name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())",
  );

  for (const migration of migrations) {
    const ddl = await readFile(new URL(migration.path, import.meta.url), "utf8");
    const checksum = createHash("sha256").update(ddl).digest("hex");
    const { rows } = await client.query(
      "SELECT checksum FROM marjea_schema_migrations WHERE name=$1",
      [migration.name],
    );
    if (rows.length && rows[0].checksum !== checksum) {
      throw new Error("Migration checksum mismatch.");
    }
    if (!rows.length) {
      await client.query(ddl);
      await client.query(
        "INSERT INTO marjea_schema_migrations(name,checksum) VALUES($1,$2)",
        [migration.name, checksum],
      );
    }
  }

  await client.query("COMMIT");
  console.info("Development claim-intelligence migrations committed successfully.");
} catch {
  await client.query("ROLLBACK").catch(() => {});
  console.error("Claim-intelligence migration failed; the transaction was rolled back.");
  process.exitCode = 1;
} finally {
  await client.end();
}
