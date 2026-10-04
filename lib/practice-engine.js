const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const PRACTICE_OUTCOMES = Object.freeze({
  strong: "strong",
  developing: "developing",
  relearn: "relearn",
});

export function scorePracticeAttempt({
  correct = false,
  registerMatch = true,
  hintsUsed = 0,
  retries = 0,
} = {}) {
  let score = correct ? 100 : 38;

  if (!registerMatch) score -= 28;
  score -= clamp(Number(hintsUsed || 0), 0, 5) * 8;
  score -= clamp(Number(retries || 0), 0, 6) * 6;

  return clamp(Math.round(score), 0, 100);
}

export function practiceOutcome(score) {
  const safe = clamp(Number(score || 0), 0, 100);
  if (safe >= 82) return PRACTICE_OUTCOMES.strong;
  if (safe >= 55) return PRACTICE_OUTCOMES.developing;
  return PRACTICE_OUTCOMES.relearn;
}

export function buildPracticeAttempt({
  id = "",
  mode = "choice",
  sceneId = "",
  skill = "Mixed review",
  prompt = "",
  response = "",
  expected = "",
  correct = false,
  targetRegister = "",
  selectedRegister = "",
  hintsUsed = 0,
  retries = 0,
  source = "hallium_practice",
  createdAt = new Date().toISOString(),
} = {}) {
  const registerRequired = Boolean(targetRegister);
  const registerMatch = !registerRequired || targetRegister === selectedRegister;
  const score = scorePracticeAttempt({ correct, registerMatch, hintsUsed, retries });
  const outcome = practiceOutcome(score);

  return {
    id: String(id || ""),
    mode: String(mode || "choice"),
    sceneId: String(sceneId || ""),
    skill: String(skill || "Mixed review"),
    prompt: String(prompt || ""),
    response: String(response || ""),
    expected: String(expected || ""),
    correct: Boolean(correct),
    targetRegister: String(targetRegister || ""),
    selectedRegister: String(selectedRegister || ""),
    registerMatch,
    hintsUsed: clamp(Math.round(Number(hintsUsed || 0)), 0, 5),
    retries: clamp(Math.round(Number(retries || 0)), 0, 6),
    score,
    outcome,
    source: String(source || "hallium_practice"),
    createdAt: String(createdAt || new Date().toISOString()),
  };
}

export function practiceAttemptMistakeEvidence(attempt = {}) {
  const normalized = buildPracticeAttempt(attempt);
  if (normalized.outcome === PRACTICE_OUTCOMES.strong) return null;

  const registerIssue = normalized.targetRegister && !normalized.registerMatch;
  return {
    id: normalized.id || [normalized.mode, normalized.sceneId, normalized.skill].filter(Boolean).join(":"),
    skill: registerIssue ? "Register choice" : normalized.skill,
    prompt: normalized.prompt,
    expected: normalized.expected,
    response: normalized.response,
    lastResult: normalized.correct && normalized.registerMatch ? "correct" : "wrong",
    misses: normalized.correct && normalized.registerMatch ? 1 : 2,
    successfulReviews: 0,
    evidenceScore: normalized.score,
    practiceOutcome: normalized.outcome,
    source: normalized.source,
    lastSeenAt: normalized.createdAt,
  };
}
