import {test} from "node:test";
import assert from "node:assert/strict";
import {activitySignal,fit} from "../lib/study-partners/core.mjs";

test("profile freshness is a coarse recent signal only",()=>{
 const recent=activitySignal({updated_at:"2026-10-01T00:00:00Z"},new Date("2026-10-08T00:00:00Z"));
 const stale=activitySignal({updated_at:"2026-01-01T00:00:00Z"},new Date("2026-10-08T00:00:00Z"));
 assert.equal(recent.status,"recent");
 assert.equal(stale.status,"stale");
});

test("cadence and freshness add only a small bounded bonus",()=>{
 const a={user_id:"a",discoverable:true,level:"beginner",availability:"Evenings",strength:"vocabulary",growth_area:"grammar",diagnostic:{partner_preferences:{cadence:"regular"}}};
 const b={user_id:"b",discoverable:true,level:"beginner",availability:"Evenings",strength:"grammar",growth_area:"vocabulary",updated_at:"2026-10-07T00:00:00Z",diagnostic:{partner_preferences:{cadence:"regular"}}};
 const m=fit(a,b);
 assert.equal(m.cadenceMatch,true);
 assert.equal(m.activityStatus,"recent");
 assert.ok(m.score<=100);
});

test("activity never bypasses opt-in discovery",()=>{
 const a={user_id:"a",discoverable:true,level:"beginner",availability:"Evenings",strength:"vocabulary",growth_area:"grammar",diagnostic:{}};
 const b={user_id:"b",discoverable:false,level:"beginner",availability:"Evenings",strength:"grammar",growth_area:"vocabulary",updated_at:new Date().toISOString(),diagnostic:{}};
 assert.equal(fit(a,b),null);
});
