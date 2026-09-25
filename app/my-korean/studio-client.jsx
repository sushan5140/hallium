"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getHallimSupabase } from "../../lib/supabase/client";

const emptyState = () => ({ saved_items: {}, personal_notes: {}, lesson_results: {} });
const tabs = [
  { id: "vocabulary", label: "Vocabulary" },
  { id: "grammar", label: "Grammar" },
  { id: "reading", label: "Reading" },
  { id: "listening", label: "Listening" },
  { id: "writing", label: "Writing" },
  { id: "test", label: "Lesson test" },
];
const slug = (kind, lessonId, index) => kind + ":" + lessonId + ":" + index;
const lkey = (id) => "l" + id;
const norm = (value) => String(value || "").trim().toLowerCase()
  .replace(/[.!?。！？,，‘’“”"']/g,"").replace(/\\s+/g,"").replace(/\s+/g,"");
const padded = (n) => String(n).padStart(2, "0");

function buildQuiz(lesson, attempts = 0) {
  const vocabulary = Array.from({length: 5}, (_, i) => {
    const index = ((attempts % 3) * 5 + i) % lesson.vocabulary.length;
    const word = lesson.vocabulary[index];
    const wrong = lesson.vocabulary
      .filter((v, n) => n !== index && v.meaning !== word.meaning)
      .filter((v, n, a) => a.findIndex((x) => x.meaning === v.meaning) === n);
    const distractors = [wrong[(index + 2) % wrong.length],wrong[(index + 6) % wrong.length],wrong[(index + 10) % wrong.length]];
    const ordered = [word, ...distractors].sort((a, b) =>
      ((lesson.vocabulary.indexOf(a) * 7 + index + attempts) % 17) -
      ((lesson.vocabulary.indexOf(b) * 7 + index + attempts) % 17));
    return {
      id: "v" + index, type: "vocabulary",
      prompt: "What does " + word.ko + " mean?",
      choices: ordered.map((v) => v.meaning), answer: word.meaning,
    };
  });
  return [...lesson.checks.map((q, i) => ({
    id: "g" + i, type: "grammar", prompt: q.question, answer: q.answer,
  })), ...vocabulary];
}
function SpeakButton({ value, say, children = "Listen" }) {
  return <button type="button" className="oks-audio" onClick={() => say(value)}
    aria-label={"Play Korean audio for " + value.slice(0,60)}>
    <span aria-hidden="true">◖))</span> {children}
  </button>;
}
export default function OwnerStudyClient({ course, initialState, stateError, userId }) {
  const [activeId,setActiveId] = useState(1);
  const [tab,setTab] = useState("vocabulary");
  const [state,setState] = useState(() => ({
    ...emptyState(),...(initialState || {}),
    saved_items: initialState?.saved_items || {},
    personal_notes: initialState?.personal_notes || {},
    lesson_results: initialState?.lesson_results || {},
  }));
  const [dirty,setDirty] = useState(0);
  const [saveStatus,setSaveStatus] = useState(stateError || "Saved privately");
  const [quizAnswers,setQuizAnswers] = useState({});
  const [quizChecked,setQuizChecked] = useState(false);
  const [quizRound,setQuizRound] = useState(initialState?.lesson_results?.l1?.attempts || 0);
  const [readingRevealed,setReadingRevealed] = useState({});
  const [listeningRevealed,setListeningRevealed] = useState({});
  const [showScript,setShowScript] = useState(false);
  const [vaultOpen,setVaultOpen] = useState(false);
  const [voicePlaying,setVoicePlaying] = useState(false);
  const lastSavedRef=useRef(null);
  const lesson=course.find((l) => l.id === activeId) || course[0];
  const result=state.lesson_results[lkey(activeId)] || {};
  const quiz=useMemo(() => buildQuiz(lesson,quizRound),[lesson,quizRound]);
  const savedEntries=useMemo(() =>
    Object.entries(state.saved_items).filter(([,value])=>value).map(([key])=>{
      const [type,id,n]=key.split(":");
      const source=course.find((l)=>l.id===Number(id));
      const item=type==="v"?source?.vocabulary[Number(n)]:source?.grammar[Number(n)];
      return item ? { key,kind:type,lesson:source,item } : null;
    }).filter(Boolean),[state.saved_items,course]);
  const learnedVocabulary=(result.learnedVocab || []).length;
  const learnedGrammar=(result.learnedGrammar || []).length;
  const lessonsTested=course.filter((l)=>state.lesson_results[lkey(l.id)]?.attempts>0).length;
  const savedCount=savedEntries.length;

  // Owner-only table independently checks signed-in uid, JWT email, and
  // admin_users membership in Postgres RLS; this browser is never trusted.
  useEffect(()=>{
    if (!dirty || stateError) return;
    let cancelled=false;
    setSaveStatus("Saving privately…");
    const timer=window.setTimeout(async()=>{
      const payload={
        user_id:userId,saved_items:state.saved_items,
        personal_notes:state.personal_notes,
        lesson_results:state.lesson_results,
        updated_at:new Date().toISOString()
      };
      const {error}=await getHallimSupabase().from("owner_korean_study")
        .upsert(payload,{onConflict:"user_id"});
      if(!cancelled){
        if(error)setSaveStatus("Save failed · retry by editing a note");
        else {
          lastSavedRef.current=Date.now();
          setSaveStatus("Saved privately ✓");
        }
      }
    },650);
    return()=>{cancelled=true;window.clearTimeout(timer);};
  },[dirty,state,stateError,userId]);

  function mutate(change){
    if(stateError)return;
    setState(prev=>change(prev));
    setDirty(n=>n+1);
  }
  function toggleSaved(kind,index){
    const key=slug(kind,activeId,index);
    mutate(prev=>({...prev,saved_items:{...prev.saved_items,[key]:!prev.saved_items[key]}}));
  }
  function toggleLearned(kind,index){
    const field=kind==="v"?"learnedVocab":"learnedGrammar",key=lkey(activeId);
    mutate(prev=>{
      const old=prev.lesson_results[key] || {};
      const oldList=old[field]||[];
      const next=oldList.includes(index)?oldList.filter(n=>n!==index):[...oldList,index];
      return {...prev,lesson_results:{...prev.lesson_results,[key]:{...old,[field]:next}}};
    });
  }
  function updateNote(key,value){
    mutate(prev=>({...prev,personal_notes:{...prev.personal_notes,[key]:value.slice(0,600)}}));
  }
  function updateWriting(value){
    const key=lkey(activeId);
    mutate(prev=>{
      const old=prev.lesson_results[key] || {};
      return {...prev,lesson_results:{...prev.lesson_results,[key]:{...old,writing:value.slice(0,3000)}}};
    });
  }
  function say(text){
    if(!("speechSynthesis" in window)){setSaveStatus("Korean audio is unavailable in this browser");return;}
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text.replace(/(?:^|\n)(?:가|나|점원|손님):\s*/g," "));
    u.lang="ko-KR";u.rate=.88;
    const ko=window.speechSynthesis.getVoices().filter(v=>v.lang?.toLowerCase().startsWith("ko"));
    u.voice=ko.find(v=>/google|microsoft/i.test(v.name))||ko[0]||null;
    u.onstart=()=>setVoicePlaying(true);
    u.onend=()=>setVoicePlaying(false);
    u.onerror=()=>setVoicePlaying(false);
    window.speechSynthesis.speak(u);
  }
  useEffect(()=>()=>{if(typeof window!=="undefined")window.speechSynthesis?.cancel()},[]);
  function selectLesson(id){
    window.speechSynthesis?.cancel();
    setVoicePlaying(false);setActiveId(id);setTab("vocabulary");
    setQuizAnswers({});setQuizChecked(false);
    setQuizRound(state.lesson_results[lkey(id)]?.attempts || 0);setShowScript(false);
    setReadingRevealed({});setListeningRevealed({});
    setVaultOpen(false);
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function selectTab(next){
    setTab(next);setQuizAnswers({});setQuizChecked(false);
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function checkQuiz(){
    if(quizChecked || quiz.some(q=>!String(quizAnswers[q.id]||"").trim()))return;
    const perQuestion=quiz.map((q)=>norm(quizAnswers[q.id])===norm(q.answer));
    const points=perQuestion.filter(Boolean).length,key=lkey(activeId);
    mutate(prev=>{
      const old=prev.lesson_results[key]||{};
      return {...prev,lesson_results:{...prev.lesson_results,[key]:{
        ...old,attempts:(old.attempts||0)+1,latestScore:points,
        bestScore:Math.max(old.bestScore||0,points),
        lastTestAt:new Date().toISOString()
      }}};
    });
    setQuizChecked(true);
  }
  function newQuiz(){setQuizRound(result.attempts || 0);setQuizAnswers({});setQuizChecked(false);}
  const answered=quiz.filter(q=>String(quizAnswers[q.id]||"").trim()).length;
  return <div className="owner-studio">
    <header className="oks-topbar">
      <a href="/" className="oks-brand"><span className="oks-brand-mark">ㅎ</span>
        <span><strong>Hallium<span>.</span></strong><small>PERSONAL KOREAN STUDIO</small></span></a>
      <span className="oks-private"><i aria-hidden="true">●</i> PRIVATE · OWNER ACCESS</span>
      <a href="/" className="oks-home-link">← Back to Hallium</a>
    </header>
    <div className="oks-shell">
      <aside className="oks-rail">
        <div className="oks-rail-intro"><span className="oks-eyebrow">YOUR OWN STUDY SPACE</span>
          <h1>One lesson,<br/>a little more<br/><em>Korean.</em></h1>
          <p>Ten structured foundations from your two uploaded study batches. Your progress stays private.</p>
        </div>
        <div className="oks-rail-head"><span>01 · COURSE MAP</span><strong>10 lessons</strong></div>
        <nav aria-label="Your private Korean lesson list" className="oks-lesson-list">
          {course.map((item)=>{
            const record=state.lesson_results[lkey(item.id)]||{};
            return <button key={item.id} className={"oks-lesson-link"+(activeId===item.id?" is-active":"")}
              aria-current={activeId===item.id?"page":undefined} onClick={()=>selectLesson(item.id)}>
              <span className="oks-lesson-number">{padded(item.id)}</span>
              <span className="oks-lesson-copy"><strong>{item.title}</strong>
                <small>{record.attempts ? "Tested · "+record.bestScore+"/8 best" : "15 words · 2 grammar"}</small></span>
              <span className="oks-link-arrow" aria-hidden="true">↗</span>
            </button>;
          })}
        </nav>
        <div className="oks-rail-tip"><span>✦ SMALL STEPS, LONG DISTANCE</span>
          <p>These ten lessons establish TOPIK I foundations. Level 3 comes in later batches—not in this pack.</p>
        </div>
      </aside>

      <main className="oks-main">
        <div className="oks-heading">
          <div><span className="oks-eyebrow">BATCH {activeId<=5?"01":"02"} · LESSON {padded(activeId)}</span>
            <h2>{lesson.title}<span>.</span></h2><p>{lesson.aim}</p></div>
          <span className="oks-batch-badge">{activeId<=5?"FOUNDATIONS I":"FOUNDATIONS II"}</span>
        </div>
        <div className="oks-metrics">
          <div><span>WORDS</span><strong>{learnedVocabulary}<small>/ 15 learned</small></strong></div>
          <div><span>GRAMMAR</span><strong>{learnedGrammar}<small>/ 2 learned</small></strong></div>
          <div><span>YOUR TEST BEST</span><strong>{result.attempts ? result.bestScore+" / 8" : "Not yet"}<small>{result.attempts?result.attempts+" attempt"+(result.attempts===1?"":"s"):"try whenever ready"}</small></strong></div>
        </div>
        <nav className="oks-tabs" aria-label="Lesson study sections">
          {tabs.map(item=><button key={item.id} className={tab===item.id?"is-active":""}
            aria-current={tab===item.id?"page":undefined} onClick={()=>selectTab(item.id)}>{item.label}</button>)}
        </nav>

        {tab==="vocabulary"&&<section className="oks-content" aria-label="Vocabulary to learn">
          <div className="oks-section-top"><div><span className="oks-eyebrow">A · 15 TARGET ITEMS</span>
            <h3>Learn the words in this lesson.</h3><p>Play the Korean, mark what you recognize, and pin anything worth revisiting.</p></div>
            <span className="oks-section-counter">{learnedVocabulary} / 15 recognized</span>
          </div>
          <div className="oks-word-grid">{lesson.vocabulary.map((word,index)=>{
            const key=slug("v",activeId,index),saved=!!state.saved_items[key],learned=(result.learnedVocab||[]).includes(index);
            return <article className={"oks-word"+(learned?" is-learned":"")} key={key}>
              <span className="oks-word-index">{padded(index+1)}</span>
              <div className="oks-word-copy"><strong lang="ko">{word.ko}</strong><span>{word.meaning}</span></div>
              <div className="oks-word-actions">
                <button onClick={()=>toggleLearned("v",index)} className={learned?"is-on":""} title={learned?"Mark as still learning":"Mark recognized"} aria-pressed={learned}>{learned?"✓ Learned":"Mark learned"}</button>
                <button onClick={()=>toggleSaved("v",index)} className={saved?"is-saved":""} aria-pressed={saved} title={saved?"Remove saved word":"Save this word"}>{saved?"★":"☆"}</button>
                <SpeakButton value={word.ko} say={say}>Hear</SpeakButton>
              </div>
            </article>;
          })}</div>
          <div className="oks-section-foot"><span>Recognized is your personal self-check, not an exam score.</span>
            <button onClick={()=>selectTab("grammar")}>Next: grammar ↗</button></div>
        </section>}

        {tab==="grammar"&&<section className="oks-content">
          <div className="oks-section-top"><div><span className="oks-eyebrow">B · TWO PRIMARY TARGETS</span>
            <h3>Make sense of the pattern.</h3><p>Clear rule, examples and your own saved reference for each grammar point.</p></div></div>
          <div className="oks-grammar-list">{lesson.grammar.map((g,index)=>{
            const key=slug("g",activeId,index),saved=!!state.saved_items[key],learned=(result.learnedGrammar||[]).includes(index);
            return <article className="oks-grammar" key={key}>
              <div className="oks-grammar-head"><span className="oks-grammar-no">0{index+1}</span>
                <div><span className="oks-eyebrow">{g.meaning}</span><h4>{g.name}</h4></div>
                <button onClick={()=>toggleSaved("g",index)} className={saved?"is-saved":""}
                  aria-pressed={saved}>{saved?"★ Saved":"☆ Save"}</button>
              </div>
              <p className="oks-rule">{g.explanation}</p>
              <div className="oks-examples">{g.examples.map((ex,i)=><div key={i}>
                <div className="oks-example-line"><strong lang="ko">{ex.ko}</strong><SpeakButton value={ex.ko} say={say}>Hear</SpeakButton></div>
                {ex.en&&<small>{ex.en}</small>}
              </div>)}</div>
              <button className={"oks-mark"+(learned?" is-on":"")} onClick={()=>toggleLearned("g",index)} aria-pressed={learned}>
                {learned?"✓ I have learned this grammar":"Mark this grammar as learned"} ↗</button>
            </article>;
          })}</div>
          <div className="oks-section-foot"><span>Two new primary grammar targets per lesson. Reused patterns are review.</span>
            <button onClick={()=>selectTab("reading")}>Next: reading ↗</button></div>
        </section>}

        {tab==="reading"&&<section className="oks-content">
          <div className="oks-section-top"><div><span className="oks-eyebrow">C · READ AND UNDERSTAND</span>
            <h3>Read the scene, not just the words.</h3><p>Answer from the Korean first. Reveal the source answer when ready.</p></div></div>
          <article className="oks-reading" lang="ko">{lesson.reading}<SpeakButton value={lesson.reading} say={say}>Hear the passage</SpeakButton></article>
          <div className="oks-question-list">{lesson.readingQuestions.map(([question,answer],index)=>{
            const visible=readingRevealed[index];
            return <article className="oks-study-question" key={index}><span>R{index+1}</span>
              <h4 lang="ko">{question}</h4><button onClick={()=>setReadingRevealed(prev=>({...prev,[index]:!visible}))}>
                {visible?"Hide source answer":"Reveal source answer"} ↗</button>
              {visible&&<p className="oks-answer" lang="ko">{answer}</p>}
            </article>;
          })}</div><div className="oks-section-foot"><span>These are original practice prompts, not official TOPIK past questions.</span>
            <button onClick={()=>selectTab("listening")}>Next: listening ↗</button></div>
        </section>}

        {tab==="listening"&&<section className="oks-content">
          <div className="oks-section-top"><div><span className="oks-eyebrow">D · LISTEN FIRST</span>
            <h3>Listen without the script.</h3><p>The PDF contains teacher scripts, not recorded audio. Browser Korean text-to-speech reads the original script aloud.</p></div></div>
          <div className="oks-listen-hero"><span className="oks-sound-symbol" aria-hidden="true">♫</span>
            <h4>Listen twice. Catch the meaning.</h4>
            <button className="oks-primary" onClick={()=>say(lesson.listening)}>{voicePlaying?"Playing Korean…":"▶ Play Korean exchange"}</button>
            <small>Tip: answer the two questions before revealing the transcript.</small>
          </div>
          <div className="oks-question-list">{lesson.listeningQuestions.map(([question,answer],index)=>{
            const visible=listeningRevealed[index];
            return <article className="oks-study-question" key={index}><span>L{index+1}</span>
              <h4 lang="ko">{question}</h4><button onClick={()=>setListeningRevealed(prev=>({...prev,[index]:!visible}))}>
                {visible?"Hide source answer":"Reveal source answer"} ↗</button>
              {visible&&<p className="oks-answer" lang="ko">{answer}</p>}
            </article>;
          })}</div>
          <button className="oks-script-toggle" onClick={()=>setShowScript(v=>!v)}>{showScript?"Hide teacher script":"Reveal teacher script after listening"} ↗</button>
          {showScript&&<pre className="oks-script" lang="ko">{lesson.listening}</pre>}
          <div className="oks-section-foot"><span>No prerecorded audio is included in the PDFs.</span><button onClick={()=>selectTab("writing")}>Next: writing ↗</button></div>
        </section>}

        {tab==="writing"&&<section className="oks-content">
          <div className="oks-section-top"><div><span className="oks-eyebrow">E · PRODUCE KOREAN</span>
            <h3>Make it yours.</h3><p>Try the original lesson's writing prompt. Your draft saves privately as you type.</p></div></div>
          <div className="oks-writing-prompt"><span>YOUR TASK</span><h4>{lesson.writing}</h4></div>
          <label className="oks-writing-label" htmlFor="oks-writing">Your Korean response</label>
          <textarea id="oks-writing" value={result.writing||""} maxLength={3000} placeholder="한국어로 써 보세요…"
            onChange={(e)=>updateWriting(e.target.value)} lang="ko" />
          <p className="oks-writing-caption">Personal writing is not auto-scored. Compare it against the lesson grammar and edit freely.</p>
          <div className="oks-section-foot"><span>Your private draft stays attached to Lesson {padded(activeId)}.</span>
            <button onClick={()=>selectTab("test")}>Take the lesson test ↗</button></div>
        </section>}

        {tab==="test"&&<section className="oks-content">
          <div className="oks-section-top"><div><span className="oks-eyebrow">F · QUICK LESSON CHECK</span>
            <h3>Test this lesson, right now.</h3><p>Three original PDF grammar/vocabulary prompts + five rotating words from this lesson only. Retake three times to meet all fifteen words.</p></div>
            <span className="oks-section-counter">8 questions</span>
          </div>
          {result.attempts>0&&<div className="oks-last-score">
            <span>YOUR RECORD</span><strong>{result.bestScore}/8 best</strong><small>{result.attempts} saved attempt{result.attempts===1?"":"s"}</small>
          </div>}
          <div className="oks-quiz">{quiz.map((q,index)=>{
            const value=quizAnswers[q.id]||"";
            const correct=norm(value)===norm(q.answer);
            return <article className={"oks-quiz-card"+(quizChecked?(correct?" is-correct":" is-wrong"):"")} key={q.id}>
              <span className="oks-quiz-tag">{index<3?"GRAMMAR / SOURCE CHECK":"VOCABULARY / THIS LESSON"} · {padded(index+1)}</span>
              <h4>{q.prompt}</h4>
              {q.choices?<div className="oks-choices">{q.choices.map(choice=><button key={choice}
                disabled={quizChecked} className={value===choice?"is-picked":""}
                aria-pressed={value===choice} onClick={()=>setQuizAnswers(prev=>({...prev,[q.id]:choice}))}>
                {choice}</button>)}</div>:
                <input lang="ko" aria-label={"Answer question "+(index+1)}
                  value={value} disabled={quizChecked} autoComplete="off" spellCheck={false}
                  onChange={e=>setQuizAnswers(prev=>({...prev,[q.id]:e.target.value}))}
                  placeholder="Your answer in Korean…" />}
              {quizChecked&&<p className="oks-quiz-answer">{correct?"✓ Correct":"Answer: "+q.answer}</p>}
            </article>;
          })}</div>
          {!quizChecked?<button className="oks-primary oks-submit" disabled={answered!==quiz.length}
            onClick={checkQuiz}>Check all answers · {answered}/{quiz.length} ready ↗</button>:
            <div className="oks-test-result"><span>CHECK COMPLETE</span>
              <strong>{result.latestScore} / 8</strong><p>Saved privately. The next round rotates five more words from this lesson.</p>
              <button onClick={newQuiz}>Try another vocabulary set ↗</button>
              <button onClick={()=>selectTab("vocabulary")}>Review this lesson ↗</button>
            </div>}
        </section>}
      </main>
      <aside className="oks-vault-rail">
        <div className="oks-privacy"><span>✦ YOUR PRIVATE COLLECTION</span>
          <h3>Keep what<br/>matters.</h3>
          <p>Pin a word or grammar point from any lesson. Add a personal note and return here later.</p>
        </div>
        <div className="oks-overview">
          <div><strong>{savedCount}</strong><span>saved items</span></div>
          <div><strong>{lessonsTested}</strong><span>lessons tested</span></div>
        </div>
        <button className="oks-vault-toggle" aria-expanded={vaultOpen} onClick={()=>setVaultOpen(v=>!v)}>
          {vaultOpen?"Hide saved library":"Open saved library"} <span>{savedCount} ↗</span>
        </button>
        {(vaultOpen||savedCount>0)&&<div className="oks-vault-list">
          {savedEntries.length===0?<p>Tap ☆ on a word or grammar pattern to build your private review list.</p>:
            savedEntries.map(({key,kind,lesson:origin,item})=><article key={key}>
              <div><small>LESSON {padded(origin.id)} · {kind==="v"?"WORD":"GRAMMAR"}</small>
                <button onClick={()=>{mutate(prev=>({...prev,saved_items:{...prev.saved_items,[key]:false}}))}}
                  aria-label={"Unsave "+(item.ko||item.name)}>✕</button></div>
              <strong lang="ko">{item.ko||item.name}</strong><p>{item.meaning}</p>
              <label>Personal note<textarea maxLength={600} value={state.personal_notes[key]||""}
                placeholder="Why did I save this? Example, memory trick…"
                onChange={e=>updateNote(key,e.target.value)}/></label>
              <button className="oks-vault-jump" onClick={()=>{selectLesson(origin.id);selectTab(kind==="v"?"vocabulary":"grammar");}}>Go to lesson ↗</button>
            </article>)}
        </div>}
        <div className="oks-save-status" role="status" aria-live="polite">{saveStatus}</div>
        <div className="oks-vault-note">Only your signed-in owner account can open this page or read and change these saved items. Learning status and quiz scores are for your personal study.</div>
      </aside>
    </div>
  </div>;
}
