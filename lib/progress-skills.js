const SKILLS=["Grammar","Vocabulary","Listening","Reading","Writing","Speaking"];
const key=s=>String(s||"").toLowerCase();
const match=s=>SKILLS.find(x=>key(s).includes(key(x)))||null;
const at=x=>Date.parse(x||"")||0;
export function buildSkillEvidenceMap({mistakes=[],practiceAttempts=[],topikAttempts=[]}={}){
 const rows=SKILLS.map(skill=>({skill,practice:[],mistakes:[],verifiedTopik:[],sources:[]}));
 const by=new Map(rows.map(r=>[r.skill,r]));
 for(const m of mistakes||[]){const s=match(m?.skill);if(s)by.get(s).mistakes.push(m);}
 for(const p of practiceAttempts||[]){const s=match(p?.skill);if(s&&Number.isFinite(p?.score))by.get(s).practice.push(p);}
 for(const a of topikAttempts||[]){
  if(!a?.submitted||!a?.scored)continue;
  for(const s of a.skills||[]){
   if(!Number.isFinite(s?.accuracy))continue;
   const target=match(s.skillLabel)||match(s.section);
   if(target)by.get(target).verifiedTopik.push({accuracy:s.accuracy,at:a.completedAt||a.startedAt});
  }
 }
 return rows.map(r=>{
  r.practice.sort((a,b)=>at(a.createdAt)-at(b.createdAt));
  r.verifiedTopik.sort((a,b)=>at(a.at)-at(b.at));
  const scored=r.practice.map(p=>Number(p.score));
  const verified=r.verifiedTopik.map(p=>Number(p.accuracy));
  const points=verified.length>=2?verified:scored;
  const delta=points.length>=2?Math.round((points.at(-1)-points[0])*10)/10:null;
  return {skill:r.skill,practiceCount:scored.length,verifiedTopikCount:verified.length,
   unresolvedCount:r.mistakes.filter(m=>m.lastResult!=="correct").length,
   direction:delta==null?"insufficient":delta>=5?"improving":delta<=-5?"declining":"stable",
   delta, evidenceStrength:verified.length>=2?"verified-repeat":scored.length>=2?"practice-repeat":verified.length+scored.length>0?"early":"insufficient",
   provenance:[...(scored.length?["practice"]:[]),...(verified.length?["verified_topik"]:[]),...(r.mistakes.length?["mistake_memory"]:[])],
   note:"Observed performance is not an official proficiency level."};
 });
}