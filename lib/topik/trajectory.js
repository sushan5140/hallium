const round1=n=>Math.round(n*10)/10;

function timeOf(row){
  const value=Date.parse(row?.completedAt||row?.startedAt||"");
  return Number.isFinite(value)?value:0;
}

function direction(delta,threshold=2){
  if(delta>=threshold)return "improving";
  if(delta<=-threshold)return "declining";
  return "stable";
}

function splitWindow(values){
  if(values.length<2)return {early:values,late:values};
  const cut=Math.max(1,Math.floor(values.length/2));
  return {early:values.slice(0,cut),late:values.slice(cut)};
}

function average(values){
  return values.length?values.reduce((sum,n)=>sum+n,0)/values.length:null;
}

export function buildTopikTrajectory(attempts=[]){
  const submitted=(attempts||[])
    .filter(row=>row?.submitted)
    .sort((a,b)=>timeOf(a)-timeOf(b));

  const scored=submitted.filter(row=>row.scored&&Number.isFinite(row.verifiedPercent));
  const scoreSeries=scored.map(row=>({
    paperId:row.paperId,
    level:row.level,
    at:row.completedAt||row.startedAt||null,
    percent:Number(row.verifiedPercent),
  }));

  let scoreTrend={
    status:"insufficient",
    delta:null,
    earlyAverage:null,
    recentAverage:null,
    attempts:scoreSeries.length,
  };

  if(scoreSeries.length>=2){
    const values=scoreSeries.map(row=>row.percent);
    const {early,late}=splitWindow(values);
    const earlyAverage=average(early);
    const recentAverage=average(late);
    const delta=recentAverage-earlyAverage;
    scoreTrend={
      status:direction(delta),
      delta:round1(delta),
      earlyAverage:round1(earlyAverage),
      recentAverage:round1(recentAverage),
      attempts:scoreSeries.length,
    };
  }

  const skillMap=new Map();
  for(const attempt of submitted){
    for(const skill of attempt.skills||[]){
      if(!Number.isFinite(skill.accuracy))continue;
      const current=skillMap.get(skill.skillId)||{
        skillId:skill.skillId,
        skillLabel:skill.skillLabel,
        section:skill.section,
        points:[],
      };
      current.points.push({
        at:attempt.completedAt||attempt.startedAt||null,
        accuracy:Number(skill.accuracy),
      });
      skillMap.set(skill.skillId,current);
    }
  }

  const skills=[...skillMap.values()].map(row=>{
    row.points.sort((a,b)=>Date.parse(a.at||0)-Date.parse(b.at||0));
    const values=row.points.map(point=>point.accuracy);
    if(values.length<2){
      return {
        skillId:row.skillId,
        skillLabel:row.skillLabel,
        section:row.section,
        status:"insufficient",
        delta:null,
        attempts:values.length,
        first:values[0]??null,
        latest:values.at(-1)??null,
        points:row.points,
      };
    }
    const {early,late}=splitWindow(values);
    const earlyAverage=average(early);
    const recentAverage=average(late);
    const delta=recentAverage-earlyAverage;
    return {
      skillId:row.skillId,
      skillLabel:row.skillLabel,
      section:row.section,
      status:direction(delta,5),
      delta:round1(delta),
      attempts:values.length,
      first:values[0],
      latest:values.at(-1),
      earlyAverage:round1(earlyAverage),
      recentAverage:round1(recentAverage),
      points:row.points,
    };
  }).sort((a,b)=>(b.delta??-Infinity)-(a.delta??-Infinity)||a.skillId.localeCompare(b.skillId));

  return {
    submittedAttempts:submitted.length,
    verifiedAttempts:scoreSeries.length,
    scoreSeries,
    scoreTrend,
    skills,
    mostImprovedSkill:skills.find(row=>row.status==="improving")||null,
    mostDeclinedSkill:[...skills].sort((a,b)=>(a.delta??Infinity)-(b.delta??Infinity))[0]?.status==="declining"
      ? [...skills].sort((a,b)=>(a.delta??Infinity)-(b.delta??Infinity))[0]
      : null,
  };
}
