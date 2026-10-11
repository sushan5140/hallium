import test from "node:test";
import assert from "node:assert/strict";
import { evaluateHangulGraduation } from "../lib/hangul-graduation.js";
import { HANGUL_DECODING_ITEMS } from "../lib/hangul-decoding.js";

test("graduation requires all five checks", () => {
  const validIds = HANGUL_DECODING_ITEMS.slice(0, 3).map(item => item.id);
  const locked=evaluateHangulGraduation({progress:{counts:{recognized:40,syllableBuilds:12,wordReads:6},recentQuizAverage:9},decodedPatterns:validIds.slice(0,2)});
  assert.equal(locked.complete,false);
  const ready=evaluateHangulGraduation({progress:{counts:{recognized:35,syllableBuilds:12,wordReads:6},recentQuizAverage:8.4},decodedPatterns:validIds});
  assert.equal(ready.complete,true);
  assert.equal(ready.nextAction.target,"/?view=lesson&lesson=unit-1-lesson-1&from=hangul");
});

test("malformed decoding progress stays locked instead of throwing", () => {
  const progress={counts:{recognized:40,syllableBuilds:12,wordReads:8},recentQuizAverage:9};
  for(const decodedPatterns of [null, {}, 4, "abc", [{}, null, 4], ["a","b","c"]]) {
    const graduation=evaluateHangulGraduation({progress,decodedPatterns});
    assert.equal(graduation.complete,false);
    assert.equal(graduation.checks.find(check=>check.id==="decoding").passed,false);
  }
});
