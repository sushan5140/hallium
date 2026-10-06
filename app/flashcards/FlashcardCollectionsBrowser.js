"use client";

import { useMemo, useState } from "react";
import { realKoreanFlashcards } from "../../lib/flashcard-collections";
import StarterFlashcardsBridge from "./StarterFlashcardsBridge";

function groupRealKorean() {
  const cards = realKoreanFlashcards();
  const map = new Map();
  for (const card of cards) {
    const id = card.collectionId || "real-korean";
    if (!map.has(id)) {
      map.set(id, {
        id,
        label: "Real Korean · " + (card.meta?.sceneLabel || "Scene"),
        description: "Authored phrases from Hallium's existing Real Korean bank.",
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
        <small>{card.meta?.register ? card.meta.register.toUpperCase() : "KOREAN"}</small>
        <h2 lang="ko">{card.korean}</h2>
        {card.meta?.romanization ? <p className="flashcardCollectionRomanization">{card.meta.romanization}</p> : null}
        <h3>{card.meaning}</h3>
        {card.meta?.note ? <p>{card.meta.note}</p> : null}
      </article>

      <div className="flashcardCollectionNav">
        <button type="button" disabled={index === 0} onClick={() => setIndex((value) => Math.max(0, value - 1))}>← Previous</button>
        <button type="button" disabled={index >= cards.length - 1} onClick={() => setIndex((value) => Math.min(cards.length - 1, value + 1))}>Next →</button>
      </div>
    </section>
  );
}

export default function FlashcardCollectionsBrowser() {
  const realKoreanCollections = useMemo(() => groupRealKorean(), []);
  const collections = useMemo(() => [
    {
      id: "starter",
      label: "Starter · 12 words",
      description: "Illustrated Starter vocabulary with recall evidence.",
      kind: "starter",
    },
    ...realKoreanCollections.map((collection) => ({ ...collection, kind: "generic" })),
  ], [realKoreanCollections]);

  const [activeId, setActiveId] = useState("starter");
  const active = collections.find((collection) => collection.id === activeId) || collections[0];

  return (
    <>
      <section className="flashcardCollectionsShell" aria-label="Flashcard collections">
        <div className="flashcardCollectionsIntro">
          <span>FLASHCARDS 2.0</span>
          <h1>Choose what you want to recall.</h1>
          <p>Starter words and Real Korean phrases now live in one collection browser. Curriculum, weak, and saved collections use the same registry without copying Hallium's source content.</p>
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
              <small>{collection.kind === "starter" ? "Starter" : collection.cards.length + " phrases"}</small>
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
