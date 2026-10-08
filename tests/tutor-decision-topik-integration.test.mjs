import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Hallium Core hydrates canonical TOPIK evidence into Tutor Decision",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.match(core,/setTopikEvidence\(savedIntelligence\.topik\?\.evidence \|\| \[\]\)/);
 assert.match(core,/setTopikEvidence\(intelligence\?\.topik\?\.evidence \|\| \[\]\)/);
 assert.match(core,/topikAttempts: topikEvidence/);
});

test("TOPIK tutor step opens the routed companion destination",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.match(core,/kind === "topik"/);
 assert.match(core,/window\.location\.href = href \|\| "\/topik-mocks"/);
 assert.match(core,/launchLearningRouteStep\(step\.kind, step\.href\)/);
});
