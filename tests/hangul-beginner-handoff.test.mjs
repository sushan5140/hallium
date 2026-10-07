import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { evaluateHangulGraduation } from "../lib/hangul-graduation.js";

const core = fs.readFileSync("app/hallium-core.js","utf8");

test("Hangul graduation deep-links directly into Beginner Lesson 1", () => {
  const ready = evaluateHangulGraduation({
    progress:{counts:{recognized:40,syllableBuilds:12,wordReads:8},recentQuizAverage:9},
    decodedPatterns:["a","b","c"],
  });
  assert.equal(ready.nextAction.target,"/?view=lesson&lesson=unit-1-lesson-1&from=hangul");
});

test("Hallium restores requested lesson state for signed-in learners", () => {
  assert.match(core,/requestedView === "lesson"/);
  assert.match(core,/requestedLesson/);
  assert.match(core,/setActiveLesson\(requestedLesson\)/);
  assert.match(core,/setStepIndex\(previousStep\)/);
});

test("Hangul handoff shows a continuity notice", () => {
  assert.match(core,/cameFromHangul/);
  assert.match(core,/Hangul complete/);
  assert.match(core,/first real conversation/);
});

test("Guest Mode can receive the same Hangul lesson handoff", () => {
  assert.match(core,/guestParams/);
  assert.match(core,/readProgress\(true\)/);
  assert.match(core,/guestParams\.get\("from"\) === "hangul"/);
});
