import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const worker=fs.readFileSync("public/sw.js","utf8");
const registration=fs.readFileSync("app/offline/OfflineRegistration.js","utf8");
const page=fs.readFileSync("app/offline/OfflineContent.js","utf8");
test("offline cache only preloads a public error shell",()=>{
 assert.match(worker,/c\.add\(FALLBACK\)/);
 assert.doesNotMatch(worker,/cache\.put\(|c\.addAll\(|caches\.open\([^)]*\)\.then\([^)]*addAll/);
 assert.match(worker,/const FALLBACK="\/offline"/);
});
test("service worker does not intercept authenticated or API requests",()=>{
 assert.match(worker,/req\.mode!=="navigate"/);
 assert.match(worker,/!PUBLIC_ROUTES\.has\(url\.pathname\)/);
 assert.match(worker,/\|\|url\.search/);
 assert.doesNotMatch(worker,/\/api|\/auth|\/profile|\/internal/);
});
test("registration waits for load and remains nonblocking",()=>{
 assert.match(registration,/serviceWorker\.register/);
 assert.match(registration,/addEventListener\("load"/);
 assert.match(registration,/\.catch\(\(\)=>\{\}\)/);
});
test("offline page offers recovery and explains privacy",()=>{
 assert.match(page,/t\.retry/);
 assert.match(page,/t\.offlineBody/);
});
