import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { gradeRealKoreanScenario, realKoreanScenarios } from "../lib/real-korean.js";

const partner = fs.readFileSync("app/partner/PartnerKorean.jsx", "utf8");

test("scenario practice covers multiple relationship contexts", () => {
  const scenarios = realKoreanScenarios();
  assert.ok(scenarios.length >= 6);
  const relationships = new Set(scenarios.map((item) => item.relationship));
  for (const value of ["close_friend","unsure","senior","service"]) {
    assert.ok(relationships.has(value), "missing relationship " + value);
  }
});

test("scenario grader checks the authored correct option", () => {
  const correct = gradeRealKoreanScenario("stranger-station", "b");
  const wrong = gradeRealKoreanScenario("stranger-station", "a");
  assert.equal(correct.status, "graded");
  assert.equal(correct.correct, true);
  assert.equal(correct.targetRegister, "polite");
  assert.equal(wrong.correct, false);
  assert.equal(wrong.correctChoice.id, "b");
});

test("scenario grader fails closed for unknown inputs", () => {
  assert.equal(gradeRealKoreanScenario("missing", "a").status, "invalid");
  assert.equal(gradeRealKoreanScenario("stranger-station", "z").status, "invalid");
});

test("scenario choices include meaning and explicit register metadata", () => {
  for (const scenario of realKoreanScenarios()) {
    assert.ok(scenario.options.length >= 3);
    assert.ok(scenario.options.every((option) => option.korean && option.meaning && option.register));
    assert.ok(scenario.explanation);
  }
});

test("Partner Korean renders scenario feedback based on meaning and social register", () => {
  assert.match(partner, /Scenario practice/);
  assert.match(partner, /gradeRealKoreanScenario/);
  assert.match(partner, /Meaning alone isn't enough here/);
  assert.match(partner, /scenarioResult\.correctChoice/);
});
