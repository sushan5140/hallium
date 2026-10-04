import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  PRACTICE_OUTCOMES,
  buildPracticeAttempt,
  practiceAttemptMistakeEvidence,
  practiceOutcome,
  scorePracticeAttempt,
} from "../lib/practice-engine.js";

const partner = fs.readFileSync("app/partner/PartnerKorean.jsx", "utf8");

test("clean correct attempts score as strong evidence", () => {
  const score = scorePracticeAttempt({ correct:true, registerMatch:true, hintsUsed:0, retries:0 });
  assert.equal(score,100);
  assert.equal(practiceOutcome(score),PRACTICE_OUTCOMES.strong);
});

test("register mismatch lowers an otherwise correct attempt", () => {
  const clean = scorePracticeAttempt({ correct:true, registerMatch:true });
  const mismatch = scorePracticeAttempt({ correct:true, registerMatch:false });
  assert.ok(mismatch < clean);
  assert.equal(practiceOutcome(mismatch),PRACTICE_OUTCOMES.developing);
});

test("hints and retries reduce evidence without producing negative scores", () => {
  const score = scorePracticeAttempt({ correct:false, registerMatch:false, hintsUsed:99, retries:99 });
  assert.equal(score,0);
  assert.equal(practiceOutcome(score),PRACTICE_OUTCOMES.relearn);
});

test("practice attempt normalizes bounded metadata and register fit", () => {
  const attempt = buildPracticeAttempt({
    id:"s1:a",
    mode:"scenario_choice",
    sceneId:"travel",
    skill:"Real Korean scenario",
    prompt:"Ask a stranger for directions.",
    response:"역 어디야?",
    expected:"지하철역이 어디예요?",
    correct:false,
    targetRegister:"polite",
    selectedRegister:"casual",
    hintsUsed:12,
    retries:20,
    createdAt:"2026-10-04T00:00:00.000Z",
  });
  assert.equal(attempt.registerMatch,false);
  assert.equal(attempt.hintsUsed,5);
  assert.equal(attempt.retries,6);
  assert.equal(attempt.outcome,"relearn");
});

test("strong attempts do not create mistake evidence", () => {
  const evidence = practiceAttemptMistakeEvidence({
    id:"s1:b",
    correct:true,
    targetRegister:"polite",
    selectedRegister:"polite",
    skill:"Directions",
  });
  assert.equal(evidence,null);
});

test("register failures become register-choice mistake evidence", () => {
  const evidence = practiceAttemptMistakeEvidence({
    id:"s1:a",
    correct:false,
    targetRegister:"polite",
    selectedRegister:"casual",
    skill:"Directions",
    prompt:"Ask a stranger.",
    response:"역 어디야?",
    expected:"지하철역이 어디예요?",
    createdAt:"2026-10-04T00:00:00.000Z",
  });
  assert.equal(evidence.skill,"Register choice");
  assert.equal(evidence.lastResult,"wrong");
  assert.equal(evidence.practiceOutcome,"relearn");
  assert.ok(Number.isFinite(evidence.evidenceScore));
});

test("Scenario Practice emits H-P8 practice evidence without changing authored grading", () => {
  assert.match(partner, /buildPracticeAttempt/);
  assert.match(partner, /mode: "scenario_choice"/);
  assert.match(partner, /source: "real_korean_scenario"/);
  assert.match(partner, /Practice evidence:/);
});
