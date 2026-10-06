import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const bridge = fs.readFileSync("app/hangul/HangulLabBridge.js","utf8");
const html = fs.readFileSync("public/hangul-lab/index.html","utf8");

test("Hangul first-word bridge reuses the existing Starter word bank", () => {
  assert.match(html, /flashcards-level1\/data\.js/);
  assert.match(bridge, /HALLIUM_STARTER_WORDS/);
});

test("reading bridge presents Korean and meanings without romanization", () => {
  assert.match(bridge, /activeReading\.target\.ko/);
  assert.match(bridge, /option\.meaning/);
  assert.doesNotMatch(bridge, /romanization|\.latin/);
});

test("word-reading evidence is earned only after a correct answer", () => {
  assert.match(bridge, /const correct = optionId === row\.target\.id/);
  assert.match(bridge, /if \(correct\)/);
  assert.match(bridge, /saveReadWord\(row\.target\.id\)/);
});

test("read evidence is deduplicated by stable Starter word id", () => {
  assert.match(bridge, /new Set/);
  assert.match(bridge, /readWords/);
});

test("first-word reading stays locked until the word stage", () => {
  assert.match(bridge, /progress\.stage === "words"/);
  assert.match(bridge, /progress\.stage === "beginner_ready"/);
  assert.match(bridge, /disabled=!readingUnlocked|disabled=\{!readingUnlocked/);
});

test("read count feeds the readiness engine rather than a separate graduation model", () => {
  assert.match(bridge, /evaluateHangulProgress/);
  assert.match(bridge, /wordReads: readWordIds\.length/);
});
