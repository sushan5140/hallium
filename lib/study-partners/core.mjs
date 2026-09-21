export const AREAS = ["vocabulary","grammar"];
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
export function areasFor(profile) {
 const a=profile?.diagnostic?.vocabulary,b=profile?.diagnostic?.grammar;
 if(a?.total>=4&&b?.total>=4){const va=a.correct/a.total,ga=b.correct/b.total;if(Math.abs(va-ga)>=.25)return {strength:va>ga?"vocabulary":"grammar",growth:va>ga?"grammar":"vocabulary",basis:"practice check"};}
 return {strength:profile?.strength||"vocabulary",growth:profile?.growth_area||"grammar",basis:"self-described study focus"};
}
export function fit(a,b) {
 if(!a?.discoverable||!b?.discoverable||a.user_id===b.user_id)return null;
 const aa=areasFor(a),bb=areasFor(b);
 const mutual=aa.strength===bb.growth&&aa.growth===bb.strength;
 return {mutual,basisA:aa.basis,basisB:bb.basis,helpsWith:aa.strength,gainsHelp:aa.growth,levelMatch:a.level===b.level,availabilityMatch:a.availability===b.availability};
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
