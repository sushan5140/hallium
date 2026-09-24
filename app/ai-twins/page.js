"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getHallimSupabase } from "../../lib/supabase/client";
import { focusFromAiAudit } from "../../lib/study-partners/core.mjs";
import { AI_GUIDES } from "../../lib/ai-twins/guides.mjs";
import "../research/ai-twins/twins.css";
import "./live.css";

const P="hallium_partner_profiles",T="hallium_twin_profiles",M="hallium_twin_meetups";
const skills=["vocabulary","grammar"];
const levels=["beginner","elementary","intermediate","advanced"];
const slots=["Flexible","Morning","Afternoon","Evening"];
const empty={nickname:"",level:"beginner",availability:"Evening",strength:"vocabulary",growth_area:"grammar",
  twin_name:"",intro:"",interests:"Korean drama, conversation",tone:"friendly",enabled:false};
const cap=s=>String(s||"").replace(/^./,c=>c.toUpperCase());
const short=s=>String(s||"").slice(0,1).toUpperCase()||"ㅎ";

export default function AiTwinsLivePage(){
  const sb=useMemo(()=>getHallimSupabase(),[]);
  const [user,setUser]=useState(null),[loading,setLoading]=useState(true);
  const [form,setForm]=useState(empty),[saved,setSaved]=useState(false);
  const [people,setPeople]=useState([]),[meetups,setMeetups]=useState([]),[connections,setConnections]=useState([]),[selected,setSelected]=useState(null);
  const [busy,setBusy]=useState(""),[error,setError]=useState(""),[notice,setNotice]=useState("");
  const [stage,setStage]=useState(0);
  const update=(field,value)=>setForm(p=>({...p,[field]:value}));

  const refresh=useCallback(async(id,{hydrate=false}={})=>{
    const [own,ownTwin,twins,profiles,meetings,rooms]=await Promise.all([
      sb.from(P).select("user_id,nickname,level,availability,strength,growth_area,discoverable").eq("user_id",id).maybeSingle(),
      sb.from(T).select("user_id,enabled,twin_name,intro,interests,tone").eq("user_id",id).maybeSingle(),
      sb.from(T).select("user_id,enabled,twin_name,intro,interests,tone").eq("enabled",true).neq("user_id",id).limit(80),
      sb.from(P).select("user_id,nickname,level,availability,strength,growth_area,discoverable").eq("discoverable",true).limit(120),
      sb.from(M).select("*").or("user_low.eq."+id+",user_high.eq."+id).order("created_at",{ascending:false}).limit(35),
      sb.from("hallium_partner_connections").select("id,user_low,user_high,status").eq("status","accepted").limit(100)
    ]);
    const problem=[own.error,ownTwin.error,twins.error,profiles.error,meetings.error,rooms.error].find(Boolean);
    if(problem){setError("Could not load the live Twinverse: "+problem.message);return;}
    const profileMap=new Map((profiles.data||[]).map(p=>[p.user_id,p]));
    const roster=(twins.data||[]).filter(t=>profileMap.has(t.user_id)).map(t=>({...t,profile:profileMap.get(t.user_id)}));
    setPeople(roster);
    setMeetups(meetings.data||[]);
    setConnections(rooms.data||[]);
    setSaved(Boolean(ownTwin.data?.enabled&&own.data?.discoverable));
    if(hydrate){
      setForm({...empty,...(own.data||{}),...(ownTwin.data||{}),
        twin_name:ownTwin.data?.twin_name||own.data?.nickname||"",
        enabled:ownTwin.data?.enabled||false});
    }
    setSelected(previous=>{
      const rows=meetings.data||[];
      return rows.find(m=>m.id===previous?.id)||rows[0]||null;
    });
  },[sb]);

  useEffect(()=>{
    let active=true;
    (async()=>{
      const {data:{user:u},error:e}=await sb.auth.getUser();
      if(!active)return;
      if(e)setError(e.message);
      setUser(u||null);
      if(u)await refresh(u.id,{hydrate:true});
      if(active)setLoading(false);
    })();
    return()=>{active=false};
  },[sb,refresh]);
  useEffect(()=>{
    if(!user)return;
    const timer=setInterval(()=>{
      if(document.visibilityState==="visible"&&!busy)refresh(user.id);
    },12000);
    return()=>clearInterval(timer);
  },[user,refresh,busy]);

  async function save(enabled=true){
    if(!user)return;
    setError("");setNotice("");
    const nickname=form.nickname.trim(),twinName=form.twin_name.trim();
    if(nickname.length<2||nickname.length>35||twinName.length<2||twinName.length>35)
      return setError("Choose a 2–35 character nickname and twin name.");
    if(form.strength===form.growth_area)return setError("Your strength and growth area should differ.");
    if(form.intro.length>300||form.interests.length>180)return setError("Your intro or interests are too long.");
    setBusy("save");
    try{
      const partner={nickname,level:form.level,availability:form.availability,
        strength:form.strength,growth_area:form.growth_area,discoverable:enabled};
      const existing=await sb.from(P).select("user_id").eq("user_id",user.id).maybeSingle();
      if(existing.error)throw existing.error;
      const write=existing.data
        ? await sb.from(P).update(partner).eq("user_id",user.id)
        : await sb.from(P).insert({...partner,user_id:user.id});
      if(write.error)throw write.error;
      const twin=await sb.from(T).upsert({
        user_id:user.id,enabled,twin_name:twinName,intro:form.intro.trim(),
        interests:form.interests.trim(),tone:form.tone,updated_at:new Date().toISOString()
      },{onConflict:"user_id"});
      if(twin.error)throw twin.error;
      update("enabled",enabled);
      await refresh(user.id);
      setNotice(enabled?"Your twin is live! You and your sister can now find one another.":"Twin discovery switched off. Any existing accepted Study Partner room remains available.");
    }catch(e){setError(e.message||"Could not save your twin.")}
    finally{setBusy("")}
  }

  async function importLearningFocus(){
    if(!user)return;
    setBusy("audit");setError("");setNotice("");
    try{
      const {data,error:e}=await sb.from("learner_state").select("ai_audit").eq("user_id",user.id).maybeSingle();
      if(e)throw e;
      const focus=focusFromAiAudit(data?.ai_audit);
      if(!focus)throw new Error("Your current AI learning report does not clearly distinguish vocabulary and grammar strengths. Choose them manually or complete a Hallium learning check.");
      setForm(p=>({...p,strength:focus.strength,growth_area:focus.growth}));
      setNotice("Private AI audit read locally for category-level signals. Review the imported categories and save to share only those summaries.");
    }catch(e){setError(e.message||"Could not read your learning report.")}
    finally{setBusy("")}
  }

  async function meet(otherId){
    if(!saved)return setError("Save and enable your own twin first.");
    setBusy("meet:"+otherId);setError("");setNotice("");setStage(0);
    const ticker=setInterval(()=>setStage(v=>Math.min(v+1,3)),5000);
    try{
      const r=await fetch("/api/ai-twins/meet",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({otherId})
      });
      const data=await r.json();
      if(!r.ok)throw new Error(data.error||"The agent meetup failed.");
      await refresh(user.id);
      setSelected(data.meetup);
      setNotice(data.reused?"An existing pending meeting was opened.":"Both AI twins have finished their actual model-generated conversation. Review their proposal below.");
      document.getElementById("tw-meetings")?.scrollIntoView({behavior:"smooth"});
    }catch(e){setError(e.message||"Could not begin meeting.")}
    finally{clearInterval(ticker);setBusy("");setStage(0)}
  }

  async function decide(accept){
    if(!selected)return;
    setBusy("decision");setError("");setNotice("");
    try{
      const {data,error:e}=await sb.rpc("hallium_twin_decide",{p_meetup:selected.id,p_accept:accept});
      if(e)throw e;
      await refresh(user.id);
      setNotice(data==="accepted"?
        "Both learners approved! Hallium has opened your real Study Partners connection and saved the joint practice activity.":
        data==="declined"?"You declined this meeting; no room was opened.":
        "Your approval was recorded. Waiting for your partner's separate approval.");
    }catch(e){setError(e.message||"Could not record your decision.")}
    finally{setBusy("")}
  }

  const peerId=selected?(selected.user_low===user?.id?selected.user_high:selected.user_low):null;
  const peer=people.find(p=>p.user_id===peerId);
  const activeRoom=connections.find(c=>c.status==="accepted"&&selected&&c.user_low===selected.user_low&&c.user_high===selected.user_high);
  const mineApproved=selected?(selected.user_low===user?.id?selected.approved_low:selected.approved_high):false;
  const otherApproved=selected?(selected.user_low===user?.id?selected.approved_high:selected.approved_low):false;
  const pairs=people.map(p=>({
    ...p,
    reciprocal:p.profile.strength===form.growth_area&&form.strength===p.profile.growth_area
  })).sort((a,b)=>Number(b.reciprocal)-Number(a.reciprocal));

  if(loading)return <main className="tw-page tw-live-loading">Opening your Twinverse…</main>;
  if(!user)return <main className="tw-page"><div className="tw-frame"><header className="tw-topbar"><a className="tw-brand" href="/">ㅎ hallium / twinverse</a><a href="/study-partners" className="tw-back">← Study Partners</a></header><section className="tw-hero"><div className="tw-eyebrow">YOUR DIGITAL STUDY DOUBLE</div><h1>Your twin.<br/><em>Your Korean universe.</em></h1><p>Sign in with Google to create your opt-in learning twin, meet another real learner's AI twin and approve a shared Korean activity together.</p><p style={{marginTop:24}}><a className="tw-primary tw-link-button" href="/auth/google?next=%2Fai-twins">Continue with Google ↗</a> <a className="tw-secondary tw-guest-guide-link" href="/ai-twins/guides">Meet the 12 AI teaching characters ✳</a></p></section></div></main>;

  return <main className="tw-page"><div className="tw-frame">
    <header className="tw-topbar">
      <a href="/" className="tw-brand"><span className="tw-brand-mark">ㅎ</span>hallium <b>/</b> twinverse</a>
      <span className="tw-beta"><span className="tw-pulse"/> LIVE TWO-ACCOUNT PILOT</span>
      <a className="tw-back" href="/study-partners">← Study Partners</a>
    </header>
    <section className="tw-hero tw-live-hero"><div className="tw-eyebrow">✳ REAL AI AGENTS · REAL LEARNERS · MUTUAL APPROVAL</div>
      <h1>Let your twin<br/><em>make the first move.</em></h1>
      <p>Two language-learning alter egos meet, talk through each learner's self-shared strengths, co-design a Korean activity and wait for both humans to approve.</p>
      <div className="tw-hero-foot"><span>01 / OPT IN</span><span>02 / THE AI TWINS TALK</span><span>03 / BOTH HUMANS DECIDE</span></div>
      <div className="tw-orbit" aria-hidden="true"><span className="tw-orbit-a">ㅎ</span><span className="tw-orbit-b">✳</span><span className="tw-orbit-c">♡</span><span className="tw-orbit-d">가</span></div>
    </section>
    {(error||notice)&&<div className={"tw-alert "+(error?"tw-alert-error":"")} role={error?"alert":"status"}>{error||notice}<button onClick={()=>{setError("");setNotice("")}} aria-label="Dismiss">×</button></div>}
    <section className="tw-guide-strip" aria-label="Meet the AI teaching characters">
      <div className="tw-guide-strip-heading"><div><span className="tw-kicker">THE TWINVERSE STARTING LINEUP · EVERY CHARACTER IS AI</span>
        <h2>No real learners online yet? <em>Learn with these 12.</em></h2>
        <p>Not fake accounts. Twelve clearly labeled AI teaching characters who actually chat, correct Korean and give you little sidequests—no human discovery opt-in required.</p></div>
        <a className="tw-guide-all" href="/ai-twins/guides">Enter the AI Guide District ↗</a>
      </div>
      <div className="tw-guide-previews">{[AI_GUIDES[0],AI_GUIDES[1],AI_GUIDES[5],AI_GUIDES[9]].map(g=>
        <a href="/ai-twins/guides" key={g.id} className="tw-guide-preview"><span className="tw-guide-preview-emoji" aria-hidden="true">{g.emoji}</span>
          <strong>{g.name} <small>AI</small></strong><span>{g.title}</span></a>)}</div>
    </section>
    <div className="tw-layout">
      <section className="tw-builder"><div className="tw-section-head"><span className="tw-step">01</span><div><span className="tw-kicker">YOUR DIGITAL ALTER EGO</span><h2>Build your twin</h2></div></div>
        <div className="tw-self"><span className="tw-avatar tw-avatar-big">{short(form.twin_name||form.nickname)}</span><div><small>YOUR OPT-IN TWIN</small><strong>{form.twin_name||"Meet your twin"} ✳</strong><p>{saved?"Live and discoverable":"Not yet enabled"}</p></div></div>
        <label className="tw-label">Your display nickname<input value={form.nickname} maxLength={35} onChange={e=>update("nickname",e.target.value)}/></label>
        <label className="tw-label">Your twin's name<input value={form.twin_name} maxLength={35} onChange={e=>update("twin_name",e.target.value)}/></label>
        <div className="tw-two">
          <label className="tw-label">Your strength<select value={form.strength} onChange={e=>update("strength",e.target.value)}>{skills.map(s=><option key={s}>{s}</option>)}</select></label>
          <label className="tw-label">Your growth area<select value={form.growth_area} onChange={e=>update("growth_area",e.target.value)}>{skills.map(s=><option key={s}>{s}</option>)}</select></label>
        </div>
        <button className="tw-secondary tw-full" type="button" disabled={Boolean(busy)} onClick={importLearningFocus}>{busy==="audit"?"Reading your report…":"✳ Import my Hallium learning focus (review first)"}</button>
        <div className="tw-two"><label className="tw-label">Level<select value={form.level} onChange={e=>update("level",e.target.value)}>{levels.map(s=><option key={s}>{s}</option>)}</select></label>
        <label className="tw-label">Study time<select value={form.availability} onChange={e=>update("availability",e.target.value)}>{slots.map(s=><option key={s}>{s}</option>)}</select></label></div>
        <label className="tw-label">What should your twin say about your learning?<textarea maxLength={300} rows={3} value={form.intro} onChange={e=>update("intro",e.target.value)} placeholder="I love K-dramas, remember words quickly, and want help with particles…"/></label>
        <label className="tw-label">Shared interests<textarea rows={2} maxLength={180} value={form.interests} onChange={e=>update("interests",e.target.value)} placeholder="K-dramas, TOPIK, conversation"/></label>
        <label className="tw-label">Personality<select value={form.tone} onChange={e=>update("tone",e.target.value)}>{["friendly","playful","calm"].map(s=><option key={s}>{s}</option>)}</select></label>
        <div className="tw-privacy">✦ Enabling makes these short learning summaries visible to other signed-in Hallium learners and turns on Study Partners discovery. No private notes, full AI audit, raw mistakes or email addresses are sent to another twin. You can switch off discovery any time.</div>
        <button className="tw-primary" disabled={Boolean(busy)} onClick={()=>save(true)}>{busy==="save"?"Saving your profile…":saved?"Save my twin changes ↗":"Enable my AI twin ↗"}</button>
        {saved&&<button className="tw-secondary tw-full" disabled={Boolean(busy)} onClick={()=>save(false)}>Disable my twin & discovery</button>}
      </section>
      <section className="tw-stage"><div className="tw-section-head"><span className="tw-step">02</span><div><span className="tw-kicker">THE TWINVERSE</span><h2>Meet the other twins</h2></div></div>
        {!saved?<div className="tw-empty-live">✳<h3>Your twin isn't in the room yet.</h3><p>Enable your profile first, then have your sister sign into her own Google account and enable her twin too.</p></div>:
          !pairs.length?<div className="tw-empty-live">♡<h3>Waiting for another human.</h3><p>Ask your sister to enable her own twin. Until then, you can practise with 12 clearly labeled AI teaching characters above. They are not counted as real people.</p><button className="tw-secondary" onClick={()=>refresh(user.id)}>Check for twins ↻</button></div>:
          <div className="tw-live-people">{pairs.map(p=><article className="tw-person" key={p.user_id}>
            <div className="tw-person-head"><span className="tw-avatar tw-lavender">{short(p.twin_name)}</span><div><strong>{p.twin_name}</strong><small>{p.profile.level} · {p.profile.availability}</small></div><span className="tw-tag">{p.reciprocal?"SKILL SWAP":"STUDY BUDDY"}</span></div>
            <p>{p.intro||"Ready to meet a new Korean learning partner."}</p>
            <div className="tw-mini-skills"><span>Gives: {p.profile.strength}</span><span>Learning: {p.profile.growth_area}</span></div>
            <small className="tw-muted">Interests: {p.interests||"Korean practice"}</small>
            <button className="tw-primary" disabled={Boolean(busy)} onClick={()=>meet(p.user_id)}>{busy==="meet:"+p.user_id?"Twins are talking…":"Send my twin to meet "+p.twin_name+" ↗"}</button>
          </article>)}</div>}
        {busy.startsWith("meet:")&&<div className="tw-progress" role="status"><div className="tw-spinner"/> <strong>{["Connecting the two AI agents…","Each twin is exploring learning goals…","Designing a Korean activity…","Saving your proposed meeting…"][stage]}</strong><p>Real model calls are running. No invitation is sent until you and the other learner both approve.</p></div>}
        <div className="tw-clarifier">Only AI-generated conversations are called AI-generated. The matching labels describe self-reported skill complementarity, not scientifically validated compatibility.</div>
      </section>
    </div>
    <section id="tw-meetings" className="tw-live-meetings"><div className="tw-section-head"><span className="tw-step">03</span><div><span className="tw-kicker">THE HUMAN DECISION</span><h2>Conversations & invitations</h2></div></div>
      {!meetups.length?<div className="tw-empty-live"><h3>Nothing here yet.</h3><p>Once you send your twin to meet somebody, the real conversation and shared activity will appear here for both accounts.</p></div>:
      <div className="tw-meet-grid">
        <div className="tw-meet-list">{meetups.map(m=>{
          const id=m.user_low===user.id?m.user_high:m.user_low;
          const name=people.find(p=>p.user_id===id)?.twin_name||"Your twin's partner";
          return <button key={m.id} className={"tw-meet-pick "+(m.id===selected?.id?"active":"")} onClick={()=>setSelected(m)}><strong>✦ {name}</strong><span>{cap(m.status)} · {new Date(m.created_at).toLocaleDateString()}</span></button>})}</div>
        {selected&&<div className="tw-meet-detail"><div className="tw-selected-top"><div><span className="tw-kicker">THE ACTUAL AGENT CONVERSATION</span><h3>{form.twin_name} × {peer?.twin_name||"Another twin"}</h3></div><span className="tw-tag">{cap(selected.status)}</span></div>
          <p className="tw-muted">Model-generated dialogue from two distinct prompted learner agents. These are not messages written by the human learners.</p>
          <div className="tw-transcript">{(selected.transcript||[]).map((line,i)=><div key={i} className={"tw-line "+(i%2?"partner":"own")}><small>{line.speaker}</small><p>{line.text}</p></div>)}</div>
          <div className="tw-plan tw-live-plan"><span className="tw-kicker">{selected.plan?.source==="groq"?"AI-GENERATED PRACTICE":"GUIDED FALLBACK PRACTICE"}</span><h3>{selected.plan?.title}</h3><p>{selected.plan?.summary}</p><ol>{(selected.plan?.steps||[]).map((step,i)=><li key={i}><span>0{i+1}</span>{step}</li>)}</ol><div className="tw-korean" lang="ko">{selected.plan?.opener}</div>
            {selected.status==="proposed"&&<><div className="tw-approvals"><span>Your approval: {mineApproved?"✓ Yes":"Pending"}</span><span>Other learner: {otherApproved?"✓ Yes":"Pending"}</span></div>
              {!mineApproved&&<div className="tw-actions"><button disabled={Boolean(busy)} className="tw-primary" onClick={()=>decide(true)}>Approve this practice plan ↗</button><button disabled={Boolean(busy)} className="tw-secondary" onClick={()=>decide(false)}>Decline</button></div>}
              {mineApproved&&<p className="tw-confirm">Your approval is saved. Waiting for the other learner. No room opens until both agree.</p>}
            </>}
            {selected.status==="accepted"&&<><p className="tw-confirm">Both people accepted. This plan was added to your Study Partners sessions.</p><a className="tw-primary tw-link-button" href={activeRoom?"/study-partners?room="+activeRoom.id+"&tab=practice":"/study-partners"}>Open your shared study room ↗</a></>}
            {selected.status==="declined"&&<p className="tw-muted">This invitation was declined. No new room was opened.</p>}
          </div>
        </div>}
      </div>}
    </section>
    <footer className="tw-footer"><span>HALLIUM / AI DOPPELGÄNGER · CONSENT-FIRST PILOT</span><span>SHARED SUMMARIES ONLY · TWO HUMAN APPROVALS</span></footer>
  </div></main>;
}
