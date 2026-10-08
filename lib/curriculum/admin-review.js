export const QA_FLAGS=["unreviewed","needs_changes","approved"];
export function buildAdminReviewQueue(audit={},flags={}){
 const rows=(audit.rows||[]).map(row=>{
  const status=QA_FLAGS.includes(flags[row.lesson?.id])?flags[row.lesson.id]:"unreviewed";
  const missing=row.coverage?.missing||[];
  const blockers=missing.map(kind=>"Missing "+kind+" stage");
  if(status==="needs_changes")blockers.push("Editor requested changes");
  return {lessonId:row.lesson?.id||"",unitTitle:row.unitTitle||"",title:row.lesson?.title||"",
   status,blockers,needsReview:status!=="approved"||blockers.length>0,
   ready:status==="approved"&&blockers.length===0};
 });
 return {rows,ready:rows.filter(x=>x.ready).length,blocked:rows.filter(x=>x.blockers.length).length,
   pending:rows.filter(x=>x.needsReview).length};
}
export function safeQaTransition(current,next,{hasCoverageGaps=false}={}){
 if(!QA_FLAGS.includes(next))return {allowed:false,reason:"Unknown QA state"};
 if(next==="approved"&&hasCoverageGaps)return {allowed:false,reason:"Resolve curriculum coverage gaps before approval"};
 return {allowed:true,reason:""};
}
