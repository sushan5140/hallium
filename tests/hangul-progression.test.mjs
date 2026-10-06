import test from "node:test";
import assert from "node:assert/strict";
import { HANGUL_STAGES, evaluateHangulProgress } from "../lib/hangul-progression.js";

test("new learners remain in the letter stage", () => {
  const result = evaluateHangulProgress({ explored:["ㄱ","ㅏ"], known:["ㄱ"] });
  assert.equal(result.stage, HANGUL_STAGES.letters);
  assert.equal(result.nextAction.target, "learn");
});

test("letter recognition plus basic quiz evidence unlocks syllable stage", () => {
  const known = Array.from({length:20}, (_,i) => String(i));
  const result = evaluateHangulProgress({
    explored:known,
    known,
    quizHistory:[{score:6},{score:7}],
  });
  assert.equal(result.stage, HANGUL_STAGES.syllables);
  assert.equal(result.nextAction.target, "build");
});

test("stronger evidence moves learners into word reading", () => {
  const known = Array.from({length:31}, (_,i) => String(i));
  const result = evaluateHangulProgress({
    explored:known,
    known,
    quizHistory:[{score:8},{score:7},{score:9}],
    syllableBuilds:9,
  });
  assert.equal(result.stage, HANGUL_STAGES.words);
});

test("beginner readiness requires recognition, quiz, syllable and word evidence", () => {
  const known = Array.from({length:36}, (_,i) => String(i));
  const result = evaluateHangulProgress({
    explored:known,
    known,
    written:Array.from({length:20},(_,i)=>String(i)),
    quizHistory:[{score:9},{score:8},{score:9}],
    syllableBuilds:14,
    wordReads:7,
  });
  assert.equal(result.stage, HANGUL_STAGES.beginnerReady);
  assert.equal(result.nextAction.target, "/?view=companion");
  assert.deepEqual(result.gaps, []);
});

test("writing contributes to readiness but cannot substitute for reading evidence", () => {
  const known = Array.from({length:40}, (_,i) => String(i));
  const result = evaluateHangulProgress({
    explored:known,
    known,
    written:known,
    quizHistory:[{score:10},{score:10}],
    syllableBuilds:12,
    wordReads:0,
  });
  assert.notEqual(result.stage, HANGUL_STAGES.beginnerReady);
  assert.ok(result.gaps.some((gap) => gap.includes("beginner words")));
});
