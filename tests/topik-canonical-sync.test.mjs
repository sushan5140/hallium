import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const queue=fs.readFileSync("app/topik-mocks/TargetedPracticeQueue.jsx","utf8");
const core=fs.readFileSync("app/hallium-core.js","utf8");

test("TOPIK evidence mirrors into canonical intelligence state",()=>{
  assert.match(queue,/intelligence/);
  assert.match(queue,/topik:/);
  assert.match(queue,/evidence:attempts/);
  assert.match(queue,/interventions/);
});

test("cloud-restored canonical TOPIK state hydrates Studio stores",()=>{
  assert.match(queue,/topik\.evidence/);
  assert.match(queue,/topik\.interventions/);
  assert.match(queue,/setAttempts\(mergedEvidence\)/);
  assert.match(queue,/setInterventions\(mergedImpact\)/);
});

test("Hallium Core unions TOPIK attempts and intervention history across devices",()=>{
  assert.match(core,/localTopik/);
  assert.match(core,/remoteTopik/);
  assert.match(core,/mergeTopikRows/);
  assert.match(core,/merged\.topik/);
  assert.match(core,/interventions:/);
});
