import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Hallium Core stores tutor intervention memory in canonical intelligence",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.match(core,/tutorInterventions/);
 assert.match(core,/createTutorInterventionSnapshot/);
 assert.match(core,/saveIntelligenceState\(\{tutorInterventions:next\}\)/);
});

test("cloud merge unions tutor interventions by stable id",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.match(core,/interventionMap/);
 assert.match(core,/remote\?\.tutorInterventions/);
 assert.match(core,/local\?\.tutorInterventions/);
 assert.match(core,/slice\(-20\)/);
});

test("latest intervention outcome feeds the canonical tutor decision",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.match(core,/evaluateTutorIntervention/);
 assert.match(core,/interventionMemory: latestTutorIntervention/);
 assert.match(core,/waiting for more evidence/);
});

test("snapshot happens when the learner opens the primary recommendation",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.match(core,/tutorDecision\?\.primary\?\.kind===step\.kind/);
 assert.match(core,/launchLearningRouteStep\(step\.kind, step\.href, step\)/);
});
