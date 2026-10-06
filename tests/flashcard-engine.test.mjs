import test from "node:test";
import assert from "node:assert/strict";
import {
  FLASHCARD_STAGES,
  applyFlashcardAttempt,
  flashcardIsDue,
  normalizeFlashcardState,
  summarizeFlashcardDeck,
} from "../lib/flashcard-engine.js";

const NOW = new Date("2026-10-06T12:00:00Z");

test("a first miss enters learning and returns tomorrow", () => {
  const next = applyFlashcardAttempt({}, { correct:false, now:NOW });
  assert.equal(next.stage, FLASHCARD_STAGES.learning);
  assert.equal(next.misses, 1);
  assert.equal(next.intervalDays, 1);
  assert.equal(next.lastResult, "wrong");
});

test("recovery after a miss is tracked separately from a clean streak", () => {
  const missed = applyFlashcardAttempt({}, { correct:false, now:NOW });
  const recovered = applyFlashcardAttempt(missed, {
    correct:true,
    now:new Date("2026-10-07T12:00:00Z"),
  });
  assert.equal(recovered.recoveries, 1);
  assert.equal(recovered.stage, FLASHCARD_STAGES.recovering);
  assert.equal(recovered.lastResult, "correct");
});

test("repeated clean recall can promote a card to strong", () => {
  let state = normalizeFlashcardState({});
  for (let i = 0; i < 7; i += 1) {
    state = applyFlashcardAttempt(state, {
      correct:true,
      now:new Date(NOW.getTime() + i * 3 * 86400000),
    });
  }
  assert.equal(state.stage, FLASHCARD_STAGES.strong);
  assert.ok(state.stability >= 70);
  assert.ok(state.intervalDays >= 2);
});

test("a miss resets the recall streak and shortens review", () => {
  let state = {
    stage:"strong",
    attempts:8,
    correct:8,
    misses:0,
    recoveries:2,
    streak:5,
    stability:88,
    lastResult:"correct",
  };
  state = applyFlashcardAttempt(state, { correct:false, now:NOW });
  assert.equal(state.streak, 0);
  assert.equal(state.stage, FLASHCARD_STAGES.learning);
  assert.equal(state.intervalDays, 1);
  assert.ok(state.stability < 88);
});

test("due logic is deterministic", () => {
  const state = {
    stage:"learning",
    nextReviewAt:"2026-10-05T12:00:00Z",
  };
  assert.equal(flashcardIsDue(state, NOW.getTime()), true);
  assert.equal(flashcardIsDue(state, new Date("2026-10-04T12:00:00Z").getTime()), false);
});

test("deck summary exposes mastery and due counts", () => {
  const summary = summarizeFlashcardDeck({
    a:{stage:"learning",attempts:1,stability:20,nextReviewAt:"2026-10-05T12:00:00Z"},
    b:{stage:"strong",attempts:5,stability:90,nextReviewAt:"2026-10-20T12:00:00Z"},
    c:{stage:"new",attempts:0,stability:0},
  }, NOW.getTime());
  assert.equal(summary.total, 3);
  assert.equal(summary.learning, 1);
  assert.equal(summary.strong, 1);
  assert.equal(summary.new, 1);
  assert.equal(summary.due, 1);
  assert.equal(summary.reviewed, 2);
});
