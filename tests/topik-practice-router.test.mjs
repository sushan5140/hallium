import test from "node:test";
import assert from "node:assert/strict";
import {routeTopikWeakness,buildTopikPracticeQueue} from "../lib/topik/practice-router.js";

test("TOPIK I ordering weakness routes into the existing sequence lesson",()=>{
  const route=routeTopikWeakness({skillId:"reading_order",skillLabel:"Sentence / paragraph ordering",reason:"x"},"I");
  assert.equal(route.kind,"companion");
  assert.equal(route.unitId,"i11");
  assert.match(route.href,/topik-companion\?unit=i11/);
});

test("TOPIK II writing sentence weakness routes to writing 51-52 lesson",()=>{
  const route=routeTopikWeakness({skillId:"writing_sentence",skillLabel:"Sentence completion"},"II");
  assert.equal(route.unitId,"ii09");
});

test("TOPIK II essay weakness routes to argument-writing lesson",()=>{
  const route=routeTopikWeakness({skillId:"writing_essay",skillLabel:"Essay writing"},"II");
  assert.equal(route.unitId,"ii10");
});

test("unknown skill falls back to focused mock practice",()=>{
  const route=routeTopikWeakness({skillId:"unknown",skillLabel:"Unknown",section:"reading"},"I");
  assert.equal(route.kind,"mock");
  assert.match(route.href,/focus=reading/);
});

test("practice queue preserves diagnosis priority and limits items",()=>{
  const queue=buildTopikPracticeQueue({ranked:[
    {skillId:"reading_inference",skillLabel:"Inference",actionable:true},
    {skillId:"reading_order",skillLabel:"Ordering",actionable:true},
    {skillId:"reading_blank",skillLabel:"Blank",actionable:true},
    {skillId:"reading_detail",skillLabel:"Detail",actionable:true},
  ]},"I",3);
  assert.equal(queue.length,3);
  assert.equal(queue[0].priority,1);
  assert.equal(queue[0].weakness.skillId,"reading_inference");
});
