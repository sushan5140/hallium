import test from "node:test";
import assert from "node:assert/strict";
import {createTopikInterventionSnapshot,evaluateTopikIntervention} from "../lib/topik/trajectory.js";

test("recommended skill can be measured after later verified practice",()=>{
  const snap=createTopikInterventionSnapshot(
    {skillId:"reading_inference",skillLabel:"Reading inference",accuracy:45},
    {kind:"companion",href:"/topik-companion?unit=i12",unitId:"i12"},
    new Date("2026-10-01T00:00:00Z")
  );
  const result=evaluateTopikIntervention(snap,[
    {completedAt:"2026-10-05T00:00:00Z",skills:[{skillId:"reading_inference",accuracy:60}]},
  ]);
  assert.equal(result.status,"helped");
  assert.equal(result.delta,15);
});

test("unrelated skill changes are not credited",()=>{
  const snap={skillId:"reading_inference",baselineAccuracy:45,recommendedAt:"2026-10-01T00:00:00Z"};
  const result=evaluateTopikIntervention(snap,[
    {completedAt:"2026-10-05T00:00:00Z",skills:[{skillId:"reading_order",accuracy:90}]},
  ]);
  assert.equal(result.status,"insufficient");
});

test("flat and worse outcomes remain distinct",()=>{
  const snap={skillId:"reading_blank",baselineAccuracy:70,recommendedAt:"2026-10-01T00:00:00Z"};
  assert.equal(evaluateTopikIntervention(snap,[{completedAt:"2026-10-05T00:00:00Z",skills:[{skillId:"reading_blank",accuracy:72}]}]).status,"flat");
  assert.equal(evaluateTopikIntervention(snap,[{completedAt:"2026-10-05T00:00:00Z",skills:[{skillId:"reading_blank",accuracy:60}]}]).status,"worse");
});
