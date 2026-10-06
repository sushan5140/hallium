import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { HANGUL_DECODING_ITEMS, decodingOptions } from "../lib/hangul-decoding.js";

const bridge = fs.readFileSync("app/hangul/HangulLabBridge.js","utf8");

test("decoding bank covers core beginner pronunciation shifts", () => {
  const rules = new Set(HANGUL_DECODING_ITEMS.map((item) => item.rule));
  for (const rule of ["Final consonant","Liaison","Nasalization","Aspiration","Tensification"]) {
    assert.ok(rules.has(rule));
  }
});

test("decoding uses Korean sound forms, not romanization", () => {
  for (const item of HANGUL_DECODING_ITEMS) {
    assert.match(item.word, /[가-힣]/);
    assert.match(item.heard, /[가-힣]/);
    assert.ok(decodingOptions(item).includes(item.heard));
  }
  assert.doesNotMatch(bridge, /romanization/);
});

test("only a correct decoding stores mastery evidence", () => {
  assert.match(bridge, /if \(value === activeDecode\.heard\)/);
  assert.match(bridge, /decodedPatterns/);
  assert.match(bridge, /new Set/);
});

test("decoding evidence shares the existing Hangul local state", () => {
  assert.match(bridge, /readHangulState/);
  assert.match(bridge, /HANGUL_STORAGE_KEY/);
});

test("micro-drill explains the rule after the learner answers", () => {
  assert.match(bridge, /activeDecode\.explanation/);
  assert.match(bridge, /decodeAnswered/);
});
