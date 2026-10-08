export function buildProgressInsights(model={}){
 const skills=model.skillMap||[];
 const urgent=skills.filter(s=>s.unresolvedCount>0).sort((a,b)=>b.unresolvedCount-a.unresolvedCount);
 const declining=skills.filter(s=>s.direction==="declining"&&s.evidenceStrength!=="insufficient");
 const gains=skills.filter(s=>s.direction==="improving"&&s.evidenceStrength!=="insufficient");
 const priorities=[];
 if(model.weaknesses?.dueCount>0)priorities.push({kind:"review",title:"Review scheduled mistakes",why:model.weaknesses.dueCount+" due items remain",href:"/?view=review"});
 if(urgent.length)priorities.push({kind:"skill",title:"Revisit "+urgent[0].skill,why:urgent[0].unresolvedCount+" unresolved mistake records",href:"/?view=profile"});
 if(declining.length)priorities.push({kind:"direction",title:"Recheck "+declining[0].skill,why:"Comparable results declined; confirm with another attempt",href:"/?view=profile"});
 if(!priorities.length)priorities.push({kind:"baseline",title:"Build comparable evidence",why:"Complete a study check or focused practice before drawing conclusions",href:"/?view=test"});
 return {improving:gains.map(s=>({skill:s.skill,delta:s.delta,source:s.evidenceStrength})),
   priorities:priorities.slice(0,3),unknown:skills.filter(s=>s.evidenceStrength==="insufficient").map(s=>s.skill),
   caveat:"Recommendations use observed evidence, not certified language mastery or causal attribution."};
}