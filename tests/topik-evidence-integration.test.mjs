import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const studio=fs.readFileSync("app/topik-mocks/MockStudio.jsx","utf8");

test("Mock Studio stores normalized evidence separately from raw answer sheets",()=>{
  assert.match(studio,/hallium:topik-pbt-mocks:v1/);
  assert.match(studio,/hallium:topik-evidence:v1/);
  assert.match(studio,/buildTopikAttemptEvidence/);
});

test("submitting a mock records evidence even when scoring is locked",()=>{
  assert.match(studio,/const scored=scoreObjectiveAttempt/);
  assert.match(studio,/const record=buildTopikAttemptEvidence/);
  assert.match(studio,/setEvidence/);
});

test("catalog exposes evidence summary without bypassing provenance scoring gates",()=>{
  assert.match(studio,/summarizeTopikEvidence/);
  assert.match(studio,/Weakest scored section/);
  assert.match(studio,/verified score pending/);
  assert.match(studio,/scoreObjectiveAttempt/);
});
