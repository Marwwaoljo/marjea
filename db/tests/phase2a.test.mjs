import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";

test("Phase 2A development schema: isolation, immutable inputs, idempotency and legacy review", {
  skip: process.env.MARJEA_RUN_DB_TESTS !== "1",
}, async () => {
  assert.notEqual(process.env.NODE_ENV, "production");
  assert.ok(process.env.DATABASE_URL);
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const a = randomUUID(), b = randomUUID(), ref = randomUUID(), otherRef = randomUUID();
  const content = randomUUID(), otherContent = randomUUID(), caseId = randomUUID(), wrongCase = randomUUID();
  const analysis = randomUUID(), draft = randomUUID(), scenario = randomUUID();
  const requester = `fixture_requester_${randomUUID()}`, reviewer = `fixture_reviewer_${randomUUID()}`;
  const role = `marjea_gate1_${randomUUID().replaceAll("-", "")}`;
  const hash = "a".repeat(64);
  async function rejects(sql, values, code) {
    await client.query("SAVEPOINT invalid_write");
    try {
      await assert.rejects(client.query(sql, values), (e) => e.code === code, sql);
    } finally {
      await client.query("ROLLBACK TO SAVEPOINT invalid_write");
      await client.query("RELEASE SAVEPOINT invalid_write");
    }
  }
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO marjea_institutions(id,name) VALUES($1,'isolated fixture'),($2,'isolated fixture')", [a, b]);
    for (const tenant of [a, b]) {
      await client.query("INSERT INTO marjea_institution_memberships(tenant_id,clerk_user_id,role) VALUES($1,$2,'analyst'),($1,$3,'reviewer')", [tenant, requester, reviewer]);
    }
    await client.query("SELECT set_config('marjea.tenant_id',$1,true)", [a]);
    for (const [tenant, reference, observation] of [[a, ref, content], [b, otherRef, otherContent]]) {
      const source = randomUUID();
      await client.query("INSERT INTO marjea_official_references(id,tenant_id,title,issuing_entity,source_url,status,created_by_clerk_user_id) VALUES($1,$2,'fixture reference','fixture','https://example.test','sari',$3)", [reference, tenant, requester]);
      await client.query("INSERT INTO marjea_official_reference_versions(tenant_id,reference_id,version_number,content_text,created_by_clerk_user_id) VALUES($1,$2,1,'original reference',$3)", [tenant, reference, requester]);
      await client.query("INSERT INTO marjea_monitor_sources(id,tenant_id,name,created_by_clerk_user_id) VALUES($1,$2,'fixture source',$3)", [source, tenant, requester]);
      await client.query("INSERT INTO marjea_observed_content(id,tenant_id,source_id,content_text,created_by_clerk_user_id) VALUES($1,$2,$3,'original observation',$4)", [observation, tenant, source, requester]);
    }
    await client.query("INSERT INTO marjea_cases(id,tenant_id,title,reference_id,observed_content_id,created_by_clerk_user_id) VALUES($1,$2,'matching case',$3,$4,$5),($6,$2,'wrong pair',NULL,$4,$5)", [caseId, a, ref, content, requester, wrongCase]);
    const insert = `INSERT INTO marjea_semantic_analyses(id,institution_id,official_reference_id,
      official_reference_version_number,observed_content_id,case_id,requested_by,engine_version,
      model,schema_version,prompt_version,dataset_scope,input_hash,
      official_reference_snapshot,observed_content_snapshot)
      VALUES($1,$2,$3,1,$4,$5,$6,'fixture-engine','fixture-model','semantic-v1','fixture-prompt',
      'ordinary',$7,'{"contentText":"original reference"}','{"contentText":"original observation"}')`;
    await client.query(insert, [analysis, a, ref, content, caseId, requester, hash]);
    await rejects(insert, [randomUUID(), a, ref, content, caseId, requester, hash], "23505");
    await rejects(insert, [randomUUID(), a, otherRef, content, null, requester, "b".repeat(64)], "23503");
    await rejects(insert, [randomUUID(), a, ref, otherContent, null, requester, "b".repeat(64)], "23503");
    await rejects(insert, [randomUUID(), a, ref, content, wrongCase, requester, "b".repeat(64)], "23503");
    await rejects("UPDATE marjea_semantic_analyses SET confidence=1.01 WHERE id=$1", [analysis], "23514");
    await rejects("UPDATE marjea_semantic_analyses SET confidence='NaN' WHERE id=$1", [analysis], "23514");
    await rejects("UPDATE marjea_semantic_analyses SET official_reference_snapshot='{\"contentText\":\"changed\"}' WHERE id=$1", [analysis], "23514");
    await rejects("UPDATE marjea_semantic_analyses SET engine_version='changed' WHERE id=$1", [analysis], "23514");
    await rejects("UPDATE marjea_semantic_analyses SET analysis_status='pending_human_review' WHERE id=$1", [analysis], "23514");
    await rejects("UPDATE marjea_semantic_analyses SET analysis_status='failed' WHERE id=$1", [analysis], "23514");
    await client.query("UPDATE marjea_official_reference_versions SET content_text='later text' WHERE tenant_id=$1 AND reference_id=$2", [a, ref]);
    const saved = await client.query("SELECT official_reference_snapshot FROM marjea_semantic_analyses WHERE id=$1", [analysis]);
    assert.equal(saved.rows[0].official_reference_snapshot.contentText, "original reference");
    await client.query("UPDATE marjea_semantic_analyses SET structured_result='{}',confidence=0.6,suggested_route='human_review',analyzed_at=now(),analysis_status='pending_human_review' WHERE id=$1", [analysis]);
    await rejects("UPDATE marjea_semantic_analyses SET structured_result='{\"changed\":true}' WHERE id=$1", [analysis], "23514");
    await rejects("UPDATE marjea_semantic_analyses SET analysis_status='approved' WHERE id=$1", [analysis], "23514");
    await rejects("UPDATE marjea_semantic_analyses SET reviewed_by=$2,reviewed_at=now() WHERE id=$1", [analysis, requester], "23514");

    const review = `INSERT INTO marjea_review_steps(tenant_id,case_id,target_kind,semantic_analysis_id,sequence_number,reviewer_clerk_user_id,created_by_clerk_user_id)
      VALUES($1,$2,'semantic_analysis',$3,1,$4,$5)`;
    await rejects(review, [a, caseId, analysis, requester, requester], "23514");
    await client.query(review, [a, caseId, analysis, reviewer, requester]);
    await rejects(review, [a, caseId, analysis, reviewer, requester], "23505");
    await rejects(review.replace(",1,$4", ",2,$4"), [a, wrongCase, analysis, reviewer, requester], "23503");
    await client.query("INSERT INTO marjea_response_drafts(id,tenant_id,case_id,draft_text,created_by_clerk_user_id) VALUES($1,$2,$3,'human response',$4)", [draft, a, caseId, requester]);
    await client.query("INSERT INTO marjea_review_steps(tenant_id,case_id,draft_id,sequence_number,reviewer_clerk_user_id,created_by_clerk_user_id) VALUES($1,$2,$3,1,$4,$5)", [a, caseId, draft, reviewer, requester]);
    await rejects("UPDATE marjea_review_steps SET decision='reject' WHERE draft_id=$1", [draft], "23514");
    await rejects("UPDATE marjea_review_steps SET draft_id=$2 WHERE semantic_analysis_id=$1", [analysis, draft], "23514");
    await client.query("INSERT INTO marjea_institution_feature_flags(institution_id,updated_by,change_reason) VALUES($1,$2,'fixture')", [a, requester]);
    const flag = await client.query("SELECT phase2_semantic_analysis_enabled FROM marjea_institution_feature_flags WHERE institution_id=$1", [a]);
    assert.equal(flag.rows[0].phase2_semantic_analysis_enabled, false);
    await client.query("INSERT INTO marjea_demo_scenarios(id,institution_id,scenario_key,created_by) VALUES($1,$2,'fixture',$3)", [scenario, b, requester]);
    await rejects("UPDATE marjea_observed_content SET demo_scenario_id=$2,demo_generation=1 WHERE id=$1", [content, scenario], "23503");
    await rejects("UPDATE marjea_observed_content SET demo_generation=1 WHERE id=$1", [content], "23514");
    await client.query("INSERT INTO marjea_audit_events(institution_id,actor_id,action,entity_kind,entity_id,request_id) VALUES($1,$2,'fixture','analysis',$3,$4)", [a, requester, analysis, randomUUID()]);
    await rejects("UPDATE marjea_audit_events SET reason='changed' WHERE institution_id=$1", [a], "23514");
    await rejects("DELETE FROM marjea_audit_events WHERE institution_id=$1", [a], "23514");

    const tables = ["marjea_semantic_analyses", "marjea_reference_observations", "marjea_first_observed_deviations", "marjea_institution_feature_flags", "marjea_demo_scenarios", "marjea_audit_events"];
    await client.query("INSERT INTO marjea_demo_scenarios(institution_id,scenario_key,created_by) VALUES($1,'fixture',$2)", [a, requester]);
    await client.query("INSERT INTO marjea_institution_feature_flags(institution_id,updated_by,change_reason) VALUES($1,$2,'fixture')", [b, requester]);
    const otherAnalysis = randomUUID();
    await client.query(insert, [otherAnalysis, b, otherRef, otherContent, null, requester, hash]);
    for (const [tenant, reference, observation, analysisId] of [[a, ref, content, analysis], [b, otherRef, otherContent, otherAnalysis]]) {
      await client.query("INSERT INTO marjea_reference_observations(institution_id,official_reference_id,official_reference_version_number,observed_content_id,dataset_scope,linked_by) VALUES($1,$2,1,$3,'ordinary',$4)", [tenant, reference, observation, requester]);
      await client.query(`INSERT INTO marjea_first_observed_deviations(institution_id,official_reference_id,official_reference_version_number,observed_content_id,semantic_analysis_id,dataset_scope,engine_version,observed_order_at,nominated_by)
        VALUES($1,$2,1,$3,$4,'ordinary','fixture-engine',now(),$5)`, [tenant, reference, observation, analysisId, requester]);
    }
    await client.query("INSERT INTO marjea_audit_events(institution_id,actor_id,action,entity_kind,entity_id,request_id) VALUES($1,$2,'fixture','analysis',$3,$4)", [b, requester, otherAnalysis, randomUUID()]);
    await rejects("UPDATE marjea_reference_observations SET observed_content_id=$2 WHERE institution_id=$1", [a, otherContent], "23503");
    await rejects("UPDATE marjea_first_observed_deviations SET semantic_analysis_id=$2 WHERE institution_id=$1", [a, otherAnalysis], "23503");
    await rejects("UPDATE marjea_first_observed_deviations SET status='confirmed' WHERE institution_id=$1", [a], "23514");
    await rejects("UPDATE marjea_reference_observations SET eligibility_status='excluded',excluded_by=$2,excluded_at=now() WHERE institution_id=$1", [a, requester], "23514");
    const policies = await client.query("SELECT relname,relrowsecurity FROM pg_class WHERE relname=ANY($1)", [tables]);
    assert.equal(policies.rowCount, 6);
    assert.ok(policies.rows.every(r => r.relrowsecurity));
    // Transaction-scoped role: no superuser, no ownership, no BYPASSRLS.
    // Role creation/grants and every fixture are rolled back at the end.
    await client.query(`CREATE ROLE "${role}" NOLOGIN NOSUPERUSER NOBYPASSRLS`);
    const current = await client.query("SELECT current_user");
    const owner = current.rows[0].current_user.replaceAll('"', '""');
    await client.query(`GRANT "${role}" TO "${owner}"`);
    await client.query(`GRANT USAGE ON SCHEMA public TO "${role}"`);
    await client.query(`GRANT SELECT,INSERT,UPDATE,DELETE ON ${tables.join(",")} TO "${role}"`);
    await client.query(`SET LOCAL ROLE "${role}"`);
    assert.equal((await client.query("SELECT count(*)::int AS n FROM marjea_semantic_analyses")).rows[0].n, 1);
    for (const table of tables) {
      assert.equal((await client.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n, 1, `${table}: tenant A sees only its record`);
    }
    await rejects("INSERT INTO marjea_institution_feature_flags(institution_id,updated_by,change_reason) VALUES($1,$2,'forbidden')", [b, requester], "42501");
    assert.equal((await client.query("DELETE FROM marjea_audit_events WHERE institution_id=$1", [a])).rowCount, 0);
    await client.query("SELECT set_config('marjea.tenant_id',$1,true)", [b]);
    for (const table of tables) {
      assert.equal((await client.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n, 1, `${table}: tenant B sees only its record`);
    }
    assert.equal((await client.query("SELECT count(*)::int AS n FROM marjea_semantic_analyses WHERE id=$1", [analysis])).rows[0].n, 0);
    await client.query("SELECT set_config('marjea.tenant_id','',true)");
    for (const table of tables) {
      assert.equal((await client.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n, 0);
    }
  } finally {
    await client.query("ROLLBACK");
    await client.end();
  }
});