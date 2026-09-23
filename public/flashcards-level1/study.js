/* Hallium Starter Unit 01 — image-first cards inspired by the owner's seven KyouStudy reference screenshots.
   The previous flip-card UI and animated stage are deliberately not loaded.
   Keep the established browser-only progress key so existing answers and bookmarks survive the redesign. */
(() => {
"use strict";
const WORDS=window.HALLIUM_STARTER_WORDS||[],ART=window.HALLIUM_STARTER_ART||{},GROUPS=window.HALLIUM_STARTER_GROUPS||["All","Greetings","Identity","Objects","Places"];
const KEY="hallium:starter-level1:flashcards:v1",PACE_KEY="hallium:starter-level1:voice-pace";
const $=id=>document.getElementById(id);
if(WORDS.length!==12||WORDS.some(word=>!ART[word.art])){document.body.textContent="The Hallium starter deck could not load. Please refresh.";return}
const blank=()=>({known:0,learning:0,saved:false,status:"new",dueAt:null,lastAt:null,listened:false,revealed:false});
const safe=id=>WORDS.some(w=>w.id===id);
const fallback=()=>({selected:WORDS[0].id,group:"All",mode:"visual",cards:{}});
function read(){try{let s=JSON.parse(localStorage.getItem(KEY));if(!s||typeof s!=="object"||!s.cards||typeof s.cards!=="object")return fallback();return{selected:safe(s.selected)?s.selected:WORDS[0].id,group:GROUPS.includes(s.group)?s.group:"All",mode:s.mode||"visual",cards:s.cards}}catch{return fallback()}}
let state=read(),reviewMode=false,messageTimer=null,voiceTimer=null;
const query=new URLSearchParams(location.search).get("word");if(safe(query)){state.selected=query;state.group="All"}
try{if(["natural","clear","slow"].includes(localStorage.getItem(PACE_KEY)))$("pace").value=localStorage.getItem(PACE_KEY)}catch{}
const word=()=>WORDS.find(w=>w.id===state.selected)||WORDS[0];
const record=()=>state.cards[state.selected]||(state.cards[state.selected]=blank());
const visible=()=>reviewMode?WORDS.filter(w=>(state.cards[w.id]||{}).status==="learn"):state.group==="All"?WORDS:WORDS.filter(w=>w.group===state.group);
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{message("Browser storage is unavailable; this session may not save your choices.")}}
function message(text){$("state-message").textContent=text;if(messageTimer)clearTimeout(messageTimer)}
function sound(text){if(!("speechSynthesis" in window)||typeof SpeechSynthesisUtterance==="undefined"){message("Korean speech is unavailable on this device.");return}
 const utterance=new SpeechSynthesisUtterance(text),rate={natural:.98,clear:.83,slow:.69}[$("pace").value]||.98;
 utterance.lang="ko-KR";utterance.rate=rate;utterance.pitch=1;utterance.volume=1;
 const voices=speechSynthesis.getVoices();const ko=voices.find(v=>/^ko-KR$/i.test(v.lang)&&/google|microsoft/i.test(v.name))||voices.find(v=>/^ko(-|$)/i.test(v.lang));if(ko)utterance.voice=ko;
 const current=state.selected;utterance.onstart=()=>{$("play-word").classList.add("playing");if(state.selected===current){record().listened=true;persist()}};
 const stop=()=>{$("play-word").classList.remove("playing")};utterance.onend=stop;utterance.onerror=()=>{stop();message("Korean audio could not play. Check the Korean voice installed on your device.")};
 try{speechSynthesis.cancel();speechSynthesis.speak(utterance)}catch{stop();message("Audio couldn't start on this device.")}}
function refreshList(){const list=$("word-list");list.replaceChildren();WORDS.forEach((w,i)=>{const c=state.cards[w.id]||blank();const btn=document.createElement("button");btn.type="button";btn.className="word-item";btn.setAttribute("aria-current",String(w.id===state.selected));btn.setAttribute("aria-label","Study "+w.ko+" "+w.short);const n=document.createElement("span");n.className="word-index";n.textContent=String(i+1).padStart(2,"0");const k=document.createElement("strong");k.lang="ko";k.textContent=w.ko;const st=document.createElement("small");st.textContent=c.saved?"♥":c.status==="know"?"✓":c.status==="learn"?"↻":"·";btn.append(n,k,st);btn.addEventListener("click",()=>go(w.id));list.append(btn)})}
function refreshFilters(){const root=$("filters");root.replaceChildren();GROUPS.forEach(g=>{const b=document.createElement("button");b.type="button";b.className="filter";b.setAttribute("aria-pressed",String(!reviewMode&&g===state.group));b.textContent=g;b.addEventListener("click",()=>{reviewMode=false;state.group=g;if(!visible().some(w=>w.id===state.selected))state.selected=visible()[0].id;render();persist()});root.append(b)})}
function render(){const w=word(),c=record(),items=visible(),index=items.findIndex(x=>x.id===w.id),absolute=WORDS.findIndex(x=>x.id===w.id);
 if(index<0){reviewMode=false;state.group="All";return render()}
 $("art").innerHTML=ART[w.art];$("art").setAttribute("aria-label",w.description);$("group").textContent=w.group.toUpperCase()+" · "+String(absolute+1).padStart(2,"0");$("word").textContent=w.ko;$("latin").textContent="["+w.ko+"] "+w.latin;$("meaning").textContent=w.meaning;
 $("explanation").textContent=w.description.replace(/\.$/,"")+".";
 $("part").textContent="PART OF SPEECH · "+(w.type.startsWith("NOUN")?"명사 (noun)":w.type==="POLITE GREETING"?"인사 (greeting)":w.type);
 $("example").textContent=w.example;$("translation").textContent=w.translation;$("tip").textContent=w.tip;$("contrast").textContent=w.contrast;
 $("bookmark").setAttribute("aria-pressed",String(c.saved));$("bookmark").setAttribute("aria-label",(c.saved?"Remove bookmark for ":"Bookmark ")+w.ko);
 $("know").classList.toggle("selected",c.status==="know");$("learn").classList.toggle("selected",c.status==="learn");$("know").setAttribute("aria-pressed",String(c.status==="know"));$("learn").setAttribute("aria-pressed",String(c.status==="learn"));
 const chosen=c.status==="know"?"✓ You marked this word as familiar.":c.status==="learn"?"↻ This word is in your review queue.":"Choose how this word feels to you. You can change your answer later.";
 message(chosen);
 $("position").textContent="Card "+(absolute+1)+" of "+WORDS.length;$("position-progress").setAttribute("aria-valuenow",String(absolute+1));$("position-meter").style.width=(absolute+1)/WORDS.length*100+"%";
 $("back").disabled=index===0;$("next").disabled=index>=items.length-1;
 const all=WORDS.map(item=>state.cards[item.id]||blank()),known=all.filter(c=>c.status==="know").length,learning=all.filter(c=>c.status==="learn").length,saved=all.filter(c=>c.saved).length;
 $("known-count").textContent=known;$("learning-count").textContent=learning;$("saved-count").textContent=saved;$("sidebar-count").textContent=(known+learning)+" / 12";$("sidebar-meter").style.width=(known+learning)/12*100+"%";
 $("review-only").disabled=learning===0;$("review-only").textContent=reviewMode?"Return to full deck ↗":"Review "+learning+" learning word"+(learning===1?"":"s")+" ↗";
 refreshList();refreshFilters();document.title=w.ko+" · Korean Flashcards — Hallium";
 }
function go(id){if(!safe(id))return;state.selected=id;if(!visible().some(w=>w.id===id)){reviewMode=false;state.group="All"}if("speechSynthesis" in window)speechSynthesis.cancel();render();persist();try{history.replaceState(null,"",location.pathname+"?word="+encodeURIComponent(id))}catch{}}
function move(n){const arr=visible(),idx=arr.findIndex(w=>w.id===state.selected),dest=arr[idx+n];if(dest)go(dest.id)}
function vote(kind){const c=record();c.status=kind;c[kind==="know"?"known":"learning"]=(Number(c[kind==="know"?"known":"learning"])||0)+1;c.lastAt=new Date().toISOString();c.dueAt=new Date(Date.now()+(kind==="know"?3:1)*86400000).toISOString();persist();render();message(kind==="know"?"✓ Saved. You can revisit this word anytime.":"↻ Added to your review queue. Come back to it tomorrow.")}
$("know").addEventListener("click",()=>vote("know"));$("learn").addEventListener("click",()=>vote("learn"));
$("bookmark").addEventListener("click",()=>{record().saved=!record().saved;persist();render();message(record().saved?"♥ Saved to your word collection.":"Removed from your word collection.")});
$("play-word").addEventListener("click",()=>sound(word().ko));$("play-example").addEventListener("click",()=>sound(word().example));
$("back").addEventListener("click",()=>move(-1));$("next").addEventListener("click",()=>move(1));
$("choose").addEventListener("click",()=>{const menu=$("word-list");menu.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});menu.querySelector('[aria-current="true"]')?.focus({preventScroll:true})});
$("pace").addEventListener("change",()=>{try{localStorage.setItem(PACE_KEY,$("pace").value)}catch{};message("Playback pace: "+$("pace").selectedOptions[0].text+".")});
$("review-only").addEventListener("click",()=>{reviewMode=!reviewMode;if(reviewMode){const first=WORDS.find(w=>(state.cards[w.id]||{}).status==="learn");if(first)state.selected=first.id}else state.group="All";render();persist()});
document.addEventListener("keydown",e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest("input,select,textarea,button,a,summary"))return;if(e.key==="ArrowRight"){e.preventDefault();move(1)}if(e.key==="ArrowLeft"){e.preventDefault();move(-1)}});
render();persist();
})();