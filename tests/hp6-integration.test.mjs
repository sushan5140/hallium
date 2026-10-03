import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const core = readFileSync(new URL("../app/hallium-core.js", import.meta.url), "utf8");

test("H-P6 preferences load from scoped intelligence state", () => {
  assert.match(core, /setLearningPreferences\(normalizeLearningPreferences\(savedIntelligence\.preferences/);
});

test("H-P6 preferences rehydrate from merged cloud intelligence state", () => {
  assert.match(core, /setLearningPreferences\(normalizeLearningPreferences\(intelligence\?\.preferences/);
});

test("H-P6 preference updates persist through intelligence state and invalidate stale AI routes", () => {
  assert.match(core, /saveIntelligenceState\(\{ preferences: persisted, learningRoute: null \}\)/);
  assert.match(core, /setLearningRouteRecord\(null\)/);
});

test("H-P6 preferences participate in automatic signed-in cloud sync", () => {
  assert.match(core, /learningRouteRecord,\s*learningPreferences,\s*mistakeLog,/);
});

test("H-P6 preferences are supplied to both deterministic and AI intelligence", () => {
  assert.match(core, /buildTodayLearningPlan\(\{[\s\S]*?preferences: learningPreferences/);
  assert.match(core, /adaptiveDifficulty: aiDifficultyRecord\?\.result \|\| null,\s*learningPreferences,/);
});

test("AI routes keep required-review safety before session fitting", () => {
  assert.match(core, /enforceLearningPlanSafety\(learningRouteRecord\?\.result \|\| fallbackLearningRoute, fallbackLearningRoute\)/);
  assert.match(core, /fitPlanToSession\(safeLearningRoute, learningPreferences\)/);
});

test("Profile exposes daily time and focus controls", () => {
  assert.match(core, /Daily study time/);
  assert.match(core, /Prioritize after required review/);
  assert.match(core, /H-P6 · Daily intelligence/);
});


test("H-P6.5 topic routing is restricted to curriculum-unlocked lessons", () => {
  assert.match(core, /rankInterestLessons\([\s\S]*?unlocked: isUnlocked\(absoluteIndex\)/);
  assert.match(core, /const interestLessonPick = interestLessonRecommendations\[0\] \|\| null/);
});

test("H-P6.5 Profile exposes topical interests and Home exposes a supplemental interest pick", () => {
  assert.match(core, /Topics you want more of/);
  assert.match(core, /FOR YOUR INTERESTS/);
  assert.match(core, /Interest-aware lesson recommendation/);
  assert.match(core, /current interest pick/);
});

test("H-P6.5 preferences are timestamped before intelligence-state persistence", () => {
  assert.match(core, /const persisted = \{ \.\.\.next, updatedAt: new Date\(\)\.toISOString\(\) \}/);
  assert.match(core, /saveIntelligenceState\(\{ preferences: persisted, learningRoute: null \}\)/);
});
