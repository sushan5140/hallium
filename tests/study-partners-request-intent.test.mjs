import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {buildRequestContext,firstSessionPlan} from "../lib/study-partners/core.mjs";

test("request context contains only structured study intent",()=>{
 const profile={availability:"Evenings",growth_area:"grammar",diagnostic:{partner_preferences:{goals:["topik"],practiceNeeds:["reading"],cadence:"regular"}}};
 const partner={diagnostic:{partner_preferences:{goals:["topik"],practiceNeeds:["reading"]}}};
 const context=buildRequestContext(profile,partner,{sharedGoals:["topik"],sharedNeeds:["reading"],helpsWith:"vocabulary",gainsHelp:"grammar",score:88});
 assert.deepEqual(context,{goal:"topik",practiceNeed:"reading",cadence:"regular",availability:"Evenings",helpsWith:"vocabulary",gainsHelp:"grammar",fitScore:88});
 assert.equal("message" in context,false);
 assert.equal("note" in context,false);
});

test("first session plan stays grounded in accepted request context",()=>{
 const plan=firstSessionPlan({goal:"topik",practiceNeed:"reading",cadence:"regular",helpsWith:"vocabulary",gainsHelp:"grammar"});
 assert.equal(plan.goal,"topik");
 assert.equal(plan.practiceNeed,"reading");
 assert.equal(plan.cadence,"regular");
 assert.ok(plan.steps.some(x=>x.includes("TOPIK")));
 assert.ok(plan.steps.some(x=>x.includes("reading")));
});

test("migration stores request context on the connection and upgrades the RPC",()=>{
 const sql=fs.readFileSync("supabase/migrations/20261008000100_partner_request_context.sql","utf8");
 assert.match(sql,/request_context jsonb/);
 assert.match(sql,/p_context jsonb default/);
 assert.match(sql,/drop function if exists public\.hallium_partner_request\(uuid\)/);
 assert.match(sql,/jsonb_build_object/);
});

test("Study Partners sends structured context instead of pre-consent free-form text",()=>{
 const ui=fs.readFileSync("app/study-partners/PartnerStudio.jsx","utf8");
 assert.match(ui,/buildRequestContext/);
 assert.match(ui,/p_context:context/);
 assert.match(ui,/firstSessionPlan/);
});
