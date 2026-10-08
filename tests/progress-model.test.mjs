import {test} from "node:test";
import assert from "node:assert/strict";
import {buildProgressModel} from "../lib/progress-model.js";

test("progress model keeps dimensions separate and has no global mastery score",()=>{
 const model=buildProgressModel({
  currentLevel:{id:"foundation",label:"Foundation",topik:"TOPIK 1 range"},
  targetLevel:{id:"elementary",label:"Elementary"},
  completedPathCount:4,
  totalPathLessons:10,
  studyResults:[{score:7,total:10}],
 });
 assert.equal(model.levelContext.currentLabel,"Foundation");
 assert.equal(model.path.percent,40);
 assert.equal(model.structuredStudy.latestPercent,70);
 assert.equal(model.masteryScore,null);
 assert.match(model.disclaimer,/separate/);
});

test("unresolved weaknesses remain visible as their own dimension",()=>{
 const model=buildProgressModel({
  mistakes:[
   {id:"m1",skill:"Grammar",misses:3,nextReviewAt:"2020-01-01T00:00:00Z",lastResult:"wrong"},
   {id:"m2",skill:"Vocabulary",misses:2,nextReviewAt:"2020-01-01T00:00:00Z",lastResult:"wrong"},
  ],
 });
 assert.equal(model.weaknesses.dueCount,2);
 assert.ok(model.unresolved.some(x=>x.label==="Grammar"));
});

test("TOPIK progress only counts verified scored attempts for score trajectory",()=>{
 const model=buildProgressModel({
  topikAttempts:[
   {submitted:true,scored:false,verifiedPercent:null,completedAt:"2026-10-01T00:00:00Z",skills:[]},
   {submitted:true,scored:true,verifiedPercent:55,completedAt:"2026-10-02T00:00:00Z",skills:[]},
   {submitted:true,scored:true,verifiedPercent:70,completedAt:"2026-10-03T00:00:00Z",skills:[]},
  ],
 });
 assert.equal(model.topik.verifiedAttempts,2);
 assert.notEqual(model.topik.scoreTrend.status,"insufficient");
 assert.equal(model.topik.source,"verified_topik_only");
});

test("practice evidence is presented independently from structured study",()=>{
 const model=buildProgressModel({
  practiceAttempts:[
   {createdAt:"2026-10-01T00:00:00Z",skill:"Grammar",score:90,outcome:"strong",mode:"build"},
   {createdAt:"2026-10-02T00:00:00Z",skill:"Grammar",score:86,outcome:"strong",mode:"build"},
  ],
 });
 assert.equal(model.practice.attempts,2);
 assert.equal(model.practice.source,"practice_evidence");
 assert.equal(model.structuredStudy.latestPercent,null);
});

test("tutor follow-up remains distinct evidence",()=>{
 const model=buildProgressModel({
  tutorInterventions:[
   {id:"t1",kind:"grammar",skill:"Grammar",evidenceSource:"practice_evidence",baselineScore:50,recommendedAt:"2026-10-01T00:00:00Z"},
  ],
  practiceAttempts:[
   {createdAt:"2026-10-02T00:00:00Z",skill:"Grammar",score:65},
   {createdAt:"2026-10-03T00:00:00Z",skill:"Grammar",score:70},
  ],
 });
 assert.equal(model.tutor.interventions,1);
 assert.equal(model.tutor.latestOutcome.status,"evaluated");
 assert.ok(model.timeline.some(x=>x.source==="tutor" && x.evidenceOnly));
 assert.ok(model.recentGains.every(x=>x.kind!=="tutor"));
});
