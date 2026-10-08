import {test} from "node:test";
import assert from "node:assert/strict";
import {
  createTutorInterventionSnapshot,
  evaluateTutorIntervention,
  buildTutorDecision,
} from "../lib/tutor-decision.js";

const snapshot={
 id:"t1",
 kind:"grammar",
 title:"Rebuild the grammar pattern",
 skill:"Grammar pattern",
 evidenceSource:"practice_evidence",
 baselineScore:50,
 recommendedAt:"2026-10-01T00:00:00Z",
 confidence:"medium",
 href:"",
};

test("one later relevant attempt is never enough to adapt",()=>{
 const result=evaluateTutorIntervention(snapshot,{practiceAttempts:[
  {createdAt:"2026-10-02T00:00:00Z",skill:"Grammar pattern",score:72},
 ]});
 assert.equal(result.status,"insufficient");
 assert.equal(result.action,"wait");
 assert.equal(result.samples,1);
});

test("two improving later attempts maintain the intervention",()=>{
 const result=evaluateTutorIntervention(snapshot,{practiceAttempts:[
  {createdAt:"2026-10-02T00:00:00Z",skill:"Grammar pattern",score:60},
  {createdAt:"2026-10-03T00:00:00Z",skill:"Grammar pattern",score:64},
 ]});
 assert.equal(result.status,"evaluated");
 assert.equal(result.action,"maintain");
 assert.equal(result.delta,12);
});

test("persistently weak later evidence escalates support",()=>{
 const result=evaluateTutorIntervention(snapshot,{practiceAttempts:[
  {createdAt:"2026-10-02T00:00:00Z",skill:"Grammar pattern",score:48},
  {createdAt:"2026-10-03T00:00:00Z",skill:"Grammar pattern",score:50},
 ]});
 assert.equal(result.action,"escalate");
});

test("strong recovery switches away from the old intervention",()=>{
 const result=evaluateTutorIntervention(snapshot,{practiceAttempts:[
  {createdAt:"2026-10-02T00:00:00Z",skill:"Grammar pattern",score:86},
  {createdAt:"2026-10-03T00:00:00Z",skill:"Grammar pattern",score:90},
 ]});
 assert.equal(result.action,"switch");
});

test("flat but usable evidence repeats before changing direction",()=>{
 const result=evaluateTutorIntervention({...snapshot,baselineScore:68},{practiceAttempts:[
  {createdAt:"2026-10-02T00:00:00Z",skill:"Grammar pattern",score:67},
  {createdAt:"2026-10-03T00:00:00Z",skill:"Grammar pattern",score:70},
 ]});
 assert.equal(result.action,"repeat");
});

test("unrelated practice is ignored",()=>{
 const result=evaluateTutorIntervention(snapshot,{practiceAttempts:[
  {createdAt:"2026-10-02T00:00:00Z",skill:"Vocabulary recall",score:90},
  {createdAt:"2026-10-03T00:00:00Z",skill:"Vocabulary recall",score:92},
 ]});
 assert.equal(result.samples,0);
 assert.equal(result.status,"insufficient");
});

test("verified TOPIK intervention watches exact later skill only",()=>{
 const topikSnapshot={...snapshot,kind:"topik",skill:"reading_order",evidenceSource:"verified_topik",baselineScore:40};
 const result=evaluateTutorIntervention(topikSnapshot,{topikAttempts:[
  {completedAt:"2026-10-02T00:00:00Z",skills:[{skillId:"reading_detail",accuracy:90},{skillId:"reading_order",accuracy:52}]},
  {completedAt:"2026-10-03T00:00:00Z",skills:[{skillId:"reading_order",accuracy:58}]},
 ]});
 assert.equal(result.samples,2);
 assert.equal(result.action,"maintain");
});

test("snapshot records only the acted-on tutor recommendation metadata",()=>{
 const decision={
  primary:{kind:"grammar",title:"Rebuild grammar",evidenceSkill:"Grammar pattern",evidenceSource:"practice_evidence"},
  practiceRecommendation:{skill:"Grammar pattern",evidenceScore:48,source:"practice_evidence"},
  confidence:"medium",
  topik:{weakness:null},
 };
 const row=createTutorInterventionSnapshot(decision,new Date("2026-10-01T00:00:00Z"));
 assert.equal(row.kind,"grammar");
 assert.equal(row.skill,"Grammar pattern");
 assert.equal(row.baselineScore,48);
});

test("evaluated maintain memory keeps the previous target in front",()=>{
 const d=buildTutorDecision({
  latestStudyPct:78,
  completedPathCount:3,
  totalPathLessons:10,
  activeStudyLabel:"Foundation",
  nextLessonTitle:"My morning",
  preferences:{dailyMinutes:15,focuses:["conversation"],topics:["daily_life"]},
  interventionMemory:{
   snapshot,
   outcome:{status:"evaluated",action:"maintain",delta:12,samples:2},
  },
 });
 assert.equal(d.primary.kind,"grammar");
 assert.match(d.primary.title,/Continue/);
});

test("due review still outranks intervention memory",()=>{
 const d=buildTutorDecision({
  mistakes:[{id:"m1",skill:"Grammar",nextReviewAt:"2026-09-01T00:00:00Z",lastResult:"wrong",misses:2}],
  dueCount:1,
  totalPathLessons:10,
  activeStudyLabel:"Foundation",
  nextLessonTitle:"My morning",
  preferences:{dailyMinutes:15,focuses:["conversation"],topics:["daily_life"]},
  interventionMemory:{
   snapshot,
   outcome:{status:"evaluated",action:"maintain",delta:12,samples:2},
  },
 });
 assert.equal(d.primary.kind,"review_queue");
});
