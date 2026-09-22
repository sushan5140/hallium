/* Hallium Starter Unit 1 — illustrated, non-MCQ, 12-word GitHub Pages preview.
   Preserves original one-book pilots and never writes to Hallium/Supabase. */
(() => {
"use strict";
const WORDS = window.HALLIUM_STARTER_WORDS || [];
const ART = window.HALLIUM_STARTER_ART || {};
const GROUPS = window.HALLIUM_STARTER_GROUPS || ["All","Greetings","Identity","Objects","Places"];
const KEY = "hallium:starter-level1:flashcards:v1";
const MODES = ["visual","recall","listening","sentence"];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const $ = id => document.getElementById(id);
if (WORDS.length !== 12 || WORDS.some(w => !ART[w.art])) {
  $("bar-lesson").textContent = "The starter deck is unavailable. Please refresh.";
  throw new Error("Hallium Starter Unit 1 requires 12 words and one unique illustrated scene for each.");
}
const emptyCard = () => ({ known:0,learning:0,saved:false,status:"new",dueAt:null,lastAt:null,listened:false,revealed:false });
const empty = () => ({ selected:"hello",group:"All",mode:"visual",cards:{} });
const validWord = id => WORDS.some(w=>w.id===id);
function read(){
  try{
    const s=JSON.parse(localStorage.getItem(KEY));
    if(!s||typeof s!=="object"||!s.cards||typeof s.cards!=="object")return empty();
    return {
      selected:validWord(s.selected)?s.selected:"hello",
      group:GROUPS.includes(s.group)?s.group:"All",
      mode:MODES.includes(s.mode)?s.mode:"visual",
      cards:Object.fromEntries(WORDS.map(w=>{
        const c=s.cards[w.id]||{};
        return [w.id,{
          known:Number.isSafeInteger(c.known)?Math.max(0,c.known):0,
          learning:Number.isSafeInteger(c.learning)?Math.max(0,c.learning):0,
          saved:c.saved===true,
          status:["new","know","learn"].includes(c.status)?c.status:"new",
          dueAt:typeof c.dueAt==="string"?c.dueAt:null,
          lastAt:typeof c.lastAt==="string"?c.lastAt:null,
          listened:c.listened===true,revealed:c.revealed===true,
        }];
      }))
    };
  }catch{return empty()}
}
let state=read(),revealed=false,answeredThisTurn=false,toastTimer=null,audioTimer=null,focusTimer=null,focusToken=0;
const fromQuery=new URLSearchParams(location.search).get("word");
if(validWord(fromQuery)){state.selected=fromQuery;state.group="All"}
const front=$("front"),back=$("back"),scene=$("flip-scene"),card=$("card");
const getWord=()=>WORDS.find(w=>w.id===state.selected)||WORDS[0];
const cardState=()=>state.cards[state.selected]||(state.cards[state.selected]=emptyCard());
const inGroup=()=>state.group==="All"?WORDS:WORDS.filter(w=>w.group===state.group);
const dateLabel=value=>{
  if(!value||!Number.isFinite(Date.parse(value)))return "";
  return new Date(value).toLocaleDateString(undefined,{month:"short",day:"numeric"});
};
function toast(message){
 const el=$("toast");el.textContent=message;el.hidden=false;
 if(toastTimer)clearTimeout(toastTimer);
 toastTimer=setTimeout(()=>el.hidden=true,4300);
}
function persist(){
 try{localStorage.setItem(KEY,JSON.stringify(state));return true}
 catch{toast("This browser couldn't save the preview. Please check local storage permissions.");return false}
}
function setText(id,value){$(id).textContent=value}
function button(label,cls,click){
 const b=document.createElement("button");b.type="button";b.className=cls;b.textContent=label;b.addEventListener("click",click);return b;
}
function go(id,groupOverride){
 if(!validWord(id))return;
 if(groupOverride)state.group=groupOverride;
 if(!inGroup().some(w=>w.id===id))state.group="All";
 const prev=state.selected;
 state.selected=id;
 flip(false,false);
 if(prev!==id && "speechSynthesis" in window)speechSynthesis.cancel();
 render();persist();
 try{history.replaceState(null,"",location.pathname+"?word="+encodeURIComponent(id))}catch{}
}
function move(delta){
 const cards=inGroup(),index=cards.findIndex(w=>w.id===state.selected),target=index+delta;
 if(target<0||target>=cards.length){toast(delta>0?"You've reached the last word in this group. Choose another group to explore.":"This is the first word in the group.");return}
 go(cards[target].id);
}
function changeGroup(group){
 if(!GROUPS.includes(group))return;
 state.group=group;
 const first=inGroup()[0];
 if(first&&!inGroup().some(w=>w.id===state.selected))state.selected=first.id;
 flip(false,false);render();persist();
}
function changeMode(mode){
 if(!MODES.includes(mode))return;
 state.mode=mode;
 flip(false,false);render();persist();
 const messages={visual:"See the scene, word, meaning, and explanation together — just like a learning card.",recall:"Try to remember the meaning before revealing it.",listening:"Listen without reading the word first.",sentence:"Say or type the missing Korean word before revealing it."};
 toast(messages[mode]);
}
function progressCount(){return WORDS.filter(w=>(state.cards[w.id]||{}).status!=="new"&&(state.cards[w.id]||{}).status).length}
function renderFilters(){
 $("group-filter").replaceChildren();
 GROUPS.forEach(group=>{
   const n=group==="All"?WORDS.length:WORDS.filter(w=>w.group===group).length;
   const b=button(group+"  "+n,"group-button"+(state.group===group?" selected":""),()=>changeGroup(group));
   b.setAttribute("aria-pressed",String(state.group===group));
   $("group-filter").appendChild(b);
 });
}
function renderDeckLists(){
 const side=$("deck-list"),grid=$("deck-grid");
 side.replaceChildren();grid.replaceChildren();
 WORDS.forEach((w,index)=>{
   const c=state.cards[w.id]||emptyCard(),selected=state.selected===w.id;
   const b=button("", "deck-item"+(selected?" chosen":"")+(c.status!=="new"?" attempted":""),()=>go(w.id,"All"));
   b.setAttribute("aria-current",selected?"true":"false");
   b.setAttribute("aria-label","Open "+w.ko+" in "+w.group);
   const n=document.createElement("span");n.className="deck-number";n.textContent=String(index+1).padStart(2,"0");
   const ko=document.createElement("strong");ko.lang="ko";ko.textContent=w.ko;
   const marker=document.createElement("span");marker.className="deck-status "+c.status;marker.textContent=c.saved?"♥":c.status==="know"?"✓":c.status==="learn"?"↻":"·";
   b.append(n,ko,marker);side.appendChild(b);
   const tile=button("","deck-tile"+(selected?" chosen":"")+(c.status!=="new"?" attempted":""),()=>go(w.id,"All"));
   const pict=document.createElement("span");pict.className="tile-pict";pict.innerHTML=ART[w.art];
   const info=document.createElement("span");info.className="tile-info";
   const i=document.createElement("small");i.textContent=w.group+" · "+String(index+1).padStart(2,"0");
   const k=document.createElement("strong");k.lang="ko";k.textContent=w.ko;
   const st=document.createElement("em");st.textContent=c.saved?"♥ Saved":c.status==="know"?"✓ Self-recalled":c.status==="learn"?"↻ In review":"Explore →";
   info.append(i,k,st);tile.append(pict,info);grid.appendChild(tile);
 });
}
function renderSaved(){
 const list=$("saved-list");list.replaceChildren();
 const saved=WORDS.filter(w=>(state.cards[w.id]||{}).saved);
 setText("collection-description",saved.length?saved.length+" saved word"+(saved.length===1?"":"s")+" in this browser.":"Save a card to keep it close.");
 if(!saved.length){const el=document.createElement("p");el.className="no-saved";el.textContent="Your saved words appear here.";list.append(el)}
 else saved.forEach(w=>list.appendChild(button(w.ko+" ↗","saved-word",()=>go(w.id,"All"))));
 const c=cardState(),w=getWord();
 $("save").setAttribute("aria-pressed",String(c.saved));
 $("hero-save").setAttribute("aria-pressed",String(c.saved));
 $("hero-save").textContent=c.saved?"♥":"♡";
 $("hero-save").setAttribute("aria-label",c.saved?"Remove "+w.ko+" from saved words":"Save "+w.ko+" to my words");
 setText("save",c.saved?"♥ Saved to my collection":"♡ Save to my collection");
 $("notebook-button").disabled=c.saved;
 $("notebook-button").textContent=c.saved?w.ko+" is saved ✓":"Save "+w.ko+" ↗";
 setText("notebook-icon",w.ko.slice(0,1));
}
function renderReview(){
 const records=WORDS.map(w=>({word:w,c:state.cards[w.id]||emptyCard()}));
 const known=records.filter(x=>x.c.status==="know").length;
 const learn=records.filter(x=>x.c.status==="learn").length;
 setText("known-count",String(known));setText("learn-count",String(learn));
 const complete=known+learn;
 setText("deck-reviewed-label",complete+" / 12 self-checked");
 $("deck-meter-fill").style.width=(complete/12*100)+"%";
 const due=records.filter(x=>x.c.dueAt&&Date.parse(x.c.dueAt)<=Date.now()).sort((a,b)=>Date.parse(a.c.dueAt)-Date.parse(b.c.dueAt));
 const stateHere=cardState();
 setText("review-state",stateHere.status==="know"?"Self-recalled "+getWord().ko+". Review about "+dateLabel(stateHere.dueAt)+".":stateHere.status==="learn"?"Keep "+getWord().ko+" close. Review about "+dateLabel(stateHere.dueAt)+".":"Choose I know this or Learn this after revealing the meaning.");
 const el=$("review-list");el.replaceChildren();
 if(due.length){
   const head=document.createElement("small");head.textContent=due.length+" word"+(due.length===1?"":"s")+" due now";el.append(head);
   due.forEach(({word})=>el.appendChild(button(word.ko+" ↗","saved-word",()=>go(word.id,"All"))));
 }else{
   const hint=document.createElement("small");hint.textContent=complete?"No words due right now.":"Your review queue begins with your first self-check.";el.append(hint);
 }
}
function renderMode(){
 $("mode-tabs").querySelectorAll("button[data-mode]").forEach(b=>{
  const selected=b.dataset.mode===state.mode;b.classList.toggle("selected",selected);b.setAttribute("aria-pressed",String(selected))
 });
 const shell=document.querySelector(".shell");shell.dataset.mode=state.mode;
 const w=getWord();const frontWord=$("front-word"),sprite=$("art-sprite"),frontRoman=$("front-romanization");
 sprite.dataset.scene=w.art;
 sprite.innerHTML=state.mode==="visual"||state.mode==="sentence"?ART[w.art]:'<span class="mode-illustration">'+(state.mode==="listening"?"♫":"?")+'</span>';
 const sentenceMode=state.mode==="sentence";
 $("front-sentence").hidden=!sentenceMode;
 $("sentence-answer").hidden=!sentenceMode;
 if(sentenceMode)setText("front-sentence",w.sentencePrompt);
 $("sentence-answer").value="";
 $("reference-detail").hidden=state.mode!=="visual";
 $("reference-actions").hidden=state.mode!=="visual";
 $("reference-finish").hidden=true;
 if(state.mode==="visual")cardState().revealed=true;
 frontWord.textContent=state.mode==="listening"?"♫":sentenceMode?"_____":w.ko;
 frontWord.lang=state.mode==="listening"?"":"ko";
 frontRoman.hidden=state.mode==="listening"||sentenceMode;
 if(!frontRoman.hidden)frontRoman.textContent=w.latin;
 const captions={
  visual:["LOOK AT THE SCENE. LEARN THE WORD.","See the image, hear the Korean, read the explanation, then self-check.","01 · Learn"],
  recall:["REMEMBER WITHOUT THE IMAGE.","What does this Korean word mean? Think first.","02 · Recall"],
  listening:["HEAR IT BEFORE YOU SEE IT.","Press Listen, then try to identify the Korean word.","03 · Listen"],
  sentence:["USE THE WORD IN CONTEXT.","Complete the Korean sentence before you reveal.","04 · Use it"]
 };
 const [label,hint,cap]=captions[state.mode];setText("front-label",label);setText("front-hint",hint);setText("mode-caption",cap);
}
function render(){
 const w=getWord(),c=cardState(),list=inGroup(),pos=list.findIndex(x=>x.id===w.id);
 setText("front-tag",w.group.toUpperCase()+" · "+String(WORDS.indexOf(w)+1).padStart(2,"0")+" / 12");
 setText("bubble-number",String(WORDS.indexOf(w)+1).padStart(2,"0")+" / 12");
 setText("bar-lesson",w.ko+" · "+w.group);
 setText("reference-count","Card "+String(WORDS.indexOf(w)+1)+" of 12");
 setText("reference-meaning",w.meaning);
 setText("reference-type",w.type);
 const explanations={hello:"A polite hello when you meet someone.",name:"What someone is called; the word for a person’s name.",student:"A person learning in a school or class.",friend:"Someone you know and have a friendly relationship with.",book:"A printed book with pages you read, not a blank notebook.",bag:"A bag for carrying books and everyday belongings.",water:"The clear liquid we drink.",coffee:"A drink made from roasted coffee beans.",school:"The place where students attend classes.",home:"The house or place where you live.",library:"A place with collections of books you can read or borrow.",cafe:"A coffee shop where people buy drinks and meet."};
 setText("reference-description",explanations[w.id]||w.description);
 setText("reference-example",w.example);
 setText("reference-translation",w.translation);
 setText("reference-tip",w.tip);
 setText("reference-contrast",w.contrast);
 const pairings={hello:"안녕하세요!",name:"이름이 뭐예요?",student:"학생이에요",friend:"친구와 함께",book:"책을 읽어요",bag:"가방을 들어요",water:"물을 마셔요",coffee:"커피 한 잔",school:"학교에 가요",home:"집에 있어요",library:"도서관에서 공부해요",cafe:"카페에서 만나요"};
 setText("reference-pair",pairings[w.id]||w.ko);
 $("front-sentence-audio").setAttribute("aria-label","Hear "+w.example);
 setText("back-type",w.type);
 setText("back-word",w.ko);setText("back-romanization",w.latin);
 setText("back-meaning",w.meaning);
 setText("back-explanation",w.group==="Greetings"?"A greeting you can say when meeting someone.":w.group==="Places"?"A place you can recognise and talk about.":w.group==="Identity"?"A word for talking about people and identity.":"An everyday object or drink.");
 setText("back-sentence",w.example);setText("back-translation",w.translation);setText("back-tip",w.tip);setText("back-contrast",w.contrast);
 ["front-audio","back-audio","inline-audio"].forEach(id=>$(id).setAttribute("aria-label","Hear "+w.ko));
 $("sentence-audio").setAttribute("aria-label","Hear "+w.example);
 const tag=$("status-chip");tag.className="status-chip"+(c.status==="new"?"":" "+c.status);
 tag.textContent=c.status==="new"?"Not practised yet":c.status==="know"?"✓ Recalled (self-check)":"♡ In review";
 setText("position-label",String(pos+1).padStart(2,"0")+" / "+String(list.length).padStart(2,"0")+" · "+w.group);
 $("previous").disabled=pos<=0;$("next").disabled=pos>=list.length-1;
 renderMode();renderFilters();renderDeckLists();renderSaved();renderReview();
 const steps=1+Number(c.listened)+Number(c.revealed)+Number(c.status!=="new");
 $("activity-progress").setAttribute("aria-valuenow",String(steps));
 $("progress-fill").style.width=steps*25+"%";
 setText("progress-number",steps+" / 4");
 ["audio","reveal","recall"].forEach((part,i)=>{
  const done=i===0?c.listened:i===1?c.revealed:c.status!=="new";
  const el=$(part+"-mark");el.textContent=done?"✓ Done":"Try it";el.classList.toggle("completed",done);
 });
 $("know").disabled=answeredThisTurn;$("learn").disabled=answeredThisTurn;
 $("reference-know").disabled=answeredThisTurn;$("reference-learn").disabled=answeredThisTurn;
 document.title=w.ko+" · Starter Flashcards — Hallium";
}
function flip(next,focus=true){
 ++focusToken;if(focusTimer)clearTimeout(focusTimer);
 if(!next){answeredThisTurn=false;card.classList.remove("has-choice","choice-know","choice-learn");$("card-finish").hidden=true;$("reference-finish").hidden=true}
 revealed=next;
 if(next){cardState().revealed=true}
 card.classList.toggle("flipped",next);scene.classList.toggle("is-revealed",next);
 front.inert=next;back.inert=!next;
 front.setAttribute("aria-hidden",String(next));back.setAttribute("aria-hidden",String(!next));
 $("know").disabled=answeredThisTurn;$("learn").disabled=answeredThisTurn;
 if(next && state.mode==="sentence"){
  const typed=$("sentence-answer").value.trim();
  const feedback=$("back-explanation");
  if(typed)feedback.textContent="You entered: "+typed+". Compare it with the Korean word above, then assess yourself.";
 }
 if(next)persist();
 const c=cardState(),steps=1+Number(c.listened)+Number(c.revealed)+Number(c.status!=="new");
 $("activity-progress").setAttribute("aria-valuenow",String(steps));$("progress-fill").style.width=steps*25+"%";setText("progress-number",steps+" / 4");
 const mark=$("reveal-mark");mark.textContent=c.revealed?"✓ Done":"Try it";mark.classList.toggle("completed",c.revealed);
 if(focus){
  const token=focusToken;
  const action=()=>{if(token===focusToken)(next?$("back-audio"):$("reveal")).focus({preventScroll:true})};
  if(reducedMotion.matches)requestAnimationFrame(action);else focusTimer=setTimeout(action,570);
 }
}
function voice(){
 if(!("speechSynthesis" in window))return null;
 const v=speechSynthesis.getVoices();
 return v.find(x=>/^ko-KR$/i.test(x.lang)&&/google|microsoft|korean/i.test(x.name))||v.find(x=>/^ko/i.test(x.lang))||null;
}
function animateAudio(on){
 ["front-audio","inline-audio","back-audio","sentence-audio","front-sentence-audio"].forEach(id=>$(id).classList.toggle("is-speaking",on));
 if(audioTimer)clearTimeout(audioTimer);
 if(on)audioTimer=setTimeout(()=>animateAudio(false),5000);
}
function play(text,slow=false){
 if(!("speechSynthesis" in window)||typeof SpeechSynthesisUtterance==="undefined"){toast("Korean audio is unavailable in this browser.");return}
 const utterance=new SpeechSynthesisUtterance(text);utterance.lang="ko-KR";
 const v=voice();if(v)utterance.voice=v;
 utterance.rate=slow?.78:.94;utterance.pitch=1;utterance.volume=1;
 const id=state.selected;
 utterance.onstart=()=>{animateAudio(true);if(state.selected===id){cardState().listened=true;persist();renderAudioMark()}};
 utterance.onend=()=>animateAudio(false);
 utterance.onerror=()=>{animateAudio(false);toast("Korean audio could not play. Check installed voices and try again.")};
 try{speechSynthesis.cancel();speechSynthesis.speak(utterance)}catch{animateAudio(false);toast("Could not start Korean audio on this device.")}
}
function renderAudioMark(){
 const c=cardState();$("audio-mark").textContent=c.listened?"✓ Done":"Try it";$("audio-mark").classList.toggle("completed",c.listened);
 const steps=1+Number(c.listened)+Number(c.revealed)+Number(c.status!=="new");
 $("activity-progress").setAttribute("aria-valuenow",String(steps));$("progress-fill").style.width=steps*25+"%";setText("progress-number",steps+" / 4");
}
function record(kind){
 if((!revealed&&state.mode!=="visual")||answeredThisTurn)return;
 answeredThisTurn=true;
 const c=cardState(),w=getWord();
 if(kind==="know")c.known+=1;else c.learning+=1;
 c.status=kind;c.lastAt=new Date().toISOString();
 c.dueAt=new Date(Date.now()+(kind==="know"?3:1)*86400000).toISOString();
 $("know").disabled=true;$("learn").disabled=true;
 $("reference-know").disabled=true;$("reference-learn").disabled=true;
 if(state.mode==="visual"){
   $("reference-finish").hidden=false;
   $("reference-finish-label").textContent=kind==="know"?"✓ Self-recalled "+w.ko+" · scheduled for a later check.":"♡ Added "+w.ko+" to tomorrow’s review.";
 }
 const panel=$("card-finish");panel.hidden=false;card.classList.add("has-choice",kind==="know"?"choice-know":"choice-learn");
 setText("finish-icon",kind==="know"?"✦":"♡");
 setText("finish-title",kind==="know"?"That felt familiar!":"Now it has a place to grow.");
 setText("finish-detail",kind==="know"?"You self-reported remembering "+w.ko+". Check again in about three days.":w.ko+" is in tomorrow's review. Try again whenever you like.");
 persist();renderReview();renderDeckLists();renderSaved();
 const chip=$("status-chip");chip.className="status-chip "+kind;chip.textContent=kind==="know"?"✓ Recalled (self-check)":"♡ In review";
 $("recall-mark").textContent="✓ Done";$("recall-mark").classList.add("completed");
 const steps=1+Number(c.listened)+Number(c.revealed)+1;
 $("activity-progress").setAttribute("aria-valuenow",String(steps));$("progress-fill").style.width=steps*25+"%";setText("progress-number",steps+" / 4");
 toast(kind==="know"?"Self-recalled "+w.ko+"; this is not a mastery score.":"Added "+w.ko+" to your personal review queue.");
}
function save(force=false){
 const c=cardState(),w=getWord();c.saved=force||!c.saved;persist();renderSaved();renderDeckLists();
 if(c.saved){$("notebook").classList.remove("just-saved");void $("notebook").offsetWidth;$("notebook").classList.add("just-saved")}
 toast(c.saved?w.ko+" is saved to this preview's personal collection.":w.ko+" removed from the preview collection.");
}
function reset(){
 if(!confirm("Clear ONLY this 12-word GitHub Pages deck? Locked Book V1/V2 and your live Hallium account will not change."))return;
 try{localStorage.removeItem(KEY)}catch{}
 state=empty();revealed=false;answeredThisTurn=false;
 flip(false,false);render();toast("Starter deck reset. The locked Book V1/V2 and live Hallium remain unchanged.");
}
$("group-filter").addEventListener("keydown",()=>{});
$("mode-tabs").querySelectorAll("button[data-mode]").forEach(b=>b.addEventListener("click",()=>changeMode(b.dataset.mode)));
$("reveal").addEventListener("click",()=>flip(true));
$("turn-back").addEventListener("click",()=>flip(false));
$("practice-again").addEventListener("click",()=>{flip(false);toast("Try to recall "+getWord().ko+" again before you reveal.")});
$("continue-next").addEventListener("click",()=>move(1));
$("know").addEventListener("click",()=>record("know"));
$("learn").addEventListener("click",()=>record("learn"));
$("reference-know").addEventListener("click",()=>record("know"));
$("reference-learn").addEventListener("click",()=>record("learn"));
$("reference-continue").addEventListener("click",()=>move(1));
$("save").addEventListener("click",()=>save());
$("hero-save").addEventListener("click",()=>save());
$("notebook-button").addEventListener("click",()=>save(true));
$("reset").addEventListener("click",reset);
$("previous").addEventListener("click",()=>move(-1));
$("next").addEventListener("click",()=>move(1));
["front-audio","back-audio","inline-audio"].forEach(id=>$(id).addEventListener("click",()=>play(getWord().ko)));
$("sentence-audio").addEventListener("click",()=>play(getWord().example,true));
$("front-sentence-audio").addEventListener("click",()=>play(getWord().example,true));
document.addEventListener("keydown",e=>{
 const target=e.target;
 if(target&&target.closest("input,textarea,select,button,a,[contenteditable=true]"))return;
 if(e.key==="ArrowRight"){e.preventDefault();move(1)}
 if(e.key==="ArrowLeft"){e.preventDefault();move(-1)}
 if(e.key==="Escape"&&revealed){e.preventDefault();flip(false)}
 if((e.key===" "||e.key==="Enter")&&!revealed){e.preventDefault();flip(true)}
});
front.inert=false;front.setAttribute("aria-hidden","false");back.inert=true;back.setAttribute("aria-hidden","true");
render();persist();
})();