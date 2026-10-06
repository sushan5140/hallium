"use client";

import styles from "./page.module.css";

export default function HangulGraduationCheckpoint({ graduation }) {
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
