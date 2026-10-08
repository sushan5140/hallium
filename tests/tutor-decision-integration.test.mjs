import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Hallium Core uses the canonical tutor decision composer",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.match(core,/buildTutorDecision/);
 assert.match(core,/const tutorDecision = buildTutorDecision/);
 assert.match(core,/const activeLearningRoute = tutorDecision\.route/);
});

test("learning desk explains the tutor decision",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.match(core,/Tutor decision/);
 assert.match(core,/tutorDecision\.confidence/);
 assert.match(core,/tutorDecision\.reason/);
 assert.match(core,/tutorDecision\.evidence/);
});
