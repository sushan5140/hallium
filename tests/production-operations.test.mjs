import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("health workflow is manual and read-only",()=>{
 const s=fs.readFileSync(".github/workflows/verify-production-health.yml","utf8");
 assert.match(s,/workflow_dispatch:/);
 assert.match(s,/contents: read/);
 assert.match(s,/HALLIUM_BASE_URL: https:\/\/hallium\.vercel\.app/);
 assert.match(s,/node scripts\/check-production\.mjs/);
 assert.doesNotMatch(s,/secrets\.|repository_dispatch|schedule:|write-all/);
});
test("operations handbook rejects claims from merge alone",()=>{
 const s=fs.readFileSync("docs/operations/PRODUCTION_READINESS.md","utf8");
 assert.match(s,/does not guarantee deployment/);
 assert.match(s,/rollback/);
 assert.match(s,/auth/);
 assert.match(s,/RLS/);
});
