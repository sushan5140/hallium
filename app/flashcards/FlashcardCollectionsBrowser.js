"use client";

import { useEffect, useMemo, useState } from "react";
import { realKoreanFlashcards, savedFlashcardCollection, weakFlashcardCollection } from "../../lib/flashcard-collections";
import StarterFlashcardsBridge from "./StarterFlashcardsBridge";

const INTELLIGENCE_KEY = "hallim:intelligence:v1";

function readFlashcardState() {
  if (typeof window === "undefined") return { cards:{}, savedIds:[], catalog:[] };
  try {
    const intelligence = JSON.parse(localStorage.getItem(INTELLIGENCE_KEY) || "{}") || {};
    const flashcards = intelligence.flashcards || {};
    return {
      cards: flashcards.cards && typeof flashcards.cards === "object" ? flashcards.cards : {},
      savedIds: Array.isArray(flashcards.savedIds) ? flashcards.savedIds : [],
      catalog: Array.isArray(flashcards.catalog) ? flashcards.catalog : [],
    };
  } catch {
    return { cards:{}, savedIds:[], catalog:[] };
  }
}

function groupCards(cards, prefix, fallbackLabel) {
  const map = new Map();
  for (const card of cards || []) {
    const id = card.collectionId || prefix;
    if (!map.has(id)) {
      map.set(id, {
        id,
        label: fallbackLabel(card),
        description: card.source === "curriculum"
          ? "Vocabulary sourced directly from Hallium curriculum lessons."
          : "Authored phrases from Hallium's existing Real Korean bank.",
        cards: [],
      });
    }
    map.get(id).cards.push(card);
  }
  return [...map.values()];
}

function GenericCollection({ collection }) {
  const [index, setIndex] = useState(0);
  const cards = collection.cards || [];
  const card = cards[index] || null;

  useEffect(() => setIndex(0), [collection.id]);

  if (!card) {
    return (
      <section className="flashcardCollectionEmpty">
        <strong>{collection.label}</strong>
        <p>No cards are available in this collection yet.</p>
      </section>
    );
  }

  return (
    <section className="flashcardCollectionStage" aria-label={collection.label}>
      <header>
        <div>
          <span>FLASHCARDS 2.0 · COLLECTION</span>
          <h1>{collection.label}</h1>
          <p>{collection.description}</p>
        </div>
        <strong>{index + 1} / {cards.length}</strong>
      </header>

      <article className="flashcardCollectionCard">
        <small>{card.meta?.register ? card.meta.register.toUpperCase() : card.source?.toUpperCase() || "KOREAN"}</small>
        <h2 lang="ko">{card.korean}</h2>
        {card.meta?.romanization ? <p className="flashcardCollectionRomanization">{card.meta.romanization}</p> : null}
        <h3>{card.meaning}</h3>
        {card.meta?.note ? <p>{card.meta.note}</p> : null}
        {card.meta?.due ? <p><strong>Due now · stability {card.meta.stability}%</strong></p> : null}
      </article>

      <div className="flashcardCollectionNav">
        <button type="button" disabled={index === 0} onClick={() => setIndex((value) => Math.max(0, value - 1))}>← Previous</button>
        <button type="button" disabled={index >= cards.length - 1} onClick={() => setIndex((value) => Math.min(cards.length - 1, value + 1))}>Next →</button>
      </div>
    </section>
  );
}

export default function FlashcardCollectionsBrowser() {
  const [canonical, setCanonical] = useState({ cards:{}, savedIds:[], catalog:[] });

  useEffect(() => {
    const refresh = () => setCanonical(readFlashcardState());
    refresh();
    window.addEventListener("hallium:flashcards:changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("hallium:flashcards:changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const collections = useMemo(() => {
    const realKorean = realKoreanFlashcards();
    const catalogMap = new Map();

    for (const card of [...canonical.catalog, ...realKorean]) {
      if (card?.id) catalogMap.set(card.id, card);
    }

    const allCards = [...catalogMap.values()];
    const weak = weakFlashcardCollection(allCards, canonical.cards);
    const saved = savedFlashcardCollection(allCards, canonical.savedIds);
    const curriculum = allCards.filter((card) => card.source === "curriculum");
    const realKoreanCollections = groupCards(
      realKorean,
      "real-korean",
      (card) => "Real Korean · " + (card.meta?.sceneLabel || "Scene"),
    );
    const curriculumCollections = groupCards(
      curriculum,
      "curriculum",
      (card) => "Curriculum · " + (card.meta?.lessonTitle || "Vocabulary"),
    );

    return [
      {
        id:"starter",
        label:"Starter · 12 words",
        description:"Illustrated Starter vocabulary with recall evidence.",
        kind:"starter",
        cards:allCards.filter((card) => card.source === "starter"),
      },
      {
        id:"weak",
        label:"Weak & due",
        description:"Cards Hallium evidence says need another recall.",
        kind:"generic",
        cards:weak,
      },
      {
        id:"saved",
        label:"Saved words",
        description:"Words you explicitly kept for later practice.",
        kind:"generic",
        cards:saved,
      },
      ...curriculumCollections.map((collection) => ({ ...collection, kind:"generic" })),
      ...realKoreanCollections.map((collection) => ({ ...collection, kind:"generic" })),
    ];
  }, [canonical]);

  const [activeId, setActiveId] = useState("starter");
  const active = collections.find((collection) => collection.id === activeId) || collections[0];

  return (
    <>
      <section className="flashcardCollectionsShell" aria-label="Flashcard collections">
        <div className="flashcardCollectionsIntro">
          <span>FLASHCARDS 2.0</span>
          <h1>Choose what you want to recall.</h1>
          <p>Starter, weak, saved, curriculum, and Real Korean collections now read from Hallium's shared learner state and authored content sources.</p>
        </div>
        <div className="flashcardCollectionTabs" role="tablist" aria-label="Choose flashcard collection">
          {collections.map((collection) => (
            <button
              key={collection.id}
              type="button"
              role="tab"
              aria-selected={collection.id === active.id}
              className={collection.id === active.id ? "selected" : ""}
              onClick={() => setActiveId(collection.id)}
            >
              <strong>{collection.label}</strong>
              <small>{collection.kind === "starter" ? "Starter" : collection.cards.length + " cards"}</small>
            </button>
          ))}
        </div>
      </section>

      {active.kind === "starter"
        ? <StarterFlashcardsBridge />
        : <GenericCollection key={active.id} collection={active} />}
    </>
  );
}
