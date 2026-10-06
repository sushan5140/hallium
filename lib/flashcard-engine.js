import { adaptiveReviewSchedule } from "./learning-intelligence.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const FLASHCARD_STAGES = Object.freeze({
  new: "new",
  learning: "learning",
  recovering: "recovering",
  strong: "strong",
});

export const FLASHCARD_MODES = Object.freeze({
  recognition: "recognition",
  production: "production",
  listening: "listening",
  sentence: "sentence",
});

const MODE_STABILITY_GAIN = Object.freeze({
  recognition: 12,
  production: 22,
  listening: 20,
  sentence: 24,
});

function normalizeMode(mode) {
  return Object.values(FLASHCARD_MODES).includes(mode)
    ? mode
    : FLASHCARD_MODES.recognition;
}

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
    reviewCredits: Math.max(0, Number(value?.reviewCredits || 0)),
    lastResult: value?.lastResult === "correct" ? "correct" : value?.lastResult === "wrong" ? "wrong" : null,
    lastReviewedAt: typeof value?.lastReviewedAt === "string" ? value.lastReviewedAt : null,
    nextReviewAt: typeof value?.nextReviewAt === "string" ? value.nextReviewAt : null,
    modeEvidence: Object.fromEntries(
      Object.values(FLASHCARD_MODES).map((mode) => {
        const row = value?.modeEvidence?.[mode] || {};
        return [mode, {
          attempts: Math.max(0, Math.round(Number(row?.attempts || 0))),
          correct: Math.max(0, Math.round(Number(row?.correct || 0))),
        }];
      })
    ),
  };
}

function stageFromReviewStage(reviewStage, correct) {
  if (!correct || reviewStage === "relearn") return FLASHCARD_STAGES.learning;
  if (reviewStage === "stable") return FLASHCARD_STAGES.strong;
  return FLASHCARD_STAGES.recovering;
}

function recallCredit(mode, { revealedBeforeAnswer = false, hintsUsed = 0 } = {}) {
  const base = {
    recognition: 0.65,
    production: 1,
    listening: 0.95,
    sentence: 1.05,
  }[normalizeMode(mode)] || 0.65;
  const penalty = (revealedBeforeAnswer ? 0.3 : 0) + clamp(Number(hintsUsed || 0), 0, 5) * 0.08;
  return Math.max(0.2, Number((base - penalty).toFixed(2)));
}

export function applyFlashcardAttempt(previous = {}, {
  correct = false,
  mode = FLASHCARD_MODES.recognition,
  revealedBeforeAnswer = false,
  hintsUsed = 0,
  now = new Date(),
} = {}) {
  const state = normalizeFlashcardState(previous);
  const normalizedMode = normalizeMode(mode);
  const safeHints = clamp(Math.round(Number(hintsUsed || 0)), 0, 5);
  const nowDate = now instanceof Date ? now : new Date(now);
  const attempts = state.attempts + 1;
  const nextCorrect = state.correct + (correct ? 1 : 0);
  const misses = state.misses + (correct ? 0 : 1);
  const streak = correct ? state.streak + 1 : 0;
  const recoveredFromMiss = Boolean(correct && state.lastResult === "wrong");
  const recoveries = state.recoveries + (recoveredFromMiss ? 1 : 0);
  const credit = correct
    ? recallCredit(normalizedMode, { revealedBeforeAnswer, hintsUsed:safeHints })
    : 0;
  const reviewCredits = Number((state.reviewCredits + credit).toFixed(2));

  const schedule = adaptiveReviewSchedule({
    correct,
    successfulReviews: reviewCredits,
    misses: Math.max(1, misses),
    urgency: state.lastResult === "wrong" ? 8 : state.stage === FLASHCARD_STAGES.learning ? 4 : 0,
    previousResult: state.lastResult || "wrong",
  });

  const stage = stageFromReviewStage(schedule.stage, correct);
  const nextReviewAt = new Date(nowDate.getTime() + schedule.intervalDays * DAY_MS).toISOString();

  const modeEvidence = {
    ...state.modeEvidence,
    [normalizedMode]: {
      attempts: state.modeEvidence[normalizedMode].attempts + 1,
      correct: state.modeEvidence[normalizedMode].correct + (correct ? 1 : 0),
    },
  };

  return {
    stage,
    attempts,
    correct: nextCorrect,
    misses,
    recoveries,
    streak,
    stability: schedule.stability,
    reviewCredits,
    intervalDays: schedule.intervalDays,
    reviewStage: schedule.stage,
    scheduleReason: schedule.reason,
    lastResult: correct ? "correct" : "wrong",
    lastReviewedAt: nowDate.toISOString(),
    nextReviewAt,
    mode: normalizedMode,
    revealedBeforeAnswer: Boolean(revealedBeforeAnswer),
    hintsUsed: safeHints,
    modeEvidence,
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


export function weakestFlashcardMode(state = {}) {
  const normalized = normalizeFlashcardState(state);
  const rows = Object.entries(normalized.modeEvidence)
    .filter(([, evidence]) => evidence.attempts > 0)
    .map(([mode, evidence]) => ({
      mode,
      attempts: evidence.attempts,
      accuracy: evidence.attempts ? evidence.correct / evidence.attempts : 0,
    }))
    .sort((a, b) =>
      a.accuracy - b.accuracy ||
      b.attempts - a.attempts ||
      a.mode.localeCompare(b.mode)
    );

  return rows[0] || null;
}
