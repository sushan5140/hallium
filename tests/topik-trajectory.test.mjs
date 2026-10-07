import test from "node:test";
import assert from "node:assert/strict";
import {buildTopikTrajectory} from "../lib/topik/trajectory.js";

test("verified mock scores produce an improvement trend",()=>{
  const result=buildTopikTrajectory([
    {submitted:true,scored:true,verifiedPercent:55,completedAt:"2026-09-01",skills:[]},
    {submitted:true,scored:true,verifiedPercent:60,completedAt:"2026-09-10",skills:[]},
    {submitted:true,scored:true,verifiedPercent:70,completedAt:"2026-10-01",skills:[]},
    {submitted:true,scored:true,verifiedPercent:75,completedAt:"2026-10-05",skills:[]},
  ]);
  assert.equal(result.scoreTrend.status,"improving");
  assert.equal(result.scoreTrend.delta,15);
});

test("unverified attempts do not create a fake score trajectory",()=>{
  const result=buildTopikTrajectory([
    {submitted:true,scored:false,verifiedPercent:null,skills:[]},
    {submitted:true,scored:false,verifiedPercent:null,skills:[]},
  ]);
  assert.equal(result.scoreTrend.status,"insufficient");
  assert.equal(result.verifiedAttempts,0);
});

test("per-skill trajectory identifies recovery",()=>{
  const result=buildTopikTrajectory([
    {submitted:true,completedAt:"2026-09-01",skills:[{skillId:"reading_inference",skillLabel:"Reading inference",section:"reading",accuracy:40}]},
    {submitted:true,completedAt:"2026-09-10",skills:[{skillId:"reading_inference",skillLabel:"Reading inference",section:"reading",accuracy:50}]},
    {submitted:true,completedAt:"2026-10-01",skills:[{skillId:"reading_inference",skillLabel:"Reading inference",section:"reading",accuracy:70}]},
    {submitted:true,completedAt:"2026-10-05",skills:[{skillId:"reading_inference",skillLabel:"Reading inference",section:"reading",accuracy:80}]},
  ]);
  assert.equal(result.mostImprovedSkill.skillId,"reading_inference");
  assert.equal(result.mostImprovedSkill.delta,30);
});

test("single skill exposure stays insufficient",()=>{
  const result=buildTopikTrajectory([
    {submitted:true,skills:[{skillId:"reading_order",skillLabel:"Ordering",section:"reading",accuracy:50}]},
  ]);
  assert.equal(result.skills[0].status,"insufficient");
});
