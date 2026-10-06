"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { applyFlashcardAttempt, flashcardIsDue, normalizeFlashcardState, summarizeFlashcardDeck } from "../../lib/flashcard-engine";
import styles from "../hangul/page.module.css";

const LEGACY_STORAGE_KEY = "hallium:flashcards:starter-unit-1:v2";
const INTELLIGENCE_KEY = "hallim:intelligence:v1";
const DECK_SIZE = 12;

function readIntelligence() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(INTELLIGENCE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function readDeck() {
  const intelligence = readIntelligence();
  const canonical = intelligence?.flashcards?.cards;
  if (canonical && typeof canonical === "object" && Object.keys(canonical).length) return canonical;
  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "{}");
    return legacy && typeof legacy === "object" ? legacy : {};
  } catch {
    return {};
  }
}

function writeFlashcards(partial) {
  try {
    const intelligence = readIntelligence();
    const previous = intelligence?.flashcards && typeof intelligence.flashcards === "object"
      ? intelligence.flashcards
      : {};
    const nextFlashcards = {
      ...previous,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(INTELLIGENCE_KEY, JSON.stringify({
      ...intelligence,
      flashcards: nextFlashcards,
    }));
    window.dispatchEvent(new CustomEvent("hallium:flashcards:changed"));
  } catch {
    // The visual deck remains usable even when browser persistence is blocked.
  }
}

function writeDeck(cards) {
  writeFlashcards({ cards });
}

export default function StarterFlashcardsBridge() {
  const frameRef = useRef(null);
  const [cards, setCards] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCards(readDeck());
    setReady(true);
  }, []);

  const summary = useMemo(() => summarizeFlashcardDeck(cards), [cards]);

  useEffect(() => {
    if (!ready) return;

    function sendState(target = frameRef.current?.contentWindow) {
      if (!target) return;
      target.postMessage({
        type: "hallium:flashcards:state",
        deckId: "starter-unit-1",
        cards,
        summary,
      }, window.location.origin);
    }

    function onMessage(event) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      const payload = event.data;
      if (!payload || typeof payload !== "object") return;

      if (payload.type === "hallium:flashcards:ready") {
        if (Array.isArray(payload.catalog) && payload.catalog.length) {
          const intelligence = readIntelligence();
          const previous = intelligence?.flashcards || {};
          const existing = Array.isArray(previous.catalog) ? previous.catalog : [];
          const byId = new Map(existing.map((card) => [card.id, card]));
          payload.catalog.forEach((card) => {
            if (card?.id) byId.set(card.id, card);
          });
          writeFlashcards({ catalog: [...byId.values()] });
        }
        sendState(event.source);
        return;
      }

      if (payload.type === "hallium:flashcards:save") {
        const intelligence = readIntelligence();
        const previous = intelligence?.flashcards || {};
        const saved = new Set(Array.isArray(previous.savedIds) ? previous.savedIds : []);
        if (payload.saved === true) saved.add(String(payload.cardId || ""));
        else saved.delete(String(payload.cardId || ""));
        saved.delete("");
        writeFlashcards({ savedIds: [...saved] });
        return;
      }

      if (payload.type !== "hallium:flashcards:attempt") return;
      const cardId = String(payload.cardId || "");
      if (!cardId) return;

      setCards((current) => {
        const previous = normalizeFlashcardState(current[cardId] || {});
        const next = applyFlashcardAttempt(previous, {
          correct: payload.correct === true,
          mode: payload.mode || "recognition",
          revealedBeforeAnswer: payload.revealedBeforeAnswer === true,
          hintsUsed: Number(payload.hintsUsed || 0),
          now: new Date(),
        });
        const updated = { ...current, [cardId]: next };
        writeDeck(updated);

        queueMicrotask(() => {
          frameRef.current?.contentWindow?.postMessage({
            type: "hallium:flashcards:state",
            deckId: "starter-unit-1",
            cards: updated,
            summary: summarizeFlashcardDeck(updated),
          }, window.location.origin);
        });

        return updated;
      });
    }

    window.addEventListener("message", onMessage);
    const frame = frameRef.current;
    const onLoad = () => sendState(frame?.contentWindow);
    frame?.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("message", onMessage);
      frame?.removeEventListener("load", onLoad);
    };
  }, [ready, cards, summary]);

  return (
    <>
      <section aria-label="Flashcard learning evidence" style={{
        display:"flex",
        gap:"8px",
        flexWrap:"wrap",
        padding:"8px 14px",
        borderBottom:"1px solid rgba(0,0,0,.07)",
        background:"#fff",
        fontSize:"12px",
      }}>
        <strong>Flashcards 2.0</strong>
        <span>{summary.reviewed}/{DECK_SIZE} reviewed</span>
        <span>{summary.due} due</span>
        <span>{summary.recovering} recovering</span>
        <span>{summary.strong} strong</span>
      </section>
      <iframe
        ref={frameRef}
        className={styles.frame}
        title="Illustrated Starter Unit 1 Korean flashcards with twelve words, pronunciation and review"
        src="/flashcards-level1/index.html"
        loading="eager"
        allow="autoplay"
      />
    </>
  );
}
