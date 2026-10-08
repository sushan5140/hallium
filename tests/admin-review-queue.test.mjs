import {test} from "node:test";
import assert from "node:assert/strict";
import {buildAdminReviewQueue,safeQaTransition} from "../lib/curriculum/admin-review.js";
import fs from "node:fs";
const audit={rows:[
 {lesson:{id:"a",title:"Good"},unitTitle:"One",coverage:{missing:[]}},
 {lesson:{id:"b",title:"Missing listening"},unitTitle:"One",coverage:{missing:["listening"]}},
 {lesson:{id:"c",title:"Native review"},unitTitle:"Two",coverage:{missing:[]}},
]};
test("QA queue distinguishes approval, blockers and reviewer work",()=>{
 const r=buildAdminReviewQueue(audit,{a:"approved",b:"approved",c:"native-review"});
 assert.equal(r.ready,1);
 assert.equal(r.blocked,1);
 assert.equal(r.pending,2);
 assert.match(r.rows[1].blockers[0],/listening/);
});
test("missing stages block approval, but not requesting a fix",()=>{
 assert.equal(safeQaTransition("review","approved",{hasCoverageGaps:true}).allowed,false);
 assert.equal(safeQaTransition("review","needs-fix",{hasCoverageGaps:true}).allowed,true);
 assert.equal(safeQaTransition("review","approved",{hasCoverageGaps:false}).allowed,true);
 assert.equal(safeQaTransition("review","unknown").allowed,false);
});
test("existing legacy QA values remain recognized",()=>{
 for(const status of ["review","native-review","needs-fix","approved"])
  assert.equal(safeQaTransition("review",status).allowed,true);
});
test("Admin Studio still requires authorized admin access",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.match(core,/if \(!adminAccess\)/);
 assert.match(core,/safeQaTransition\(qa,event\.target\.value/);
 assert.match(core,/reviewQueue\.blocked/);
});
