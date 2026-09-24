"use client";

import { useMemo, useState } from "react";
import { createPracticePlan, DEMO_TWINS, LEVELS, rankTwins, scriptedMeetup, SKILLS, SLOTS } from "../../../lib/ai-twins/demo.mjs";
import "./twins.css";

const title = s => s.charAt(0).toUpperCase() + s.slice(1);
const initial = s => (s || "?").slice(0, 1).toUpperCase();

function Avatar({ name, color = "you", big = false }) {
  return <span className={"tw-avatar tw-" + color + (big ? " tw-avatar-big" : "")} aria-hidden="true">{initial(name)}<i>✦</i></span>;
}

function Signal({ label, value }) {
  return <div className="tw-signal"><span>{label}</span><strong>{title(value)}</strong></div>;
}

export default function AiTwinsResearchPage() {
  const [me, setMe] = useState({
    id: "local-demo-you", name: "You", level: "beginner",
    strength: "vocabulary", growth: "grammar", slot: "Evening", consent: false
  });
  const [launched, setLaunched] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [approved, setApproved] = useState(false);
  const [notice, setNotice] = useState("");
  const ranked = useMemo(() => rankTwins(me, DEMO_TWINS), [me]);
  const selected = ranked.find(candidate => candidate.other.id === selectedId) || ranked[0] || null;
  const plan = selected ? createPracticePlan(me, selected) : null;
  const dialogue = selected ? scriptedMeetup(me, selected) : [];

  function change(key, value) {
    setMe(current => ({ ...current, [key]: value }));
    setLaunched(false);
    setSelectedId("");
    setApproved(false);
    setNotice("");
  }

  function launch() {
    if (!me.consent) {
      setNotice("Opt in to this local simulation before creating your twin.");
      return;
    }
    if (me.strength === me.growth) {
      setNotice("Choose different strengths and growth areas to test the skill swap.");
      return;
    }
    if (!me.name.trim()) {
      setNotice("Give your demo twin a name first.");
      return;
    }
    setNotice("");
    setSelectedId(ranked[0]?.other.id || "");
    setLaunched(true);
    setApproved(false);
  }

  return <main className="tw-page">
    <div className="tw-noise" aria-hidden="true" />
    <div className="tw-frame">
      <header className="tw-topbar">
        <a className="tw-brand" href="/study-partners"><span className="tw-brand-mark">ㅎ</span><span>hallium <b>/</b> research room</span></a>
        <span className="tw-beta"><span className="tw-pulse" /> PRIVATE EXPERIMENT · V0</span>
        <a className="tw-back" href="/study-partners">← Study Partners</a>
      </header>

      <section className="tw-hero">
        <div className="tw-eyebrow"><span>✳</span> FROM YOUR KOREAN LEARNING UNIVERSE</div>
        <h1>What if your <em>AI twin</em><br />made the first move?</h1>
        <p>Your learning profile gets a fictional digital alter ego. It meets other demo twins, finds a two-way skill swap, and pitches a Korean challenge. <strong>You</strong> make the final call.</p>
        <div className="tw-hero-foot"><span>01 / DESIGN YOUR TWIN</span><span>02 / LET THEM MEET</span><span>03 / APPROVE THE PLAN</span></div>
        <div className="tw-orbit" aria-hidden="true"><span className="tw-orbit-a">ㅎ</span><span className="tw-orbit-b">✳</span><span className="tw-orbit-c">♡</span><span className="tw-orbit-d">가</span></div>
      </section>

      <div className="tw-layout">
        <section className="tw-builder" aria-labelledby="tw-build-title">
          <div className="tw-section-head"><span className="tw-step">01</span><div><span className="tw-kicker">THE ORIGIN STORY</span><h2 id="tw-build-title">Create your twin</h2></div></div>
          <div className="tw-self"><Avatar name={me.name} big /><div><small>YOUR LOCAL DEMO ALTER EGO</small><strong>{me.name.trim() || "Your twin"}<span> ✳</span></strong><p>Not a real account. Your answers stay in this browser session.</p></div></div>
          <label className="tw-label">Give your twin a name<input maxLength={24} value={me.name} onChange={e => change("name", e.target.value)} placeholder="Your nickname" autoComplete="off" /></label>
          <label className="tw-label">Korean level<select value={me.level} onChange={e => change("level", e.target.value)}>{LEVELS.map(level => <option key={level} value={level}>{title(level)}</option>)}</select></label>
          <div className="tw-two"><label className="tw-label">Your superpower<select value={me.strength} onChange={e => change("strength", e.target.value)}>{SKILLS.map(skill => <option key={skill}>{skill}</option>)}</select></label><label className="tw-label">Your plot twist<select value={me.growth} onChange={e => change("growth", e.target.value)}>{SKILLS.map(skill => <option key={skill}>{skill}</option>)}</select></label></div>
          <label className="tw-label">When you can practise<select value={me.slot} onChange={e => change("slot", e.target.value)}>{SLOTS.map(slot => <option key={slot}>{slot}</option>)}</select></label>
          <label className="tw-optin"><input type="checkbox" checked={me.consent} onChange={e => change("consent", e.target.checked)} /><span><b>Let my twin join this fictional meetup</b><small>No real user discovery, messages, external API calls, or saved personal profiles. This is an explicitly opt-in local simulation.</small></span></label>
          {notice && <p className="tw-warning" role="alert">{notice}</p>}
          <button className="tw-primary" onClick={launch}>Send my twin into the room <span>↗</span></button>
          <p className="tw-fine">You can change your answers and rerun the experiment any time.</p>
        </section>

        <section className="tw-stage" aria-live="polite">
          {!launched ? <div className="tw-prelaunch">
            <div className="tw-section-head"><span className="tw-step">02</span><div><span className="tw-kicker">THE FIRST ENCOUNTER</span><h2>Somewhere in the twin-verse…</h2></div></div>
            <div className="tw-empty-art" aria-hidden="true"><div className="tw-portal"><span>ㅎ</span><span>✦</span></div><span className="tw-bubble one">안녕!</span><span className="tw-bubble two">you there?</span></div>
            <h3>The other twins are here.</h3><p>Choose your strengths, opt in, and see which fictional learner complements your growth areas. No awkward first DM required.</p>
            <div className="tw-minis">{DEMO_TWINS.map(t => <span key={t.id}><Avatar name={t.name} color={t.color} />{t.name}</span>)}</div>
          </div> : <>
            <div className="tw-section-head tw-stage-title"><span className="tw-step">02</span><div><span className="tw-kicker">THE FIRST ENCOUNTER</span><h2>It's a match? Let's investigate.</h2></div></div>
            <p className="tw-stage-intro">These are <strong>four fictional personas</strong>. Choose a twin to see why the deterministic matcher suggested them.</p>
            <div className="tw-candidates">{ranked.map(match => <button className={"tw-candidate" + (selected?.other.id === match.other.id ? " active" : "")} key={match.other.id} onClick={() => {setSelectedId(match.other.id);setApproved(false);}}>
              <Avatar name={match.other.name} color={match.other.color} />
              <span className="tw-candidate-copy"><strong>{match.other.name}</strong><small>{match.other.vibe}</small></span>
              <span className="tw-percent">{match.score}<small>/100*</small></span>
            </button>)}</div>
            {selected && <div className="tw-selected">
              <div className="tw-selected-top"><div><span className="tw-kicker">YOUR SELECTED CO-STAR</span><h3>{selected.other.name}'s twin <span>✳</span></h3></div><span className="tw-tag">{selected.mutual ? "TWO-WAY SKILL SWAP" : "PRACTICE POTENTIAL"}</span></div>
              <p className="tw-quote">“{selected.other.intro}”</p>
              <div className="tw-signals"><Signal label="Gives" value={selected.other.strength} /><Signal label="Growing in" value={selected.other.growth} /><Signal label="Study time" value={selected.other.slot} /></div>
              <div className="tw-why"><strong>Why your twins connected</strong>{selected.reasons.map(reason => <p key={reason}><span>✦</span>{reason}</p>)}</div>
              <p className="tw-disclaimer">*Match score is a transparent rule-based demo heuristic—not an AI prediction, validated compatibility metric, or measured learning outcome.</p>
            </div>}
            {selected && <div className="tw-transcript"><div className="tw-transcript-head"><strong>↔ The twins' first conversation</strong><span>SIMULATED · SCRIPTED</span></div>
              {dialogue.map((line,i) => <div className={"tw-line " + (i % 2 ? "partner" : "own")} key={i}><small>{line.speaker}</small><p>{line.text}</p></div>)}
            </div>}
          </>}
        </section>
      </div>

      {launched && plan && <section className="tw-approval">
        <div className="tw-approval-copy"><span className="tw-kicker">03 / HUMAN-IN-THE-LOOP</span><h2>Your twins made plans.<br /><em>Do you approve?</em></h2><p>Nothing is sent to another person. In a future live version, both learners would need to accept before a room or shared activity opens.</p></div>
        <div className="tw-plan"><span className="tw-tag">{plan.label}</span><h3>15 minutes. Two humans. One Korean glow-up.</h3><ol>{plan.agenda.map((task,i)=><li key={task}><span>0{i+1}</span>{task}</li>)}</ol><div className="tw-korean" lang="ko">{plan.prompts.map(line=><p key={line}>{line}</p>)}</div>
        <button className={"tw-primary " + (approved ? "tw-approved" : "")} onClick={() => setApproved(true)} disabled={approved}>{approved ? "Approved locally ✓" : "Approve this practice plan ↗"}</button>
        {approved && <p className="tw-confirm" role="status">Demo approved! No connection request was sent. Next research milestone: mutually authorized live matching and an outcome study.</p>}</div>
      </section>}

      <footer className="tw-footer"><span>HALLIUM RESEARCH ROOM / AI DOPPELGÄNGER</span><span>NO REAL USER DATA · NO MODEL CALLS · NO PRODUCTION CHANGES</span></footer>
    </div>
  </main>;
}
