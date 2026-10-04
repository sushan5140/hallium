import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const core = fs.readFileSync("app/hallium-core.js", "utf8");
const css = fs.readFileSync("app/globals.css", "utf8");

test("Home builds adaptive practice from learner evidence and saved preferences", () => {
  assert.match(core, /buildAdaptivePracticeSession/);
  assert.match(core, /mistakes:\s*relevantMistakes/);
  assert.match(core, /preferences:\s*learningPreferences/);
  assert.match(core, /latestStudyPct/);
});

test("Home exposes the adaptive queue and its provenance-oriented counts", () => {
  assert.match(core, /TODAY'S ADAPTIVE PRACTICE/);
  assert.match(core, /adaptivePracticeSession\.weaknessCount/);
  assert.match(core, /adaptivePracticeSession\.scenarioCount/);
  assert.match(core, /adaptivePracticeSession\.difficulty/);
  assert.match(core, /adaptivePracticeSession\.items\.slice\(0,3\)/);
});

test("adaptive session starts with Review when the first item is a weakness", () => {
  assert.match(core, /first\?\.kind === "weakness_review" \? "review" : "partner"/);
});

test("adaptive practice card has a single-column mobile fallback", () => {
  assert.match(css, /\.home-adaptive-practice\{[\s\S]*grid-template-columns/);
  assert.match(css, /@media\(max-width:760px\)[\s\S]*\.home-adaptive-practice\{grid-template-columns:1fr/);
});
