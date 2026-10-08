import {test} from "node:test";
import assert from "node:assert/strict";
import {buildTutorDecision} from "../lib/tutor-decision.js";

test("due review keeps top priority and produces high confidence",()=>{
 const d=buildTutorDecision({
  mistakes:[{id:"m1",skill:"Grammar",nextReviewAt:"2026-10-01T00:00:00Z",lastResult:"wrong",misses:2}],
  latestStudyPct:72,
  completedPathCount:3,
  totalPathLessons:10,
  activeStudyLabel:"Foundation",
  nextLessonTitle:"My morning",
  preferences:{dailyMinutes:15,focuses:["grammar"],topics:["daily_life"]},
  dueCount:1,
 });
 assert.equal(d.primary.kind,"review_queue");
 assert.equal(d.confidence,"high");
 assert.equal(d.evidence[0].kind,"due_review");
});

test("recent weak practice can become the tutor intervention",()=>{
 const d=buildTutorDecision({
  latestStudyPct:78,
  completedPathCount:4,
  totalPathLessons:10,
  activeStudyLabel:"Foundation",
  nextLessonTitle:"My morning",
  preferences:{dailyMinutes:15,focuses:["conversation"],topics:["daily_life"]},
  practiceAttempts:[
   {createdAt:"2026-10-08T00:00:00Z",skill:"Grammar pattern",score:42,outcome:"relearn",mode:"build"},
   {createdAt:"2026-10-08T00:05:00Z",skill:"Grammar pattern",score:50,outcome:"relearn",mode:"build"},
  ],
  dueCount:0,
 });
 assert.equal(d.primary.kind,"grammar");
 assert.equal(d.practiceRecommendation.source,"practice_evidence");
 assert.ok(d.evidence.some(x=>x.kind==="practice_evidence"));
});

test("empty evidence stays low confidence instead of inventing mastery",()=>{
 const d=buildTutorDecision({
  totalPathLessons:10,
  activeStudyLabel:"Starter",
  nextLessonTitle:"First lesson",
  preferences:{dailyMinutes:15,focuses:["conversation"],topics:["daily_life"]},
 });
 assert.equal(d.confidence,"low");
 assert.equal(d.evidence[0].kind,"baseline");
 assert.match(d.route.headline,/baseline/i);
});
