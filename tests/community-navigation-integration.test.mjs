import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("community is accessible from creator and ambassador pages",()=>{
 for(const path of ["app/creator-kit/page.js","app/ambassadors/page.js"]){
  assert.match(fs.readFileSync(path,"utf8"),/href="\/community"/);
 }
});
test("community exposes consent-first contribution studio",()=>{
 const page=fs.readFileSync("app/community/contribute/page.js","utf8");
 for(const key of ["rightsConfirmed","anonymousPreference","permissionToContact","contributionDraftText"]){
  assert.ok(page.includes(key));
 }
 assert.match(page,/clipboard\.writeText/);
});
test("public community forbids unmoderated publication and private information exposure",()=>{
 const page=fs.readFileSync("app/community/page.js","utf8");
 assert.match(page,/No public comment wall/);
 assert.match(page,/private chat scraping/);
 assert.match(page,/not.*official TOPIK scores/);
});
test("editorial policy explicitly requires review and future protections",()=>{
 const policy=fs.readFileSync("docs/community/REVIEW_POLICY.md","utf8");
 for(const term of ["Rights","Privacy","Learning quality","Moderation","RLS","rate limits"]){
  assert.ok(policy.includes(term));
 }
});
