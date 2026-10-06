const DAY_MS = 24 * 60 * 60 * 1000;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const FLASHCARD_STAGES = Object.freeze({
  new: "new",
  learning: "learning",
  recovering: "recovering",
  strong: "strong",
});

export function normalizeFlashcardState(value = {}) {
  const stage = Object.values(FLASHCARD_STAGES).includes(value?.stage)
    ? value.stage
    : FLASHCARD_STAGES.new;

  return {
    stage,
    attempts: Math.max(0, Math.round(Number(value?.attempts || 0))),
    correct: Math.max(0, Math.round(Number(value?.correct || 0))),
    misses: Math.max(0, Math.round(Number(value?.misses || 0))),
    recoveries: Math.max(0, Math.round(Number(value?.recoveries || 0))),
    streak: Math.max(0, Math.round(Number(value?.streak || 0))),
    stability: clamp(Math.round(Number(value?.stability || 0)), 0, 100),
    lastResult: value?.lastResult === "correct" ? "correct" : value?.lastResult === "wrong" ? "wrong" : null,
    lastReviewedAt: typeof value?.lastReviewedAt === "string" ? value.lastReviewedAt : null,
    nextReviewAt: typeof value?.nextReviewAt === "string" ? value.nextReviewAt : null,
  };
}

function stageFor({ correct, misses, recoveries, streak, stability }) {
  if (!correct) return FLASHCARD_STAGES.learning;
  if (streak >= 3 && recoveries >= 2 && stability >= 70) return FLASHCARD_STAGES.strong;
  if (misses > 0) return FLASHCARD_STAGES.recovering;
  return FLASHCARD_STAGES.learning;
}

function intervalFor({ correct, stage, streak, stability, misses }) {
  if (!correct) return 1;
  if (stage === FLASHCARD_STAGES.strong) {
    return clamp(Math.round(10 + streak * 4 + stability * 0.18 - misses * 1.5), 10, 45);
  }
  if (stage === FLASHCARD_STAGES.recovering) {
    return clamp(Math.round(2 + streak * 1.5 + stability * 0.05 - misses * 0.4), 2, 10);
  }
  return clamp(2 + Math.max(0, streak - 1), 2, 6);
}

export function applyFlashcardAttempt(previous = {}, {
  correct = false,
  now = new Date(),
} = {}) {
  const state = normalizeFlashcardState(previous);
  const nowDate = now instanceof Date ? now : new Date(now);
  const attempts = state.attempts + 1;
  const nextCorrect = state.correct + (correct ? 1 : 0);
  const misses = state.misses + (correct ? 0 : 1);
  const streak = correct ? state.streak + 1 : 0;
  const recoveredFromMiss = Boolean(correct && state.lastResult === "wrong");
  const recoveries = state.recoveries + (recoveredFromMiss ? 1 : 0);

  const stability = clamp(
    Math.round(
      state.stability +
      (correct ? 18 : -24) +
      (recoveredFromMiss ? 8 : 0) +
      Math.min(streak, 4) * (correct ? 3 : 0) -
      Math.max(0, misses - 2) * 2
    ),
    0,
    100,
  );

  const stage = stageFor({ correct, misses, recoveries, streak, stability });
  const intervalDays = intervalFor({ correct, stage, streak, stability, misses });
  const nextReviewAt = new Date(nowDate.getTime() + intervalDays * DAY_MS).toISOString();

  return {
    stage,
    attempts,
    correct: nextCorrect,
    misses,
    recoveries,
    streak,
    stability,
    intervalDays,
    lastResult: correct ? "correct" : "wrong",
    lastReviewedAt: nowDate.toISOString(),
    nextReviewAt,
  };
}

export function flashcardIsDue(state = {}, now = Date.now()) {
  const normalized = normalizeFlashcardState(state);
  if (!normalized.nextReviewAt) return normalized.stage !== FLASHCARD_STAGES.new;
  const due = new Date(normalized.nextReviewAt).getTime();
  return Number.isFinite(due) && due <= Number(now);
}

export function summarizeFlashcardDeck(cards = {}, now = Date.now()) {
  const values = Object.values(cards || {}).map(normalizeFlashcardState);
  const counts = {
    new: 0,
    learning: 0,
    recovering: 0,
    strong: 0,
    due: 0,
  };

  for (const state of values) {
    counts[state.stage] += 1;
    if (flashcardIsDue(state, now)) counts.due += 1;
  }

  return {
    total: values.length,
    ...counts,
    reviewed: values.filter((state) => state.attempts > 0).length,
    averageStability: values.length
      ? Math.round(values.reduce((sum, state) => sum + state.stability, 0) / values.length)
      : 0,
  };
}
