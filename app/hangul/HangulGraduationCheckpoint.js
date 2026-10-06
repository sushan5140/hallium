"use client";

import { useEffect, useMemo, useState } from "react";
import { evaluateHangulProgress } from "../../lib/hangul-progression";
import { evaluateHangulGraduation } from "../../lib/hangul-graduation";
import styles from "./page.module.css";

const STORAGE_KEY = "hallium-hangul-lab-preview-v1";

function readState() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

export default function HangulGraduationCheckpoint() {
  const [state, setState] = useState({});

  useEffect(() => {
    const refresh = () => setState(readState());
    refresh();
    const timer = window.setInterval(refresh, 1200);
    window.addEventListener("storage", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const progress = useMemo(() => evaluateHangulProgress({
    ...state,
    syllableBuilds: Array.isArray(state.builtSyllables) ? state.builtSyllables.length : 0,
    wordReads: Array.isArray(state.readWords) ? new Set(state.readWords.map(String)).size : 0,
  }), [state]);

  const graduation = useMemo(() => evaluateHangulGraduation({
    progress,
    decodedPatterns: state.decodedPatterns || [],
  }), [progress, state]);

  return (
    <section className={styles.graduationBridge} aria-label="Hangul graduation checkpoint">
      <div className={styles.graduationHead}>
        <div>
          <span>FINAL HANGUL CHECKPOINT</span>
          <strong>{graduation.complete ? "Ready for Beginner." : "Finish the bridge before moving on."}</strong>
          <small>{graduation.passedCount} / {graduation.total} checks complete</small>
        </div>
        <button
          type="button"
          disabled={!graduation.complete}
          onClick={() => {
            if (graduation.complete) window.location.href = graduation.nextAction.target;
          }}
        >
          {graduation.complete ? "Start Beginner Lesson 1 ↗" : "Beginner locked"}
        </button>
      </div>

      <div className={styles.graduationGrid}>
        {graduation.checks.map((check) => (
          <article key={check.id} className={check.passed ? styles.graduationPassed : ""}>
            <span>{check.passed ? "✓" : "○"}</span>
            <div>
              <strong>{check.label}</strong>
              <small>{check.detail}</small>
            </div>
            <b>{check.value}</b>
          </article>
        ))}
      </div>
    </section>
  );
}
