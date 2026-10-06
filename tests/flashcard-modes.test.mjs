import test from "node:test";
import assert from "node:assert/strict";
import {
  FLASHCARD_MODES,
  applyFlashcardAttempt,
  weakestFlashcardMode,
} from "../lib/flashcard-engine.js";

const NOW = new Date("2026-10-06T12:00:00Z");

test("production recall contributes more stability than recognition", () => {
  const recognition = applyFlashcardAttempt({}, {
    correct:true,
    mode:FLASHCARD_MODES.recognition,
    now:NOW,
  });
  const production = applyFlashcardAttempt({}, {
    correct:true,
    mode:FLASHCARD_MODES.production,
    now:NOW,
  });

  assert.ok(production.stability > recognition.stability);
});

test("revealing before answering reduces evidence strength", () => {
  const clean = applyFlashcardAttempt({}, {
    correct:true,
    mode:FLASHCARD_MODES.sentence,
    now:NOW,
  });
  const revealed = applyFlashcardAttempt({}, {
    correct:true,
    mode:FLASHCARD_MODES.sentence,
    revealedBeforeAnswer:true,
    now:NOW,
  });

  assert.ok(revealed.stability < clean.stability);
});

test("hints reduce stability but do not turn a correct answer into a miss", () => {
  const result = applyFlashcardAttempt({}, {
    correct:true,
    mode:FLASHCARD_MODES.listening,
    hintsUsed:2,
    now:NOW,
  });

  assert.equal(result.lastResult, "correct");
  assert.equal(result.misses, 0);
  assert.equal(result.hintsUsed, 2);
  assert.ok(result.stability > 0);
});

test("mode evidence remains independent across recall surfaces", () => {
  let state = applyFlashcardAttempt({}, {
    correct:true,
    mode:FLASHCARD_MODES.recognition,
    now:NOW,
  });
  state = applyFlashcardAttempt(state, {
    correct:false,
    mode:FLASHCARD_MODES.listening,
    now:new Date("2026-10-07T12:00:00Z"),
  });

  assert.equal(state.modeEvidence.recognition.attempts, 1);
  assert.equal(state.modeEvidence.recognition.correct, 1);
  assert.equal(state.modeEvidence.listening.attempts, 1);
  assert.equal(state.modeEvidence.listening.correct, 0);
});

test("weakest mode identifies the lowest demonstrated accuracy", () => {
  let state = {};
  state = applyFlashcardAttempt(state, { correct:true, mode:"recognition", now:NOW });
  state = applyFlashcardAttempt(state, { correct:true, mode:"production", now:new Date("2026-10-07T12:00:00Z") });
  state = applyFlashcardAttempt(state, { correct:false, mode:"production", now:new Date("2026-10-08T12:00:00Z") });

  const weak = weakestFlashcardMode(state);
  assert.equal(weak?.mode, "production");
  assert.equal(weak?.attempts, 2);
  assert.equal(weak?.accuracy, 0.5);
});

test("unknown mode fails closed to recognition evidence", () => {
  const result = applyFlashcardAttempt({}, {
    correct:true,
    mode:"magic-ai-mode",
    now:NOW,
  });
  assert.equal(result.mode, FLASHCARD_MODES.recognition);
  assert.equal(result.modeEvidence.recognition.attempts, 1);
});
