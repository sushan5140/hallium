import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("TOPIK mocks mount diagnosis-driven targeted practice",()=>{
  const page=fs.readFileSync("app/topik-mocks/page.js","utf8");
  const queue=fs.readFileSync("app/topik-mocks/TargetedPracticeQueue.jsx","utf8");
  assert.match(page,/TargetedPracticeQueue/);
  assert.match(queue,/diagnoseTopikWeaknesses/);
  assert.match(queue,/buildTopikPracticeQueue/);
});
