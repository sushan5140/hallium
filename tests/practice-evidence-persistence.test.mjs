import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildPracticeAttempt, practiceAttemptMistakeEvidence } from "../lib/practice-engine.js";

const core = fs.readFileSync("app/hallium-core.js", "utf8");
const partner = fs.readFileSync("app/partner/PartnerKorean.jsx", "utf8");

test("practice attempts preserve authored scenario choices", () => {
  const attempt = buildPracticeAttempt({
    id:"station:a",
    mode:"scenario_choice",
    sceneId:"travel",
    skill:"Real Korean scenario",
    prompt:"Ask a stranger for directions.",
    response:"역 어디야?",
    expected:"지하철역이 어디예요?",
    choices:["역 어디야?","지하철역이 어디예요?","야, 지하철 어디?"],
    correct:false,
    targetRegister:"polite",
    selectedRegister:"casual",
  });

  assert.deepEqual(attempt.choices,[
    "역 어디야?",
    "지하철역이 어디예요?",
    "야, 지하철 어디?",
  ]);
});

test("weak practice evidence becomes a valid review-question shape", () => {
  const evidence = practiceAttemptMistakeEvidence({
    id:"station:a",
    mode:"scenario_choice",
    sceneId:"travel",
    skill:"Real Korean scenario",
    prompt:"Ask a stranger for directions.",
    response:"역 어디야?",
    expected:"지하철역이 어디예요?",
    choices:["역 어디야?","지하철역이 어디예요?","야, 지하철 어디?"],
    correct:false,
    targetRegister:"polite",
    selectedRegister:"casual",
  });

  assert.ok(evidence);
  assert.ok(Array.isArray(evidence.options));
  assert.ok(evidence.options.length >= 2);
  assert.equal(evidence.options[evidence.answer],"지하철역이 어디예요?");
  assert.equal(evidence.skill,"Register choice");
  assert.match(evidence.explanation,/target social register/i);
});

test("strong evidence still stays out of the mistake pipeline", () => {
  const evidence = practiceAttemptMistakeEvidence({
    id:"station:b",
    response:"지하철역이 어디예요?",
    expected:"지하철역이 어디예요?",
    choices:["역 어디야?","지하철역이 어디예요?"],
    correct:true,
    targetRegister:"polite",
    selectedRegister:"polite",
  });
  assert.equal(evidence,null);
});

test("Scenario Practice sends authored choices and attempts to Hallium", () => {
  assert.match(partner,/choices: activeScenario\.options\.map/);
  assert.match(partner,/onPracticeAttempt\?\.\(attempt\)/);
});

test("Hallium persists a bounded practice-evidence history in intelligence state", () => {
  assert.match(core,/const \[practiceEvidence, setPracticeEvidence\] = useState\(\[\]\)/);
  assert.match(core,/setPracticeEvidence\(savedIntelligence\.practiceEvidence \|\| \[\]\)/);
  assert.match(core,/setPracticeEvidence\(intelligence\?\.practiceEvidence \|\| \[\]\)/);
  assert.match(core,/slice\(0, 40\)/);
  assert.match(core,/saveIntelligenceState\(\{ practiceEvidence: nextEvidence \}\)/);
});

test("signed-in cloud sync reacts to practice-evidence changes", () => {
  assert.match(core,/mistakeLog,[\s\S]*practiceEvidence,[\s\S]*\]\);/);
  assert.match(core,/intelligence_state: intelligence \|\| \{\}/);
});

test("weak practice attempts bridge into scheduled H-P6 review records", () => {
  assert.match(core,/practiceAttemptMistakeEvidence\(attempt\)/);
  assert.match(core,/adaptiveReviewSchedule\(\{[\s\S]*correct: false/);
  assert.match(core,/writeMistakeLog\(\[nextEntry/);
  assert.match(core,/nextReviewAt: now/);
});

test("Partner Korean receives the practice evidence callback from Hallium core", () => {
  assert.match(core,/<PartnerKorean[^>]*onPracticeAttempt=\{recordPracticeEvidence\}/);
});
