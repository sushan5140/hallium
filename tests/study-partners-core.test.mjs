import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateMatch, buildPractice, pairKey } from "../lib/study-partners/demo.mjs";

const susan = { id:"susan",ready:true,level:"Beginner",availability:"Evenings · IST",skills:{vocabulary:86,grammar:48,listening:67} };
const mina = { id:"mina",ready:true,level:"Beginner",availability:"Evenings · IST",skills:{vocabulary:52,grammar:89,listening:70} };
const jiho = { id:"jiho",ready:true,level:"Elementary",availability:"Weekends · KST",skills:{vocabulary:76,grammar:74,listening:83} };

test("matching finds two-way complementary skill categories",()=>{
  const fit = calculateMatch(susan,mina);
  assert.equal(fit.helpThem.skill,"vocabulary");
  assert.equal(fit.helpMe.skill,"grammar");
  assert.equal(fit.strong,true);
  assert.equal(fit.overlap,true);
  assert.ok(fit.score > calculateMatch(susan,jiho).score);
});
test("no automatic suggestion when discovery is disabled",()=>{
  assert.equal(calculateMatch(susan,{...mina,ready:false}),null);
  assert.equal(calculateMatch({...susan,ready:false},mina),null);
});
test("same-strength peers do not falsely receive a two-way-complement label",()=>{
  const fit=calculateMatch(susan,{...mina,skills:{vocabulary:83,grammar:47,listening:65}});
  assert.equal(fit.strong,false);
  assert.ok(fit.score<=100&&fit.score>=0);
});
test("pair identity is stable across participant order",()=>{
  assert.equal(pairKey("mina","susan"),pairKey("susan","mina"));
});
test("practice rounds only use explicitly supplied notes",()=>{
  const words=[{id:"word1",title:"학교",meaning:"school",example:"학교에 가요."}];
  const grammar=[{id:"grammar1",title:"에서",meaning:"place where action occurs",example:"학교에서 공부해요."}];
  const result=buildPractice(words,grammar,pairKey("susan","mina"));
  assert.deepEqual(result.wordIds,["word1"]);
  assert.deepEqual(result.grammarIds,["grammar1"]);
  assert.deepEqual(result.rounds.map(x=>x.kind),["vocabulary","grammar","together"]);
  assert.ok(result.rounds[0].prompt.includes("학교"));
  assert.ok(result.rounds[1].prompt.includes("에서"));
  assert.ok(result.rounds[2].prompt.includes("학교")&&result.rounds[2].prompt.includes("에서"));
  assert.equal(result.provider,"guided-demo");
});
test("no private fallback vocabulary or grammar when sharing is empty",()=>{
  assert.throws(()=>buildPractice([], [{id:"g",title:"에"}],"a::b"),/shared vocabulary and grammar/);
  assert.throws(()=>buildPractice([{id:"w",title:"학교"}],[],"a::b"),/shared vocabulary and grammar/);
});
