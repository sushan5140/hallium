import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {PUBLIC_LOCALES,normalizePublicLocale,publicCopy} from "../lib/i18n/public-copy.mjs";

test("public localization allows explicit English and Korean with safe fallback",()=>{
 assert.deepEqual(PUBLIC_LOCALES,["en","ko"]);
 assert.equal(normalizePublicLocale("ko"),"ko");
 assert.equal(normalizePublicLocale("fr"),"en");
 assert.equal(normalizePublicLocale(""),"en");
 for(const locale of PUBLIC_LOCALES){
  const t=publicCopy(locale);
  for(const key of ["skip","language","offlineTitle","offlineBody","retry","community"]){
   assert.ok(typeof t[key]==="string"&&t[key].trim().length>0,locale+" missing "+key);
  }
 }
});
test("recovery screen has explicit language selector and localized content",()=>{
 const text=fs.readFileSync("app/offline/OfflineContent.js","utf8");
 assert.match(text,/htmlFor="offline-language"/);
 assert.match(text,/id="offline-language"/);
 assert.match(text,/<option value="ko">한국어<\/option>/);
 assert.match(text,/lang=\{locale\}/);
 assert.match(text,/t\.offlineTitle/);
});
test("layout offers keyboard skip navigation",()=>{
 const content=fs.readFileSync("app/layout.js","utf8");
 assert.match(content,/className="skipToContent"/);
 assert.match(content,/href="#main-content"/);
 assert.match(content,/id="main-content"/);
});
test("styles provide focus-visible and reduced-motion alternatives",()=>{
 const content=fs.readFileSync("app/globals.css","utf8");
 assert.match(content,/:focus-visible/);
 assert.match(content,/prefers-reduced-motion: reduce/);
 assert.match(content,/\.skipToContent:focus/);
});
test("offline service worker still avoids private-page caching",()=>{
 const content=fs.readFileSync("public/sw.js","utf8");
 assert.match(content,/req\.mode!=="navigate"/);
 assert.match(content,/c\.add\(FALLBACK\)/);
 assert.doesNotMatch(content,/caches\.open\(CACHE\).*cache\.put/);
});
