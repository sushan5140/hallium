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
  choices = [],
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
    choices: [...new Set((Array.isArray(choices) ? choices : []).map((value) => String(value || "")).filter(Boolean))].slice(0, 6),
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
  const options = normalized.choices.length >= 2
    ? normalized.choices
    : [...new Set([normalized.expected, normalized.response].filter(Boolean))];

  return {
    id: normalized.id || [normalized.mode, normalized.sceneId, normalized.skill].filter(Boolean).join(":"),
    skill: registerIssue ? "Register choice" : normalized.skill,
    prompt: normalized.prompt,
    expected: normalized.expected,
    response: normalized.response,
    options,
    answer: Math.max(0, options.indexOf(normalized.expected)),
    explanation: registerIssue
      ? "Choose the wording that matches the target social register as well as the intended meaning."
      : "Review the authored answer and retry the same skill without relying on the previous response.",
    lastResult: normalized.correct && normalized.registerMatch ? "correct" : "wrong",
    misses: normalized.correct && normalized.registerMatch ? 1 : 2,
    successfulReviews: 0,
    evidenceScore: normalized.score,
    practiceOutcome: normalized.outcome,
    source: normalized.source,
    lastSeenAt: normalized.createdAt,
  };
}


export function summarizePracticeEvidence(attempts = [], limit = 40) {
  const recent = (Array.isArray(attempts) ? attempts : [])
    .filter(Boolean)
    .sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, Math.max(1, Number(limit || 40)));

  const outcomeCounts = { strong:0, developing:0, relearn:0 };
  const modeCounts = new Map();
  const skillRows = new Map();

  for (const attempt of recent) {
    const outcome = PRACTICE_OUTCOMES[attempt?.outcome] || practiceOutcome(attempt?.score);
    outcomeCounts[outcome] += 1;

    const mode = String(attempt?.mode || "practice").replace(/^lesson_/, "").replaceAll("_", " ");
    modeCounts.set(mode, Number(modeCounts.get(mode) || 0) + 1);

    const skill = String(attempt?.skill || "Mixed review");
    const row = skillRows.get(skill) || { skill, attempts:0, scoreTotal:0, relearn:0, developing:0, strong:0 };
    row.attempts += 1;
    row.scoreTotal += clamp(Number(attempt?.score || 0), 0, 100);
    row[outcome] += 1;
    skillRows.set(skill,row);
  }

  const skills = [...skillRows.values()]
    .map((row) => ({
      ...row,
      averageScore: row.attempts ? Math.round(row.scoreTotal / row.attempts) : 0,
      needsWork: row.relearn * 2 + row.developing,
    }))
    .sort((a,b) =>
      b.needsWork - a.needsWork ||
      a.averageScore - b.averageScore ||
      b.attempts - a.attempts ||
      a.skill.localeCompare(b.skill)
    );

  const modes = [...modeCounts.entries()]
    .map(([mode,count]) => ({ mode, count }))
    .sort((a,b) => b.count - a.count || a.mode.localeCompare(b.mode));

  const averageScore = recent.length
    ? Math.round(recent.reduce((sum,item) => sum + clamp(Number(item?.score || 0),0,100),0) / recent.length)
    : null;

  return {
    attempts: recent.length,
    averageScore,
    outcomes: outcomeCounts,
    modes,
    skills,
    topWeakSkill: skills.find((row) => row.needsWork > 0) || null,
    evidenceLabel: recent.length < 5 ? "early evidence" : recent.length < 15 ? "growing evidence" : "multi-mode evidence",
  };
}
