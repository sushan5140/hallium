import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("targeted practice queue surfaces verified trajectory only from evidence",()=>{
  const queue=fs.readFileSync("app/topik-mocks/TargetedPracticeQueue.jsx","utf8");
  assert.match(queue,/buildTopikTrajectory/);
  assert.match(queue,/Verified score trend/);
  assert.match(queue,/Improving skill/);
});

test("trajectory UI does not fabricate a trend when evidence is insufficient",()=>{
  const queue=fs.readFileSync("app/topik-mocks/TargetedPracticeQueue.jsx","utf8");
  assert.match(queue,/scoreTrend\.status!=="insufficient"/);
});
