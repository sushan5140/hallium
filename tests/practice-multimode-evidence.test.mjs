import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const core = fs.readFileSync("app/hallium-core.js", "utf8");

test("question-based practice emits H-P8 evidence before legacy mistake handling", () => {
  const start = core.indexOf("function recordQuestionOutcome");
  const block = core.slice(start,start + 4200);
  assert.match(block,/buildPracticeAttempt\(\{/);
  assert.match(block,/mode: source \|\| "choice"/);
  assert.match(block,/response: question\.options\?\.\[selectedIndex\] \|\| ""/);
  assert.match(block,/expected: question\.options\?\.\[question\.answer\] \|\| ""/);
  assert.match(block,/choices: question\.options \|\| \[\]/);
  assert.match(block,/writePracticeEvidenceHistory\(attempt\)/);
});

test("correct first-time answers are retained as evidence even when they create no mistake", () => {
  const start = core.indexOf("function recordQuestionOutcome");
  const block = core.slice(start,start + 2600);
  const evidenceIndex = block.indexOf("writePracticeEvidenceHistory(attempt)");
  const returnIndex = block.indexOf("if (correct && !existing) return");
  assert.ok(evidenceIndex >= 0);
  assert.ok(returnIndex > evidenceIndex);
});

test("study tests feed the shared question-outcome pipeline", () => {
  assert.match(core,/recordQuestionOutcome\(q, "study_test", studyTestChoice, wasCorrect/);
});

test("adaptive review and checkpoint quizzes feed the shared question-outcome pipeline", () => {
  assert.match(core,/recordQuestionOutcome\(question, aiQuiz\.type === "checkpoint" \? "ai_checkpoint" : "adaptive_review"/);
});

test("multimode evidence persistence is factored away from mistake bridging", () => {
  assert.match(core,/function writePracticeEvidenceHistory\(attempt\)/);
  assert.match(core,/function recordPracticeEvidence\(attempt\)[\s\S]*writePracticeEvidenceHistory\(attempt\)/);
  assert.match(core,/function recordQuestionOutcome\([\s\S]*writePracticeEvidenceHistory\(attempt\)/);
});

test("question outcome keeps the existing H-P6 mistake scheduler authoritative", () => {
  const start = core.indexOf("function recordQuestionOutcome");
  const end = core.indexOf("function scheduleMistakeReview", start);
  const block = core.slice(start,end);
  assert.match(block,/adaptiveReviewSchedule\(/);
  assert.match(block,/writeMistakeLog\(/);
  assert.match(block,/nextReviewAt:/);
});
