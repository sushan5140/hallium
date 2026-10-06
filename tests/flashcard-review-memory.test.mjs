import test from "node:test";
import assert from "node:assert/strict";
import {
  applyFlashcardAttempt,
  flashcardMistakeEvidence,
  flashcardRecoveryEvidence,
} from "../lib/flashcard-engine.js";

const NOW = new Date("2026-10-06T12:00:00Z");

test("a failed flashcard can enter Hallium's shared mistake-log shape", () => {
  const state = applyFlashcardAttempt({}, {
    correct:false,
    mode:"production",
    now:NOW,
  });
  const evidence = flashcardMistakeEvidence({
    cardId:"water",
    korean:"물",
    meaning:"Water",
    state,
  });

  assert.equal(evidence?.id, "flashcard:starter-unit-1:water");
  assert.equal(evidence?.skill, "Vocabulary recall");
  assert.equal(evidence?.source, "flashcards");
  assert.equal(evidence?.lastResult, "wrong");
  assert.equal(evidence?.nextReviewAt, state.nextReviewAt);
});

test("correct-only cards do not generate new mistake evidence", () => {
  const state = applyFlashcardAttempt({}, {
    correct:true,
    mode:"production",
    now:NOW,
  });
  assert.equal(flashcardMistakeEvidence({
    cardId:"water", korean:"물", meaning:"Water", state,
  }), null);
});

test("recovery evidence preserves the same stable flashcard identity", () => {
  const missed = applyFlashcardAttempt({}, { correct:false, mode:"production", now:NOW });
  const recovered = applyFlashcardAttempt(missed, {
    correct:true,
    mode:"production",
    now:new Date("2026-10-07T12:00:00Z"),
  });
  const evidence = flashcardRecoveryEvidence({
    cardId:"water",
    state:recovered,
  });

  assert.equal(evidence?.id, "flashcard:starter-unit-1:water");
  assert.equal(evidence?.lastResult, "correct");
  assert.equal(evidence?.source, "flashcards");
  assert.equal(evidence?.nextReviewAt, recovered.nextReviewAt);
});

test("review-memory adapters fail closed without a stable card id", () => {
  const missed = applyFlashcardAttempt({}, { correct:false, now:NOW });
  assert.equal(flashcardMistakeEvidence({ state:missed }), null);
  assert.equal(flashcardRecoveryEvidence({ state:{...missed,lastResult:"correct"} }), null);
});
