import {test} from "node:test";
import assert from "node:assert/strict";
import {normalizeContribution,validateContribution,contributionDraftText} from "../lib/community/contributions.mjs";
import fs from "node:fs";

const good={type:"lesson_correction",title:"Grammar explanation correction",context:"Unit 1 greeting example needs a more precise honorific explanation.",suggestion:"Explain the register distinction and include one polite classroom example.",rightsConfirmed:true};

test("requires meaningful context, proposal and rights confirmation",()=>{
 assert.equal(validateContribution(good).valid,true);
 assert.equal(validateContribution({...good,rightsConfirmed:false}).valid,false);
 assert.equal(validateContribution({...good,suggestion:"short"}).valid,false);
});
test("normalizes unsupported types and bounds user-supplied content",()=>{
 const row=normalizeContribution({...good,type:"admin",title:"x".repeat(300),suggestion:"y".repeat(4000)});
 assert.equal(row.type,"practice_idea");
 assert.equal(row.title.length,100);
 assert.equal(row.suggestion.length,1800);
});
test("draft text does not imply submission or publication",()=>{
 const result=contributionDraftText(good);
 assert.equal(result.valid,true);
 assert.match(result.text,/DRAFT ONLY/);
 assert.match(result.text,/does not submit or publish/);
 assert.match(result.text,/Preferred credit: anonymous/);
});
test("private contribution is not placed in an auto-publish flow",()=>{
 const hub=fs.readFileSync("app/community/page.js","utf8");
 const studio=fs.readFileSync("app/community/contribute/page.js","utf8");
 assert.match(hub,/review suggestions before using them/);
 assert.match(studio,/does not upload, submit, or publicly post/);
 assert.doesNotMatch(studio,/\.from\(["']community/);
});
test("existing creator feedback remains separate from general community",()=>{
 const hub=fs.readFileSync("app/community/page.js","utf8");
 assert.match(hub,/Invite only/);
 assert.match(hub,/creator-feedback/);
});
