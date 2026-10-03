import test from "node:test";
import assert from "node:assert/strict";
import {
  buildTodayLearningPlan,
  enforceLearningPlanSafety,
  fitPlanToSession,
  inferDifficulty,
  normalizeLearningPreferences,
  rankWeakSkills,
  reviewUrgency,
} from "../lib/learning-intelligence.js";

const NOW = Date.parse("2026-10-03T12:00:00Z");

test("overdue unresolved mistakes receive more urgency than recovered future items", () => {
  const overdue = reviewUrgency({
    misses: 3,
    successfulReviews: 0,
    lastResult: "wrong",
    lastSeenAt: "2026-10-01T12:00:00Z",
    nextReviewAt: "2026-10-02T12:00:00Z",
  }, NOW);

  const recovered = reviewUrgency({
    misses: 1,
    successfulReviews: 2,
    lastResult: "correct",
    lastSeenAt: "2026-10-02T12:00:00Z",
    nextReviewAt: "2026-10-10T12:00:00Z",
  }, NOW);

  assert.ok(overdue > recovered);
});

test("weak skills rank by accumulated urgency instead of raw item count alone", () => {
  const ranked = rankWeakSkills([
    { skill:"Particles", misses:3, lastResult:"wrong", nextReviewAt:"2026-10-02T12:00:00Z" },
    { skill:"Particles", misses:2, lastResult:"wrong", nextReviewAt:"2026-10-03T11:00:00Z" },
    { skill:"Vocabulary", misses:1, successfulReviews:2, lastResult:"correct", nextReviewAt:"2026-10-10T12:00:00Z" },
    { skill:"Vocabulary", misses:1, successfulReviews:2, lastResult:"correct", nextReviewAt:"2026-10-10T12:00:00Z" },
    { skill:"Vocabulary", misses:1, successfulReviews:2, lastResult:"correct", nextReviewAt:"2026-10-10T12:00:00Z" },
  ], NOW);

  assert.equal(ranked[0].skill,"Particles");
  assert.ok(ranked[0].score > ranked[1].score);
});

test("due weaknesses always become today's first action", () => {
  const plan = buildTodayLearningPlan({
    mistakes:[
      { skill:"Particles", misses:2, lastResult:"wrong", nextReviewAt:"2026-10-03T10:00:00Z" },
    ],
    latestStudyPct:92,
    completedPathCount:10,
    totalPathLessons:15,
    nextLessonTitle:"Ordering at a café",
    now:NOW,
  });

  assert.equal(plan.steps[0].kind,"review_queue");
  assert.equal(plan.focus,"Particles");
  assert.equal(plan.dueCount,1);
});

test("no structured result produces a baseline-building route", () => {
  const plan=buildTodayLearningPlan({
    mistakes:[],
    latestStudyPct:null,
    activeStudyLabel:"Beginner",
    nextLessonTitle:"Greetings",
    preferences:{dailyMinutes:30,focuses:["conversation"]},
    now:NOW,
  });

  assert.equal(plan.steps[0].kind,"vocab");
  assert.equal(plan.steps[2].kind,"test");
  assert.match(plan.headline,/baseline/i);
});

test("high score with no due weakness can stretch", () => {
  const plan=buildTodayLearningPlan({
    mistakes:[],
    latestStudyPct:94,
    completedPathCount:8,
    totalPathLessons:10,
    nextLessonTitle:"Making plans",
    now:NOW,
  });

  assert.equal(plan.difficulty,"stretch");
  assert.equal(plan.steps[0].kind,"companion");
  assert.match(plan.headline,/stretch/i);
});

test("low score or heavy weakness load reinforces", () => {
  assert.equal(inferDifficulty({latestStudyPct:61,dueCount:0}),"reinforce");
  assert.equal(inferDifficulty({latestStudyPct:90,dueCount:4}),"reinforce");
  assert.equal(inferDifficulty({latestStudyPct:91,dueCount:0,topWeakness:{score:4}}),"stretch");
});


test("learning preferences clamp time and discard unsupported focus values", () => {
  assert.deepEqual(
    normalizeLearningPreferences({ dailyMinutes: 2, focuses:["grammar","unknown","grammar"] }),
    { dailyMinutes:5, focuses:["grammar"] }
  );
  assert.deepEqual(
    normalizeLearningPreferences({ dailyMinutes:120, focuses:[] }),
    { dailyMinutes:60, focuses:["conversation"] }
  );
});

test("short sessions keep at least one useful action and annotate minutes", () => {
  const plan=fitPlanToSession({
    headline:"Turn recognition into usable Korean",
    dueCount:0,
    steps:[
      {kind:"companion",title:"Context",priority:86},
      {kind:"adaptive_review",title:"Review",priority:80},
      {kind:"test",title:"Test",priority:72},
    ],
  },{dailyMinutes:5,focuses:["conversation"]});

  assert.equal(plan.steps.length,1);
  assert.equal(plan.steps[0].kind,"companion");
  assert.equal(plan.steps[0].minutes,10);
  assert.equal(plan.sessionMinutes,5);
});

test("focus preference can reorder optional actions", () => {
  const plan=fitPlanToSession({
    headline:"Keep moving",
    dueCount:0,
    steps:[
      {kind:"companion",title:"Context",priority:70},
      {kind:"grammar",title:"Grammar",priority:69},
      {kind:"test",title:"Test",priority:68},
    ],
  },{dailyMinutes:30,focuses:["grammar"]});

  assert.equal(plan.steps[0].kind,"grammar");
});

test("due review remains first even when another focus is strongly preferred", () => {
  const plan=fitPlanToSession({
    headline:"2 weaknesses are due now",
    dueCount:2,
    steps:[
      {kind:"review_queue",title:"Review due",priority:100},
      {kind:"companion",title:"Conversation",priority:82},
      {kind:"grammar",title:"Grammar",priority:80},
    ],
  },{dailyMinutes:30,focuses:["conversation"]});

  assert.equal(plan.steps[0].kind,"review_queue");
});

test("buildTodayLearningPlan applies session preferences", () => {
  const plan=buildTodayLearningPlan({
    mistakes:[],
    latestStudyPct:92,
    completedPathCount:5,
    totalPathLessons:10,
    nextLessonTitle:"Plans",
    preferences:{dailyMinutes:10,focuses:["assessment"]},
    now:NOW,
  });

  assert.equal(plan.sessionMinutes,10);
  assert.ok(plan.steps.length>=1);
  assert.ok(plan.steps.every((step)=>Number.isFinite(step.minutes)));
});


test("AI route cannot displace a required due review", () => {
  const fallback = {
    dueCount: 2,
    difficulty: "reinforce",
    rankedWeaknesses: [{ skill:"Particles", score:14 }],
    steps:[
      { kind:"review_queue", title:"Review 2 due weaknesses", why:"Due now", priority:100 },
      { kind:"adaptive_review", title:"Transfer Particles", why:"Fresh practice", priority:82 },
    ],
  };

  const aiRoute = {
    headline:"Use Korean in context",
    focus:"Conversation",
    reason:"AI prefers context",
    steps:[
      { kind:"companion", title:"Continue lesson", why:"Context" },
      { kind:"test", title:"Take a test", why:"Reassess" },
    ],
  };

  const safe=enforceLearningPlanSafety(aiRoute,fallback);
  assert.equal(safe.dueCount,2);
  assert.equal(safe.steps[0].kind,"review_queue");
  assert.equal(safe.rankedWeaknesses[0].skill,"Particles");
});


test("AI route safety restores due review before optional AI steps", async () => {
  const { enforceLearningPlanSafety } = await import("../lib/learning-intelligence.js");
  const fallback = {
    headline:"One weakness is due now",
    dueCount:1,
    difficulty:"reinforce",
    rankedWeaknesses:[{skill:"Particles",score:12}],
    steps:[
      {kind:"review_queue",title:"Review due weakness",priority:100},
      {kind:"adaptive_review",title:"Transfer Particles",priority:82},
    ],
  };
  const ai = {
    headline:"Try something new",
    steps:[
      {kind:"companion",title:"Conversation",priority:95},
      {kind:"test",title:"Challenge",priority:90},
    ],
  };
  const safe = enforceLearningPlanSafety(ai,fallback);
  assert.equal(safe.steps[0].kind,"review_queue");
  assert.equal(safe.dueCount,1);
});

test("session fitting never drops a required due-review first action", async () => {
  const { enforceLearningPlanSafety } = await import("../lib/learning-intelligence.js");
  const fallback={
    headline:"2 weaknesses are due now",
    dueCount:2,
    steps:[
      {kind:"review_queue",title:"Review due",priority:100},
      {kind:"adaptive_review",title:"Transfer",priority:82},
    ],
  };
  const safe=enforceLearningPlanSafety({
    headline:"AI route",
    steps:[{kind:"grammar",title:"Grammar",priority:99}],
  },fallback);
  const fitted=fitPlanToSession(safe,{dailyMinutes:5,focuses:["grammar"]});
  assert.equal(fitted.steps[0].kind,"review_queue");
  assert.equal(fitted.steps[0].minutes,6);
});
