"use client";

import { useEffect, useMemo, useState } from "react";
import "./studio.css";
import { calculateMatch, buildPractice, pairKey } from "../../lib/study-partners/demo.mjs";

const STORE = "hallium:study-partners-local-preview:v1";
const CATEGORIES = ["vocabulary", "grammar", "listening"];
const DEMO_PEOPLE = [
  { id: "susan", name: "Susan", initial: "S", level: "Beginner", availability: "Evenings · IST", tagline: "Building confident everyday sentences.", skills: { vocabulary: 86, grammar: 48, listening: 67 }, ready: true, accent: "lilac" },
  { id: "mina", name: "Mina", initial: "M", level: "Beginner", availability: "Evenings · IST", tagline: "I love working out how Korean sentences fit together.", skills: { vocabulary: 52, grammar: 89, listening: 70 }, ready: true, accent: "peach" },
  { id: "noor", name: "Noor", initial: "N", level: "Beginner", availability: "Weekends · PKT", tagline: "Grammar makes sense; word recall takes practice.", skills: { vocabulary: 58, grammar: 80, listening: 48 }, ready: true, accent: "mint" },
  { id: "jiho", name: "Jiho", initial: "J", level: "Elementary", availability: "Weekends · KST", tagline: "Enjoys reading Korean and practising pronunciation.", skills: { vocabulary: 76, grammar: 74, listening: 83 }, ready: true, accent: "sky" },
];
const SEED_NOTES = [
  { id: "s1", userId: "susan", kind: "vocabulary", title: "학교", meaning: "school", example: "학교에 가요.", collection: "Everyday vocabulary" },
  { id: "s2", userId: "susan", kind: "vocabulary", title: "친구", meaning: "friend", example: "친구를 만나요.", collection: "Everyday vocabulary" },
  { id: "s3", userId: "susan", kind: "vocabulary", title: "도서관", meaning: "library", example: "도서관에서 공부해요.", collection: "Places & people" },
  { id: "s4", userId: "susan", kind: "vocabulary", title: "공부하다", meaning: "to study", example: "저는 한국어를 공부해요.", collection: "Everyday vocabulary" },
  { id: "m1", userId: "mina", kind: "grammar", title: "하고", meaning: "with / and (nouns)", example: "친구하고 학교에 가요.", collection: "Core grammar" },
  { id: "m2", userId: "mina", kind: "grammar", title: "에서", meaning: "place where an action happens", example: "도서관에서 공부해요.", collection: "Core grammar" },
  { id: "m3", userId: "mina", kind: "grammar", title: "-아요 / -어요", meaning: "polite present-tense ending", example: "한국어를 공부해요.", collection: "Verb endings" },
  { id: "n1", userId: "noor", kind: "grammar", title: "에", meaning: "destination / time marker", example: "학교에 가요.", collection: "Particles" },
  { id: "n2", userId: "noor", kind: "grammar", title: "은 / 는", meaning: "topic particle", example: "저는 학생이에요.", collection: "Particles" },
  { id: "j1", userId: "jiho", kind: "listening", title: "어떻게 지내요?", meaning: "How are you doing?", example: "잘 지내요.", collection: "Useful phrases" },
  { id: "j2", userId: "jiho", kind: "vocabulary", title: "천천히", meaning: "slowly", example: "천천히 말해 주세요.", collection: "Useful phrases" },
];
const newData = () => ({
  people: DEMO_PEOPLE.map(p => ({ ...p, skills: { ...p.skills } })),
  notes: SEED_NOTES.map(n => ({ ...n })),
  requests: [],
  shares: [],
  sharedNotes: [],
  messages: [],
  sessions: [],
  blocks: [],
  reports: [],
  actor: "susan",
  selectedPartner: null,
});
const display = text => String(text || "").trim();
const clamp = x => Math.max(0, Math.min(100, Number(x) || 0));
const toId = () => typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
const cap = value => value.slice(0, 1).toUpperCase() + value.slice(1);
const time = () => new Date().toISOString();

function storageRead() {
  try {
    const value = JSON.parse(localStorage.getItem(STORE));
    if (!value || !Array.isArray(value.people) || !Array.isArray(value.notes)) return newData();
    return { ...newData(), ...value };
  } catch { return newData(); }
}
function Avatar({ person, small = false }) {
  return <span className={"spAvatar " + person.accent + (small ? " spAvatarSm" : "")} aria-hidden="true">{person.initial}</span>;
}
function Chip({ children, tone = "" }) {
  return <span className={"spChip " + tone}>{children}</span>;
}
function Skill({ label, value, compact = false }) {
  return <div className={"spSkill " + (compact ? "spSkillCompact" : "")}>
    <div className="spSkillLabels"><span>{cap(label)}</span><strong>{value}<small>/100</small></strong></div>
    <div className="spSkillTrack"><span style={{ width: value + "%", background: label === "grammar" ? "#e2a16d" : label === "listening" ? "#55a99b" : "#776ee1" }} /></div>
  </div>;
}
function Note({ note, actions }) {
  return <article className="spNote"><div className="spNoteTop"><Chip tone={note.kind}>{cap(note.kind)}</Chip><span>{note.collection || "My notes"}</span></div>
    <h3 lang="ko">{note.title}</h3><p>{note.meaning}</p>{note.example && <div className="spNoteExample" lang="ko">{note.example}</div>}
    {actions && <div className="spNoteActions">{actions}</div>}
  </article>;
}

export default function PartnerStudio() {
  const [data, setData] = useState(newData);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("overview");
  const [noteForm, setNoteForm] = useState({ kind: "vocabulary", title: "", meaning: "", example: "", collection: "" });
  const [shareSelection, setShareSelection] = useState("");
  const [shareMode, setShareMode] = useState("read-only");
  const [draft, setDraft] = useState("");
  const [collabDraft, setCollabDraft] = useState("");
  const [answer, setAnswer] = useState("");
  const [currentRound, setCurrentRound] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState("all");
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => { setData(storageRead()); setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(STORE, JSON.stringify(data)); } catch {} }, [data, ready]);
  useEffect(() => { setAnswer(""); setCurrentRound(0); setShowHint(false); }, [data.actor, data.selectedPartner]);
  const update = fn => setData(previous => fn(previous));
  const say = msg => { setToast(msg); setTimeout(() => setToast(""), 4500); };

  const me = data.people.find(p => p.id === data.actor) || data.people[0];
  const myNotes = data.notes.filter(n => n.userId === me.id);
  const matched = useMemo(() => data.people
    .filter(p => p.id !== me.id && !data.blocks.some(b => (b.by === me.id && b.other === p.id) || (b.by === p.id && b.other === me.id)))
    .map(p => ({ ...p, match: calculateMatch(me, p) }))
    .filter(p => p.match)
    .sort((a, b) => b.match.score - a.match.score), [data.people, data.blocks, me]);
  const requests = data.requests.filter(r => r.from === me.id || r.to === me.id);
  const connections = data.requests.filter(r => r.status === "accepted" && (r.from === me.id || r.to === me.id))
    .map(r => ({ request: r, person: data.people.find(p => p.id === (r.from === me.id ? r.to : r.from)) }))
    .filter(({ person }) => person && !data.blocks.some(b => (b.by === me.id && b.other === person.id) || (b.by === person.id && b.other === me.id)));
  const partner = connections.find(x => x.person.id === data.selectedPartner)?.person || connections[0]?.person || null;
  const roomKey = partner ? pairKey(me.id, partner.id) : null;
  const visibleShares = roomKey ? data.shares.filter(s => s.pair === roomKey && !s.revoked) : [];
  const incomingShares = visibleShares.filter(s => s.owner !== me.id);
  const outgoingShares = visibleShares.filter(s => s.owner === me.id);
  const roomNotes = data.sharedNotes.filter(n => n.pair === roomKey);
  const roomMessages = data.messages.filter(n => n.pair === roomKey);
  const roomSessions = data.sessions.filter(n => n.pair === roomKey);
  const session = roomSessions.at(-1);
  const sharedSourceNotes = visibleShares.flatMap(s => { const note = data.notes.find(n => n.id === s.noteId); return note ? [note] : []; });
  const allPracticeNotes = [...sharedSourceNotes, ...roomNotes];

  function requestConnect(id) {
    if (!me.ready) return say("Enable partner discovery in My Profile first.");
    const to = data.people.find(p => p.id === id);
    if (!to?.ready || id === me.id) return;
    if (data.blocks.some(b => (b.by === me.id && b.other === id) || (b.by === id && b.other === me.id))) return say("This partner is unavailable.");
    update(d => {
      const pair = pairKey(me.id, id);
      const existing = d.requests.find(r => r.pair === pair && ["pending", "accepted"].includes(r.status));
      if (existing) return d;
      return { ...d, requests: [...d.requests, { id: toId(), pair, from: me.id, to: id, status: "pending", at: time() }] };
    });
    say("Partner request sent. Switch demo learner to accept it.");
  }
  function decideRequest(id, status) {
    update(d => ({ ...d, requests: d.requests.map(r => r.id === id && r.to === me.id && r.status === "pending" ? { ...r, status, updatedAt: time() } : r) }));
    say(status === "accepted" ? "Partnership created. Open your study room." : "Request declined.");
  }
  function choosePartner(id) { update(d => ({ ...d, selectedPartner: id })); setTab("room"); }
  function closePartnership(id) {
    if (!confirm("End this study partnership? Shared notes will no longer be accessible in this room.")) return;
    const pair = pairKey(me.id, id);
    update(d => ({ ...d, selectedPartner: null, requests: d.requests.map(r => r.pair === pair && r.status === "accepted" ? { ...r, status: "ended" } : r), shares: d.shares.map(s => s.pair === pair ? { ...s, revoked: true } : s) }));
    setTab("discover"); say("Partnership ended; access to shared items revoked.");
  }
  function blockPartner(id) {
    if (!confirm("Block this learner in the local preview? They will disappear from your discovery and shared room.")) return;
    const pair = pairKey(me.id, id);
    update(d => ({ ...d, blocks: [...d.blocks, { by: me.id, other: id }], requests: d.requests.map(r => r.pair === pair && r.status === "accepted" ? { ...r, status: "ended" } : r), shares: d.shares.map(s => s.pair === pair ? { ...s, revoked: true } : s), selectedPartner: null }));
    setTab("discover"); say("Learner blocked in this preview.");
  }
  function addNote() {
    if (!display(noteForm.title) || !display(noteForm.meaning)) return say("Add Korean text/pattern and an explanation.");
    const note = { id: toId(), userId: me.id, kind: noteForm.kind, title: display(noteForm.title).slice(0, 90), meaning: display(noteForm.meaning).slice(0, 240), example: display(noteForm.example).slice(0, 180), collection: display(noteForm.collection).slice(0, 60) || "My notes" };
    update(d => ({ ...d, notes: [note, ...d.notes] }));
    setNoteForm({ ...noteForm, title: "", meaning: "", example: "" }); say("Saved privately to your notebook.");
  }
  function shareNote() {
    if (!partner || !shareSelection || !myNotes.some(n => n.id === shareSelection)) return say("Choose a personal note first.");
    update(d => {
      const existing = d.shares.find(s => s.pair === roomKey && s.noteId === shareSelection && s.owner === me.id);
      if (existing) return { ...d, shares: d.shares.map(s => s.id === existing.id ? { ...s, mode: shareMode, revoked: false } : s) };
      return { ...d, shares: [...d.shares, { id: toId(), pair: roomKey, owner: me.id, noteId: shareSelection, mode: shareMode, revoked: false, at: time() }] };
    });
    setShareSelection(""); say("Only the selected note is shared. Your full notebook stays private.");
  }
  function revokeShare(id) {
    update(d => ({ ...d, shares: d.shares.map(s => s.id === id && s.owner === me.id ? { ...s, revoked: true } : s) }));
    say("Partner access revoked. Copies they explicitly saved remain theirs.");
  }
  function copyShare(share) {
    const original = data.notes.find(n => n.id === share.noteId);
    if (!original) return;
    const already = myNotes.find(n => n.copiedFrom === share.id);
    if (already) return say("You already saved a personal copy.");
    update(d => ({ ...d, notes: [{ ...original, id: toId(), userId: me.id, copiedFrom: share.id, collection: "From " + (data.people.find(p => p.id === share.owner)?.name || "partner") }, ...d.notes] }));
    say("An independent editable copy is now in your notebook.");
  }
  function addSharedNote() {
    if (!partner || !display(collabDraft)) return;
    update(d => ({ ...d, sharedNotes: [...d.sharedNotes, { id: toId(), pair: roomKey, userId: me.id, kind: "together", title: "Joint study note", meaning: display(collabDraft).slice(0, 300), example: "", collection: "Our shared notebook" }] }));
    setCollabDraft(""); say("Added to the shared notebook, not your partner's private notes.");
  }
  function sendMessage() {
    if (!partner || !display(draft)) return;
    update(d => ({ ...d, messages: [...d.messages, { id: toId(), pair: roomKey, from: me.id, text: display(draft).slice(0, 700), at: time() }] }));
    setDraft("");
  }
  async function makeSession() {
    const words = allPracticeNotes.filter(n => n.kind === "vocabulary");
    const grammar = allPracticeNotes.filter(n => n.kind === "grammar");
    if (!partner || aiGenerating) return;
    if (!words.length || !grammar.length) return say("Share at least one vocabulary note and one grammar note first. Both types must be deliberately shared.");
    const guided = buildPractice(words, grammar, roomKey);
    setAiGenerating(true);
    let next = guided, mode = "guided local generator";
    try {
      const response = await fetch("/api/study-partners/practice", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words: words.slice(0, 4), grammar: grammar.slice(0, 3) }),
      });
      if (response.ok) {
        const body = await response.json();
        if (Array.isArray(body.rounds) && body.rounds.length === 3) {
          next = { ...guided, provider: "groq-ai", rounds: body.rounds };
          mode = "AI-assisted, grounded in selected notes";
        }
      }
    } catch { /* Offline/local without a configured AI_API uses the transparent guided demo. */ }
    finally { setAiGenerating(false); }
    update(d => ({ ...d, sessions: [...d.sessions, next] }));
    setCurrentRound(0); setAnswer(""); setShowHint(false); setTab("practice");
    say("Created three rounds with " + mode + ".");
  }
  function submitResponse() {
    if (!session || !display(answer)) return say("Write your response first.");
    const round = String(currentRound);
    update(d => ({ ...d, sessions: d.sessions.map(s => s.id === session.id ? { ...s, responses: { ...s.responses, [round]: { ...(s.responses[round] || {}), [me.id]: display(answer).slice(0, 700) } } } : s) }));
    say("Response saved. Switch learners to compare and discuss.");
    setAnswer("");
  }
  function completeSession() {
    if (!session) return;
    update(d => ({ ...d, sessions: d.sessions.map(s => s.id === session.id ? { ...s, completedBy: [...new Set([...s.completedBy, me.id])] } : s) }));
    say("Marked as completed for " + me.name + ". This is not an AI grade.");
  }

  if (!ready) return <main className="spLoading">Preparing your local Study Partners preview…</main>;
  const sectionNames = { overview: "Your learning desk", profile: "Your learning profile", discover: "Discover partners", requests: "Connections & requests", notebook: "Your private notebook", room: "Shared study room", practice: "Mutual practice" };
  const tabs = [["overview","Overview","⌂"],["profile","My profile","◉"],["discover","Discover","✦"],["requests","Connections","↔"],["notebook","My notes","▤"],["room","Shared room","♡"],["practice","Practice","✎"]];
  return <div className="spShell">
    <header className="spTopbar"><a href="/" className="spBrand"><span>ㅎ</span><div><strong>Hallium</strong><small>STUDY PARTNERS</small></div></a><span className="spPreviewLabel">LOCAL DEMO · SIMULATED USERS</span><a href="/" className="spExit">← Back to Hallium</a></header>
    <div className="spBody">
      <aside className="spSidebar">
        <div className="spSidebarLead"><span className="spEyebrow">LEARN BETTER, TOGETHER</span><h2>Find your<br/>other half<span>.</span></h2><p>Pair complementary strengths, swap selected notes and practise what matters.</p></div>
        <nav aria-label="Study Partners sections">{tabs.map(([key,label,icon]) => <button key={key} type="button" className={"spNav " + (tab === key ? "selected" : "")} onClick={() => setTab(key)}><span>{icon}</span>{label}{key === "requests" && requests.some(r => r.to === me.id && r.status === "pending") && <i>!</i>}</button>)}</nav>
        <div className="spPersonaBox"><span className="spEyebrow">PREVIEW AS</span><div className="spPersonaSelect"><Avatar person={me} small /><label><span className="spSr">Choose demo learner</span><select value={me.id} onChange={event => { update(d => ({ ...d, actor: event.target.value, selectedPartner: null })); setTab("overview"); }}>{data.people.map(p => <option key={p.id} value={p.id}>{p.name} · {p.level}</option>)}</select></label></div><small>Switch people to accept requests, exchange notes and reply.</small></div>
      </aside>
      <main className="spMain">
        <div className="spPageHeading"><span className="spEyebrow">HALLIUM / STUDY PARTNERS / {tab.toUpperCase()}</span><h1>{sectionNames[tab]}<em>.</em></h1><p>{tab === "overview" ? "Two learners. Different strengths. A stronger study routine." : tab === "discover" ? "Suggestions come from adjustable example scores — never from real users." : tab === "room" ? "Only notes deliberately shared with this partner appear here." : tab === "practice" ? "Make something useful together from your shared learning material." : "This is an interactive prototype saved only in this browser."}</p></div>
        <div className="spDemoNotice"><strong>Prototype mode</strong><span>All learners, skills and notes shown here are fictional. Actions save only to this browser; no messages are sent to real Hallium users or production Supabase.</span><button onClick={() => { if(confirm("Reset all fictional learners, notes, conversations and requests in this browser?")){setData(newData());setTab("overview");say("Demo reset.");} }}>Reset demo</button></div>
        {tab === "overview" && <div className="spOverview">
          <section className="spHero"><div><Chip tone="light">THE COMPLEMENTARY LEARNING IDEA</Chip><h2>What you know can help someone else learn.</h2><p>And what they understand might be the missing piece in your Korean.</p><button className="spPrimary" onClick={() => setTab("discover")}>Discover your match ↗</button></div><div className="spHeroArt"><span>어</span><span>휘</span><b>↗</b><small>VOCAB × GRAMMAR</small></div></section>
          <div className="spStats"><div><strong>{myNotes.length}</strong><span>Personal notes</span></div><div><strong>{connections.length}</strong><span>Connected partners</span></div><div><strong>{requests.filter(r => r.to === me.id && r.status === "pending").length}</strong><span>Requests to you</span></div><div><strong>{data.sessions.filter(s => connections.some(c => s.pair === pairKey(me.id, c.person.id))).length}</strong><span>Joint practice sets</span></div></div>
          <div className="spTwoCols"><section className="spPanel"><span className="spEyebrow">01 · YOUR LEARNING SHAPE</span><h2>{me.name}'s skill profile</h2><p className="spMuted">Adjustable example data for this localhost demo.</p>{CATEGORIES.map(c => <Skill key={c} label={c} value={me.skills[c]} />)}<button className="spTextButton" onClick={() => setTab("profile")}>Explore your skill profile →</button></section>
            <section className="spPanel"><span className="spEyebrow">02 · YOUR LEARNING COMPLEMENT</span><h2>{matched[0] ? matched[0].name + " could help" : "Meet another learner"}</h2>{matched[0] ? <><div className="spMiniPerson"><Avatar person={matched[0]} /><div><strong>{matched[0].name}</strong><span>{matched[0].level} · {matched[0].availability}</span></div><Chip>{matched[0].match.strong ? "Mutual strengths" : "Explore fit"}</Chip></div><p>You can help with <b>{matched[0].match.helpThem.skill}</b>; they can help with <b>{matched[0].match.helpMe.skill}</b>.</p></> : <p>Enable discovery in your profile to meet other learners.</p>}<button className="spTextButton" onClick={() => setTab("discover")}>See partner suggestions →</button></section></div>
          <section className="spSectionTip"><span>✦</span><div><strong>Shared notes become shared practice.</strong><p>Send vocabulary. Receive grammar. Complete three rounds using the actual items you and your partner selected.</p></div><button onClick={() => setTab("notebook")}>Prepare my notebook →</button></section>
        </div>}
        {tab === "profile" && <div className="spTwoCols">
          <section className="spPanel"><div className="spMiniPerson"><Avatar person={me}/><div><strong>{me.name}</strong><span>{me.level} · {me.availability}</span></div></div><h2>My learning evidence</h2><p className="spMuted">For the demo only, adjust scores to see recommendations react. In production, these must come from verified vocabulary, grammar and listening exercises.</p>{CATEGORIES.map(c => <div className="spSlider" key={c}><Skill label={c} value={me.skills[c]} /><label><span className="spSr">Adjust {c} example evidence</span><input type="range" min="0" max="100" value={me.skills[c]} onChange={event => update(d => ({...d,people:d.people.map(p => p.id === me.id ? {...p,skills:{...p.skills,[c]:clamp(event.target.value)}}:p)}))}/></label></div>)}</section>
          <section className="spPanel"><span className="spEyebrow">PARTNERSHIP SETTINGS</span><h2>Study on your terms.</h2><p className="spMuted">No one is added to your study room automatically.</p><label className="spToggle"><span><strong>Open to study partners</strong><small>Allows your example profile to appear in discovery.</small></span><input type="checkbox" checked={me.ready} onChange={e => update(d => ({...d,people:d.people.map(p => p.id === me.id ? {...p,ready:e.target.checked}:p)}))}/></label><div className="spDivider"/><h3>What partners see</h3><p>First name, approximate level, optional availability and a learning-focused reason to connect. Your raw test results, full mistake log and private notebook remain hidden.</p><button className="spPrimary" onClick={() => setTab("discover")}>Find complementary learners →</button></section>
        </div>}
        {tab === "discover" && <div><div className="spFilterBar"><div><span className="spEyebrow">YOUR COMPLEMENTARY MATCHES</span><h2>Different strengths. Shared progress.</h2></div><label>Show <select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All suggested learners</option><option value="strong">Clear two-way complement</option><option value="same">Same learning level</option></select></label></div>
          <div className="spMatchGrid">{matched.filter(p => filter === "strong" ? p.match.strong : filter === "same" ? p.level === me.level : true).map(p => {const req = data.requests.find(r => r.pair === pairKey(me.id,p.id) && ["accepted","pending"].includes(r.status)); return <article className="spMatch" key={p.id}><div className="spMatchHead"><Avatar person={p}/><Chip tone={p.match.strong ? "mint" : ""}>{p.match.strong ? "Two-way complement" : "Practice compatibility"}</Chip></div><h3>{p.name}</h3><p className="spMuted">{p.level} · {p.availability}</p><p className="spMatchTagline">{p.tagline}</p><div className="spMatchSkills">{CATEGORIES.map(c => <Skill key={c} label={c} value={p.skills[c]} compact />)}</div><div className="spMatchReasons"><div><span>YOU COULD HELP WITH</span><b>{cap(p.match.helpThem.skill)}</b></div><div><span>THEY COULD HELP WITH</span><b>{cap(p.match.helpMe.skill)}</b></div></div><p className="spMatchCaveat">{p.match.strong ? "This is a complementary practice suggestion, not a teaching credential." : "Less two-way evidence; guided practice can still be useful."}</p><button className="spPrimary spFull" disabled={!!req && req.status === "pending"} onClick={() => req?.status === "accepted" ? choosePartner(p.id) : requestConnect(p.id)}>{req?.status === "accepted" ? "Open shared room →" : req?.status === "pending" ? req.from === me.id ? "Request sent" : "Respond in Connections" : "Ask to study together ↗"}</button></article>})}</div>
          {!matched.length && <div className="spEmpty">No eligible profiles right now. Check your discovery setting or switch demo learners.</div>}
        </div>}
        {tab === "requests" && <div className="spTwoCols">
          <section className="spPanel"><span className="spEyebrow">NEEDS YOUR RESPONSE</span><h2>Partner requests</h2>{requests.filter(r => r.to === me.id && r.status === "pending").map(r => {const from = data.people.find(p => p.id === r.from);return from && <div className="spRequest" key={r.id}><div className="spMiniPerson"><Avatar person={from} small/><div><strong>{from.name} wants to study together</strong><span>{from.level} · mutual opt-in required</span></div></div><div className="spRow"><button className="spPrimary" onClick={() => decideRequest(r.id,"accepted")}>Accept request</button><button className="spOutline" onClick={() => decideRequest(r.id,"declined")}>Decline</button></div></div>})}{!requests.some(r => r.to === me.id && r.status === "pending") && <div className="spEmpty">No new requests. Switch to another demo learner after sending one.</div>}</section>
          <section className="spPanel"><span className="spEyebrow">STUDY TOGETHER</span><h2>My connections</h2>{connections.map(({person}) => <div className="spConnection" key={person.id}><div className="spMiniPerson"><Avatar person={person} small/><div><strong>{person.name}</strong><span>Mutually accepted partner</span></div></div><button className="spPrimary" onClick={() => choosePartner(person.id)}>Open room →</button></div>)}{!connections.length && <div className="spEmpty">Once a request is accepted, your shared study room appears here.</div>}<div className="spDivider"/><span className="spEyebrow">SENT REQUESTS</span>{requests.filter(r => r.from === me.id && r.status === "pending").map(r => <p key={r.id} className="spMuted">Awaiting {data.people.find(p => p.id === r.to)?.name}'s response.</p>)}</section>
        </div>}
        {tab === "notebook" && <div className="spNotebookLayout"><section className="spPanel spCreateNote"><span className="spEyebrow">PERSONAL · PRIVATE BY DEFAULT</span><h2>New learning note</h2><p className="spMuted">This notebook is yours. A partner sees only notes you explicitly share in the room.</p><label>Type<select value={noteForm.kind} onChange={e => setNoteForm(n => ({...n,kind:e.target.value}))}><option value="vocabulary">Vocabulary</option><option value="grammar">Grammar</option><option value="listening">Listening / phrase</option></select></label><label>Korean word or pattern<input maxLength={90} placeholder="학교 / 에 / 어떻게 지내요?" value={noteForm.title} onChange={e => setNoteForm(n=>({...n,title:e.target.value}))}/></label><label>Your explanation<input maxLength={240} placeholder="Meaning or how to use it" value={noteForm.meaning} onChange={e => setNoteForm(n=>({...n,meaning:e.target.value}))}/></label><label>Example sentence<input maxLength={180} placeholder="학교에 가요." value={noteForm.example} onChange={e => setNoteForm(n=>({...n,example:e.target.value}))}/></label><label>Collection<input maxLength={60} placeholder="Everyday Korean" value={noteForm.collection} onChange={e => setNoteForm(n=>({...n,collection:e.target.value}))}/></label><button className="spPrimary spFull" onClick={addNote}>＋ Save private note</button></section><section><div className="spFilterBar"><div><span className="spEyebrow">{myNotes.length} NOTES</span><h2>{me.name}'s notebook</h2></div></div><div className="spNotesGrid">{myNotes.map(n => <Note key={n.id} note={n} actions={<span className="spMuted">Private · share selected items from a partner room</span>}/>)}</div></section></div>}
        {tab === "room" && <div>
          <div className="spRoomSwitch"><label>Active shared room <select value={partner?.id||""} onChange={e=>choosePartner(e.target.value)}><option value="" disabled>{connections.length?"Choose your partner":"No active partners"}</option>{connections.map(c=><option key={c.person.id} value={c.person.id}>{c.person.name}</option>)}</select></label><button className="spOutline" onClick={()=>setTab("requests")}>Manage connections ↗</button></div>
          {!partner ? <div className="spEmpty spTall"><h2>Your shared room starts with a mutual yes.</h2><p>Discover someone, send a request, switch demo learners and accept it.</p><button className="spPrimary" onClick={()=>setTab("discover")}>Discover partners</button></div> : <>
          <section className="spRoomHero"><div className="spMiniPerson"><Avatar person={me}/><span className="spRoomHeart">♡</span><Avatar person={partner}/><div><span className="spEyebrow">SHARED STUDY SPACE</span><h2>{me.name} + {partner.name}</h2><p>Two notebooks. One practice routine.</p></div></div><div className="spRoomButtons"><button className="spOutline" onClick={()=>{update(d=>({...d,reports:[...d.reports,{by:me.id,other:partner.id,at:time()}]}));say("Preview report recorded locally. No moderator is notified.");}}>Report</button><button className="spOutline" onClick={()=>blockPartner(partner.id)}>Block</button><button className="spOutline" onClick={()=>closePartnership(partner.id)}>End partnership</button></div></section>
          <div className="spRoomCols"><section className="spPanel"><span className="spEyebrow">SELECTIVE NOTE SHARING</span><h2>Share one of your notes</h2><p className="spMuted">Choose exactly what {partner.name} may view. Sharing does not reveal the rest of your notebook or learning report.</p><label>My personal note<select value={shareSelection} onChange={e=>setShareSelection(e.target.value)}><option value="">Choose a note to share…</option>{myNotes.map(n=><option key={n.id} value={n.id}>{n.title} — {n.collection}</option>)}</select></label><label>Permission<select value={shareMode} onChange={e=>setShareMode(e.target.value)}><option value="read-only">Read only + save a personal copy</option><option value="collaborate">Allow collaboration in the shared room</option></select></label><button className="spPrimary spFull" onClick={shareNote}>Share selected note →</button><div className="spDivider"/><h3>Shared by you ({outgoingShares.length})</h3>{outgoingShares.map(s=>{const n=data.notes.find(x=>x.id===s.noteId);return n&&<div className="spSharedLine" key={s.id}><span><b lang="ko">{n.title}</b><small>{s.mode} · shared with {partner.name}</small></span><button onClick={()=>revokeShare(s.id)}>Revoke</button></div>})}{!outgoingShares.length&&<p className="spMuted">Nothing shared yet.</p>}</section>
          <section className="spPanel"><span className="spEyebrow">FROM YOUR PARTNER</span><h2>Received notes ({incomingShares.length})</h2>{incomingShares.map(s=>{const n=data.notes.find(x=>x.id===s.noteId);return n&&<Note key={s.id} note={n} actions={<><span className="spMuted">{s.mode} · by {partner.name}</span><button className="spOutline" onClick={()=>copyShare(s)}>Save my copy</button></>}/>})}{!incomingShares.length&&<div className="spEmpty">Switch to {partner.name} and share a note to see it here.</div>}</section></div>
          <div className="spRoomCols"><section className="spPanel"><span className="spEyebrow">COLLABORATIVE SPACE</span><h2>Our shared notebook</h2><p className="spMuted">Add a joint observation; neither person's personal notes are edited.</p>{roomNotes.map(n=><div key={n.id} className="spJointNote"><span>{data.people.find(p=>p.id===n.userId)?.name}</span><p>{n.meaning}</p></div>)}<textarea maxLength={300} value={collabDraft} onChange={e=>setCollabDraft(e.target.value)} placeholder="Something we noticed about today's Korean…"/><button className="spPrimary" onClick={addSharedNote}>＋ Add joint note</button></section><section className="spPanel"><span className="spEyebrow">CONVERSATION</span><h2>Practice together</h2><div className="spChat">{roomMessages.length?roomMessages.map(m=><div className={"spBubble "+(m.from===me.id?"own":"")} key={m.id}><small>{data.people.find(p=>p.id===m.from)?.name}</small><p>{m.text}</p></div>):<p className="spMuted">Say hi! Messages stay in this local simulated room.</p>}</div><div className="spCompose"><input value={draft} onChange={e=>setDraft(e.target.value)} maxLength={700} placeholder="Write to your study partner…" onKeyDown={e=>{if(e.key==="Enter")sendMessage()}}/><button className="spPrimary" onClick={sendMessage}>Send ↗</button></div></section></div>
          <section className="spPracticeCall"><div><span className="spEyebrow">NEXT STEP · MUTUAL PRACTICE</span><h2>Turn your shared notes into a session.</h2><p>{allPracticeNotes.filter(n=>n.kind==="vocabulary").length} vocabulary · {allPracticeNotes.filter(n=>n.kind==="grammar").length} grammar notes available. Both types are needed.</p></div><button className="spPrimary" disabled={aiGenerating} onClick={makeSession}>{aiGenerating ? "Building practice…" : "Generate mutual practice ✦"}</button></section>
          </>}
        </div>}
        {tab === "practice" && <div>{!partner ? <div className="spEmpty spTall">Accept a partner request first. <button className="spPrimary" onClick={()=>setTab("discover")}>Find a partner</button></div> : !session ? <section className="spPanel spPracticeBlank"><span className="spEyebrow">BUILT FROM SHARED MATERIAL</span><h2>A study session that needs both of you.</h2><p>Share a vocabulary note and a grammar note in your room, then generate a three-round exercise from those exact items.</p><button className="spPrimary" onClick={()=>setTab("room")}>Go to shared room →</button><button className="spOutline" disabled={aiGenerating} onClick={makeSession}>{aiGenerating ? "Building practice…" : "Generate from current shares ✦"}</button></section> : <section className="spPracticeLayout"><div className="spSessionTop"><div><span className="spEyebrow">{session.provider === "groq-ai" ? "AI-ASSISTED · GROUNDED IN SHARED NOTES" : "GUIDED OFFLINE PREVIEW · NOT AI-GRADED"}</span><h2>Mutual learning session</h2><p>Grounded in {session.wordIds.length} shared vocabulary and {session.grammarIds.length} grammar notes.</p></div><div className="spMiniPerson"><Avatar person={me} small/><span className="spRoomHeart">♡</span><Avatar person={partner} small/></div></div><div className="spRoundNav">{session.rounds.map((r,i)=><button className={currentRound===i?"active":""} key={i} onClick={()=>{setCurrentRound(i);setShowHint(false)}}>{r.kicker}</button>)}</div><div className="spPracticeBody"><article className="spPracticePrompt"><span className="spEyebrow">{session.rounds[currentRound].kicker}</span><h3>{session.rounds[currentRound].title}</h3><p>{session.rounds[currentRound].prompt}</p><div className="spReference"><span>SELECTED NOTE EVIDENCE</span><p lang="ko">{session.rounds[currentRound].source}</p></div><button className="spOutline" onClick={()=>setShowHint(x=>!x)}>{showHint?"Hide the note hint":"Reveal a note hint ↓"}</button>{showHint&&<p className="spHint">{session.rounds[currentRound].hint}</p>}</article><article className="spPanel"><span className="spEyebrow">YOUR RESPONSE · {me.name.toUpperCase()}</span><h3>Try it in your own words.</h3><textarea maxLength={700} rows={5} value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Type your explanation or Korean sentence…"/><button className="spPrimary spFull" onClick={submitResponse}>Save my response →</button><p className="spMuted">Responses are shown to your accepted partner. There is no automated correctness score in this preview.</p></article></div><div className="spResponseGrid">{data.people.filter(p=>[me.id,partner.id].includes(p.id)).map(p=><div key={p.id} className="spPanel"><div className="spMiniPerson"><Avatar person={p} small/><strong>{p.name}'s response</strong></div><p>{session.responses[String(currentRound)]?.[p.id] || "Not answered yet."}</p></div>)}</div><div className="spSessionFooter"><span>Completed: {session.completedBy.map(id=>data.people.find(p=>p.id===id)?.name).join(", ")||"Neither learner yet"}</span><button className="spOutline" onClick={()=>setCurrentRound((currentRound+1)%3)}>Next round →</button><button className="spPrimary" onClick={completeSession}>Mark my session complete ✓</button><button className="spOutline" disabled={aiGenerating} onClick={makeSession}>{aiGenerating ? "Building…" : "New practice from shared notes ↻"}</button></div></section>}</div>}
      </main>
    </div>{toast&&<div className="spToast" role="status">{toast}</div>}
  </div>;
}
