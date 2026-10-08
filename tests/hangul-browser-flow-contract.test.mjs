import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const script=readFileSync(".github/scripts/verify-hangul-layout.cjs","utf8");
const source=readFileSync("public/hangul-lab/app.js","utf8");

test("browser verification enters Learn before asserting letter visibility",()=>{
 const nav=script.indexOf('learnNav+\' [data-view="learn"]\'');
 const visible=script.indexOf('first().waitFor({state:"visible"})');
 assert.ok(nav>=0&&visible>nav,"must enter Learn view before visibility assertion");
 assert.match(script,/const learnNav=width<=760\?"\.mobile-nav":"\.desktop-nav"/);
});

test("Hangul application supports explicit Learn view and all five learning areas",()=>{
 assert.match(source,/\['learn','build','write','practice','cards'\]/);
 assert.match(source,/switchView\(location\.hash\.slice\(1\)\|\|'learn'/);
});

test("responsive regression still checks writing, building and saved learning state",()=>{
 assert.match(script,/for\(const width of \[1600,1440/);
 assert.match(script,/pulse-known/);
 assert.match(script,/pulse-explored/);
 assert.match(script,/writing-canvas/);
 assert.match(script,/syllable-result/);
});
