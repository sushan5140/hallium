import {test} from "node:test";
import assert from "node:assert/strict";
import {buildSkillEvidenceMap} from "../lib/progress-skills.js";
import {buildProgressInsights} from "../lib/progress-insights.js";
import {buildPublicProgressSummary,progressSummaryText} from "../lib/progress-sharing.js";
import {buildProgressModel} from "../lib/progress-model.js";
import fs from "node:fs";

test("skill map separates verified TOPIK from practice and missing evidence",()=>{
 const rows=buildSkillEvidenceMap({
   practiceAttempts:[{skill:"Grammar",score:60,createdAt:"2026-10-01"},{skill:"Grammar",score:75,createdAt:"2026-10-02"}],
   topikAttempts:[{submitted:true,scored:false,skills:[{section:"reading",accuracy:5}]}],
   mistakes:[{skill:"Listening",lastResult:"wrong"}],
 });
 const gram=rows.find(x=>x.skill==="Grammar");
 const reading=rows.find(x=>x.skill==="Reading");
 assert.equal(gram.direction,"improving");
 assert.equal(gram.practiceCount,2);
 assert.equal(reading.verifiedTopikCount,0);
 assert.equal(rows.find(x=>x.skill==="Listening").unresolvedCount,1);
 assert.equal(rows.find(x=>x.skill==="Speaking").evidenceStrength,"insufficient");
});

test("progress insights prioritize due reviews over apparent gains",()=>{
 const insights=buildProgressInsights({skillMap:[
   {skill:"Grammar",unresolvedCount:3,direction:"declining",evidenceStrength:"practice-repeat"},
   {skill:"Reading",unresolvedCount:0,direction:"improving",delta:15,evidenceStrength:"verified-repeat"},
 ],weaknesses:{dueCount:2}});
 assert.equal(insights.priorities[0].kind,"review");
 assert.equal(insights.priorities[1].title,"Revisit Grammar");
 assert.equal(insights.improving[0].skill,"Reading");
});

test("share summary excludes answers, private mistakes and tutor contents",()=>{
 const model={path:{completed:4,total:10},skillMap:[{skill:"Grammar",direction:"improving",evidenceStrength:"practice-repeat",privateAnswer:"secret"}],
   topik:{verifiedAttempts:3,scoreTrend:{status:"stable"}},mistakes:[{prompt:"secret"}],tutor:{latest:{title:"private"}}};
 const basic=buildPublicProgressSummary(model);
 assert.equal(basic.skills,undefined);
 assert.equal(basic.topik,undefined);
 assert.doesNotMatch(JSON.stringify(basic),/secret|private/);
 const included=buildPublicProgressSummary(model,{includeSkills:true,includeTopik:true});
 assert.equal(included.skills.length,1);
 assert.equal(included.topik.verifiedAttempts,3);
 assert.doesNotMatch(progressSummaryText(included),/secret|private/);
});

test("Batch 12 progress composition is read-only and preserves null mastery",()=>{
 const model=buildProgressModel({completedPathCount:2,totalPathLessons:4});
 assert.equal(model.masteryScore,null);
 assert.equal(model.skillMap.length,6);
 assert.ok(model.insights.priorities.length>=1);
 assert.ok(Array.isArray(model.timeline));
});

test("profile shows separate evidence map, priorities and safe sharing",()=>{
 const ui=fs.readFileSync("app/hallium-core.js","utf8");
 assert.match(ui,/SKILL EVIDENCE MAP/);
 assert.match(ui,/WHAT TO WORK ON NEXT/);
 assert.match(ui,/Copy basic progress summary/);
 assert.match(ui,/buildPublicProgressSummary\(progressModel\)/);
});
