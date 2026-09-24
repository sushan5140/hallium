"use client";
import {useCallback,useEffect,useState} from "react";
import {topikUnits} from "../topik-companion/curriculum";
import s from "./bridge.module.css";
const KOREAN="hallim:vercel:lessons:v2";
const TOPIK="hallium:topik-companion:v1";
const PREFERENCE="hallium:topik-bridge:v1";
const row=(unit,title,ids,topik)=>({unit,title,ids:ids.map(n=>"unit-"+unit+"-lesson-"+n),topik:topik.map(n=>"i"+String(n).padStart(2,"0"))});
const stages=[
 row(1,"First words and introductions",[1,2,3,4,5,6],[1,2]),
 row(2,"My day and my plans",[1,2,3,4,5],[6,7]),
 row(3,"Food, requests and counting",[1,2,3,4,5],[4,5]),
 row(4,"Shopping and comparisons",[1,2,3,4,5],[9,10]),
 row(5,"Places, directions and messages",[1,2,3,4,5],[3,11]),
 row(6,"Past events and reasons",[1,2,3,4,5],[8,12])
];
const lessonNames={
 1:["Meeting someone new","What's this?","Places around me","Where are you going?","A tiny first conversation","Unit 1 checkpoint"],
 2:["My morning","What time is it?","What I like","Weekend plans","Unit 2 checkpoint"],
 3:["Food I know","One, two, three","What do you want?","At the counter","Unit 3 checkpoint"],
 4:["How much is this?","Do you have this?","I’ll take this one","Shopping conversation","Unit 4 checkpoint"],
 5:["Where is it?","Go straight","Let’s meet there","Finding each other","Unit 5 checkpoint"],
 6:["What did you do?","It was good","I’m going to","Weekend recap & next plan","Unit 6 checkpoint"]
};
function read(){
 try{
  const everyday=JSON.parse(localStorage.getItem(KOREAN)||"{}");
  const topik=JSON.parse(localStorage.getItem(TOPIK)||"{}");
  const prefs=JSON.parse(localStorage.getItem(PREFERENCE)||"{}");
  return {everyday:everyday&&typeof everyday==="object"?everyday:{},topik:topik&&typeof topik==="object"?topik:{},target:prefs?.target===2?2:1};
 }catch{return {everyday:{},topik:{},target:1}}
}
const total=stages.reduce((n,stage)=>n+stage.ids.length+stage.topik.length,0);
export default function Bridge(){
 const [data,setData]=useState({everyday:{},topik:{},target:1});
 const [ready,setReady]=useState(false),[expanded,setExpanded]=useState(0);
 const refresh=useCallback(()=>setData(read()),[]);
 useEffect(()=>{
  refresh();setReady(true);
  const onVisible=()=>{if(document.visibilityState==="visible")refresh()};
  window.addEventListener("focus",refresh);
  window.addEventListener("storage",refresh);
  document.addEventListener("visibilitychange",onVisible);
  return()=>{window.removeEventListener("focus",refresh);window.removeEventListener("storage",refresh);document.removeEventListener("visibilitychange",onVisible)};
 },[refresh]);
 const finishedEveryday=id=>!!data.everyday?.[id]?.completed;
 const finishedTopik=id=>!!data.topik?.results?.[id]?.done;
 const stageCount=stage=>stage.ids.filter(finishedEveryday).length+stage.topik.filter(finishedTopik).length;
 const completed=stages.reduce((n,stage)=>n+stageCount(stage),0);
 const current=stages.findIndex(stage=>stageCount(stage)<stage.ids.length+stage.topik.length);
 const nextIndex=current===-1?5:current;
 function setGoal(target){try{localStorage.setItem(PREFERENCE,JSON.stringify({target}))}catch{}setData(old=>({...old,target}))}
 if(!ready)return <main className={s.loading}>Opening Korean → TOPIK Bridge…</main>;
 return <main className={s.shell}>
  <header className={s.bar}><a className={s.brand} href="/companions"><span>ㅎ</span><strong>Hallium<small>COMPANION ROUTES</small></strong></a><nav><a href="/?view=companion">Everyday Korean</a><a href="/topik-companion">TOPIK revision</a><a href="/topik-mocks">Past papers ↗</a></nav></header>
  <div className={s.content}>
   <section className={s.hero}><span className={s.eyebrow}>FROM THE FIRST HANGUL LETTER TO EXAM PRACTICE</span><h1>Korean <em>→</em><br/>TOPIK Bridge.</h1><p>For people starting from scratch. One connected path alternates Hallium's existing real-life lessons with TOPIK I vocabulary and grammar practice. Learn what a sentence means, then learn how the exam tests it.</p><div className={s.heroLinks}><a href="/hangul">Start with Hangul ↗</a><a href="/topik-companion">I know the basics · skip to revision →</a></div></section>
   <section className={s.stats}><div><span>YOUR COMBINED LEARNING PATH</span><strong>{completed}<small> / {total}</small></strong><div className={s.track}><i style={{width:completed/total*100+"%"}}/></div><p>{total-completed} lessons and checkpoints left. Progress comes from the existing Korean and TOPIK companions—nothing is copied or reset.</p></div><div><span>YOUR PAPER-BASED TOPIK I TARGET</span><div className={s.goals} role="group" aria-label="TOPIK goal"><button aria-pressed={data.target===1} onClick={()=>setGoal(1)}>Level 1</button><button aria-pressed={data.target===2} onClick={()=>setGoal(2)}>Level 2</button></div><p><b>{data.target===1?"80":"140"} / 200 points</b> is the official PBT threshold for Level {data.target}; this is a target, not an estimated personal score.</p><small>TOPIK I PBT: listening 30 questions + reading 40. Completing this bridge does not guarantee an exam result.</small></div></section>
   <div className={s.two}><aside className={s.intro}><span className={s.eyebrow}>WHAT MAKES IT A BRIDGE</span><h2>Not two random courses.</h2><p>Each stage pairs meaningful everyday situations with two matching types of TOPIK I tasks. Return to completed lessons in either companion without starting again.</p><div className={s.concept}><b>01 · LEARN THE SOUNDS</b><p>Hangul Lab: alphabet, syllables, common sound changes and listening repetition.</p><a href="/hangul">Practice Hangul ↗</a></div><div className={s.concept}><b>02 · USE THE LANGUAGE</b><p>31 Korean Companion lessons and checkpoints covering the foundation route (Units 1–6).</p><a href="/?view=companion">Browse all everyday lessons ↗</a></div><div className={s.concept}><b>03 · RECOGNIZE EXAM TASKS</b><p>12 TOPIK Companion lessons with 60 example words, 24 patterns and 84 original mini-check items.</p><a href="/topik-companion">Open exam revision ↗</a></div><div className={s.warning}><strong>A useful foundation—not an exam guarantee.</strong><p>The current course is still a compact foundation. A broader vocabulary bank, independent listening comprehension and performance on authentic timed papers are needed before anyone should treat themselves as ready. Existing past-paper tests are not yet certified for automatic scoring.</p></div></aside>
   <section className={s.road}><div className={s.roadTitle}><div><span className={s.eyebrow}>YOUR INTEGRATED STUDY MAP</span><h2>Six connected stages.</h2><p>Finish a daily-life unit, then consolidate it with TOPIK-specific vocabulary and grammar.</p></div><span>{completed}/{total}</span></div>
   {stages.map((stage,i)=>{
    const done=stageCount(stage),maximum=stage.ids.length+stage.topik.length;
    return <article className={s.stage} key={stage.unit}><button className={s.stageHead} aria-expanded={expanded===i} onClick={()=>setExpanded(expanded===i?-1:i)}><span className={s.index}>{done===maximum?"✓":String(i+1).padStart(2,"0")}</span><span><small>STAGE {i+1} · {done} / {maximum} COMPLETE</small><strong>{stage.title}</strong><em>Everyday unit {stage.unit} + 2 TOPIK I lessons</em></span><b>{expanded===i?"−":"+"}</b></button>
    {expanded===i&&<div className={s.steps}><div className={s.pathTitle}><span>01 · KOREAN COMPANION</span><small>Existing real-life course and progress</small></div>{stage.ids.map((id,k)=><a className={s.step} key={id} href={"/?view=lesson&lesson="+id}><span className={s.tick}>{finishedEveryday(id)?"✓":String(k+1).padStart(2,"0")}</span><span><strong>{lessonNames[stage.unit][k]}</strong><small>{finishedEveryday(id)?"Completed in Korean Companion":k===stage.ids.length-1?"Unit checkpoint":"Original Korean Companion lesson"}</small></span><span>↗</span></a>)}
     <div className={s.pathTitle}><span>02 · TOPIK COMPANION</span><small>Exam-specific practice linked to the topic</small></div>{stage.topik.map(id=>{const unit=topikUnits.find(u=>u.id===id);const score=data.topik?.results?.[id];return <a className={s.step} key={id} href={"/topik-companion?unit="+id}><span className={s.tick}>{finishedTopik(id)?"✓":"토"}</span><span><strong>{unit.title}</strong><small>{score?.done?score.score+"/"+score.total+" lesson checks correct":"5 words · 2 patterns · 7 lesson checks"}</small></span><span>↗</span></a>})}
     <div className={s.stageFinish}>{done===maximum?"Stage practiced. Continue to the next stage or review weak answers.":"Return here after each lesson. Your progress refreshes when you switch back."}</div></div>}</article>
   })}
   <div className={s.next}><strong>{completed===total?"You have completed the current bridge curriculum.":"Suggested next: "+stages[nextIndex].title}</strong><button onClick={()=>setExpanded(nextIndex)}>Open this stage →</button></div>
   </section></div>
   <section className={s.paper}><div><span className={s.eyebrow}>THE NEXT SKILL TO BUILD</span><h2>Turn learning into listening and reading stamina.</h2><p>After the foundational stages, review complete official question booklets in the source-linked studio. Check the original answers manually where available; Hallium does not yet certify the audio or score automatically. Level 2 needs broader vocabulary and more consistent comprehension than this bridge currently teaches.</p></div><a href="/topik-mocks">Explore past-paper practice ↗</a></section>
   <footer>HALLIUM · KOREAN → TOPIK BRIDGE <a href="/companions">Choose another route ↗</a></footer>
  </div>
 </main>
}
