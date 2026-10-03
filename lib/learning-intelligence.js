const DAY_MS = 24 * 60 * 60 * 1000;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function reviewUrgency(item, now = Date.now()) {
  const misses = Math.max(1, Number(item?.misses || 1));
  const successfulReviews = Math.max(0, Number(item?.successfulReviews || 0));
  const next = new Date(item?.nextReviewAt || 0).getTime();
  const seen = new Date(item?.lastSeenAt || item?.createdAt || 0).getTime();

  const overdueDays = Number.isFinite(next) ? Math.max(0, Math.floor((now - next) / DAY_MS)) : 0;
  const ageDays = Number.isFinite(seen) ? Math.max(0, Math.floor((now - seen) / DAY_MS)) : 0;
  const unresolved = item?.lastResult === "correct" ? 0 : 1;

  const raw =
    misses * 2.4 +
    unresolved * 3.2 +
    Math.min(overdueDays, 14) * 0.65 +
    Math.min(ageDays, 21) * 0.08 -
    successfulReviews * 1.35;

  return Number(clamp(raw, 0, 25).toFixed(2));
}

export function rankWeakSkills(mistakes = [], now = Date.now(), limit = 3) {
  const bySkill = new Map();

  for (const item of mistakes || []) {
    const skill = String(item?.skill || "Mixed review");
    const score = reviewUrgency(item, now);
    const previous = bySkill.get(skill) || { skill, score: 0, due: 0, items: 0, misses: 0 };
    const due = new Date(item?.nextReviewAt || 0).getTime() <= now;

    previous.score += score;
    previous.items += 1;
    previous.misses += Math.max(1, Number(item?.misses || 1));
    if (due) previous.due += 1;
    bySkill.set(skill, previous);
  }

  return [...bySkill.values()]
    .map((entry) => ({ ...entry, score: Number(entry.score.toFixed(2)) }))
    .sort((a, b) =>
      b.score - a.score ||
      b.due - a.due ||
      b.misses - a.misses ||
      a.skill.localeCompare(b.skill)
    )
    .slice(0, Math.max(1, limit));
}

export function inferDifficulty({ latestStudyPct = null, dueCount = 0, topWeakness = null } = {}) {
  const weakScore = Number(topWeakness?.score || 0);

  if (latestStudyPct == null) return "balanced";
  if (latestStudyPct < 65 || dueCount >= 4 || weakScore >= 16) return "reinforce";
  if (latestStudyPct >= 88 && dueCount === 0 && weakScore < 7) return "stretch";
  return "balanced";
}

function buildBaseTodayLearningPlan({
  mistakes = [],
  latestStudyPct = null,
  completedPathCount = 0,
  totalPathLessons = 0,
  activeStudyLabel = "current level",
  nextLessonTitle = "your next lesson",
  now = Date.now(),
} = {}) {
  const dueMistakes = (mistakes || [])
    .filter((item) => new Date(item?.nextReviewAt || 0).getTime() <= now)
    .sort((a, b) => new Date(a?.nextReviewAt || 0) - new Date(b?.nextReviewAt || 0));

  const rankedWeaknesses = rankWeakSkills(mistakes, now, 3);
  const topWeakness = rankedWeaknesses[0] || null;
  const difficulty = inferDifficulty({
    latestStudyPct,
    dueCount: dueMistakes.length,
    topWeakness,
  });

  if (dueMistakes.length) {
    return {
      headline: dueMistakes.length === 1 ? "One weakness is due now" : dueMistakes.length + " weaknesses are due now",
      focus: topWeakness?.skill || activeStudyLabel + " retention",
      reason: topWeakness
        ? `${topWeakness.skill} has the highest review urgency from your misses, recovery history, and due schedule.`
        : "Scheduled recall is due before new material.",
      difficulty,
      dueCount: dueMistakes.length,
      rankedWeaknesses,
      steps: [
        {
          kind: "review_queue",
          title: "Review " + dueMistakes.length + " due " + (dueMistakes.length === 1 ? "weakness" : "weaknesses"),
          why: "Repair scheduled recall before adding more interference.",
          priority: 100,
        },
        {
          kind: "adaptive_review",
          title: topWeakness ? "Transfer " + topWeakness.skill : "Transfer the repaired skill",
          why: "Use fresh questions to check whether recall transfers beyond the remembered item.",
          priority: 82,
        },
        {
          kind: "companion",
          title: "Use it in " + nextLessonTitle,
          why: "Return the repaired language to a real lesson context.",
          priority: 68,
        },
      ],
    };
  }

  if (latestStudyPct == null) {
    return {
      headline: "Build your first measurable baseline",
      focus: "Vocabulary → Grammar → Test",
      reason: "Hallium needs one structured result before weakness ranking can become precise.",
      difficulty: "balanced",
      dueCount: 0,
      rankedWeaknesses,
      steps: [
        { kind: "vocab", title: "Review core vocabulary", why: "Build recognition before measuring recall.", priority: 88 },
        { kind: "grammar", title: "Study the active grammar pack", why: "Connect known words into usable patterns.", priority: 82 },
        { kind: "test", title: "Take the " + activeStudyLabel + " study test", why: "Create measurable evidence for the next route.", priority: 78 },
      ],
    };
  }

  if (latestStudyPct < 70 || difficulty === "reinforce") {
    return {
      headline: "Reinforce the weak layer first",
      focus: topWeakness?.skill || activeStudyLabel + " recall",
      reason: topWeakness
        ? `Your latest result is ${latestStudyPct}% and ${topWeakness.skill} carries the highest remaining weakness score.`
        : `Your latest result is ${latestStudyPct}%, so consolidation should come before extra difficulty.`,
      difficulty: "reinforce",
      dueCount: 0,
      rankedWeaknesses,
      steps: [
        { kind: "vocab", title: "Repair vocabulary recall", why: "Rebuild fast recognition in the active study pack.", priority: 86 },
        { kind: "grammar", title: "Rebuild the grammar layer", why: "Stabilize sentence patterns before reassessment.", priority: 82 },
        { kind: "adaptive_review", title: "Run targeted review", why: "Test transfer using only material already learned.", priority: 76 },
      ],
    };
  }

  const completion = totalPathLessons
    ? Math.round((completedPathCount / totalPathLessons) * 100)
    : 0;

  return {
    headline: difficulty === "stretch" ? "You have room to stretch" : "Turn recognition into usable Korean",
    focus: topWeakness?.skill || "Context + transfer + reassessment",
    reason: difficulty === "stretch"
      ? `Your latest result is ${latestStudyPct}% with no due weaknesses, so Hallium can increase transfer difficulty.`
      : `Your latest result is ${latestStudyPct}% and your path is ${completion}% complete; keep moving while checking retention.`,
    difficulty,
    dueCount: 0,
    rankedWeaknesses,
    steps: [
      { kind: "companion", title: "Continue " + nextLessonTitle, why: "Use the language in a connected real-life context.", priority: 86 },
      { kind: "adaptive_review", title: difficulty === "stretch" ? "Run stretch practice" : "Run adaptive review", why: "Mix recall with transfer at the right difficulty.", priority: 80 },
      { kind: "test", title: "Reassess the study pack", why: "Confirm that the gains remain stable.", priority: 72 },
    ],
  };
}


export const LEARNING_FOCUS_OPTIONS = Object.freeze([
  "conversation",
  "listening",
  "vocabulary",
  "grammar",
  "assessment",
]);

export const LEARNING_TOPIC_OPTIONS = Object.freeze([
  "daily_life",
  "food",
  "shopping",
  "travel",
  "conversation",
  "opinions",
]);

export const DEFAULT_LEARNING_PREFERENCES = Object.freeze({
  dailyMinutes: 15,
  focuses: ["conversation"],
  topics: ["daily_life"],
});

export function normalizeLearningPreferences(value = {}) {
  const minutes = clamp(Math.round(Number(value?.dailyMinutes || DEFAULT_LEARNING_PREFERENCES.dailyMinutes)), 5, 60);
  const allowed = new Set(LEARNING_FOCUS_OPTIONS);
  const focuses = [...new Set(Array.isArray(value?.focuses) ? value.focuses : DEFAULT_LEARNING_PREFERENCES.focuses)]
    .filter((focus) => allowed.has(focus))
    .slice(0, 3);
  const allowedTopics = new Set(LEARNING_TOPIC_OPTIONS);
  const hasExplicitTopics = Array.isArray(value?.topics);
  const topics = [...new Set(hasExplicitTopics ? value.topics : DEFAULT_LEARNING_PREFERENCES.topics)]
    .filter((topic) => allowedTopics.has(topic))
    .slice(0, 3);

  return {
    dailyMinutes: minutes,
    focuses: focuses.length ? focuses : [...DEFAULT_LEARNING_PREFERENCES.focuses],
    topics: hasExplicitTopics ? topics : [...DEFAULT_LEARNING_PREFERENCES.topics],
  };
}

const ACTION_MINUTES = Object.freeze({
  review_queue: 6,
  adaptive_review: 8,
  companion: 10,
  vocab: 6,
  grammar: 8,
  test: 10,
  checkpoint: 12,
});

const FOCUS_BOOSTS = Object.freeze({
  conversation: { companion: 18, adaptive_review: 4 },
  listening: { companion: 12, adaptive_review: 7 },
  vocabulary: { vocab: 18, review_queue: 5, adaptive_review: 4 },
  grammar: { grammar: 18, adaptive_review: 6 },
  assessment: { test: 18, checkpoint: 18, adaptive_review: 3 },
});

function preferenceBoost(kind, focuses) {
  return (focuses || []).reduce((sum, focus) => sum + Number(FOCUS_BOOSTS[focus]?.[kind] || 0), 0);
}

export function fitPlanToSession(plan, preferences = DEFAULT_LEARNING_PREFERENCES) {
  const normalized = normalizeLearningPreferences(preferences);
  const original = Array.isArray(plan?.steps) ? plan.steps : [];
  if (!original.length) return { ...plan, sessionMinutes: normalized.dailyMinutes, preferences: normalized, steps: [] };

  const mustKeepFirst = plan?.dueCount > 0 || /baseline/i.test(String(plan?.headline || ""));
  const first = original[0];

  const rankedRest = original.slice(mustKeepFirst ? 1 : 0)
    .map((step, index) => ({
      ...step,
      _index: index,
      _score: Number(step?.priority || 0) + preferenceBoost(step?.kind, normalized.focuses),
    }))
    .sort((a, b) => b._score - a._score || a._index - b._index)
    .map(({ _index, _score, ...step }) => step);

  const ranked = mustKeepFirst ? [first, ...rankedRest] : rankedRest;
  const selected = [];
  let used = 0;

  for (const step of ranked) {
    const minutes = Number(ACTION_MINUTES[step?.kind] || 8);
    if (!selected.length || used + minutes <= normalized.dailyMinutes) {
      selected.push({ ...step, minutes });
      used += minutes;
    }
  }

  return {
    ...plan,
    sessionMinutes: normalized.dailyMinutes,
    plannedMinutes: used,
    preferences: normalized,
    steps: selected.slice(0, 3),
  };
}


export function buildTodayLearningPlan(input = {}) {
  const base = buildBaseTodayLearningPlan(input);
  return fitPlanToSession(base, input.preferences || DEFAULT_LEARNING_PREFERENCES);
}


export function enforceLearningPlanSafety(plan, fallbackPlan) {
  const fallback = fallbackPlan || {};
  const candidate = plan || fallback;
  const dueCount = Number(fallback?.dueCount || candidate?.dueCount || 0);

  if (dueCount <= 0) {
    return {
      ...candidate,
      dueCount,
      difficulty: candidate?.difficulty || fallback?.difficulty || "balanced",
      rankedWeaknesses: candidate?.rankedWeaknesses || fallback?.rankedWeaknesses || [],
    };
  }

  const required = (fallback?.steps || []).find((step) => step?.kind === "review_queue") || {
    kind: "review_queue",
    title: "Review due weaknesses",
    why: "Scheduled recall is due before optional practice.",
    priority: 100,
  };

  const remaining = (candidate?.steps || []).filter((step) => step?.kind !== "review_queue");

  return {
    ...candidate,
    dueCount,
    difficulty: candidate?.difficulty || fallback?.difficulty || "reinforce",
    rankedWeaknesses: candidate?.rankedWeaknesses || fallback?.rankedWeaknesses || [],
    steps: [required, ...remaining].slice(0, 3),
  };
}


export function adaptiveReviewSchedule({
  correct = false,
  successfulReviews = 0,
  misses = 1,
  urgency = 0,
  previousResult = "wrong",
} = {}) {
  const safeMisses = Math.max(1, Number(misses || 1));
  const recoveries = Math.max(0, Number(successfulReviews || 0));
  const safeUrgency = clamp(Number(urgency || 0), 0, 25);

  if (!correct) {
    return {
      intervalDays: 1,
      stage: "relearn",
      stability: 0,
      reason: safeMisses >= 3
        ? "Repeated misses keep this item in tomorrow's review."
        : "A miss returns tomorrow before the memory fades.",
    };
  }

  const ladder = [2, 5, 10, 21, 45, 60];
  const base = ladder[Math.min(Math.max(recoveries - 1, 0), ladder.length - 1)];

  const missPenalty = 1 + Math.max(0, safeMisses - 1) * 0.22;
  const urgencyPenalty = 1 + safeUrgency * 0.025;
  const relearningPenalty = previousResult === "wrong" ? 0.82 : 1;

  const intervalDays = clamp(
    Math.round((base * relearningPenalty) / (missPenalty * urgencyPenalty)),
    1,
    60,
  );

  const stability = clamp(
    Math.round(18 + recoveries * 16 - Math.max(0, safeMisses - 1) * 7 - safeUrgency * 0.8),
    5,
    100,
  );

  return {
    intervalDays,
    stage: recoveries >= 4 ? "stable" : recoveries >= 2 ? "strengthening" : "recovering",
    stability,
    reason: intervalDays === 1
      ? "This recovery is still fragile, so Hallium checks it again tomorrow."
      : `Hallium schedules the next recall in ${intervalDays} days based on recovery strength and miss history.`,
  };
}


const FOCUS_TASKS = Object.freeze({
  conversation: (ctx) => "Continue " + ctx.nextLessonTitle + " and say the key lines aloud.",
  listening: (ctx) => "Replay Korean audio from " + ctx.nextLessonTitle + " and shadow the short exchange.",
  vocabulary: (ctx) => "Review " + ctx.activeStudyLabel + " vocabulary with active recall.",
  grammar: (ctx) => "Rebuild one " + ctx.activeStudyLabel + " grammar pattern from memory.",
  assessment: () => "Run a short study check and inspect every wrong answer.",
});

function dayBucket(nextReviewAt, now, maxDays) {
  const when = new Date(nextReviewAt || 0).getTime();
  if (!Number.isFinite(when)) return 0;
  const delta = Math.floor((when - now) / DAY_MS);
  return clamp(delta, 0, maxDays - 1);
}

export function buildDeterministicStudyPlan({
  mistakes = [],
  preferences = DEFAULT_LEARNING_PREFERENCES,
  latestStudyPct = null,
  activeStudyLabel = "current level",
  nextLessonTitle = "your next lesson",
  now = Date.now(),
  days = 5,
} = {}) {
  const normalized = normalizeLearningPreferences(preferences);
  const dayCount = clamp(Math.round(Number(days || 5)), 5, 7);
  const rankedWeaknesses = rankWeakSkills(mistakes, now, 3);
  const dueBuckets = Array.from({ length: dayCount }, () => []);
  const assigned = new Set();

  for (const [index, item] of (mistakes || []).entries()) {
    const id = String(item?.id || item?.prompt || "mistake-" + index);
    if (assigned.has(id)) continue;
    const bucket = dayBucket(item?.nextReviewAt, now, dayCount);
    dueBuckets[bucket].push(item);
    assigned.add(id);
  }

  const focusCycle = normalized.focuses.length
    ? normalized.focuses
    : DEFAULT_LEARNING_PREFERENCES.focuses;

  const resultDays = Array.from({ length: dayCount }, (_, index) => {
    const dueItems = dueBuckets[index];
    const chosenFocus = focusCycle[index % focusCycle.length] || "conversation";
    const tasks = [];

    if (dueItems.length) {
      const skills = [...new Set(dueItems.map((item) => item?.skill || "mixed review"))].slice(0, 2);
      tasks.push(
        "Review " + dueItems.length + " scheduled " + (dueItems.length === 1 ? "weakness" : "weaknesses") +
        (skills.length ? " (" + skills.join(" + ") + ")" : "") + "."
      );
    }

    const ctx = { activeStudyLabel, nextLessonTitle };
    const focusTask = FOCUS_TASKS[chosenFocus]?.(ctx) || FOCUS_TASKS.conversation(ctx);
    tasks.push(focusTask);

    if (index === 0 && latestStudyPct == null) {
      tasks.push("Take the " + activeStudyLabel + " study test to create a measurable baseline.");
    } else if (index === dayCount - 1) {
      tasks.push("Reassess the study pack and compare the result with your latest evidence.");
    } else if (latestStudyPct != null && latestStudyPct < 70) {
      tasks.push("Use one targeted adaptive review before adding harder material.");
    } else {
      tasks.push("Finish with one short transfer task using only material already studied.");
    }

    return {
      day: "Day " + (index + 1),
      focus: dueItems.length
        ? (dueItems[0]?.skill || "Scheduled review")
        : chosenFocus.replaceAll("_", " "),
      minutes: normalized.dailyMinutes,
      tasks: tasks.slice(0, 3),
    };
  });

  const dueCount = (mistakes || []).filter(
    (item) => new Date(item?.nextReviewAt || 0).getTime() <= now
  ).length;

  return {
    title: "Your next " + dayCount + " Hallium days",
    summary: dueCount
      ? "Start with " + dueCount + " due " + (dueCount === 1 ? "weakness" : "weaknesses") +
        ", then rotate your saved focus priorities inside a " + normalized.dailyMinutes + "-minute daily session."
      : "No review is overdue, so Hallium rotates your saved focus priorities inside a " +
        normalized.dailyMinutes + "-minute daily session while keeping reassessment in the plan.",
    days: resultDays,
    source: "hallium_local",
    rankedWeaknesses,
    generatedFrom: {
      dailyMinutes: normalized.dailyMinutes,
      focuses: normalized.focuses,
      latestStudyPct,
      dueCount,
    },
  };
}


const TOPIC_KEYWORDS = Object.freeze({
  daily_life: ["everyday","daily","morning","routine","time","weekend","plan","yesterday","past","future"],
  food: ["food","drink","menu","order","ordering","counter","quantity","preference","restaurant","cafe","café"],
  shopping: ["shopping","shop","price","item","buy","availability","quantity","store"],
  travel: ["direction","directions","place","movement","meet","meeting","where","go straight","finding","transport","station","travel"],
  conversation: ["conversation","react","clarify","follow-up","background","reported","said","question","request","suggestion","chat"],
  opinions: ["opinion","reason","compare","choosing","choice","viewpoint","stance","argument","justify","contrast","inference"],
});

function lessonSearchText(lesson) {
  return [
    lesson?.title,
    lesson?.subtitle,
    lesson?.unitTitle,
    ...(Array.isArray(lesson?.canDo) ? lesson.canDo : []),
  ].filter(Boolean).join(" ").toLowerCase();
}

export function rankInterestLessons(lessons = [], preferences = DEFAULT_LEARNING_PREFERENCES, limit = 3) {
  const normalized = normalizeLearningPreferences(preferences);
  const topics = normalized.topics || [];
  if (!topics.length) return [];

  return (lessons || [])
    .filter((lesson) => lesson?.unlocked)
    .map((lesson) => {
      const text = lessonSearchText(lesson);
      const matchedTopics = topics.filter((topic) =>
        (TOPIC_KEYWORDS[topic] || []).some((keyword) => text.includes(keyword))
      );
      const keywordHits = topics.reduce(
        (sum, topic) => sum + (TOPIC_KEYWORDS[topic] || []).filter((keyword) => text.includes(keyword)).length,
        0,
      );
      const score =
        keywordHits * 10 +
        matchedTopics.length * 4 +
        (lesson?.current ? 3 : 0) +
        (lesson?.completed ? 0 : 2);

      return {
        ...lesson,
        interestScore: score,
        matchedTopics,
      };
    })
    .filter((lesson) => lesson.interestScore > 0)
    .sort((a,b) =>
      b.interestScore - a.interestScore ||
      Number(b.current) - Number(a.current) ||
      Number(a.completed) - Number(b.completed) ||
      String(a.title || "").localeCompare(String(b.title || ""))
    )
    .slice(0, Math.max(1, limit));
}
