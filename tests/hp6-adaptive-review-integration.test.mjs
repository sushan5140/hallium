import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const core = readFileSync(new URL("../app/hallium-core.js", import.meta.url), "utf8");

test("H-P6.3 removes the fixed successful-review interval ladder", () => {
  assert.doesNotMatch(core, /function intervalForReview\(/);
  assert.doesNotMatch(core, /\[3,\s*7,\s*14,\s*30,\s*60\]/);
});

test("question outcomes persist adaptive review metadata", () => {
  assert.match(core, /adaptiveReviewSchedule\(\{[\s\S]*?correct:\s*true/);
  assert.match(core, /reviewStage:\s*schedule\.stage/);
  assert.match(core, /reviewStability:\s*schedule\.stability/);
  assert.match(core, /scheduleReason:\s*schedule\.reason/);
  assert.match(core, /nextReviewAt:\s*addDaysIso\(schedule\.intervalDays\)/);
});

test("manual weakness review uses the same adaptive scheduler", () => {
  assert.match(core, /function scheduleMistakeReview\([\s\S]*?adaptiveReviewSchedule\(\{/);
  assert.match(core, /review_stage:\s*schedule\.stage/);
  assert.match(core, /review_stability:\s*schedule\.stability/);
});

test("Review UI previews the chosen adaptive interval before scheduling", () => {
  assert.match(core, /const reviewSchedulePreview = due \? adaptiveReviewSchedule\(/);
  assert.match(core, /Schedule in " \+ \(reviewSchedulePreview\?\.intervalDays \|\| 1\)/);
});
