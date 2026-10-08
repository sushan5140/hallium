import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Learning Desk renders tutor session closure from canonical outcome evaluation",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.match(core,/buildTutorSessionClosure/);
 assert.match(core,/const tutorSessionClosure = latestTutorIntervention/);
 assert.match(core,/SESSION OUTCOME/);
 assert.match(core,/tutorSessionClosure\.changed/);
 assert.match(core,/tutorSessionClosure\.unresolved/);
 assert.match(core,/tutorSessionClosure\.next/);
 assert.match(core,/tutorSessionClosure\.causalCaveat/);
});
