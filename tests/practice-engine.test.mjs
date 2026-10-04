import test from "node:test";
import assert from "node:assert/strict";
import { buildAdaptivePracticeSession } from "../lib/practice-engine.js";

const NOW = Date.parse("2026-10-04T01:00:00Z");

test("due weaknesses always occupy the front of the practice session", () => {
  const session = buildAdaptivePracticeSession({
    mistakes:[
      { id:"m1", skill:"Particles", prompt:"Choose the right particle", misses:3, lastResult:"wrong", nextReviewAt:"2026-10-03T01:00:00Z" },
      { id:"m2", skill:"Vocabulary", prompt:"Recall the word", misses:1, lastResult:"wrong", nextReviewAt:"2026-10-10T01:00:00Z" },
    ],
    preferences:{dailyMinutes:15,focuses:["conversation"],topics:["travel"]},
    latestStudyPct:90,
    now:NOW,
  });
  assert.equal(session.items[0].kind,"weakness_review");
  assert.equal(session.items[0].skill,"Particles");
  assert.equal(session.dueCount,1);
});

test("travel interest fills optional practice with travel scenarios", () => {
  const session = buildAdaptivePracticeSession({
    mistakes:[],
    preferences:{dailyMinutes:20,focuses:["conversation"],topics:["travel"]},
    latestStudyPct:84,
    now:NOW,
  });
  assert.equal(session.items[0].kind,"real_korean_scenario");
  assert.equal(session.items[0].sceneId,"travel");
  assert.equal(session.matchedScenes[0].id,"travel");
});

test("food interest routes authored cafe practice", () => {
  const session = buildAdaptivePracticeSession({
    preferences:{dailyMinutes:15,focuses:["conversation"],topics:["food"]},
    now:NOW,
  });
  assert.equal(session.items[0].sceneId,"cafe");
});

test("explicit empty interests use general authored practice rather than inventing a match", () => {
  const session = buildAdaptivePracticeSession({
    preferences:{dailyMinutes:15,focuses:["conversation"],topics:[]},
    now:NOW,
  });
  assert.deepEqual(session.matchedScenes,[]);
  assert.equal(session.items[0].kind,"real_korean_scenario");
  assert.equal(session.items[0].source,"hallium_authored");
});

test("session length is bounded and deterministic", () => {
  const input={
    mistakes:Array.from({length:12},(_,i)=>({
      id:"m"+i, skill:"Skill "+i, misses:2, lastResult:"wrong", nextReviewAt:"2026-10-03T01:00:00Z",
    })),
    preferences:{dailyMinutes:30,focuses:["grammar"],topics:["conversation"]},
    latestStudyPct:62,
    now:NOW,
    itemLimit:6,
  };
  const a=buildAdaptivePracticeSession(input);
  const b=buildAdaptivePracticeSession(input);
  assert.equal(a.items.length,6);
  assert.deepEqual(a,b);
  assert.equal(a.difficulty,"reinforce");
});

test("practice items expose provenance instead of pretending AI generated them", () => {
  const session=buildAdaptivePracticeSession({
    mistakes:[{id:"due",skill:"Grammar",misses:2,lastResult:"wrong",nextReviewAt:"2026-10-01T01:00:00Z"}],
    preferences:{dailyMinutes:15,focuses:["conversation"],topics:["daily_life"]},
    now:NOW,
  });
  assert.equal(session.items[0].source,"learner_evidence");
  assert.ok(session.items.some((item)=>item.source==="hallium_authored"));
  assert.equal(session.source,"hallium_practice_engine");
});
