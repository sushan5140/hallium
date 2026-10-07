import { test } from "node:test";
import assert from "node:assert/strict";
import {CHECK,diagnosticResults,areasFor,focusFromAiAudit,fit,offlinePractice} from "../lib/study-partners/core.mjs";
const a={user_id:"a",discoverable:true,level:"beginner",availability:"Evenings",strength:"vocabulary",growth_area:"grammar",diagnostic:{}};
const b={user_id:"b",discoverable:true,level:"beginner",availability:"Evenings",strength:"grammar",growth_area:"vocabulary",diagnostic:{}};
test("opt-in and reciprocal needs are required",()=>{
 assert.equal(fit(a,b).mutual,true);
 assert.equal(fit(a,{...b,discoverable:false}),null);
 assert.equal(fit(a,a),null);
 assert.equal(fit(a,{...b,growth_area:"grammar"}).mutual,false);
});
test("diagnostic aggregates only answered questions",()=>{
 assert.equal(CHECK.length,8);
 const r=diagnosticResults({0:1,1:0,2:0,3:2,4:2,5:1,6:0,7:0});
 assert.deepEqual(r.vocabulary,{correct:4,total:4});
 assert.deepEqual(r.grammar,{correct:3,total:4});
 assert.equal(areasFor({...a,diagnostic:r}).strength,"vocabulary");
});
test("no invented teaching expertise from a tied check",()=>{
 assert.equal(areasFor({...a,diagnostic:{vocabulary:{correct:3,total:4},grammar:{correct:3,total:4}}}).basis,"self-described study focus");
});
test("partner practice requires deliberately shared material from both types",()=>{
 assert.throws(()=>offlinePractice([]),/Share at least one/);
 assert.throws(()=>offlinePractice([{kind:"vocabulary",title:"학교",meaning:"school"}]),/Share at least one/);
 const r=offlinePractice([{kind:"vocabulary",title:"학교",meaning:"school",example:"학교에 가요."},{kind:"grammar",title:"에서",meaning:"where action occurs",example:"학교에서 공부해요."}]);
 assert.deepEqual(r.map(x=>x.kind),["vocabulary","grammar","together"]);
 assert.ok(r[2].prompt.includes("학교")&&r[2].prompt.includes("에서"));
});

test("AI report focus is optional and requires unambiguous opposing categories",()=>{
 const focus=focusFromAiAudit({audit:{strengths:["Vocabulary recall"],weaknesses:["Grammar particle confusion"]}});
 assert.deepEqual(focus,{strength:"vocabulary",growth:"grammar"});
 assert.equal(focusFromAiAudit({audit:{strengths:["Needs vocabulary and grammar"],weaknesses:["Grammar"]}}),null);
 assert.equal(areasFor({...a,diagnostic:{report_import:focus}}).basis,"Hallium AI learning report");
});


test("compatibility score rewards reciprocal learning needs, level and availability",()=>{
 const m=fit(a,b);
 assert.equal(m.mutual,true);
 assert.equal(m.score,92);
 assert.equal(m.levelMatch,true);
 assert.equal(m.availabilityMatch,true);
 assert.ok(m.reasons.includes("Your practice needs complement each other"));
 assert.ok(m.reasons.includes("Same Korean level"));
});

test("nearby levels remain compatible without pretending to be exact matches",()=>{
 const m=fit(a,{...b,level:"elementary"});
 assert.equal(m.levelMatch,false);
 assert.equal(m.levelDistance,1);
 assert.equal(m.score,84);
 assert.ok(m.reasons.includes("Nearby Korean level"));
});

test("flexible availability is treated as compatible without exposing extra schedule detail",()=>{
 const m=fit({...a,availability:"Flexible"},{...b,availability:"Mornings"});
 assert.equal(m.availabilityMatch,true);
 assert.equal(m.availabilityLabel,"Flexible timing");
});

test("evidence-informed label appears when at least one profile uses measured focus",()=>{
 const measured={...a,diagnostic:{vocabulary:{correct:4,total:4},grammar:{correct:2,total:4}}};
 const m=fit(measured,b);
 assert.equal(m.confidence,"evidence-informed");
});
