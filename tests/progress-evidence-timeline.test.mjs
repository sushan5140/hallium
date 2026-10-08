import {test} from "node:test";
import assert from "node:assert/strict";
import {buildEvidenceTimeline,buildProgressModel} from "../lib/progress-model.js";

test("evidence timeline sorts newest first across sources",()=>{
 const rows=buildEvidenceTimeline({
  studyResults:[{score:6,total:10,completedAt:"2026-10-01T00:00:00Z"}],
  practiceAttempts:[{id:"p1",skill:"Grammar",score:70,outcome:"developing",createdAt:"2026-10-03T00:00:00Z"}],
  topikAttempts:[{submitted:true,scored:true,verifiedPercent:65,completedAt:"2026-10-02T00:00:00Z",skills:[]}],
  tutorInterventions:[{id:"t1",title:"Grammar repair",recommendedAt:"2026-10-04T00:00:00Z"}],
 });
 assert.deepEqual(rows.map(x=>x.source),["tutor","practice","verified_topik","structured_study"]);
});

test("unverified TOPIK attempt never enters dated progress timeline",()=>{
 const rows=buildEvidenceTimeline({
  topikAttempts:[
   {submitted:true,scored:false,verifiedPercent:null,completedAt:"2026-10-02T00:00:00Z",skills:[]},
   {submitted:true,scored:true,verifiedPercent:70,completedAt:"2026-10-03T00:00:00Z",skills:[]},
  ],
 });
 assert.equal(rows.length,1);
 assert.equal(rows[0].source,"verified_topik");
});

test("practice activity is not called a gain without comparable same-skill evidence",()=>{
 const rows=buildEvidenceTimeline({
  practiceAttempts:[{id:"p1",skill:"Grammar",score:95,outcome:"strong",createdAt:"2026-10-01T00:00:00Z"}],
 });
 assert.equal(rows[0].gain,false);
 assert.equal(rows[0].evidenceOnly,true);
});

test("same-skill practice needs a meaningful delta before it becomes a gain",()=>{
 const rows=buildEvidenceTimeline({
  practiceAttempts:[
   {id:"p1",skill:"Grammar",score:60,outcome:"developing",createdAt:"2026-10-01T00:00:00Z"},
   {id:"p2",skill:"Grammar",score:70,outcome:"developing",createdAt:"2026-10-02T00:00:00Z"},
  ],
 });
 const newest=rows[0];
 assert.equal(newest.change,10);
 assert.equal(newest.gain,true);
});

test("structured study gains require comparative improvement",()=>{
 const rows=buildEvidenceTimeline({
  studyResults:[
   {score:6,total:10,completedAt:"2026-10-01T00:00:00Z"},
   {score:7,total:10,completedAt:"2026-10-02T00:00:00Z"},
  ],
 });
 assert.equal(rows[0].change,10);
 assert.equal(rows[0].gain,true);
});

test("curriculum snapshot is explicitly not fabricated into dated history",()=>{
 const model=buildProgressModel({completedPathCount:5,totalPathLessons:10});
 assert.equal(model.timeline.length,0);
 assert.match(model.timelineNote,/do not carry reliable completion timestamps/);
});

test("recent gains are derived only from timeline rows marked as gains",()=>{
 const model=buildProgressModel({
  practiceAttempts:[
   {id:"p1",skill:"Grammar",score:55,outcome:"developing",createdAt:"2026-10-01T00:00:00Z"},
   {id:"p2",skill:"Grammar",score:70,outcome:"developing",createdAt:"2026-10-02T00:00:00Z"},
  ],
 });
 assert.equal(model.recentGains.length,1);
 assert.equal(model.recentGains[0].kind,"practice");
 assert.match(model.recentGains[0].detail,/\+15 pts/);
});
