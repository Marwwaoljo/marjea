import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import pg from "pg";

const { Client } = pg;
const connectionString = process.env.MARJEA_RLS_TEST_DATABASE_URL;

test("institution test policies are additive and fail closed", async () => {
  const sql = await readFile(new URL("./institution_rls_test_policies.sql", import.meta.url), "utf8");
  assert.match(sql, /FORCE ROW LEVEL SECURITY/g);
  assert.match(sql, /marjea\.tenant_id/g);
  assert.match(sql, /marjea\.user_id/g);
  assert.match(sql, /marjea_institution_verification_reviews_tenant_policy/);
  assert.doesNotMatch(sql, /\bDROP\s+(POLICY|TABLE|SCHEMA)\b/i);
  assert.match(sql, /TEST DATABASE ONLY/);
});

test("limited RLS role isolates two synthetic institutions", {
  skip: connectionString ? false : "MARJEA_RLS_TEST_DATABASE_URL is not configured",
}, async () => {
  const url = new URL(connectionString);
  const sslmode = url.searchParams.get("sslmode");
  const client = new Client({
    host: url.hostname,
    port: url.port ? Number(url.port) : undefined,
    database: decodeURIComponent(url.pathname.slice(1)),
    user: decodeURIComponent(url.username),
    password: process.env.MARJEA_RLS_TEST_PASSWORD,
    ssl: sslmode === "disable"
      ? false
      : sslmode
        ? { rejectUnauthorized: !["require", "prefer", "allow"].includes(sslmode) }
        : undefined,
  });
  await client.connect();

  const a = randomUUID();
  const b = randomUUID();
  const userA = `rls_test_a_${randomUUID()}`;
  const userB = `rls_test_b_${randomUUID()}`;

  try {
    const { rows: [role] } = await client.query(`
      SELECT current_database() AS database_name, current_user AS role_name,
             rolsuper, rolbypassrls, rolcreatedb, rolcreaterole, rolreplication, rolinherit
      FROM pg_roles WHERE rolname = current_user
    `);
    assert.equal(role.database_name, "marjea_institution_test_20261102");
    assert.equal(role.role_name, "marjea_rls_test_app");
    assert.equal(role.rolsuper, false);
    assert.equal(role.rolbypassrls, false);
    assert.equal(role.rolcreatedb, false);
    assert.equal(role.rolcreaterole, false);
    assert.equal(role.rolreplication, false);
    assert.equal(role.rolinherit, false);

    const { rows: tables } = await client.query(`
      SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity,
             pg_get_userbyid(c.relowner) = current_user AS owned_by_runtime
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public'
        AND c.relname = ANY($1::text[])
    `, [["marjea_institutions", "marjea_institution_memberships", "marjea_institution_verification_reviews"]]);
    assert.equal(tables.length, 3);
    for (const table of tables) {
      assert.equal(table.relrowsecurity, true, `${table.relname}: RLS`);
      assert.equal(table.relforcerowsecurity, true, `${table.relname}: FORCE RLS`);
      assert.equal(table.owned_by_runtime, false, `${table.relname}: not owned by test role`);
    }

    await client.query("BEGIN");
    await client.query("SELECT set_config('marjea.tenant_id',$1,true), set_config('marjea.user_id',$2,true)", [a, userA]);
    await client.query("INSERT INTO marjea_institutions(id,name) VALUES ($1,'Synthetic A')", [a]);
    await client.query("INSERT INTO marjea_institution_memberships(id,tenant_id,clerk_user_id,role) VALUES ($1,$2,$3,'analyst')", [randomUUID(), a, userA]);
    await client.query("SELECT set_config('marjea.tenant_id',$1,true), set_config('marjea.user_id',$2,true)", [b, userB]);
    await client.query("INSERT INTO marjea_institutions(id,name) VALUES ($1,'Synthetic B')", [b]);
    await client.query("INSERT INTO marjea_institution_memberships(id,tenant_id,clerk_user_id,role) VALUES ($1,$2,$3,'analyst')", [randomUUID(), b, userB]);
    await client.query("UPDATE marjea_institutions SET legal_verification_status='VERIFIED' WHERE id=$1", [b]);
    await client.query("SELECT set_config('marjea.tenant_id',$1,true), set_config('marjea.user_id',$2,true)", [a, userA]);
    const revokedUser = `${userA}_revoked`;
    await client.query("INSERT INTO marjea_institution_memberships(id,tenant_id,clerk_user_id,role) VALUES ($1,$2,$3,'analyst')", [randomUUID(), a, revokedUser]);
    await client.query("UPDATE marjea_institution_memberships SET revoked_at=now() WHERE tenant_id=$1 AND clerk_user_id=$2", [a, revokedUser]);

    await client.query("SELECT set_config('marjea.tenant_id',$1,true), set_config('marjea.user_id',$2,true)", [a, userA]);
    const institutions = await client.query("SELECT id FROM marjea_institutions WHERE id = ANY($1::uuid[])", [[a, b]]);
    assert.deepEqual(institutions.rows.map(row => row.id), [a]);
    const memberships = await client.query("SELECT tenant_id FROM marjea_institution_memberships WHERE tenant_id = ANY($1::uuid[])", [[a, b]]);
    assert.ok(memberships.rows.length >= 1);
    assert.ok(memberships.rows.every(row => row.tenant_id === a));

    const updateOther = await client.query("UPDATE marjea_institutions SET name='changed' WHERE id=$1", [b]);
    assert.equal(updateOther.rowCount, 0);
    const deleteOther = await client.query("DELETE FROM marjea_institution_memberships WHERE tenant_id=$1", [b]);
    assert.equal(deleteOther.rowCount, 0);
    await client.query("SAVEPOINT cross_tenant_insert");
    await assert.rejects(
      client.query("INSERT INTO marjea_institution_memberships(id,tenant_id,clerk_user_id,role) VALUES ($1,$2,$3,'analyst')", [randomUUID(), b, `forged_${randomUUID()}`]),
      error => error.code === "42501",
    );
    await client.query("ROLLBACK TO SAVEPOINT cross_tenant_insert");

    await client.query("SELECT set_config('marjea.tenant_id','',true)");
    const ownMemberships = await client.query("SELECT tenant_id FROM marjea_institution_memberships");
    assert.deepEqual(ownMemberships.rows.map(row => row.tenant_id), [a]);
    await client.query("SELECT set_config('marjea.user_id',$1,true)", [revokedUser]);
    assert.equal((await client.query("SELECT id FROM marjea_institution_memberships")).rowCount, 0, "revoked membership is not active");
    const reviewer = `reviewer_${randomUUID()}`;
    await client.query("SELECT set_config('marjea.user_id',$1,true)", [reviewer]);
    const queue = await client.query(
      "SELECT id FROM marjea_institutions WHERE id = ANY($1::uuid[]) AND legal_verification_status='PENDING'",
      [[a, b]],
    );
    assert.equal(queue.rowCount, 0, "ordinary member cannot see the platform review queue");
    await client.query("SELECT set_config('marjea.platform_review_access','true',true)");
    const pending = await client.query(
      "SELECT id FROM marjea_institutions WHERE id = ANY($1::uuid[]) AND legal_verification_status='PENDING'",
      [[a, b]],
    );
    assert.deepEqual(pending.rows.map(row => row.id), [a], "platform context exposes pending institution rows only");
    await client.query("SELECT set_config('marjea.platform_review_access','',true), set_config('marjea.user_id','',true)");
    assert.equal((await client.query("SELECT id FROM marjea_institutions")).rowCount, 0);
    await assert.rejects(
      client.query("INSERT INTO marjea_institutions(id,name) VALUES ($1,'No context')", [randomUUID()]),
      error => error.code === "42501",
    );
    await client.query("ROLLBACK");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
});
