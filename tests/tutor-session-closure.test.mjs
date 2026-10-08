import {test} from "node:test";
import assert from "node:assert/strict";
import {buildTutorSessionClosure} from "../lib/tutor-decision.js";

const snap={kind:"grammar",title:"Grammar repair",recommendedAt:"2026-10-01T00:00:00Z"};

test("closure waits when later evidence is insufficient",()=>{
 const c=buildTutorSessionClosure(snap,{status:"insufficient",samples:1,action:"wait"});
 assert.equal(c.status,"waiting");
 assert.equal(c.posture,"wait");
 assert.match(c.unresolved,/At least two later relevant attempts/);
});

test("maintain outcome becomes stay posture",()=>{
 const c=buildTutorSessionClosure(snap,{status:"evaluated",action:"maintain",samples:2,delta:12});
 assert.equal(c.posture,"stay");
 assert.match(c.changed,/\+12 pts/);
 assert.match(c.next,/Keep the same intervention/);
});

test("escalate outcome requests more support without calling the intervention a failure",()=>{
 const c=buildTutorSessionClosure(snap,{status:"evaluated",action:"escalate",samples:3,delta:-4});
 assert.equal(c.posture,"escalate");
 assert.match(c.next,/Escalate support/);
 assert.match(c.causalCaveat,/does not prove the intervention failed/);
});

test("repeat outcome stays explicitly inconclusive",()=>{
 const c=buildTutorSessionClosure(snap,{status:"evaluated",action:"repeat",samples:2,delta:1});
 assert.equal(c.posture,"repeat");
 assert.match(c.unresolved,/too flat/);
 assert.match(c.causalCaveat,/inconclusive/);
});

test("switch outcome closes the old intervention and moves on",()=>{
 const c=buildTutorSessionClosure(snap,{status:"evaluated",action:"switch",samples:3,delta:22});
 assert.equal(c.status,"closed");
 assert.equal(c.posture,"move_on");
 assert.match(c.next,/Release this intervention/);
});

test("closure never claims causality",()=>{
 for(const action of ["maintain","escalate","repeat","switch"]){
  const c=buildTutorSessionClosure(snap,{status:"evaluated",action,samples:2,delta:5});
  assert.match(c.causalCaveat,/does not claim|does not attribute causality|does not prove|avoids making a causal claim/i);
 }
});
