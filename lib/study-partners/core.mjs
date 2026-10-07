export const AREAS = ["vocabulary","grammar"];
export const PARTNER_GOALS=["conversation","topik","accountability","confidence","reading","writing"];
export const PRACTICE_NEEDS=["speaking","listening","reading","writing","vocabulary","grammar"];
export const CHECK = [
  {area:"vocabulary",question:"What does 친구 mean?",options:["school","friend","food","library"],answer:1},
  {area:"grammar",question:"Choose the polite ending: 저는 학생___",options:["예요","이에요","에서","까지"],answer:1},
  {area:"vocabulary",question:"What does 도서관 mean?",options:["library","classroom","friend","meeting"],answer:0},
  {area:"grammar",question:"Choose the destination particle: 학교___ 가요.",options:["에서","하고","에","는"],answer:2},
  {area:"vocabulary",question:"Which word means 'to study'?",options:["만나다","마시다","공부하다","쉬다"],answer:2},
  {area:"grammar",question:"Choose the action location particle: 도서관___ 공부해요.",options:["에","에서","하고","을"],answer:1},
  {area:"vocabulary",question:"What does 물 mean?",options:["water","milk","rice","house"],answer:0},
  {area:"grammar",question:"Choose the polite sentence: 나는 한국어를 공부___",options:["해요.","하다.","에.","친구."],answer:0},
];
export function diagnosticResults(choices) {
 const result={};
 for(const area of AREAS){const q=CHECK.map((item,i)=>({...item,i})).filter(x=>x.area===area);const valid=q.filter(x=>Number.isInteger(choices[x.i]));result[area]={correct:valid.filter(x=>choices[x.i]===x.answer).length,total:valid.length};}
 return result;
}
export function focusFromAiAudit(record) {
 const audit=record?.audit||record||{};
 if(!Array.isArray(audit.strengths)||!Array.isArray(audit.weaknesses))return null;
 const category=text=>{
  const s=String(text||"").toLowerCase();
  const vocab=/vocab|word recall|word recognition|lexical|word bank/.test(s);
  const grammar=/grammar|particle|sentence structur|conjugat|verb ending|sentence pattern/.test(s);
  return vocab&&!grammar?"vocabulary":grammar&&!vocab?"grammar":null;
 };
 const strong=[...new Set(audit.strengths.map(category).filter(Boolean))];
 const needs=[...new Set(audit.weaknesses.map(category).filter(Boolean))];
 if(strong.length!==1||needs.length!==1||strong[0]===needs[0])return null;
 return {strength:strong[0],growth:needs[0]};
}
export function partnerPreferences(profile){
 const p=profile?.diagnostic?.partner_preferences||{};
 return {
  goals:[...new Set((Array.isArray(p.goals)?p.goals:[]).filter(x=>PARTNER_GOALS.includes(x)))],
  practiceNeeds:[...new Set((Array.isArray(p.practiceNeeds)?p.practiceNeeds:[]).filter(x=>PRACTICE_NEEDS.includes(x)))],
 };
}
export function areasFor(profile) {
 const a=profile?.diagnostic?.vocabulary,b=profile?.diagnostic?.grammar;
 if(a?.total>=4&&b?.total>=4){const va=a.correct/a.total,ga=b.correct/b.total;if(Math.abs(va-ga)>=.25)return {strength:va>ga?"vocabulary":"grammar",growth:va>ga?"grammar":"vocabulary",basis:"practice check"};}
 const imported=profile?.diagnostic?.report_import;
 if(imported&&AREAS.includes(imported.strength)&&AREAS.includes(imported.growth)&&imported.strength!==imported.growth)return {strength:imported.strength,growth:imported.growth,basis:"Hallium AI learning report"};
 return {strength:profile?.strength||"vocabulary",growth:profile?.growth_area||"grammar",basis:"self-described study focus"};
}
const LEVEL_ORDER=["beginner","elementary","intermediate","advanced"];

function levelDistance(a,b){
 const ai=LEVEL_ORDER.indexOf(String(a||"").toLowerCase());
 const bi=LEVEL_ORDER.indexOf(String(b||"").toLowerCase());
 if(ai<0||bi<0)return null;
 return Math.abs(ai-bi);
}

function availabilityCompatibility(a,b){
 const left=String(a||"Flexible"),right=String(b||"Flexible");
 if(left==="Flexible"||right==="Flexible")return {match:true,score:14,label:"Flexible timing"};
 if(left===right)return {match:true,score:16,label:"Same availability"};
 const broad=new Set(["Weekdays","Weekends"]);
 const daypart=new Set(["Mornings","Afternoons","Evenings"]);
 if(broad.has(left)&&broad.has(right))return {match:false,score:5,label:"Different weekly availability"};
 if(daypart.has(left)&&daypart.has(right))return {match:false,score:5,label:"Different time of day"};
 return {match:false,score:8,label:"Some scheduling overlap may be possible"};
}

export function fit(a,b) {
 if(!a?.discoverable||!b?.discoverable||a.user_id===b.user_id)return null;
 const aa=areasFor(a),bb=areasFor(b);
 const mutual=aa.strength===bb.growth&&aa.growth===bb.strength;
 const oneWay=aa.strength===bb.growth||aa.growth===bb.strength;
 const distance=levelDistance(a.level,b.level);
 const availability=availabilityCompatibility(a.availability,b.availability);
 const ap=partnerPreferences(a),bp=partnerPreferences(b);
 const sharedGoals=ap.goals.filter(x=>bp.goals.includes(x));
 const sharedNeeds=ap.practiceNeeds.filter(x=>bp.practiceNeeds.includes(x));

 let score=0;
 if(mutual)score+=52;
 else if(oneWay)score+=30;
 else score+=8;

 if(distance===0)score+=24;
 else if(distance===1)score+=16;
 else if(distance===2)score+=7;

 score+=availability.score;
 score+=Math.min(5,sharedGoals.length*3);
 score+=Math.min(3,sharedNeeds.length*2);
 score=Math.max(0,Math.min(100,score));

 const reasons=[];
 if(mutual)reasons.push("Your practice needs complement each other");
 else if(oneWay)reasons.push("One learning need directly overlaps");
 if(distance===0)reasons.push("Same Korean level");
 else if(distance===1)reasons.push("Nearby Korean level");
 if(availability.match)reasons.push(availability.label);
 if(sharedGoals.length)reasons.push("Shared study goal");
 if(sharedNeeds.length)reasons.push("Shared practice need");

 return {
  mutual,
  oneWay,
  score,
  confidence:aa.basis==="self-described study focus"&&bb.basis==="self-described study focus"?"self-described":"evidence-informed",
  reasons,
  basisA:aa.basis,
  basisB:bb.basis,
  helpsWith:aa.strength,
  gainsHelp:aa.growth,
  levelMatch:distance===0,
  levelDistance:distance,
  availabilityMatch:availability.match,
  availabilityLabel:availability.label,
  sharedGoals,
  sharedNeeds,
 };
}
export function offlinePractice(notes) {
 const words=notes.filter(n=>n.kind==="vocabulary"),patterns=notes.filter(n=>n.kind==="grammar");
 if(!words.length||!patterns.length)throw new Error("Share at least one vocabulary note and one grammar note");
 const w=words[0],g=patterns[0];
 return [
  {kind:"vocabulary",kicker:"01 · WORD RECALL",title:"Explain your partner's word",prompt:"Without looking at the translation, explain "+w.title+" and use it in a Korean phrase.",hint:w.meaning,source:[w.title,w.example].filter(Boolean).join(" · ")},
  {kind:"grammar",kicker:"02 · PATTERN PRACTICE",title:"Show the sentence pattern",prompt:"Explain how "+g.title+" works, then point it out in the shared example.",hint:g.meaning,source:[g.title,g.example].filter(Boolean).join(" · ")},
  {kind:"together",kicker:"03 · BUILD TOGETHER",title:"One conversation, two strengths",prompt:"Together write two Korean lines using "+w.title+" and "+g.title+". Compare and discuss your attempts.",hint:"You can use the examples; this guided exercise does not grade Korean automatically.",source:[w.example,g.example].filter(Boolean).join(" · ")},
 ];
}
