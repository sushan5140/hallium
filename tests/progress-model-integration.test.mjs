import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Hallium Core renders multidimensional progress evidence",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.match(core,/buildProgressModel/);
 assert.match(core,/CURRENT LEVEL CONTEXT/);
 assert.match(core,/STRUCTURED STUDY/);
 assert.match(core,/UNRESOLVED/);
 assert.match(core,/VERIFIED TOPIK/);
 assert.match(core,/TUTOR FOLLOW-UP/);
});

test("Progress surface does not render a global mastery percentage",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.doesNotMatch(core,/GLOBAL MASTERY/i);
 assert.doesNotMatch(core,/overall mastery/i);
});
