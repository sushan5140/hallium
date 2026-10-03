import test from "node:test";
import assert from "node:assert/strict";
import {
  curriculumAudit,
  lessonCoverage,
  teachingItemFromStep,
} from "../lib/curriculum/admin.js";

const completeLesson = {
  id: "u1-l1",
  type: "lesson",
  title: "Complete lesson",
  steps: [
    { kind: "word", korean: "학교", meaning: "school" },
    { kind: "explain", title: "Place + 에", body: "Destination", korean: "학교에 가요." },
    { kind: "choice", prompt: "Choose" },
    { kind: "listening", prompt: "Listen" },
    { kind: "shadowing", transcript: "학교에 가요." },
    { kind: "build", prompt: "Build" },
    { kind: "finish", canDo: ["use 에"] },
  ],
};

test("lesson coverage reports the real teaching primitives", () => {
  const coverage = lessonCoverage(completeLesson);
  assert.equal(coverage.complete, true);
  assert.equal(coverage.vocabulary.length, 1);
  assert.equal(coverage.grammar.length, 1);
  assert.equal(coverage.listening, true);
  assert.equal(coverage.production, true);
});

test("curriculum audit exposes missing lesson stages instead of hiding them", () => {
  const units = [{
    id: "u1",
    number: 1,
    title: "Unit",
    levelId: "new",
    levelLabel: "Starter",
    lessons: [
      completeLesson,
      { id: "u1-l2", type: "lesson", title: "Thin lesson", steps: [{ kind: "word" }, { kind: "finish" }] },
    ],
  }];
  const audit = curriculumAudit(units);
  assert.equal(audit.summary.lessons, 2);
  assert.equal(audit.summary.withGaps, 1);
  assert.match(audit.rows[1].coverage.missing.join(","), /listening/);
});

test("saved teaching item preserves lesson provenance", () => {
  const item = teachingItemFromStep({
    unit: { id: "u1", title: "Unit" },
    lesson: completeLesson,
    step: completeLesson.steps[0],
    stepIndex: 0,
  });
  assert.equal(item.unitId, "u1");
  assert.equal(item.lessonId, "u1-l1");
  assert.equal(item.kind, "word");
  assert.equal(item.title, "학교");
});


test("curriculum audit separates intentional omissions from genuine gaps", () => {
  const intentional = {
    id: "u1-l3",
    type: "lesson",
    title: "Recognition lesson",
    coverageExemptions: {
      listening: "Uses reading as receptive input.",
      shadowing: "Deferred to the next lesson.",
      build: "Recognition-first lesson.",
    },
    steps: [
      { kind: "word", korean: "학교", meaning: "school" },
      { kind: "explain", title: "Place words", body: "Recognize places." },
      { kind: "choice", prompt: "Choose" },
      { kind: "finish", canDo: ["recognize places"] },
    ],
  };
  const coverage = lessonCoverage(intentional);
  assert.deepEqual(coverage.missing, []);
  assert.equal(coverage.intentionalOmissions.length, 3);
  assert.equal(coverage.complete, true);
  assert.match(coverage.intentionalOmissions[0].reason, /reading/i);
});
