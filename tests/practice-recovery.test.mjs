import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildPracticeAttempt, practiceAttemptMistakeEvidence } from "../lib/practice-engine.js";

const core = fs.readFileSync("app/hallium-core.js", "utf8");

test("a clean strong retry produces no new mistake evidence", () => {
  const attempt = buildPracticeAttempt({
    id:"friend-rain-home:a",
    mode:"scenario_choice",
    sceneId:"caring",
    skill:"Real Korean scenario",
    prompt:"Your close friend is heading home in heavy rain.",
    response:"조심히 가. 도착하면 연락해.",
    expected:"조심히 가. 도착하면 연락해.",
    choices:["조심히 가. 도착하면 연락해.","조심히 가세요."],
    correct:true,
    targetRegister:"casual",
    selectedRegister:"casual",
  });
  assert.equal(attempt.outcome,"strong");
  assert.equal(practiceAttemptMistakeEvidence(attempt),null);
});

test("practice recovery searches the existing weakness by source and scene", () => {
  assert.match(core,/const reviewPrefix = \["practice", source, scene, ""\]\.join\("\|"\)/);
  assert.match(core,/existingPractice = .*startsWith\(reviewPrefix\)/s);
});

test("strong retry increments recovery count and uses adaptive successful-review scheduling", () => {
  const start = core.indexOf("if (!weak) {");
  const end = core.indexOf("if (!Array.isArray(weak.options)", start);
  const block = core.slice(start,end);
  assert.match(block,/successfulReviews = Number\(existingPractice\.successfulReviews \|\| 0\) \+ 1/);
  assert.match(block,/adaptiveReviewSchedule\(\{[\s\S]*correct: true/);
  assert.match(block,/previousResult: existingPractice\.lastResult \|\| "wrong"/);
  assert.match(block,/nextReviewAt: addDaysIso\(schedule\.intervalDays\)/);
  assert.match(block,/lastResult: "correct"/);
});

test("recovered practice weakness preserves original review question while refreshing evidence", () => {
  const start = core.indexOf("const recovered = {");
  const block = core.slice(start,start + 1200);
  assert.match(block,/\.\.\.existingPractice/);
  assert.match(block,/response: attempt\.response/);
  assert.match(block,/evidenceScore: attempt\.score/);
  assert.match(block,/practiceOutcome: attempt\.outcome/);
  assert.match(block,/reviewStage: schedule\.stage/);
  assert.match(block,/reviewStability: schedule\.stability/);
});

test("practice recovery emits a dedicated learning event", () => {
  assert.match(core,/trackLearningEvent\("practice_recovery_recorded"/);
  assert.match(core,/interval_days: schedule\.intervalDays/);
  assert.match(core,/review_stability: schedule\.stability/);
});

test("weak retries still enter immediate review rather than the recovery branch", () => {
  const start = core.indexOf("if (!Array.isArray(weak.options)");
  const block = core.slice(start,start + 2200);
  assert.match(block,/correct: false/);
  assert.match(block,/nextReviewAt: now/);
  assert.match(block,/lastResult/);
});
