import test from "node:test";
import assert from "node:assert/strict";
import { evaluateHangulGraduation } from "../lib/hangul-graduation.js";

test("graduation requires all five checks", () => {
  const locked=evaluateHangulGraduation({progress:{counts:{recognized:40,syllableBuilds:12,wordReads:6},recentQuizAverage:9},decodedPatterns:["a","b"]});
  assert.equal(locked.complete,false);
  const ready=evaluateHangulGraduation({progress:{counts:{recognized:35,syllableBuilds:12,wordReads:6},recentQuizAverage:8.4},decodedPatterns:["a","b","c"]});
  assert.equal(ready.complete,true);
  assert.equal(ready.nextAction.target,"/?view=lesson&lesson=unit-1-lesson-1&from=hangul");
});
