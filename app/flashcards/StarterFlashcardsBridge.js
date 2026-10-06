"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { applyFlashcardAttempt, flashcardIsDue, normalizeFlashcardState, summarizeFlashcardDeck } from "../../lib/flashcard-engine";
import styles from "../hangul/page.module.css";

const STORAGE_KEY = "hallium:flashcards:starter-unit-1:v2";
const DECK_SIZE = 12;

function readDeck() {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeDeck(cards) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // The visual deck remains usable even when browser persistence is blocked.
  }
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
        sendState(event.source);
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
