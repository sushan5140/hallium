import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const studio=fs.readFileSync("app/topik-mocks/MockStudio.jsx","utf8");

test("Mock Studio uses ranked diagnosis from normalized evidence",()=>{
  assert.match(studio,/diagnoseTopikWeaknesses/);
  assert.match(studio,/Practice next/);
  assert.match(studio,/confidence/);
});

test("diagnosis remains separate from scoring authority",()=>{
  assert.match(studio,/scoreObjectiveAttempt/);
  assert.match(studio,/diagnoseTopikWeaknesses\(evidence\)/);
});
