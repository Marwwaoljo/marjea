import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  CreateSemanticAnalysisBody,
  GetSemanticAnalysisResponse,
  ResetOfuqDemoBody,
  SubmitReviewDecisionBody,
  SubmitSemanticReviewDecisionBody,
} from "../../api-zod/src/generated/api.ts";

const resultSchema = GetSemanticAnalysisResponse.shape.structuredResult.options[0];
const validResult = {
  schema_version: "semantic-v1",
  language: "ar",
  summary: "نتيجة اختبار العقد فقط، وليست تحليلاً منتجاً.",
  material_deviation: true,
  deviation_types: ["scope_change"],
  findings: [{
    type: "scope_change",
    official_quote: "نطاق المرجع",
    observed_quote: "نطاق المحتوى",
    explanation: "تفسير اختبار",
    confidence: 0.8,
  }],
  suggested_route: "human_review",
  confidence: 0.8,
  limitations: [],
};

test("Semantic structured-output contract is strict at every object boundary", () => {
  assert.equal(resultSchema.safeParse(validResult).success, true);
  assert.equal(resultSchema.safeParse({ ...validResult, invented: true }).success, false);
  assert.equal(resultSchema.safeParse({ ...validResult, findings: [{ ...validResult.findings[0], invented: true }] }).success, false);
  for (const confidence of [-0.01, 1.01, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(resultSchema.safeParse({ ...validResult, confidence }).success, false);
  }
  assert.equal(resultSchema.safeParse({ ...validResult, schema_version: "invented" }).success, false);
  assert.equal(resultSchema.safeParse({ ...validResult, findings: [{}] }).success, false);
  assert.equal(resultSchema.safeParse({ ...validResult, summary: "" }).success, false);
  assert.equal(resultSchema.safeParse({ ...validResult, findings: Array(21).fill(validResult.findings[0]) }).success, false);
  assert.equal(resultSchema.safeParse({ ...validResult, suggested_route: "automatically_approved" }).success, false);
});

test("Analysis requests cannot supply identity, hash, engine or snapshots", () => {
  const input = { officialReferenceId: randomUUID(), officialReferenceVersionNumber: 1, observedContentId: randomUUID(), caseId: null };
  assert.equal(CreateSemanticAnalysisBody.safeParse(input).success, true);
  for (const key of ["institutionId", "requestedBy", "engineVersion", "inputHash", "officialReferenceSnapshot", "demoGeneration"]) {
    assert.equal(CreateSemanticAnalysisBody.safeParse({ ...input, [key]: "injected" }).success, false);
  }
  assert.equal(CreateSemanticAnalysisBody.safeParse({ ...input, officialReferenceVersionNumber: 0 }).success, false);
});

test("Reject belongs to semantic review only; demo reset requires explicit confirmation and generation", () => {
  assert.equal(SubmitReviewDecisionBody.safeParse({ decision: "reject", note: "اختبار" }).success, false);
  assert.equal(SubmitSemanticReviewDecisionBody.safeParse({
    decision: "reject",
    note: "سبب موثق",
    reviewedResult: { materialDeviation: false, suggestedRoute: "insufficient_evidence", rationale: "تقييم بشري اختباري" },
  }).success, true);
  assert.equal(ResetOfuqDemoBody.safeParse({ confirm: true, expectedGeneration: 1, reason: "اختبار" }).success, true);
  assert.equal(ResetOfuqDemoBody.safeParse({ confirm: false, expectedGeneration: 1, reason: "اختبار" }).success, false);
  assert.equal(ResetOfuqDemoBody.safeParse({ confirm: true, expectedGeneration: 0, reason: "اختبار" }).success, false);
});