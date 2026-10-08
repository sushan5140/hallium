import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Hallium Core passes session-only tutor intent into Tutor Decision",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.match(core,/const \[tutorIntent, setTutorIntent\]/);
 assert.match(core,/intent: tutorIntent/);
 assert.match(core,/Today only/);
});

test("session steering is not persisted through saveIntelligenceState",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.doesNotMatch(core,/saveIntelligenceState\(\{[^}]*tutorIntent/);
 assert.doesNotMatch(core,/preferences:[^\n]*tutorIntent/);
});

test("Learning Desk exposes focus and time steering controls",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 for(const label of ["Conversation","Listening","Vocabulary","Grammar","Assessment","TOPIK"]){
  assert.ok(core.includes(label));
 }
 assert.match(core,/Available time/);
 assert.match(core,/Clear today&apos;s steering/);
});
