"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getHallimSupabase } from "../../../lib/supabase/client";
import { AI_GUIDES, getAiGuide } from "../../../lib/ai-twins/guides.mjs";
import "./guides.css";

const TABLE = "hallium_ai_guide_turns";

export default function AiGuideDistrict() {
  const sb = useMemo(() => getHallimSupabase(), []);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState("loading");
  const [guideId, setGuideId] = useState("nari");
  const [turns, setTurns] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const bottom = useRef(null);
  const guide = getAiGuide(guideId) || AI_GUIDES[0];

  const load = useCallback(async (uid, id) => {
    setLoading(true); setError("");
    const { data, error: e } = await sb.from(TABLE)
      .select("id,guide_id,user_message,assistant_message,created_at")
      .eq("user_id", uid).eq("guide_id", id)
      .order("created_at", { ascending: false }).limit(40);
    if (e) setError("Couldn't load this private chat: " + e.message);
    else setTurns([...(data || [])].reverse());
    setLoading(false);
  }, [sb]);

  useEffect(() => {
    let live = true;
    (async () => {
      const { data: { user: u }, error: e } = await sb.auth.getUser();
      if (!live) return;
      if (e) setError(e.message);
      setUser(u || null);
      if (u) {
        const {data: phaseData,error:phaseError}=await sb.rpc("hallium_twinverse_status");
        if (live) {
          setPhase(phaseError?"unavailable":phaseData?.mode||"unavailable");
          if(phaseError)setError("Could not verify the Twinverse phase. New AI lessons are paused.");
        }
        await load(u.id, guideId);
      } else {
        const {data: publicPhase,error:phaseError}=await sb.from("hallium_twinverse_phase")
          .select("mode").eq("id",1).maybeSingle();
        if(live){
          setPhase(phaseError?"unavailable":publicPhase?.mode||"unavailable");
          if(phaseError)setError("Could not load Twinverse availability.");
        }
      }
      if (live) setReady(true);
    })();
    return () => { live = false; };
  }, [sb, load]); // Keep auth tied to current user; choosing a guide loads separately.

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [turns.length, busy]);

  async function choose(id) {
    if (busy || id === guideId) return;
    setGuideId(id); setDraft(""); setTurns([]); setError(""); setNotice("");
    if (user) await load(user.id, id);
  }

  async function send(value = draft) {
    const message = String(value || "").trim();
    if (!user) { setError("Sign in to start a private guide conversation."); return; }
    if (phase !== "seed") { setError("The AI starter district has retired. Existing lessons can still be read or deleted."); return; }
    if (!message || busy) return;
    if (message.length > 750) { setError("Keep your message under 750 characters."); return; }
    setBusy("send"); setError(""); setNotice("");
    try {
      const response = await fetch("/api/ai-twins/guides/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId, message })
      });
      const json = await response.json();
      if (!response.ok) {
        if(response.status===410)setPhase("human");
        throw new Error(json.error || "The AI tutor couldn't respond.");
      }
      setTurns(old => [...old, json.turn]);
      setDraft("");
    } catch (e) {
      setError(e.message || "The AI tutor couldn't respond.");
    } finally {
      setBusy("");
    }
  }

  async function clearHistory() {
    if (!user || !turns.length || busy) return;
    if (!window.confirm("Delete your saved conversation with " + guide.name + "? This cannot be undone.")) return;
    setBusy("clear"); setError(""); setNotice("");
    try {
      const { error: e } = await sb.from(TABLE).delete()
        .eq("user_id", user.id).eq("guide_id", guide.id);
      if (e) throw e;
      setTurns([]);
      setNotice("Your chat with " + guide.name + " was deleted.");
    } catch (e) {
      setError(e.message || "Couldn't delete your conversation.");
    } finally {
      setBusy("");
    }
  }

  const retired = phase === "human";
  if(!ready || phase==="loading")return <main className="ag-page ag-page-loading">Checking the Twinverse chapter…</main>;
  if(!user && retired)return <main className="ag-page"><div className="ag-shell">
    <header className="ag-header"><a href="/ai-twins" className="ag-brand"><span className="ag-brand-symbol">ㅎ</span> hallium / Twinverse</a></header>
    <section className="ag-retired-guest"><span className="ag-eyebrow">CHAPTER 02 · REAL PEOPLE</span>
      <h1>The first 12 humans are here. ♡</h1><p>Our clearly labeled AI starter cast has retired. The original Twinverse now helps real opted-in learners find each other and create shared Korean practice.</p>
      <a href="/ai-twins" className="ag-send ag-login">Explore the human Twinverse ↗</a></section>
  </div></main>;
  return <main className="ag-page">
    <div className="ag-shell">
      <header className="ag-header">
        <a href="/ai-twins" className="ag-brand"><span className="ag-brand-symbol">ㅎ</span> hallium <span className="ag-brand-slash">/</span> AI guide district</a>
        <span className="ag-pill">{retired?"✳ ARCHIVED AI STARTER CAST":"✳ 12 FICTIONAL AI TEACHERS"}</span>
        <a href="/ai-twins" className="ag-back">← Twinverse</a>
      </header>

      <section className="ag-hero">
        <div className="ag-hero-copy">
          <p className="ag-eyebrow">{retired?"CHAPTER 02 · THE REAL HUMAN TWINVERSE IS OPEN":"YOUR LEARNING UNIVERSE DOESN'T NEED AN EMPTY LOBBY."}</p>
          <h1>{retired?<>Our AI guides<br /><em>did their job. ♡</em></>:<>Meet your new<br /><em>Korean sidekicks.</em></>}</h1>
          <p>{retired?"Twelve real learners have now opted in. The 12 fictional AI guides are retired, but you can still read or delete your previously saved private lessons. Explore real study partners next.":"Twelve different personalities. Twelve different ways to learn. Pick an AI character, start an actual conversation, and turn your awkward Korean moments into side quests."}</p>
          <div className="ag-herotags">{retired?<><span>READ-ONLY CHAT ARCHIVE</span><span>NO NEW AI REPLIES</span><span>REAL LEARNERS NOW LEAD</span></>:<><span>REAL AI REPLIES</span><span>YOUR OWN PRIVATE CHATS</span><span>NO FAKE HUMAN ACCOUNTS</span></>}</div>
        </div>
        <div className="ag-hero-art" aria-hidden="true"><span>ㅎ</span><i>✦</i><b>안녕!</b><em>♡</em></div>
      </section>

      {(error || notice) && <div className={"ag-alert " + (error ? "ag-alert-error" : "")} role={error ? "alert" : "status"}>
        <span>{error || notice}</span><button type="button" aria-label="Dismiss" onClick={() => { setError(""); setNotice(""); }}>×</button>
      </div>}

      <div className="ag-layout">
        <aside className="ag-catalog">
          <div className="ag-panel-title"><p>{retired?"PAST AI TEACHERS · READ-ONLY":"CHOOSE A CHARACTER"}</p><h2>{retired?"Your guide archive":"The starting lineup"} <span>12</span></h2></div>
          <div className="ag-guide-list">
            {AI_GUIDES.map(person => <button key={person.id} type="button"
              className={"ag-guide-card ag-" + person.color + (guideId === person.id ? " selected" : "")}
              disabled={Boolean(busy)} onClick={() => choose(person.id)}
              aria-pressed={guideId === person.id}>
              <span className="ag-avatar" aria-hidden="true">{person.emoji}</span>
              <span className="ag-card-copy"><strong>{person.name} <span className="ag-ai-badge">AI</span></strong><small>{person.title}</small><em>{person.specialty}</em></span>
              <span className="ag-arrow" aria-hidden="true">↗</span>
            </button>)}
          </div>
          <p className="ag-disclosure">{retired?"These were clearly labeled fictional AI guides, not human users. Their teaching chats are now read-only; nothing was deleted automatically.":"Every character here is an artificial teaching persona—not a real member or a fake community account. Real learners appear separately in Twinverse."}</p>
        </aside>

        <section className="ag-chat" aria-label={"Conversation with AI guide " + guide.name}>
          <div className={"ag-chat-head ag-" + guide.color}>
            <span className="ag-avatar ag-avatar-large" aria-hidden="true">{guide.emoji}</span>
            <div className="ag-chat-identity"><small>✳ VERIFIED FICTIONAL AI GUIDE</small><h2>{guide.name}</h2><p>{guide.title} <span>·</span> {guide.level}</p></div>
            <span className="ag-role">AI / NOT HUMAN</span>
          </div>
          <div className="ag-chat-body">
            {!retired?<div className="ag-intro-card">
              <div className="ag-intro-sigil">{guide.emoji}</div>
              <span className="ag-eyebrow">MEET {guide.name.toUpperCase()}</span>
              <h3>{guide.vibe}</h3>
              <p>Specialty: {guide.specialty}. You can steer the lesson, ask questions or begin one of the prompts below.</p>
              <div className="ag-starters">{guide.starts.map(start => <button key={start}
                type="button" disabled={Boolean(busy)} onClick={() => { setDraft(start); setError(""); }}>
                ✦ {start}
              </button>)}</div>
            </div>

            :<div className="ag-retired-note"><strong>♡ The human Twinverse is open.</strong><p>The AI starter cast has retired. You can revisit or delete past lessons here, but new AI teaching sessions are closed.</p><a href="/ai-twins">Meet real learners ↗</a></div>}
            {!ready || loading ? <p className="ag-status">Opening your classroom…</p> : !user ?
              <div className="ag-signin"><strong>Sign in to teach your tutor who you are.</strong><p>Your lessons are private and saved to your own Hallium account. You don't need to enable human matchmaking.</p><a className="ag-send ag-login" href="/auth/google?next=%2Fai-twins%2Fguides">Continue with Google ↗</a></div> : null}

            {turns.map(row => <div key={row.id} className="ag-exchange">
              <div className="ag-bubble ag-user"><small>YOU</small><p>{row.user_message}</p></div>
              <div className="ag-bubble ag-tutor"><small>{guide.emoji} {guide.name.toUpperCase()} · AI</small><p>{row.assistant_message}</p></div>
            </div>)}
            {busy === "send" && <div className="ag-thinking" role="status"><span className="ag-loader" /> {guide.name} is crafting your next Korean sidequest…</div>}
            <div ref={bottom} />
          </div>
          <div className="ag-composer">
            <div className="ag-composer-top"><span>{retired?"READ-ONLY PRIVATE CHAT ARCHIVE":"PRIVATE ONE-ON-ONE AI LESSON"}</span>
              <button disabled={!user || !turns.length || Boolean(busy)} type="button" onClick={clearHistory}>
                {busy === "clear" ? "Deleting…" : "Clear this chat"}
              </button></div>
            {!retired&&<form onSubmit={e => { e.preventDefault(); send(); }}>
              <textarea aria-label={"Message " + guide.name} value={draft} maxLength={750}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}
                disabled={!user || Boolean(busy)} rows={2} placeholder={user ? "Say something in Korean… or ask in English!" : "Sign in with Google to start talking…"} />
              <button className="ag-send" type="submit" disabled={!user || Boolean(busy) || !draft.trim()}>
                {busy === "send" ? "Thinking…" : "Send ↗"}</button>
            </form>}
            <p>{retired?"No more AI messages are generated. Your past private history remains available until you clear it.":"AI-generated teaching can make mistakes. Chat text is sent to Hallium's AI provider and saved privately until you clear it. 40 replies / 24 hours during this pilot."}</p>
          </div>
        </section>
      </div>
      <footer className="ag-footer"><span>HALLIUM AI GUIDE DISTRICT · NOT A SIMULATED HUMAN COMMUNITY</span><a href="/ai-twins">Explore real learners & their opted-in twins ↗</a></footer>
    </div>
  </main>;
}
