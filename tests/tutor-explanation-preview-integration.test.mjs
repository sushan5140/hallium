import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Learning Desk renders the canonical tutor explanation",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.match(core,/WHY THIS NEXT/);
 assert.match(core,/tutorDecision\.explanation\.trains/);
 assert.match(core,/tutorDecision\.explanation\.chosenBecause/);
 assert.match(core,/tutorDecision\.explanation\.success/);
 assert.match(core,/tutorDecision\.explanation\.evidence/);
 assert.match(core,/tutorDecision\.explanation\.alternatives/);
 assert.match(core,/tutorDecision\.explanation\.uncertainty/);
});
