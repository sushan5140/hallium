import {
  DEFAULT_LEARNING_PREFERENCES,
  normalizeLearningPreferences,
  rankRealKoreanScenes,
  reviewUrgency,
} from "./learning-intelligence.js";
import { realKoreanScenarios, realKoreanScenes } from "./real-korean.js";

const DEFAULT_ITEM_LIMIT = 5;

function stableMistakeId(item, index) {
  return String(item?.id || item?.prompt || item?.skill || "mistake-" + index);
}

export function buildAdaptivePracticeSession({
  mistakes = [],
  preferences = DEFAULT_LEARNING_PREFERENCES,
  latestStudyPct = null,
  now = Date.now(),
  itemLimit = DEFAULT_ITEM_LIMIT,
} = {}) {
  const normalized = normalizeLearningPreferences(preferences);
  const limit = Math.max(3, Math.min(8, Math.round(Number(itemLimit || DEFAULT_ITEM_LIMIT))));
  const due = (mistakes || [])
    .map((item, index) => ({
      ...item,
      _id: stableMistakeId(item, index),
      _urgency: reviewUrgency(item, now),
      _due: new Date(item?.nextReviewAt || 0).getTime() <= now,
    }))
    .filter((item) => item._due)
    .sort((a,b) =>
      b._urgency - a._urgency ||
      String(a._id).localeCompare(String(b._id))
    );

  const sceneMatches = rankRealKoreanScenes(realKoreanScenes(), normalized, 3);
  const matchedSceneIds = new Set(sceneMatches.map((scene) => scene.id));
  const scenarios = realKoreanScenarios();
  const preferredScenarios = scenarios.filter((scenario) => matchedSceneIds.has(scenario.sceneId));
  const scenarioPool = preferredScenarios.length ? preferredScenarios : scenarios;

  const items = [];
  for (const item of due) {
    if (items.length >= limit) break;
    items.push({
      id: "weakness:" + item._id,
      kind: "weakness_review",
      skill: String(item?.skill || "Mixed review"),
      title: "Repair " + String(item?.skill || "this weakness"),
      prompt: String(item?.prompt || "Review the missed item and answer it again from memory."),
      priority: 100 + item._urgency,
      source: "learner_evidence",
      due: true,
    });
  }

  for (const scenario of scenarioPool) {
    if (items.length >= limit) break;
    items.push({
      id: "scenario:" + scenario.id,
      kind: "real_korean_scenario",
      sceneId: scenario.sceneId,
      title: scenario.situation,
      prompt: scenario.prompt,
      targetRegister: scenario.targetRegister,
      scenarioId: scenario.id,
      priority: preferredScenarios.includes(scenario) ? 72 : 58,
      source: "hallium_authored",
      due: false,
    });
  }

  const dueCount = due.length;
  const scenarioCount = items.filter((item) => item.kind === "real_korean_scenario").length;
  const weaknessCount = items.filter((item) => item.kind === "weakness_review").length;

  return {
    title: dueCount ? "Repair first, then use Korean" : "Use Korean in context",
    reason: dueCount
      ? "Due weaknesses stay first; Real Korean practice fills the remaining session without replacing scheduled review."
      : preferredScenarios.length
        ? "Hallium uses your saved interests to choose authored Real Korean practice."
        : "No review is due, so Hallium starts with authored general-purpose Real Korean practice.",
    sessionMinutes: normalized.dailyMinutes,
    difficulty:
      latestStudyPct == null ? "balanced" :
      latestStudyPct < 70 || dueCount >= 3 ? "reinforce" :
      latestStudyPct >= 88 && dueCount === 0 ? "stretch" : "balanced",
    dueCount,
    weaknessCount,
    scenarioCount,
    preferences: normalized,
    matchedScenes: sceneMatches.map((scene) => ({
      id: scene.id,
      label: scene.label,
      matchedTopics: scene.matchedTopics,
    })),
    items,
    source: "hallium_practice_engine",
  };
}
