import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const bridge = fs.readFileSync("app/hangul/HangulLabBridge.js","utf8");
const core = fs.readFileSync("app/hallium-core.js","utf8");
const lab = fs.readFileSync("public/hangul-lab/app.js","utf8");
const checkpoint = fs.readFileSync("app/hangul/HangulGraduationCheckpoint.js","utf8");

test("Hangul evidence mirrors into canonical intelligence state", () => {
  assert.match(bridge,/hallim:intelligence:v1/);
  assert.match(bridge,/hangul: merged/);
  assert.match(bridge,/hallium:hangul:changed/);
});

test("Hallium Core merges Hangul evidence across devices", () => {
  assert.match(core,/localHangul/);
  assert.match(core,/remoteHangul/);
  assert.match(core,/decodedPatterns/);
  assert.match(core,/merged\.hangul = hangul/);
});

test("restored canonical state hydrates the static Hangul Lab", () => {
  assert.match(bridge,/hallium:hangul:hydrate/);
  assert.match(lab,/hallium:hangul:hydrate/);
  assert.match(lab,/builtSyllables/);
  assert.match(lab,/readWords/);
});

test("graduation timestamp is persisted before Beginner handoff", () => {
  assert.match(checkpoint,/graduatedAt/);
  assert.match(checkpoint,/new Date\(\)\.toISOString\(\)/);
  assert.match(checkpoint,/window\.location\.href = graduation\.nextAction\.target/);
});
