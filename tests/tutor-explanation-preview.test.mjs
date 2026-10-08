import {test} from "node:test";
import assert from "node:assert/strict";
import {buildTutorDecision} from "../lib/tutor-decision.js";

const base={
  latestStudyPct:78,
  completedPathCount:3,
  totalPathLessons:10,
  activeStudyLabel:"Foundation",
  nextLessonTitle:"My morning",
  preferences:{dailyMinutes:15,focuses:["conversation"],topics:["daily_life"]},
};

test("tutor decision exposes a grounded intervention explanation",()=>{
 const d=buildTutorDecision({...base,intent:{focus:"grammar"}});
 assert.equal(d.explanation.trains,"Grammar-only focus");
 assert.match(d.explanation.chosenBecause,/focus this session on grammar/);
 assert.match(d.explanation.success,/grammar attempts/i);
 assert.ok(Array.isArray(d.explanation.evidence));
 assert.ok(Array.isArray(d.explanation.alternatives));
});

test("verified TOPIK preview defines success as later verified skill accuracy",()=>{
 const d=buildTutorDecision({
  ...base,
  intent:{focus:"topik"},
  topikLevel:"I",
  topikAttempts:[
   {submitted:true,scored:true,verifiedPercent:60,completedAt:"2026-10-01T00:00:00Z",skills:[
    {skillId:"reading_order",skillLabel:"Reading order",section:"reading",answered:2,total:2,accuracy:40},
   ]},
  ],
 });
 assert.equal(d.primary.kind,"topik");
 assert.match(d.explanation.success,/verified accuracy/);
 assert.match(d.explanation.trains,/Reading order/);
});

test("low confidence preview states uncertainty instead of certainty",()=>{
 const d=buildTutorDecision({
  totalPathLessons:10,
  activeStudyLabel:"Starter",
  nextLessonTitle:"First lesson",
  preferences:{dailyMinutes:15,focuses:["conversation"],topics:["daily_life"]},
 });
 assert.equal(d.confidence,"low");
 assert.match(d.explanation.uncertainty,/Evidence is still limited/);
});

test("alternatives mirror lower-ranked route steps",()=>{
 const d=buildTutorDecision(base);
 assert.deepEqual(
  d.explanation.alternatives.map(x=>x.kind),
  d.route.steps.slice(1,3).map(x=>x.kind)
 );
});
