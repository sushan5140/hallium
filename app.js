"use strict";
const KEY="hallium:standalone-dashboard-preview:v1";
const defaultState=()=>({lesson:false,words:false,quiz:false,path:0,answers:{},checked:false,unit:2,feedback:"",selection:null});
let state=defaultState();
try{let old=JSON.parse(localStorage.getItem(KEY)||"{}");if(old&&typeof old==="object")state={...defaultState(),...old,path:Math.max(0,Math.min(40,Number(old.path)||0))};}catch{}
const $=id=>document.getElementById(id);
const tasks=()=>[!!state.lesson,!!state.words,!!state.quiz];
const nDone=()=>tasks().filter(Boolean).length;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>el.classList.remove("show"),3000)}
function jump(id){const el=$(id);if(el)el.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});document.querySelectorAll(".navlink").forEach(b=>b.classList.toggle("active",b.dataset.jump===id));}
function speak(ko){if(!("speechSynthesis" in window)){toast("Korean speech is unavailable in this browser.");return}window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(ko);u.lang="ko-KR";u.rate=.86;window.speechSynthesis.speak(u)}
function coachMessage(){
 if(!state.lesson)return {reason:"Start with one lesson. Your next steps will become clearer as you practise.",title:"Find your first rhythm.",caption:"Listen, practice, and complete one lesson.",action:"Continue the lesson",target:"lesson"};
 if(!state.words)return {reason:"Nice start. You have finished the lesson; now recall three everyday words before moving on.",title:"Turn recognition into recall.",caption:"Review the words from the morning dialogue.",action:"Review vocabulary",target:"words"};
 if(!state.quiz)return {reason:"You have seen the words and the context. A short check can show which idea needs another look.",title:"Check the meaning.",caption:"Try the two-question mini check.",action:"Start mini check",target:"check"};
 return {reason:"Your three practice steps are complete. Revisit a sentence or open the next chapter when you're ready.",title:"Keep a steady pace.",caption:"Your completed practice is saved in this browser.",action:"Review today's lesson",target:"lesson"};
}
function render(){
 const completed=nDone(),percent=Math.round(completed/3*100),p=state.path;
 $("daily-fraction").innerHTML=completed+"<span>/3</span>";
 $("steps-complete").textContent=completed+" / 3";
 $("goal-percent").textContent=percent+"%";
 document.querySelectorAll(".mini-dots i").forEach((e,i)=>e.classList.toggle("filled",i<completed));
 document.querySelectorAll(".task").forEach((e,i)=>{e.classList.toggle("done",tasks()[i]);e.classList.toggle("active",!tasks()[i]&&(i===0||tasks()[i-1]));e.querySelector(".task-num").textContent=tasks()[i]?"✓":"0"+(i+1)});
 ["Completed · revisit →","Completed · revisit →","Completed · try again →"].forEach((t,i)=>{$("task-hint-"+i).textContent=tasks()[i]?t:["Begin learning →","Start quick recall →","Try the check →"][i]});
 $("catalog-done").textContent=p;$("path-total").textContent=p;$("catalog-fill").style.width=p/40*100+"%";$("catalog-progress").setAttribute("aria-valuenow",p);
 $("lesson-percent").textContent=state.lesson?"100%":state.words?"65%":"0%";$("lesson-fill").style.width=state.lesson?"100%":state.words?"65%":"0%";$("lesson-progress").setAttribute("aria-valuenow",state.lesson?100:state.words?65:0);
 $("complete-lesson").innerHTML=state.lesson?"Completed · review lesson <span>✓</span>":"Finish this sample lesson <span>↗</span>";$("complete-lesson").classList.toggle("done",state.lesson);
 const unitDone=Math.min(5,Math.max(0,p));$("unit-fraction").textContent=unitDone+" / 5";$("unit-fill").style.width=unitDone/5*100+"%";$("unit-progress").setAttribute("aria-valuenow",unitDone);$("unit-remaining").textContent=5-unitDone+" chapter steps to go";document.querySelectorAll(".chapter-pips i").forEach((e,i)=>{e.classList.toggle("filled",i<unitDone);e.classList.toggle("next",i===unitDone)});
 const next=coachMessage();$("coach-message").textContent=next.reason;$("focus-title").textContent=next.title;$("focus-description").textContent=next.caption;$("focus-action").innerHTML=next.action+" <span>↗</span>";$("focus-action").dataset.target=next.target;
 $("vocab-fill").style.width=(state.words?75:state.lesson?37:12)+"%";$("grammar-fill").style.width=(state.quiz?70:state.lesson?36:10)+"%";$("routine-fill").style.width=percent+"%";
 $("vocab-note").textContent=state.words?"Practised":state.lesson?"Building":"Starting";$("grammar-note").textContent=state.quiz?"Checked":state.lesson?"Noticed":"Starting";$("routine-note").textContent=completed+" of 3";
 $("next-heading").textContent=state.lesson?"Next: keep practising":"My morning";$("next-caption").textContent=state.lesson?"Revisit any sentence to make it stick.":"Your next little win.";$("review-heading").textContent=state.words?"Keep these words fresh.":"Ready for the first recall?";$("review-caption").textContent=state.words?"Review makes them easier to remember.":"Practice three everyday words.";
}
function lessonDone(){if(!state.lesson){state.lesson=true;state.path=Math.max(1,state.path);toast("Sample lesson completed. Your Momentum is updated!")}else toast("You can listen to the example dialogue again.");persist();render()}
const words=[["아침","morning"],["일어나다","to wake up"],["먹다","to eat"]];
function modal(title,intro,body,footer,kicker="PRACTICE"){
 $("dialog-title").textContent=title;$("dialog-intro").textContent=intro;$("dialog-body").replaceChildren();$("dialog-footer").replaceChildren();
 $("dialog-kicker").textContent=kicker; if(typeof body==="function")body($("dialog-body")); if(typeof footer==="function")footer($("dialog-footer"));
 $("dialog").hidden=false;$("close-dialog").focus();document.body.style.overflow="hidden";
}
function closeModal(){$("dialog").hidden=true;document.body.style.overflow="";window.speechSynthesis?.cancel();}
function addButton(parent,text,callback){const b=document.createElement("button");b.type="button";b.textContent=text;b.addEventListener("click",callback);parent.appendChild(b);return b}
function wordModal(){
 modal("Three words, one morning.","Listen and recall the meaning. Marking this set reviewed updates Today's Plan and the Coach.",body=>{
 words.forEach(([ko,en],i)=>{const row=document.createElement("div");row.className="word-item";const text=document.createElement("div");const strong=document.createElement("strong");strong.lang="ko";strong.textContent=ko;const small=document.createElement("small");small.textContent=en;text.append(strong,small);row.append(text);addButton(row,"▶ Listen",()=>speak(ko));body.appendChild(row)});
 },foot=>{addButton(foot,state.words?"Reviewed ✓ · listen again":"Mark these words reviewed ✓",()=>{state.words=true;persist();render();closeModal();toast("Vocabulary marked as practised.")})},"VOCABULARY · ORIGINAL EXAMPLES");
}
const quiz=[{q:"What does 아침 mean?",a:["evening","morning","school"],correct:1},{q:"What is the best meaning of 먹다?",a:["to eat","to arrive","to learn"],correct:0}];
function checkModal(){
 state.selection={};const renderCheck=(body,foot)=>{
 body.replaceChildren();foot.replaceChildren();
 quiz.forEach((item,i)=>{let p=document.createElement("p");p.className="quiz-prompt";p.textContent=(i+1)+". "+item.q;body.appendChild(p);item.a.forEach((choice,k)=>{
  let b=document.createElement("button");b.className="answer-row";const sel=state.selection[i]===k;b.classList.toggle("selected",sel);if(state.checked&&k===item.correct)b.classList.add("correct");if(state.checked&&sel&&k!==item.correct)b.classList.add("wrong");
  const number=document.createElement("span");number.textContent="0"+(k+1);b.append(number,document.createTextNode(choice));b.disabled=state.checked;b.onclick=()=>{state.selection[i]=k;renderCheck(body,foot)};body.appendChild(b);
 })});const h=document.createElement("p");h.className="quiz-help";h.textContent=state.checked?"This is Hallium-created sample practice, not an official TOPIK score.":"Choose an answer to both questions to enable checking.";body.appendChild(h);
 if(state.checked){let score=quiz.filter((q,i)=>q.correct===state.selection[i]).length;addButton(foot,score+" / 2 correct · Try again",()=>{state.checked=false;state.selection={};renderCheck(body,foot)});addButton(foot,"Finish",()=>{state.quiz=true;persist();render();closeModal();toast("Mini check completed.")})}
 else {let btn=addButton(foot,"Check my answers →",()=>{state.checked=true;renderCheck(body,foot)});btn.disabled=quiz.some((q,i)=>state.selection[i]===undefined)}
 };
 modal("A quick meaning check.","Two original Hallium questions. The feedback changes as you answer.",body=>renderCheck(body,$("dialog-footer")),null,"MINI CHECK · ORIGINAL QUESTIONS");
}
function catalogModal(){
 const units=[["01","First words and introductions",true],["02","My everyday life",true],["03","Food and requests",false],["04","Shopping and prices",false],["05","Places and directions",false],["06","Past events and reasons",false]];
 modal("Your learning path.","Browse the sample units. This preview does not change the real Hallium account or curriculum.",body=>{
 units.forEach(([no,title,available])=>{const row=document.createElement("div");row.className="catalog-item";const t=document.createElement("div");const a=document.createElement("strong");a.textContent="UNIT "+no+" · "+title;const b=document.createElement("small");b.textContent=available?"A sample lesson is available":"Preview of the route structure";t.append(a,b);row.appendChild(t);addButton(row,available?"Explore ↗":"Coming soon",()=>{closeModal();jump(available?"lesson":"study");if(!available)toast("This is a design preview; full lessons remain in the Hallium app.")});body.appendChild(row)});
 },foot=>addButton(foot,"Close",closeModal),"YOUR CURRICULUM");
}
function routeModal(route){
 const info={
 bridge:["Korean → TOPIK Bridge","A combined foundation route for beginners: Hangul, everyday Korean, and exam-focused practice."],
 everyday:["Korean Companion","A real-life course for conversation, travel, daily routine, and grammar in context."],
 topik:["TOPIK Companion","Focused revision for learners who know the basics and want to prepare for the TOPIK test."]
 }[route]||["Hallium","Build one Korean habit at a time."];
 modal(info[0],info[1],body=>{const p=document.createElement("p");p.className="quiz-help";p.textContent="This independent GitHub Pages build previews the dashboard UI only. It deliberately does not open Hallium sign-in, duplicate the real course, or claim to sync your data.";body.appendChild(p)},foot=>addButton(foot,"Return to dashboard",closeModal),"LEARNING ROUTE PREVIEW");
}
function action(a){
 switch(a){case"lesson":jump("lesson");break;case"words":wordModal();break;case"check":checkModal();break;case"catalog":catalogModal();break;case"coach":jump("coach");break;case"bridge":case"everyday":case"topik":routeModal(a);break;}
}
document.querySelectorAll("[data-jump]").forEach(b=>b.addEventListener("click",()=>jump(b.dataset.jump)));
document.querySelectorAll("[data-say]").forEach(b=>b.addEventListener("click",()=>speak(b.dataset.say)));
document.querySelectorAll("[data-task]").forEach(b=>b.addEventListener("click",()=>action(["lesson","words","check"][Number(b.dataset.task)])));
document.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>action(b.dataset.open)));
$("open-catalog").onclick=catalogModal;$("open-words").onclick=wordModal;$("open-check").onclick=checkModal;
$("complete-lesson").onclick=lessonDone;$("coach-refresh").onclick=()=>{render();toast("Updated from your saved sample activity. No AI account needed.")};
$("momentum-next").onclick=()=>action("lesson");$("momentum-review").onclick=wordModal;$("focus-action").onclick=()=>action($("focus-action").dataset.target);
$("reset").onclick=()=>modal("Reset this preview?","This only clears the sample data in this browser, never any actual Hallium account.",body=>{},foot=>{addButton(foot,"Cancel",closeModal);addButton(foot,"Reset preview",()=>{state=defaultState();persist();render();closeModal();toast("Sample dashboard reset.")})},"LOCAL PREVIEW");
$("close-dialog").onclick=closeModal;$("dialog").addEventListener("click",e=>{if(e.target===$("dialog"))closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("dialog").hidden)closeModal()});
render();
