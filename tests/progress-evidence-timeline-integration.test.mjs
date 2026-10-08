import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Progress surface renders recent gains separately from evidence history",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.match(core,/RECENT GAINS/);
 assert.match(core,/EVIDENCE TIMELINE/);
 assert.match(core,/progressModel\.recentGains/);
 assert.match(core,/progressModel\.timeline/);
 assert.match(core,/progressModel\.timelineNote/);
});

test("Progress copy says gains require comparable evidence",()=>{
 const core=fs.readFileSync("app/hallium-core.js","utf8");
 assert.match(core,/waits for comparable evidence before calling something an improvement/);
});
