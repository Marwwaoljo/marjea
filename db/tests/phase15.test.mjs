import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";

// Explicit opt-in: isolated development schema tests, never server startup.
test("Phase 1.5 constraints protect request ownership and open subscriptions", {
  skip: process.env.MARJEA_RUN_DB_TESTS !== "1",
}, async () => {
  assert.ok(process.env.DATABASE_URL, "A development database is required");
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const tenantA = randomUUID(), tenantB = randomUUID(), key = randomUUID();
  const user = `user_constraint_test_${randomUUID()}`;
  async function rejects(query, values, code) {
    await client.query("SAVEPOINT rejected_write");
    try {
      await assert.rejects(client.query(query, values), (error) => error.code === code);
    } finally {
      await client.query("ROLLBACK TO SAVEPOINT rejected_write");
      await client.query("RELEASE SAVEPOINT rejected_write");
    }
  }
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO marjea_institutions(id,name) VALUES ($1,'constraint fixture'),($2,'constraint fixture')", [tenantA, tenantB]);
    const legacy = await client.query("SELECT institution_type,contact_name,contact_email FROM marjea_institutions WHERE id=$1", [tenantA]);
    assert.deepEqual(legacy.rows[0], { institution_type: null, contact_name: null, contact_email: null });
    await client.query("INSERT INTO marjea_institution_memberships(tenant_id,clerk_user_id,role) VALUES($1,$2,'tenant_admin')", [tenantA, user]);
    await client.query("SELECT set_config('marjea.tenant_id',$1,true)", [tenantA]);
    const insert = "INSERT INTO marjea_institution_subscriptions(institution_id,plan_key,requested_by) VALUES($1,$2,$3)";
    const created = await client.query(`${insert} RETURNING subscription_status,started_at,expires_at`, [tenantA, "institutional", user]);
    assert.deepEqual(created.rows[0], { subscription_status: "requested", started_at: null, expires_at: null });
    await rejects(insert, [tenantA, "partnership", user], "23505");
    await rejects(insert, [tenantB, "institutional", user], "23503");
    await rejects("UPDATE marjea_institutions SET institution_type='invented' WHERE id=$1", [tenantA], "23514");
    await rejects("UPDATE marjea_institution_subscriptions SET plan_key='invented' WHERE institution_id=$1", [tenantA], "23514");
    await rejects("UPDATE marjea_institution_subscriptions SET subscription_status='paid' WHERE institution_id=$1", [tenantA], "23514");
    await client.query("UPDATE marjea_institution_subscriptions SET subscription_status='cancelled' WHERE institution_id=$1", [tenantA]);
    await client.query(insert, [tenantA, "institutional", user]);
    const receipt = "INSERT INTO marjea_onboarding_requests(clerk_user_id,request_key,request_hash,institution_id) VALUES($1,$2,'test-hash',$3)";
    await client.query(receipt, [user, key, tenantA]);
    await rejects(receipt, [user, key, tenantA], "23505");
    await rejects(receipt, [user, randomUUID(), tenantB], "23503");
    const policy = await client.query("SELECT relrowsecurity FROM pg_class WHERE oid='marjea_institution_subscriptions'::regclass");
    assert.equal(policy.rows[0].relrowsecurity, true);
  } finally {
    await client.query("ROLLBACK");
    await client.end();
  }
});