import {test} from "node:test";
import assert from "node:assert/strict";
import {buildTutorDecision} from "../lib/tutor-decision.js";

const prefs={dailyMinutes:15,focuses:["conversation"],topics:["daily_life"]};

test("verified TOPIK weakness can become the first tutor intervention",()=>{
 const d=buildTutorDecision({
  preferences:prefs,
  totalPathLessons:10,
  activeStudyLabel:"Foundation",
  nextLessonTitle:"My morning",
  topikLevel:"I",
  topikAttempts:[
   {submitted:true,scored:true,verifiedPercent:62,completedAt:"2026-10-01T00:00:00Z",skills:[
    {skillId:"reading_order",skillLabel:"Reading order",section:"reading",answered:2,total:2,accuracy:40},
   ]},
   {submitted:true,scored:true,verifiedPercent:65,completedAt:"2026-10-05T00:00:00Z",skills:[
    {skillId:"reading_order",skillLabel:"Reading order",section:"reading",answered:2,total:2,accuracy:45},
   ]},
  ],
 });
 assert.equal(d.primary.kind,"topik");
 assert.match(d.primary.href,/unit=i11/);
 assert.equal(d.topik.weakness.skillId,"reading_order");
 assert.ok(d.evidence.some(x=>x.kind==="verified_topik"));
});

test("unverified TOPIK completion cannot create a mastery or weakness intervention",()=>{
 const d=buildTutorDecision({
  preferences:prefs,
  totalPathLessons:10,
  activeStudyLabel:"Foundation",
  nextLessonTitle:"My morning",
  topikAttempts:[
   {submitted:true,scored:false,verifiedPercent:null,completedAt:"2026-10-05T00:00:00Z",skills:[
    {skillId:"reading_order",skillLabel:"Reading order",section:"reading",answered:0,total:4,accuracy:null},
   ]},
  ],
 });
 assert.notEqual(d.primary.kind,"topik");
 assert.equal(d.topik.weakness,null);
 assert.equal(d.evidence.some(x=>x.kind==="verified_topik"),false);
});

test("due review safety stays ahead of verified TOPIK weakness",()=>{
 const d=buildTutorDecision({
  preferences:prefs,
  mistakes:[{id:"m1",skill:"Grammar",nextReviewAt:"2026-10-01T00:00:00Z",lastResult:"wrong",misses:2}],
  dueCount:1,
  totalPathLessons:10,
  activeStudyLabel:"Foundation",
  nextLessonTitle:"My morning",
  topikAttempts:[
   {submitted:true,scored:true,verifiedPercent:50,completedAt:"2026-10-05T00:00:00Z",skills:[
    {skillId:"reading_order",skillLabel:"Reading order",section:"reading",answered:2,total:2,accuracy:30},
   ]},
  ],
 });
 assert.equal(d.primary.kind,"review_queue");
 assert.equal(d.confidence,"high");
});

test("verified TOPIK score trajectory is exposed as tutor evidence",()=>{
 const d=buildTutorDecision({
  preferences:prefs,
  totalPathLessons:10,
  activeStudyLabel:"Foundation",
  nextLessonTitle:"My morning",
  topikAttempts:[
   {submitted:true,scored:true,verifiedPercent:50,completedAt:"2026-09-01T00:00:00Z",skills:[]},
   {submitted:true,scored:true,verifiedPercent:60,completedAt:"2026-09-10T00:00:00Z",skills:[]},
   {submitted:true,scored:true,verifiedPercent:70,completedAt:"2026-10-01T00:00:00Z",skills:[]},
   {submitted:true,scored:true,verifiedPercent:80,completedAt:"2026-10-05T00:00:00Z",skills:[]},
  ],
 });
 const row=d.evidence.find(x=>x.kind==="topik_trajectory");
 assert.ok(row);
 assert.match(row.label,/improving/);
});
