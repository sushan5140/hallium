import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { summarizePracticeEvidence } from "../lib/practice-engine.js";

const core = fs.readFileSync("app/hallium-core.js", "utf8");
const css = fs.readFileSync("app/globals.css", "utf8");

test("practice summary counts outcomes and computes an evidence average", () => {
  const summary = summarizePracticeEvidence([
    { score:100,outcome:"strong",mode:"study_test",skill:"Vocabulary",createdAt:"2026-10-04T03:00:00Z" },
    { score:70,outcome:"developing",mode:"lesson_listening",skill:"Listening",createdAt:"2026-10-04T02:00:00Z" },
    { score:30,outcome:"relearn",mode:"lesson_listening",skill:"Listening",createdAt:"2026-10-04T01:00:00Z" },
  ]);
  assert.equal(summary.attempts,3);
  assert.equal(summary.averageScore,67);
  assert.deepEqual(summary.outcomes,{strong:1,developing:1,relearn:1});
});

test("small histories are explicitly labeled as early evidence", () => {
  assert.equal(summarizePracticeEvidence([]).evidenceLabel,"early evidence");
  assert.equal(summarizePracticeEvidence([{score:90,outcome:"strong"}]).evidenceLabel,"early evidence");
});

test("practice summary ranks evidence-backed weak skills without claiming level", () => {
  const summary = summarizePracticeEvidence([
    { score:25,outcome:"relearn",mode:"lesson_dictation",skill:"Listening recall" },
    { score:45,outcome:"relearn",mode:"lesson_dictation",skill:"Listening recall" },
    { score:90,outcome:"strong",mode:"study_test",skill:"Vocabulary" },
  ]);
  assert.equal(summary.topWeakSkill.skill,"Listening recall");
  assert.equal(summary.topWeakSkill.relearn,2);
  assert.ok(summary.topWeakSkill.needsWork > 0);
});

test("mode coverage normalizes lesson mode labels", () => {
  const summary = summarizePracticeEvidence([
    { score:80,outcome:"developing",mode:"lesson_listening",skill:"Listening" },
    { score:85,outcome:"strong",mode:"lesson_listening",skill:"Listening" },
    { score:95,outcome:"strong",mode:"ai_checkpoint",skill:"Grammar" },
  ]);
  assert.equal(summary.modes[0].mode,"listening");
  assert.equal(summary.modes[0].count,2);
});

test("summary respects the evidence history limit", () => {
  const attempts = Array.from({length:50},(_,i)=>({
    score:100,
    outcome:"strong",
    mode:"study_test",
    skill:"Vocabulary",
    createdAt:new Date(Date.UTC(2026,9,4,0,0,i)).toISOString(),
  }));
  assert.equal(summarizePracticeEvidence(attempts,40).attempts,40);
});

test("Profile surfaces evidence summary with explicit non-proficiency language", () => {
  assert.match(core,/summarizePracticeEvidence\(practiceEvidence\)/);
  assert.match(core,/H-P8 · Practice evidence/);
  assert.match(core,/without pretending it is a proficiency score/);
  assert.match(core,/practice evidence, not level/);
  assert.match(core,/practiceSummary\.topWeakSkill/);
});

test("practice evidence summary has a responsive mobile layout", () => {
  assert.match(css,/\.practiceEvidenceStats\{display:grid/);
  assert.match(css,/@media\(max-width:760px\)[\s\S]*\.practiceEvidenceStats\{grid-template-columns:1fr 1fr\}/);
});
