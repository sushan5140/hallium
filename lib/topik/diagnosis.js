const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const round1=n=>Math.round(n*10)/10;

function recencyWeight(iso,nowMs){
  const t=Date.parse(iso||"");
  if(!Number.isFinite(t)) return 0.75;
  const days=Math.max(0,(nowMs-t)/86400000);
  if(days<=7) return 1;
  if(days<=30) return 0.9;
  if(days<=90) return 0.8;
  return 0.7;
}

export function diagnoseTopikWeaknesses(attempts=[],now=new Date()){
  const rows=(attempts||[]).filter(a=>a&&a.submitted);
  const nowMs=now instanceof Date?now.getTime():Date.parse(now);
  const map=new Map();

  for(const attempt of rows){
    const recency=recencyWeight(attempt.completedAt||attempt.startedAt,nowMs);
    for(const skill of attempt.skills||[]){
      const current=map.get(skill.skillId)||{
        skillId:skill.skillId,
        skillLabel:skill.skillLabel,
        section:skill.section,
        exposures:0,
        answered:0,
        total:0,
        scoredExposures:0,
        weightedAccuracySum:0,
        weightedAccuracyWeight:0,
        recentMissSignal:0,
      };
      current.exposures+=1;
      current.answered+=Number(skill.answered||0);
      current.total+=Number(skill.total||0);

      if(Number.isFinite(skill.accuracy)){
        current.scoredExposures+=1;
        current.weightedAccuracySum+=Number(skill.accuracy)*recency;
        current.weightedAccuracyWeight+=recency;
        current.recentMissSignal+=(100-Number(skill.accuracy))*recency;
      }
      map.set(skill.skillId,current);
    }
  }

  const ranked=[...map.values()].map(row=>{
    const completion=row.total?row.answered/row.total:0;
    const unansweredRate=1-completion;
    const accuracy=row.weightedAccuracyWeight
      ? row.weightedAccuracySum/row.weightedAccuracyWeight
      : null;

    // Accuracy drives weakness only when verified scoring exists.
    const accuracyRisk=accuracy==null?0:(100-accuracy)/100;
    const unansweredRisk=unansweredRate;
    const repeatWeight=clamp(row.exposures/3,0.35,1);
    const evidenceConfidence=clamp(
      (row.scoredExposures?0.55:0.2)+Math.min(row.exposures,4)*0.1,
      0,
      1
    );

    const weaknessScore=round1(100*(
      accuracyRisk*0.62+
      unansweredRisk*0.23+
      repeatWeight*0.15
    )*evidenceConfidence);

    let reason;
    if(accuracy==null){
      reason=unansweredRate>=0.35
        ?"Frequently left incomplete; verified accuracy is not available yet."
        :"Needs more verified scored evidence before Hallium can call this a true weakness.";
    }else if(accuracy<60){
      reason="Repeated verified errors are the main signal.";
    }else if(unansweredRate>=0.3){
      reason="Accuracy is mixed, but too many questions are left unanswered.";
    }else{
      reason="Performance is below your stronger skill blocks.";
    }

    return {
      skillId:row.skillId,
      skillLabel:row.skillLabel,
      section:row.section,
      weaknessScore,
      confidence:round1(evidenceConfidence*100),
      exposures:row.exposures,
      scoredExposures:row.scoredExposures,
      accuracy:accuracy==null?null:round1(accuracy),
      unansweredRate:round1(unansweredRate*100),
      reason,
      actionable:accuracy!=null||unansweredRate>=0.35,
    };
  });

  ranked.sort((a,b)=>b.weaknessScore-a.weaknessScore||b.confidence-a.confidence||a.skillId.localeCompare(b.skillId));
  return {
    ranked,
    primary:ranked.find(row=>row.actionable)||null,
    verifiedWeaknessCount:ranked.filter(row=>row.accuracy!=null&&row.weaknessScore>0).length,
  };
}
