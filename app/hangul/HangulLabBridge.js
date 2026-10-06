"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { evaluateHangulProgress } from "../../lib/hangul-progression";
import styles from "./page.module.css";

export default function HangulLabBridge() {
  const frameRef = useRef(null);
  const [evidence, setEvidence] = useState({});
  const progress = useMemo(() => evaluateHangulProgress(evidence), [evidence]);

  useEffect(() => {
    function onMessage(event) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      const payload = event.data;
      if (!payload || payload.type !== "hallium:hangul:progress") return;
      setEvidence(payload.evidence && typeof payload.evidence === "object" ? payload.evidence : {});
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

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

  const stageLabel = {
    letters:"Letters",
    syllables:"Syllables",
    words:"First words",
    beginner_ready:"Beginner ready",
  }[progress.stage] || "Letters";

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
      <iframe
        ref={frameRef}
        className={styles.frame}
        title="Hallium's interactive Hangul learning and handwriting studio"
        src="/hangul-lab/index.html#learn"
        loading="eager"
        allow="autoplay"
      />
    </>
  );
}
