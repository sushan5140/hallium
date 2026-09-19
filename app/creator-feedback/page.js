"use client";

import { useEffect, useState } from "react";
import { getHallimSupabase } from "../../lib/supabase/client";

export default function CreatorFeedbackPage() {
  const [token,setToken] = useState("");
  const [score,setScore] = useState(7);
  const [confusing,setConfusing] = useState("");
  const [weakest,setWeakest] = useState("");
  const [blocker,setBlocker] = useState("");
  const [improvement,setImprovement] = useState("");
  const [busy,setBusy] = useState(false);
  const [submitted,setSubmitted] = useState(false);
  const [error,setError] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") || "";
    setToken(value);
  }, []);

  async function submit() {
    if (!token) {
      setError("This feedback link is missing its token.");
      return;
    }
    setBusy(true); setError("");
    const supabase = getHallimSupabase();
    const { error } = await supabase.from("ambassador_feedback").insert({
      token,
      recommend_score: Number(score),
      confusing_parts: confusing || null,
      weakest_part: weakest || null,
      recommendation_blocker: blocker || null,
      biggest_improvement: improvement || null,
    });
    if (error) setError(error.message); else setSubmitted(true);
    setBusy(false);
  }

  if (submitted) {
    return (
      <main className="feedbackPage">
        <section className="feedbackCard done">
          <span className="eyebrow">Hallim creator feedback</span>
          <h1>Thank you. That is exactly what this pilot needs.</h1>
          <p>Your feedback was attached privately to the Hallim testing pilot. The link cannot be reused.</p>
          <a href="/demo">Return to Hallim demo →</a>
        </section>
      </main>
    );
  }

  return (
    <main className="feedbackPage">
      <section className="feedbackCard">
        <span className="eyebrow">Hallim founding pilot</span>
        <h1>Tell us what would stop you from recommending Hallim.</h1>
        <p>We care more about blockers and confusion than compliments. Your response is private to the Hallim pilot team.</p>

        <label className="feedbackScore">
          <span>How likely would you be to recommend Hallim after testing it?</span>
          <div><input type="range" min="0" max="10" value={score} onChange={(e)=>setScore(e.target.value)} /><b>{score}/10</b></div>
        </label>

        <label><span>What confused you?</span><textarea value={confusing} onChange={(e)=>setConfusing(e.target.value)} placeholder="Anything unclear in the product, learning flow, terminology, or navigation…" /></label>
        <label><span>What felt weakest?</span><textarea value={weakest} onChange={(e)=>setWeakest(e.target.value)} placeholder="The part you trusted least or would not want to show your audience…" /></label>
        <label><span>What would stop you from recommending it?</span><textarea value={blocker} onChange={(e)=>setBlocker(e.target.value)} placeholder="One blocker is more valuable than ten compliments." /></label>
        <label><span>What single improvement would matter most?</span><textarea value={improvement} onChange={(e)=>setImprovement(e.target.value)} placeholder="If we fixed one thing before launch, what should it be?" /></label>

        {error && <div className="feedbackError">{error}</div>}
        <button className="publicPrimary feedbackSubmit" disabled={busy || !token} onClick={submit}>{busy ? "Submitting…" : "Submit private feedback"}</button>
        {!token && <small className="feedbackMissing">This page needs the one-time feedback link provided by Hallim.</small>}
      </section>
    </main>
  );
}
