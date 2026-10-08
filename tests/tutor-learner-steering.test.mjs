import {test} from "node:test";
import assert from "node:assert/strict";
import {buildTutorDecision,normalizeTutorIntent} from "../lib/tutor-decision.js";

const base={
  latestStudyPct:78,
  completedPathCount:3,
  totalPathLessons:10,
  activeStudyLabel:"Foundation",
  nextLessonTitle:"My morning",
  preferences:{dailyMinutes:15,focuses:["conversation"],topics:["daily_life"]},
};

test("empty learner intent stays empty",()=>{
 const intent=normalizeTutorIntent({});
 assert.equal(intent.focus,"");
 assert.equal(intent.minutes,null);
 assert.equal(intent.topikMode,false);
});

test("session focus can steer the first tutor action",()=>{
 const d=buildTutorDecision({...base,intent:{focus:"grammar"}});
 assert.equal(d.primary.kind,"grammar");
 assert.match(d.primary.title,/Grammar-only/);
 assert.equal(d.evidence[0].kind,"learner_intent");
});

test("session time budget fits the route without changing saved preferences",()=>{
 const d=buildTutorDecision({...base,intent:{minutes:10}});
 assert.equal(d.intent.minutes,10);
 assert.ok((d.route.plannedMinutes||d.route.sessionMinutes)<=10);
});

test("TOPIK mode uses verified weakness when available",()=>{
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
 assert.match(d.primary.href,/topik-companion/);
});

test("TOPIK mode without verified evidence builds evidence instead of inventing weakness",()=>{
 const d=buildTutorDecision({
  ...base,
  intent:{focus:"topik"},
  topikAttempts:[
   {submitted:true,scored:false,verifiedPercent:null,completedAt:"2026-10-01T00:00:00Z",skills:[
    {skillId:"reading_order",skillLabel:"Reading order",section:"reading",answered:1,total:4,accuracy:null},
   ]},
  ],
 });
 assert.equal(d.primary.kind,"topik");
 assert.equal(d.primary.href,"/topik-mocks");
 assert.match(d.primary.why,/does not have enough verified scored evidence/);
});

test("explicit focus outranks intervention memory",()=>{
 const d=buildTutorDecision({
  ...base,
  intent:{focus:"listening"},
  interventionMemory:{
   snapshot:{kind:"grammar",title:"Grammar repair",recommendedAt:"2026-10-01T00:00:00Z"},
   outcome:{status:"evaluated",action:"maintain",delta:10,samples:2},
  },
 });
 assert.equal(d.primary.kind,"companion");
 assert.match(d.primary.title,/Listening-focused/);
});

test("due review still outranks learner steering",()=>{
 const d=buildTutorDecision({
  ...base,
  intent:{focus:"topik",minutes:10},
  mistakes:[{id:"m1",skill:"Grammar",nextReviewAt:"2026-09-01T00:00:00Z",lastResult:"wrong",misses:2}],
  dueCount:1,
 });
 assert.equal(d.primary.kind,"review_queue");
 assert.equal(d.confidence,"high");
});
