import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const core = fs.readFileSync("app/hallium-core.js", "utf8");

test("Companion objective steps emit H-P8 evidence on Check", () => {
  const start = core.indexOf("function recordCompanionStepAttempt");
  const end = core.indexOf("function retryCompanionStep", start);
  const block = core.slice(start,end);
  assert.match(block,/\["choice", "listening", "reading"\]\.includes\(step\.kind\)/);
  assert.match(block,/mode: "lesson_" \+ step\.kind/);
  assert.match(block,/skill: step\.kind === "listening" \? "Listening" : step\.kind === "reading" \? "Reading" : "Grammar"/);
  assert.match(block,/choices: step\.options \|\| \[\]/);
  assert.match(block,/recordPracticeEvidence\(buildPracticeAttempt\(/);
});

test("sentence building records the assembled response and exact target", () => {
  const start = core.indexOf('if (step.kind === "build")');
  const block = core.slice(start,start + 1200);
  assert.match(block,/const response = buildPhrase\(step\)/);
  assert.match(block,/mode: "lesson_build"/);
  assert.match(block,/skill: "Sentence building"/);
  assert.match(block,/response,/);
  assert.match(block,/expected: step\.answer \|\| ""/);
  assert.match(block,/correct: response === step\.answer/);
});

test("dictation records learner text and normalized correctness", () => {
  const start = core.indexOf('if (step.kind === "dictation")');
  const block = core.slice(start,start + 1200);
  assert.match(block,/const response = dictationInput\.trim\(\)/);
  assert.match(block,/mode: "lesson_dictation"/);
  assert.match(block,/skill: "Listening recall"/);
  assert.match(block,/correct: dictationCorrect\(step\)/);
});

test("Companion retries increment retry evidence before another check", () => {
  assert.match(core,/const \[lessonRetryCount, setLessonRetryCount\] = useState\(0\)/);
  assert.match(core,/setLessonRetryCount\(\(count\) => count \+ 1\)/);
  assert.match(core,/retries: lessonRetryCount/);
  assert.match(core,/setLessonRetryCount\(0\)/);
});

test("lesson check buttons use the evidence-aware checker", () => {
  assert.match(core,/onClick=\{\(\) => recordCompanionStepAttempt\(currentStep\)\}>Check answer/);
  assert.match(core,/onClick=\{\(\) => recordCompanionStepAttempt\(currentStep\)\}>Check sentence/);
  assert.match(core,/onClick=\{\(\) => recordCompanionStepAttempt\(currentStep\)\}>Check dictation/);
});

test("Try again routes through the retry counter", () => {
  assert.match(core,/retryCompanionStep\("choice"\)/);
  assert.match(core,/retryCompanionStep\("build"\)/);
  assert.match(core,/retryCompanionStep\("dictation"\)/);
});

test("shadowing remains explicitly unscored", () => {
  const lessonStart = core.indexOf("function Lesson()");
  const lessonBlock = core.slice(lessonStart,lessonStart + 9000);
  assert.match(lessonBlock,/isShadowing && !shadowDone/);
  assert.match(lessonBlock,/setShadowDone\(true\)/);
  assert.doesNotMatch(lessonBlock,/recordCompanionStepAttempt\(currentStep\).*repeated it aloud/s);
});

test("advance does not emit duplicate practice evidence", () => {
  const start = core.indexOf("function advance()");
  const end = core.indexOf("function completeLesson()", start);
  const block = core.slice(start,end);
  assert.doesNotMatch(block,/recordPracticeEvidence|buildPracticeAttempt|recordCompanionStepAttempt/);
});
