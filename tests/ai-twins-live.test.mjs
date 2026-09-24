import {test} from "node:test";
import assert from "node:assert/strict";
import { pairFor, publicTwin, guidedPlan, validatePlan, UUID_RE } from "../lib/ai-twins/live.mjs";

const a={user_id:"a",enabled:true,twin_name:"Alex",intro:"I like grammar",interests:"K-drama",tone:"playful"};
const p={user_id:"a",discoverable:true,level:"beginner",strength:"vocabulary",growth_area:"grammar",availability:"Evening"};
const b={user_id:"b",enabled:true,twin_name:"Minji",intro:"I love words",interests:"TOPIK",tone:"friendly"};
const q={user_id:"b",discoverable:true,level:"beginner",strength:"grammar",growth_area:"vocabulary",availability:"Evening"};

test("canonical pair prevents reversed duplicates",()=>{
  assert.deepEqual(pairFor("a","b"),{low:"a",high:"b"});
  assert.deepEqual(pairFor("b","a"),{low:"a",high:"b"});
});
test("no public twin without consent and discovery",()=>{
  assert.equal(publicTwin({...a,enabled:false},p),null);
  assert.equal(publicTwin(a,{...p,discoverable:false}),null);
  assert.equal(publicTwin(a,{...p,user_id:"other"}),null);
});
test("public twin shares only allowed summary fields",()=>{
  assert.deepEqual(Object.keys(publicTwin({...a,private_notes:"secret",email:"hidden@example.com"},p)).sort(),
    ["id","name","intro","interests","tone","level","gives","needs","availability"].sort());
  assert.ok(!JSON.stringify(publicTwin(a,p)).includes("email"));
});
test("plan rejects malformed model output",()=>{
  assert.equal(validatePlan({title:"Bad",summary:"Wrong",steps:["one"],opener:"Hi"}),null);
  assert.equal(validatePlan({title:"Bad",summary:"Wrong",steps:["one","two",""],opener:"Hi"}),null);
  assert.equal(validatePlan({title:"Bad",summary:"Wrong",steps:["one","two","three"],opener:""}),null);
});
test("guided fallback names both learners and explicitly marks source",()=>{
  const plan=guidedPlan(publicTwin(a,p),publicTwin(b,q));
  assert.equal(plan.steps.length,3);
  assert.equal(plan.source,"guided");
  assert.ok(plan.summary.includes("Alex")&&plan.summary.includes("Minji"));
});
test("UUID validation checks full canonical UUID",()=>{
  assert.equal(UUID_RE.test("00000000-0000-0000-0000-000000000000"),true);
  assert.equal(UUID_RE.test("banana"),false);
});
