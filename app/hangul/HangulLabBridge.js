"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { evaluateHangulProgress } from "../../lib/hangul-progression";
import { HANGUL_DECODING_ITEMS, decodingOptions } from "../../lib/hangul-decoding";
import styles from "./page.module.css";

const HANGUL_STORAGE_KEY = "hallium-hangul-lab-preview-v1";

function readHangulState() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(HANGUL_STORAGE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function saveReadWord(wordId) {
  const current = readHangulState();
  const readWords = [...new Set([...(current.readWords || []).map(String), String(wordId)])].slice(-80);
  localStorage.setItem(HANGUL_STORAGE_KEY, JSON.stringify({ ...current, readWords }));
  return readWords;
}

function readingOptions(words, target, count = 4) {
  const alternatives = words.filter((word) => word.id !== target.id);
  return [target, ...alternatives.slice(0, Math.max(0, count - 1))];
}

export default function HangulLabBridge() {
  const frameRef = useRef(null);
  const [evidence, setEvidence] = useState({});
  const [starterWords, setStarterWords] = useState([]);
  const [readWordIds, setReadWordIds] = useState([]);
  const [readingRound, setReadingRound] = useState([]);
  const [readingIndex, setReadingIndex] = useState(0);
  const [readingScore, setReadingScore] = useState(0);
  const [readingAnswered, setReadingAnswered] = useState(false);
  const [decodedIds, setDecodedIds] = useState([]);
  const [decodeIndex, setDecodeIndex] = useState(0);
  const [decodeAnswered, setDecodeAnswered] = useState(false);

  const progress = useMemo(() => evaluateHangulProgress({
    ...evidence,
    wordReads: readWordIds.length,
  }), [evidence, readWordIds]);

  useEffect(() => {
    const saved = readHangulState();
    setReadWordIds([...new Set((saved.readWords || []).map(String))]);
    setDecodedIds([...new Set((saved.decodedPatterns || []).map(String))]);
  }, []);

  useEffect(() => {
    function onMessage(event) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      const payload = event.data;
      if (!payload || payload.type !== "hallium:hangul:progress") return;
      const next = payload.evidence && typeof payload.evidence === "object" ? payload.evidence : {};
      setEvidence(next);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function loadStarterWords() {
    const words = frameRef.current?.contentWindow?.HALLIUM_STARTER_WORDS;
    setStarterWords(Array.isArray(words) ? words.filter((word) => word?.id && word?.ko && word?.meaning) : []);
  }

  function continueNext() {
    if (progress.nextAction.kind === "beginner_lesson") {
      window.location.href = progress.nextAction.target;
      return;
    }
    frameRef.current?.contentWindow?.postMessage({
      type:"hallium:hangul:navigate",
      target:progress.nextAction.target,
    }, window.location.origin);
  }

  function startReadingRound() {
    if (progress.stage !== "words" && progress.stage !== "beginner_ready") return;
    const words = starterWords.slice(0, 8);
    const round = words.map((target, index) => ({
      target,
      options: readingOptions(words, target).sort((a, b) =>
        ((a.id.charCodeAt(0) + index) % 7) - ((b.id.charCodeAt(0) + index) % 7)
      ),
    }));
    setReadingRound(round);
    setReadingIndex(0);
    setReadingScore(0);
    setReadingAnswered(false);
  }

  function answerReading(optionId) {
    if (readingAnswered) return;
    const row = readingRound[readingIndex];
    if (!row) return;
    const correct = optionId === row.target.id;
    if (correct) {
      setReadingScore((value) => value + 1);
      setReadWordIds(saveReadWord(row.target.id));
    }
    setReadingAnswered(true);
  }

  function nextReadingWord() {
    if (readingIndex >= readingRound.length - 1) {
      setReadingRound([]);
      setReadingIndex(0);
      setReadingAnswered(false);
      return;
    }
    setReadingIndex((value) => value + 1);
    setReadingAnswered(false);
  }

  const stageLabel = {
    letters:"Letters",
    syllables:"Syllables",
    words:"First words",
    beginner_ready:"Beginner ready",
  }[progress.stage] || "Letters";

  const activeReading = readingRound[readingIndex] || null;
  const activeDecode = HANGUL_DECODING_ITEMS[decodeIndex] || null;
  const readingUnlocked = progress.stage === "words" || progress.stage === "beginner_ready";

  function answerDecode(value) {
    if (!activeDecode || decodeAnswered) return;
    if (value === activeDecode.heard) {
      const current = readHangulState();
      const decodedPatterns = [...new Set([...(current.decodedPatterns || []).map(String), activeDecode.id])];
      localStorage.setItem(HANGUL_STORAGE_KEY, JSON.stringify({ ...current, decodedPatterns }));
      setDecodedIds(decodedPatterns);
    }
    setDecodeAnswered(true);
  }

  function nextDecode() {
    setDecodeIndex((value) => (value + 1) % HANGUL_DECODING_ITEMS.length);
    setDecodeAnswered(false);
  }

  return (
    <>
      <section className={styles.progressBridge} aria-label="Hangul to Beginner progress">
        <div>
          <span>HANGUL → BEGINNER</span>
          <strong>{stageLabel}</strong>
          <small>{progress.readiness}% readiness</small>
        </div>
        <div className={styles.progressMetrics}>
          <span><b>{progress.counts.recognized}</b>/40 letters</span>
          <span><b>{progress.recentQuizAverage}</b>/10 quiz</span>
          <span><b>{progress.counts.syllableBuilds}</b> syllables</span>
          <span><b>{progress.counts.wordReads}</b> words</span>
        </div>
        <button type="button" onClick={continueNext}>{progress.nextAction.label} ↗</button>
      </section>

      <section className={styles.readingBridge} aria-label="First word reading bridge">
        <div>
          <span>FIRST WORD READING · NO ROMANIZATION</span>
          <strong>{readingUnlocked ? "Turn syllables into real words." : "Finish the syllable stage first."}</strong>
          <small>{Math.min(readWordIds.length, 8)} / 8 Starter words read correctly</small>
        </div>

        {!activeReading ? (
          <button type="button" disabled={!readingUnlocked || starterWords.length < 8} onClick={startReadingRound}>
            {readingUnlocked ? "Read 8 Starter words ↗" : "Reading locked"}
          </button>
        ) : (
          <div className={styles.readingRound}>
            <header>
              <span>WORD {String(readingIndex + 1).padStart(2, "0")} / 08</span>
              <span>{readingScore} correct</span>
            </header>
            <div className={styles.readingWord} lang="ko">{activeReading.target.ko}</div>
            <p>What does this word mean?</p>
            <div className={styles.readingAnswers}>
              {activeReading.options.map((option) => {
                const isCorrect = readingAnswered && option.id === activeReading.target.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={readingAnswered}
                    className={isCorrect ? styles.correctReading : ""}
                    onClick={() => answerReading(option.id)}
                  >
                    {option.meaning}
                  </button>
                );
              })}
            </div>
            {readingAnswered ? (
              <button type="button" className={styles.readingNext} onClick={nextReadingWord}>
                {readingIndex === readingRound.length - 1 ? "Finish round ↗" : "Next word →"}
              </button>
            ) : null}
          </div>
        )}
      </section>

      <section className={styles.decodingBridge} aria-label="Common Korean pronunciation patterns">
        <div>
          <span>REAL-WORD DECODING</span>
          <strong>Written Hangul does not always sound letter-by-letter.</strong>
          <small>{decodedIds.length} / {HANGUL_DECODING_ITEMS.length} patterns decoded correctly</small>
        </div>
        {activeDecode ? (
          <div className={styles.decodingCard}>
            <header><span>{activeDecode.rule}</span><b lang="ko">{activeDecode.word}</b></header>
            <p>Which form is closest to what you actually hear?</p>
            <div className={styles.decodingAnswers}>
              {decodingOptions(activeDecode).map((option) => (
                <button key={option} type="button" disabled={decodeAnswered} onClick={() => answerDecode(option)} lang="ko">{option}</button>
              ))}
            </div>
            {decodeAnswered ? <><small>{activeDecode.explanation}</small><button type="button" onClick={nextDecode}>Next pattern →</button></> : null}
          </div>
        ) : null}
      </section>

      <iframe
        ref={frameRef}
        className={styles.frame}
        title="Hallium's interactive Hangul learning and handwriting studio"
        src="/hangul-lab/index.html#learn"
        loading="eager"
        allow="autoplay"
        onLoad={loadStarterWords}
      />
    </>
  );
}
