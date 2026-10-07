import test from "node:test";
import assert from "node:assert/strict";
import { diagnoseTopikWeaknesses } from "../lib/topik/diagnosis.js";

test("low verified accuracy outranks a merely incomplete but unscored skill",()=>{
  const result=diagnoseTopikWeaknesses([
    {submitted:true,completedAt:"2026-10-06T00:00:00Z",skills:[
      {skillId:"reading_inference",skillLabel:"Reading inference",section:"reading",answered:8,total:8,accuracy:40},
      {skillId:"reading_order",skillLabel:"Ordering",section:"reading",answered:3,total:8,accuracy:null},
    ]},
  ],new Date("2026-10-07T00:00:00Z"));
  assert.equal(result.primary.skillId,"reading_inference");
  assert.ok(result.primary.weaknessScore>0);
});

test("unverified completion gaps can be flagged without inventing accuracy",()=>{
  const result=diagnoseTopikWeaknesses([
    {submitted:true,skills:[{skillId:"reading_blank",skillLabel:"Blank fill",section:"reading",answered:2,total:8,accuracy:null}]},
  ]);
  const row=result.ranked[0];
  assert.equal(row.accuracy,null);
  assert.equal(row.actionable,true);
  assert.match(row.reason,/incomplete/);
});

test("repeated recent verified misses strengthen the diagnosis",()=>{
  const one=diagnoseTopikWeaknesses([
    {submitted:true,completedAt:"2026-10-06T00:00:00Z",skills:[{skillId:"x",skillLabel:"X",section:"reading",answered:5,total:5,accuracy:50}]},
  ],new Date("2026-10-07T00:00:00Z")).ranked[0];

  const repeated=diagnoseTopikWeaknesses([
    {submitted:true,completedAt:"2026-10-06T00:00:00Z",skills:[{skillId:"x",skillLabel:"X",section:"reading",answered:5,total:5,accuracy:50}]},
    {submitted:true,completedAt:"2026-10-05T00:00:00Z",skills:[{skillId:"x",skillLabel:"X",section:"reading",answered:5,total:5,accuracy:50}]},
  ],new Date("2026-10-07T00:00:00Z")).ranked[0];

  assert.ok(repeated.weaknessScore>one.weaknessScore);
  assert.ok(repeated.confidence>one.confidence);
});

test("strong verified performance does not become the primary weakness",()=>{
  const result=diagnoseTopikWeaknesses([
    {submitted:true,skills:[
      {skillId:"strong",skillLabel:"Strong",section:"listening",answered:10,total:10,accuracy:95},
      {skillId:"weak",skillLabel:"Weak",section:"reading",answered:10,total:10,accuracy:55},
    ]},
  ]);
  assert.equal(result.primary.skillId,"weak");
});
