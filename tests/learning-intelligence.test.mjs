import test from "node:test";
import assert from "node:assert/strict";
import {
  adaptiveReviewSchedule,
  applyDailyLearningProgress,
  buildDeterministicStudyPlan,
  buildTodayLearningPlan,
  enforceLearningPlanSafety,
  fitPlanToSession,
  inferDifficulty,
  markDailyLearningAction,
  normalizeDailyLearningSession,
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


test("repeated misses stay on a one-day relearn interval", () => {
  const schedule=adaptiveReviewSchedule({
    correct:false,
    misses:5,
    successfulReviews:0,
    urgency:18,
    previousResult:"wrong",
  });
  assert.equal(schedule.intervalDays,1);
  assert.equal(schedule.stage,"relearn");
  assert.equal(schedule.stability,0);
});

test("fragile first recovery can remain close when miss history is heavy", () => {
  const schedule=adaptiveReviewSchedule({
    correct:true,
    misses:5,
    successfulReviews:1,
    urgency:18,
    previousResult:"wrong",
  });
  assert.ok(schedule.intervalDays>=1 && schedule.intervalDays<=3);
  assert.equal(schedule.stage,"recovering");
});

test("clean repeated recovery expands review spacing", () => {
  const first=adaptiveReviewSchedule({
    correct:true, misses:1, successfulReviews:1, urgency:2, previousResult:"wrong",
  });
  const stronger=adaptiveReviewSchedule({
    correct:true, misses:1, successfulReviews:3, urgency:2, previousResult:"correct",
  });
  assert.ok(stronger.intervalDays>first.intervalDays);
  assert.ok(stronger.stability>first.stability);
  assert.equal(stronger.stage,"strengthening");
});

test("higher urgency shortens the next successful-review interval", () => {
  const low=adaptiveReviewSchedule({
    correct:true, misses:2, successfulReviews:3, urgency:2, previousResult:"correct",
  });
  const high=adaptiveReviewSchedule({
    correct:true, misses:2, successfulReviews:3, urgency:20, previousResult:"correct",
  });
  assert.ok(high.intervalDays<low.intervalDays);
});

test("adaptive review intervals never exceed sixty days", () => {
  const schedule=adaptiveReviewSchedule({
    correct:true,
    misses:1,
    successfulReviews:99,
    urgency:0,
    previousResult:"correct",
  });
  assert.equal(schedule.intervalDays,60);
  assert.equal(schedule.stage,"stable");
});


test("deterministic weekly plan puts currently due review on day one", () => {
  const plan=buildDeterministicStudyPlan({
    mistakes:[
      { id:"m1", skill:"Particles", nextReviewAt:"2026-10-03T10:00:00Z" },
      { id:"m2", skill:"Vocabulary", nextReviewAt:"2026-10-05T10:00:00Z" },
    ],
    preferences:{dailyMinutes:20,focuses:["conversation","grammar"]},
    latestStudyPct:82,
    activeStudyLabel:"Beginner",
    nextLessonTitle:"Ordering at a café",
    now:NOW,
  });

  assert.equal(plan.days.length,5);
  assert.equal(plan.days[0].minutes,20);
  assert.match(plan.days[0].tasks[0],/Review 1 scheduled weakness/);
  assert.match(plan.days[0].tasks.join(" "),/Particles/);
});

test("weekly plan rotates saved focus priorities", () => {
  const plan=buildDeterministicStudyPlan({
    mistakes:[],
    preferences:{dailyMinutes:15,focuses:["grammar","assessment"]},
    latestStudyPct:88,
    activeStudyLabel:"Foundation",
    nextLessonTitle:"Making plans",
    now:NOW,
  });

  assert.equal(plan.days[0].focus,"grammar");
  assert.equal(plan.days[1].focus,"assessment");
  assert.equal(plan.days[2].focus,"grammar");
  assert.ok(plan.days[0].tasks.some((task)=>/grammar pattern/i.test(task)));
  assert.ok(plan.days[1].tasks.some((task)=>/study check/i.test(task)));
});

test("weekly plan creates a measurable baseline when no test exists", () => {
  const plan=buildDeterministicStudyPlan({
    mistakes:[],
    preferences:{dailyMinutes:10,focuses:["vocabulary"]},
    latestStudyPct:null,
    activeStudyLabel:"Starter",
    nextLessonTitle:"Greetings",
    now:NOW,
  });

  assert.ok(plan.days[0].tasks.some((task)=>/study test/i.test(task)));
  assert.equal(plan.generatedFrom.latestStudyPct,null);
});

test("weekly plan is stable for the same learner snapshot", () => {
  const input={
    mistakes:[{ id:"same", skill:"Grammar", nextReviewAt:"2026-10-04T12:00:00Z" }],
    preferences:{dailyMinutes:30,focuses:["listening","conversation"]},
    latestStudyPct:74,
    activeStudyLabel:"Foundation",
    nextLessonTitle:"Daily routines",
    now:NOW,
  };
  assert.deepEqual(buildDeterministicStudyPlan(input),buildDeterministicStudyPlan(input));
});

test("weekly plan day count is bounded to five through seven", () => {
  const short=buildDeterministicStudyPlan({days:2,now:NOW});
  const long=buildDeterministicStudyPlan({days:30,now:NOW});
  assert.equal(short.days.length,5);
  assert.equal(long.days.length,7);
});


test("daily learning session resets on a new date", () => {
  const oldSession={
    date:"2026-10-02",
    startedKinds:["companion"],
    completedKinds:["companion"],
    updatedAt:"2026-10-02T12:00:00Z",
  };
  const current=normalizeDailyLearningSession(oldSession,NOW);
  assert.equal(current.date,"2026-10-03");
  assert.deepEqual(current.startedKinds,[]);
  assert.deepEqual(current.completedKinds,[]);
});

test("marking daily actions deduplicates started and completed kinds", () => {
  let session=markDailyLearningAction(null,"companion","started",NOW);
  session=markDailyLearningAction(session,"companion","started",NOW);
  session=markDailyLearningAction(session,"companion","completed",NOW);
  assert.deepEqual(session.startedKinds,["companion"]);
  assert.deepEqual(session.completedKinds,["companion"]);
});

test("completed recommendations disappear from today's route", () => {
  const plan={
    headline:"Keep moving",
    dueCount:0,
    steps:[
      {kind:"companion",title:"Lesson"},
      {kind:"test",title:"Test"},
    ],
  };
  const session={
    date:"2026-10-03",
    startedKinds:["companion"],
    completedKinds:["companion"],
    updatedAt:"2026-10-03T10:00:00Z",
  };
  const next=applyDailyLearningProgress(plan,session,NOW);
  assert.deepEqual(next.steps.map((s)=>s.kind),["test"]);
});

test("started optional actions move behind unstarted optional work", () => {
  const plan={
    headline:"Keep moving",
    dueCount:0,
    steps:[
      {kind:"companion",title:"Lesson"},
      {kind:"adaptive_review",title:"Review"},
      {kind:"test",title:"Test"},
    ],
  };
  const session={
    date:"2026-10-03",
    startedKinds:["companion"],
    completedKinds:[],
    updatedAt:"2026-10-03T10:00:00Z",
  };
  const next=applyDailyLearningProgress(plan,session,NOW);
  assert.deepEqual(next.steps.map((s)=>s.kind),["adaptive_review","test","companion"]);
});

test("unfinished due review stays first even after it has been started", () => {
  const plan={
    headline:"Weakness due",
    dueCount:2,
    steps:[
      {kind:"review_queue",title:"Review due"},
      {kind:"companion",title:"Lesson"},
      {kind:"test",title:"Test"},
    ],
  };
  const session={
    date:"2026-10-03",
    startedKinds:["review_queue"],
    completedKinds:[],
    updatedAt:"2026-10-03T10:00:00Z",
  };
  const next=applyDailyLearningProgress(plan,session,NOW);
  assert.equal(next.steps[0].kind,"review_queue");
});

test("finishing every recommendation marks today's plan complete", () => {
  const plan={
    headline:"Keep moving",
    dueCount:0,
    steps:[
      {kind:"companion",title:"Lesson"},
      {kind:"test",title:"Test"},
    ],
  };
  const session={
    date:"2026-10-03",
    startedKinds:["companion","test"],
    completedKinds:["companion","test"],
    updatedAt:"2026-10-03T10:00:00Z",
  };
  const next=applyDailyLearningProgress(plan,session,NOW);
  assert.equal(next.completedToday,true);
  assert.equal(next.steps.length,0);
  assert.match(next.headline,/complete/i);
});
