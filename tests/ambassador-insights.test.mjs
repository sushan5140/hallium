import {test} from "node:test";
import assert from "node:assert/strict";
import {referralFunnel,pilotNextAction,validReferralCode} from "../lib/ambassador-insights.mjs";
import fs from "node:fs";
test("referral conversion uses real denominators, never divides by zero",()=>{
 const r=referralFunnel({visits:20,signups:5,activated:2,tested:1});
 assert.equal(r.conversion.visitToSignup,25);
 assert.equal(r.conversion.signupToActivated,40);
 assert.equal(referralFunnel().conversion.visitToSignup,null);
 assert.equal(referralFunnel({visits:-2}).visits,0);
});
test("pilot stages preserve consent and manual review",()=>{
 assert.match(pilotNextAction({stage:"testing"}).note,/before approval/);
 assert.match(pilotNextAction({stage:"declined"}).note,/Respect/);
 assert.match(pilotNextAction({stage:"paused"}).note,/Confirm permission/);
});
test("referral code validation is bounded and safe",()=>{
 assert.equal(validReferralCode("abc_123"),true);
 assert.equal(validReferralCode("a"),false);
 assert.equal(validReferralCode("https://example.com"),false);
 assert.equal(validReferralCode("x".repeat(49)),false);
});
test("admin stays behind existing auth allowlist and privileged RPC",()=>{
 const s=fs.readFileSync("app/internal/ambassadors/page.js","utf8");
 assert.match(s,/is_hallim_admin/);
 assert.match(s,/admin_approve_pilot/);
 assert.match(s,/admin_pause_pilot/);
 assert.match(s,/pilot.stage==="active"/);
 assert.match(s,/copyReferral/);
});
