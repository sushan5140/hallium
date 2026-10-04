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


const PRACTICE_ROUTE_BY_SKILL = [
  { test:/register|real korean|conversation|social/i, kind:"real_korean", title:"Practice Real Korean choices", why:"Recent evidence shows social/register choices need another clean attempt." },
  { test:/listening|dictation|recall/i, kind:"companion", title:"Practice listening in your next lesson", why:"Recent evidence shows listening or recall needs reinforcement in lesson context." },
  { test:/grammar|sentence building|pattern/i, kind:"grammar", title:"Rebuild the grammar pattern", why:"Recent evidence points to grammar or sentence construction as the next weak layer." },
  { test:/vocab|word|meaning/i, kind:"vocab", title:"Strengthen weak vocabulary", why:"Recent evidence points to vocabulary recall as the next weak layer." },
  { test:/reading/i, kind:"companion", title:"Practice reading in context", why:"Recent evidence shows reading comprehension needs another contextual pass." },
];


export function recentPracticeEvidence(attempts = [], {
  maxAgeDays = 21,
  now = new Date(),
} = {}) {
  const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const maxAgeMs = Math.max(1, Number(maxAgeDays || 21)) * 86400000;

  return (Array.isArray(attempts) ? attempts : []).filter((attempt) => {
    if (!attempt) return false;
    const createdMs = new Date(attempt.createdAt || 0).getTime();
    if (!Number.isFinite(createdMs) || createdMs <= 0) return true;
    return nowMs - createdMs <= maxAgeMs;
  });
}

export function recommendNextPractice({
  attempts = [],
  dueCount = 0,
  maxAgeDays = 21,
  now = new Date(),
} = {}) {
  if (Number(dueCount || 0) > 0) {
    return {
      kind:"review_queue",
      title:"Review due weaknesses",
      why:"Scheduled review is due now, so it stays ahead of new evidence-based practice.",
      source:"due_review",
      skill:null,
    };
  }

  const freshAttempts = recentPracticeEvidence(attempts, { maxAgeDays, now });
  const summary = summarizePracticeEvidence(freshAttempts);
  const weak = summary.topWeakSkill;
  if (!weak) return null;

  const mapped = PRACTICE_ROUTE_BY_SKILL.find((item) => item.test.test(weak.skill))
    || { kind:"test", title:"Run a focused study check", why:"Recent evidence is weak but does not map cleanly to one practice surface yet." };

  return {
    kind:mapped.kind,
    title:mapped.title,
    why:mapped.why,
    source:"practice_evidence",
    skill:weak.skill,
    evidenceScore:weak.averageScore,
    relearn:weak.relearn,
    developing:weak.developing,
    freshAttemptCount:freshAttempts.length,
    maxAgeDays:Number(maxAgeDays || 21),
  };
}

export function applyEvidenceAwarePracticeRoute(route = {}, recommendation = null, dueCount = 0) {
  if (!route || !Array.isArray(route.steps) || !recommendation) return route;

  const steps = [...route.steps];
  const dueReview = Number(dueCount || 0) > 0;

  if (dueReview) {
    const review = steps.find((step) => step?.kind === "review_queue")
      || { kind:"review_queue", title:"Review due weaknesses", why:"Scheduled review is due now.", minutes:8 };
    const withoutReview = steps.filter((step) => step?.kind !== "review_queue");
    return { ...route, steps:[review, ...withoutReview].slice(0,3) };
  }

  const recommendedStep = {
    kind:recommendation.kind,
    title:recommendation.title,
    why:recommendation.why,
    minutes:recommendation.kind === "test" ? 10 : 8,
    evidenceSkill:recommendation.skill || null,
    evidenceSource:recommendation.source,
  };
  const deduped = steps.filter((step) => step?.kind !== recommendedStep.kind);
  return {
    ...route,
    steps:[recommendedStep, ...deduped].slice(0,3),
    evidenceRecommendation:recommendation,
  };
}
