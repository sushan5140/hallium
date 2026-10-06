import { allRealKoreanPhrases } from "./real-korean.js";
import { flashcardIsDue, normalizeFlashcardState } from "./flashcard-engine.js";

const clean = (value = "") => String(value || "").trim();

function stableCard({
  id,
  korean,
  meaning,
  source,
  sourceId = "",
  collectionId = "",
  tags = [],
  meta = {},
}) {
  const safeId = clean(id);
  const ko = clean(korean);
  const en = clean(meaning);
  if (!safeId || !ko || !en) return null;

  return {
    id: safeId,
    korean: ko,
    meaning: en,
    source: clean(source) || "hallium",
    sourceId: clean(sourceId),
    collectionId: clean(collectionId),
    tags: [...new Set((tags || []).map(clean).filter(Boolean))],
    meta: { ...(meta || {}) },
  };
}

export function lessonVocabularyCards(lessons = []) {
  const cards = [];
  const seen = new Set();

  for (const lesson of lessons || []) {
    const lessonId = clean(lesson?.id);
    const unitId = clean(lesson?.unitId);
    const title = clean(lesson?.title);
    const steps = Array.isArray(lesson?.steps) ? lesson.steps : [];

    for (const [index, step] of steps.entries()) {
      if (step?.kind !== "word") continue;
      const korean = clean(step?.korean);
      const meaning = clean(step?.meaning);
      if (!korean || !meaning) continue;

      const key = korean + "|" + meaning.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const card = stableCard({
        id: "lesson:" + (lessonId || "unknown") + ":" + index,
        korean,
        meaning,
        source: "curriculum",
        sourceId: lessonId,
        collectionId: unitId ? "unit:" + unitId : "curriculum",
        tags: [lesson?.levelId, unitId, "lesson-vocabulary"],
        meta: {
          lessonTitle: title,
          unitNumber: lesson?.unitNumber ?? null,
          note: clean(step?.note),
        },
      });
      if (card) cards.push(card);
    }
  }

  return cards;
}

export function realKoreanFlashcards() {
  return allRealKoreanPhrases()
    .map((phrase) => stableCard({
      id: "real-korean:" + phrase.id,
      korean: phrase.korean,
      meaning: phrase.meaning,
      source: "real_korean",
      sourceId: phrase.id,
      collectionId: "real-korean:" + phrase.sceneId,
      tags: [phrase.sceneId, phrase.register, "real-korean"],
      meta: {
        romanization: clean(phrase.romanization),
        register: clean(phrase.register),
        note: clean(phrase.note),
        sceneLabel: clean(phrase.sceneLabel),
      },
    }))
    .filter(Boolean);
}

export function weakFlashcardCollection(cards = [], evidenceById = {}, now = Date.now()) {
  return (cards || [])
    .map((card) => {
      const state = normalizeFlashcardState(evidenceById?.[card?.id] || {});
      return { card, state };
    })
    .filter(({ card, state }) =>
      card &&
      (state.lastResult === "wrong" ||
       state.stage === "learning" ||
       state.stage === "recovering" ||
       flashcardIsDue(state, now))
    )
    .sort((a, b) =>
      Number(flashcardIsDue(b.state, now)) - Number(flashcardIsDue(a.state, now)) ||
      a.state.stability - b.state.stability ||
      b.state.misses - a.state.misses ||
      String(a.card.id).localeCompare(String(b.card.id))
    )
    .map(({ card, state }) => ({
      ...card,
      meta: {
        ...card.meta,
        flashcardStage: state.stage,
        stability: state.stability,
        misses: state.misses,
        due: flashcardIsDue(state, now),
      },
    }));
}

export function savedFlashcardCollection(cards = [], savedIds = []) {
  const wanted = new Set((savedIds || []).map(clean).filter(Boolean));
  return (cards || []).filter((card) => wanted.has(clean(card?.id)));
}

export function buildFlashcardCollections({
  lessons = [],
  starterCards = [],
  evidenceById = {},
  savedIds = [],
  now = Date.now(),
} = {}) {
  const curriculum = lessonVocabularyCards(lessons);
  const realKorean = realKoreanFlashcards();
  const starter = (starterCards || []).filter((card) => card?.id && card?.korean && card?.meaning);
  const all = [...starter, ...curriculum, ...realKorean];
  const weak = weakFlashcardCollection(all, evidenceById, now);
  const saved = savedFlashcardCollection(all, savedIds);

  const byUnit = new Map();
  for (const card of curriculum) {
    const key = card.collectionId || "curriculum";
    if (!byUnit.has(key)) byUnit.set(key, []);
    byUnit.get(key).push(card);
  }

  const byScene = new Map();
  for (const card of realKorean) {
    const key = card.collectionId;
    if (!byScene.has(key)) byScene.set(key, []);
    byScene.get(key).push(card);
  }

  return [
    {
      id: "starter",
      label: "Starter",
      description: "Your authored Starter vocabulary collection.",
      source: "starter",
      cards: starter,
    },
    {
      id: "weak",
      label: "Weak & due",
      description: "Cards that Hallium evidence says need another recall.",
      source: "evidence",
      cards: weak,
    },
    {
      id: "saved",
      label: "Saved words",
      description: "Cards you explicitly kept for later practice.",
      source: "saved",
      cards: saved,
    },
    ...[...byUnit.entries()].map(([id, cards]) => ({
      id,
      label: cards[0]?.meta?.lessonTitle
        ? "Curriculum · " + cards[0].meta.lessonTitle
        : "Curriculum vocabulary",
      description: "Vocabulary sourced directly from Hallium lesson word steps.",
      source: "curriculum",
      cards,
    })),
    ...[...byScene.entries()].map(([id, cards]) => ({
      id,
      label: "Real Korean · " + (cards[0]?.meta?.sceneLabel || id.replace("real-korean:", "")),
      description: "Authored phrases from the existing Real Korean scene bank.",
      source: "real_korean",
      cards,
    })),
  ];
}
