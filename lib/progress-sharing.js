// Share only aggregate, opt-in fields. Never export raw answers, mistake text,
// private chats, diagnostic material, account IDs or intervention content.
export function buildPublicProgressSummary(model={},options={}){
 const includeSkills=options.includeSkills===true;
 const includeTopik=options.includeTopik===true;
 const path=model.path||{};
 const summary={
   title:"My Hallium Korean learning progress",
   curriculum:{completed:Number(path.completed||0),total:Number(path.total||0)},
   note:"Learning activity, not official language certification or a mastery rating.",
 };
 if(includeSkills)summary.skills=(model.skillMap||[]).map(row=>({
   skill:row.skill, direction:row.direction, evidenceStrength:row.evidenceStrength,
 })).slice(0,6);
 if(includeTopik)summary.topik={
   verifiedAttempts:Number(model.topik?.verifiedAttempts||0),
   trend:model.topik?.scoreTrend?.status||"insufficient",
 };
 return summary;
}
export function progressSummaryText(summary={}){
 const path=summary.curriculum||{};
 const lines=[summary.title||"My Hallium progress",
   "Curriculum: "+(path.completed||0)+"/"+(path.total||0),
   ...(summary.skills||[]).map(s=>s.skill+": "+s.direction+" ("+s.evidenceStrength+")"),
   ...(summary.topik?["TOPIK verified attempts: "+summary.topik.verifiedAttempts+" · "+summary.topik.trend]:[]),
   summary.note||"Not official proficiency evidence."];
 return lines.join("\n");
}