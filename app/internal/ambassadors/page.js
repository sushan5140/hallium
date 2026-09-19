"use client";

import { useEffect, useMemo, useState } from "react";
import { getHallimSupabase } from "../../../lib/supabase/client";

const movableStages = ["shortlisted","invited","testing","active","declined"];

export default function AmbassadorAdminPage() {
  const [loading,setLoading] = useState(true);
  const [authorized,setAuthorized] = useState(false);
  const [user,setUser] = useState(null);
  const [dashboard,setDashboard] = useState({ totals:{}, pilots:[] });
  const [error,setError] = useState("");
  const [busy,setBusy] = useState("");
  const [creatorName,setCreatorName] = useState("");
  const [platform,setPlatform] = useState("");
  const [handle,setHandle] = useState("");
  const [contact,setContact] = useState("");
  const [codeDrafts,setCodeDrafts] = useState({});
  const [feedbackLinks,setFeedbackLinks] = useState({});

  const totals = dashboard?.totals || {};
  const pilots = dashboard?.pilots || [];

  async function loadDashboard() {
    const supabase = getHallimSupabase();
    setError("");
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user || null;
    setUser(currentUser);

    if (!currentUser) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    const { data: adminData, error: adminError } = await supabase.rpc("is_hallim_admin");
    if (adminError || !adminData) {
      setAuthorized(false);
      setLoading(false);
      if (adminError) setError(adminError.message);
      return;
    }

    setAuthorized(true);
    const { data, error: dashError } = await supabase.rpc("admin_ambassador_dashboard");
    if (dashError) {
      setError(dashError.message);
    } else if (data) {
      setDashboard(data);
    }
    setLoading(false);
  }

  useEffect(() => { loadDashboard(); }, []);

  async function createPilot() {
    if (!creatorName.trim() || !platform.trim()) return;
    setBusy("create");
    setError("");
    const supabase = getHallimSupabase();
    const { error } = await supabase.rpc("admin_create_pilot", {
      p_creator_name: creatorName.trim(),
      p_platform: platform.trim(),
      p_handle: handle.trim() || null,
      p_contact_channel: contact.trim() || null,
    });
    if (error) setError(error.message);
    else {
      setCreatorName(""); setPlatform(""); setHandle(""); setContact("");
      await loadDashboard();
    }
    setBusy("");
  }

  async function setStage(id, stage) {
    setBusy(id + stage);
    const supabase = getHallimSupabase();
    const { error } = await supabase.rpc("admin_set_pilot_stage", { p_pilot_id:id, p_stage:stage });
    if (error) setError(error.message); else await loadDashboard();
    setBusy("");
  }

  async function approvePilot(id) {
    const code = (codeDrafts[id] || "").trim();
    if (!/^[A-Za-z0-9_-]{2,48}$/.test(code)) {
      setError("Use a 2–48 character referral code with letters, numbers, _ or -.");
      return;
    }
    setBusy(id + "approve");
    const supabase = getHallimSupabase();
    const { error } = await supabase.rpc("admin_approve_pilot", { p_pilot_id:id, p_code:code });
    if (error) setError(error.message); else await loadDashboard();
    setBusy("");
  }

  async function pausePilot(id) {
    setBusy(id + "pause");
    const supabase = getHallimSupabase();
    const { error } = await supabase.rpc("admin_pause_pilot", { p_pilot_id:id });
    if (error) setError(error.message); else await loadDashboard();
    setBusy("");
  }

  async function createFeedbackLink(id) {
    setBusy(id + "feedback");
    const supabase = getHallimSupabase();
    const { data, error } = await supabase.rpc("admin_feedback_link", { p_pilot_id:id });
    if (error) {
      setError(error.message);
    } else if (data) {
      const url = window.location.origin + "/creator-feedback?token=" + data;
      setFeedbackLinks((current) => ({...current,[id]:url}));
      try { await navigator.clipboard.writeText(url); } catch {}
    }
    setBusy("");
  }

  if (loading) {
    return <main className="internalPage"><section className="internalGate"><span className="eyebrow">Hallim Internal</span><h1>Checking access…</h1></section></main>;
  }

  if (!user) {
    return (
      <main className="internalPage">
        <section className="internalGate">
          <span className="eyebrow">Hallim Internal</span>
          <h1>Sign in to Hallim first.</h1>
          <p>The ambassador console uses your normal Hallim session, then checks a separate admin allowlist.</p>
          <a href="/">Open Hallim →</a>
        </section>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="internalPage">
        <section className="internalGate">
          <span className="eyebrow">Hallim Internal</span>
          <h1>Admin access has not been granted.</h1>
          <p>Your account is signed in, but Hallim does not automatically make users administrators. This account must be explicitly added to the private admin allowlist.</p>
          <small>{user.email}</small>
          {error && <div className="internalError">{error}</div>}
        </section>
      </main>
    );
  }

  return (
    <main className="internalPage">
      <header className="internalTopbar">
        <div><span className="eyebrow">Hallim Internal</span><h1>Founding Ambassador Pilot</h1></div>
        <div><small>{user.email}</small><button onClick={loadDashboard}>Refresh</button></div>
      </header>

      {error && <div className="internalError">{error}</div>}

      <section className="internalMetrics">
        <article><small>Pilots</small><b>{totals.pilots || 0}</b></article>
        <article><small>Referral visits</small><b>{totals.visits || 0}</b></article>
        <article><small>Signups</small><b>{totals.signups || 0}</b></article>
        <article><small>Activated</small><b>{totals.activated || 0}</b></article>
        <article><small>Reached test</small><b>{totals.tested || 0}</b></article>
        <article><small>Weakness review</small><b>{totals.weakness_reviewed || 0}</b></article>
        <article><small>Returned later</small><b>{totals.returned_next_day || 0}</b></article>
      </section>

      <section className="internalCreate">
        <div><span className="eyebrow">Add real shortlist</span><h2>Create a pilot only after intentionally selecting the creator.</h2></div>
        <div className="internalCreateFields">
          <input placeholder="Creator name" value={creatorName} onChange={(e)=>setCreatorName(e.target.value)} />
          <input placeholder="Platform" value={platform} onChange={(e)=>setPlatform(e.target.value)} />
          <input placeholder="@handle (optional)" value={handle} onChange={(e)=>setHandle(e.target.value)} />
          <input placeholder="Contact channel (optional)" value={contact} onChange={(e)=>setContact(e.target.value)} />
          <button disabled={busy==="create" || !creatorName.trim() || !platform.trim()} onClick={createPilot}>{busy==="create" ? "Adding…" : "Add to shortlist"}</button>
        </div>
      </section>

      <section className="internalPilots">
        <div className="internalSectionHead"><span className="eyebrow">Pilot cohort</span><h2>{pilots.length ? pilots.length + " real creator" + (pilots.length===1?"":"s") : "No creators added yet."}</h2></div>

        {pilots.map((pilot) => (
          <article className="pilotAdminCard" key={pilot.id}>
            <div className="pilotAdminIdentity">
              <div><small>{pilot.platform}</small><h3>{pilot.creator_name}</h3><p>{pilot.handle || "No handle saved"}{pilot.contact_channel ? " · " + pilot.contact_channel : ""}</p></div>
              <span className={"pilotStage " + pilot.stage}>{pilot.stage}</span>
            </div>

            <div className="pilotFunnel">
              <span><b>{pilot.visits || 0}</b><small>visits</small></span>
              <i>→</i>
              <span><b>{pilot.signups || 0}</b><small>signups</small></span>
              <i>→</i>
              <span><b>{pilot.activated || 0}</b><small>activated</small></span>
              <i>→</i>
              <span><b>{pilot.tested || 0}</b><small>tested</small></span>
              <i>→</i>
              <span><b>{pilot.weakness_reviewed || 0}</b><small>reviewed</small></span>
              <i>→</i>
              <span><b>{pilot.returned_next_day || 0}</b><small>returned</small></span>
            </div>

            <div className="pilotAdminActions">
              <select value="" disabled={!!busy} onChange={(e)=>{ if(e.target.value) setStage(pilot.id,e.target.value); }}>
                <option value="">Move stage…</option>
                {movableStages.filter((stage)=>stage !== pilot.stage).map((stage)=><option key={stage} value={stage}>{stage}</option>)}
              </select>

              {!pilot.ambassador_code ? (
                <div className="pilotCodeIssue">
                  <input placeholder="Referral code" value={codeDrafts[pilot.id] || ""} onChange={(e)=>setCodeDrafts((current)=>({...current,[pilot.id]:e.target.value}))} />
                  <button disabled={!!busy} onClick={()=>approvePilot(pilot.id)}>Approve + issue code</button>
                </div>
              ) : (
                <div className="pilotActiveCode">
                  <small>Referral code</small>
                  <b>{pilot.ambassador_code}</b>
                  {pilot.stage === "paused"
                    ? <button disabled={!!busy} onClick={()=>setStage(pilot.id,"active")}>Reactivate</button>
                    : <button disabled={!!busy} onClick={()=>pausePilot(pilot.id)}>Pause code</button>}
                </div>
              )}

              <button className="feedbackLinkButton" disabled={!!busy} onClick={()=>createFeedbackLink(pilot.id)}>
                {busy===pilot.id+"feedback" ? "Creating…" : "Create feedback link"}
              </button>
            </div>

            {feedbackLinks[pilot.id] && <div className="pilotFeedbackLink"><b>Copied feedback link</b><span>{feedbackLinks[pilot.id]}</span></div>}

            {Array.isArray(pilot.feedback) && pilot.feedback.length > 0 && (
              <div className="pilotFeedbackSummary">
                <small>Latest feedback</small>
                <b>{pilot.feedback[pilot.feedback.length-1]?.recommend_score}/10 recommendation score</b>
                <p>{pilot.feedback[pilot.feedback.length-1]?.recommendation_blocker || pilot.feedback[pilot.feedback.length-1]?.weakest_part || "No written blocker."}</p>
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
