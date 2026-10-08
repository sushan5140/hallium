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

test("Hangul iframe keeps a usable height even with expanded progress panels",()=>{
 const css=readFileSync("app/hangul/page.module.css","utf8");
 assert.match(css,/\.shell\{[^}]*overflow-y:auto/);
 assert.match(css,/\.frame\{[^}]*flex:1 0 auto/);
 assert.match(css,/\.frame\{[^}]*min-height:clamp\(420px,65dvh,740px\)/);
});

test("browser verification re-enters Learn after restoring saved progress",()=>{
 const reload=script.indexOf('await page.reload({waitUntil:"domcontentloaded"})');
 assert.ok(reload>=0,"saved progress reload must be tested");
 const postReload=script.slice(reload);
 const learn=postReload.indexOf('await frame.locator(learnNav+\' [data-view="learn"]\').click()');
 const visible=postReload.indexOf('await frame.locator("#view-learn").waitFor({state:"visible"})');
 const saved=postReload.indexOf('Hangul local progress not retained across reload');
 assert.ok(learn>=0&&visible>learn&&saved>visible,"must return to visible Learn before checking saved state");
});
