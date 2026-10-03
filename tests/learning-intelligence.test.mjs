import test from "node:test";
import assert from "node:assert/strict";
import {
  buildTodayLearningPlan,
  inferDifficulty,
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
