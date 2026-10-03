import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const core = readFileSync(new URL("../app/hallium-core.js", import.meta.url), "utf8");

test("H-P6.4 builds a deterministic study plan before any AI call", () => {
  const localIndex = core.indexOf("const localResult = buildDeterministicStudyPlan");
  const aiIndex = core.indexOf('const result = await callIntelligence("study_plan"');
  assert.ok(localIndex >= 0);
  assert.ok(aiIndex > localIndex);
});

test("H-P6.4 persists the local plan immediately", () => {
  assert.match(core, /source:\s*"Hallim local"/);
  assert.match(core, /setStudyPlanRecord\(localRecord\)/);
  assert.match(core, /saveIntelligenceState\(\{ studyPlan: localRecord \}\)/);
});

test("Guest Mode keeps the deterministic study plan without a paid AI dependency", () => {
  assert.match(core, /if \(guestMode\) return localRecord/);
});

test("AI study planning receives the deterministic plan as grounded context", () => {
  assert.match(core, /deterministicStudyPlan:\s*localResult/);
  assert.match(core, /source:\s*"Hallim AI"/);
});

test("Study plan UI exposes whether the plan is local or AI-enhanced", () => {
  assert.match(core, /studyPlanRecord\.source \|\| "Hallim"/);
});
