import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync("app/hangul/page.js","utf8");
const bridge = fs.readFileSync("app/hangul/HangulLabBridge.js","utf8");
const app = fs.readFileSync("public/hangul-lab/app.js","utf8");

test("Hangul route is wrapped by the readiness bridge", () => {
  assert.match(page, /HangulLabBridge/);
  assert.doesNotMatch(page, /<iframe/);
});

test("existing Hangul Lab emits measurable progress to the parent", () => {
  assert.match(app, /hallium:hangul:progress/);
  assert.match(app, /known:state\.known/);
  assert.match(app, /quizHistory:state\.quizHistory/);
  assert.match(app, /syllableBuilds:\(state\.builtSyllables\|\|\[\]\)\.length/);
});

test("syllable evidence counts unique built syllables rather than arbitrary clicks", () => {
  assert.match(app, /if\(!state\.builtSyllables\.includes\(built\)\)/);
  assert.match(app, /state\.builtSyllables\.push\(built\)/);
});

test("word-reading evidence is deliberately zero until a real reading drill exists", () => {
  assert.match(app, /wordReads:0/);
});

test("parent can route the learner back into the appropriate Hangul stage", () => {
  assert.match(bridge, /hallium:hangul:navigate/);
  assert.match(app, /hallium:hangul:navigate/);
});

test("beginner-ready route points into the actual Companion curriculum", () => {
  assert.match(bridge, /window\.location\.href = progress\.nextAction\.target/);
});
