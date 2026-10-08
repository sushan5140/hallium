import {buildProgressInsights} from "./progress-insights.js";
import {buildSkillEvidenceMap} from "./progress-skills.js";
import {rankWeakSkills} from "./learning-intelligence.js";
import {summarizePracticeEvidence} from "./practice-engine.js";
import {diagnoseTopikWeaknesses} from "./topik/diagnosis.js";
import {buildTopikTrajectory} from "./topik/trajectory.js";
import {evaluateTutorIntervention} from "./tutor-decision.js";

const pct=(done,total)=>total>0?Math.round((Number(done||0)/Number(total))*100):0;
const validTime=value=>{
  const t=Date.parse(value||"");
  return Number.isFinite(t)?t:null;
};
const percentResult=row=>row&&Number(row.total)>0?Math.round((Number(row.score||0)/Number(row.total))*100):null;

export function buildEvidenceTimeline({
  studyResults=[],
  practiceAttempts=[],
  topikAttempts=[],
  tutorInterventions=[],
  limit=12,
}={}){
  const events=[];

  const studies=(studyResults||[])
    .filter(row=>validTime(row?.completedAt)!=null)
    .sort((a,b)=>validTime(a.completedAt)-validTime(b.completedAt));
  studies.forEach((row,index)=>{
    const score=percentResult(row);
    const previous=index>0?percentResult(studies[index-1]):null;
    const delta=score!=null&&previous!=null?score-previous:null;
    events.push({
      id:"study:"+(row.completedAt||index),
      at:row.completedAt,
      source:"structured_study",
      label:"Structured study check",
      detail:score==null?"Recorded study attempt":score+"%",
      change:delta==null?null:delta,
      gain:delta!=null&&delta>=5,
      evidenceOnly:false,
    });
  });

  const practices=(practiceAttempts||[])
    .filter(row=>validTime(row?.createdAt)!=null)
    .sort((a,b)=>validTime(a.createdAt)-validTime(b.createdAt));
  const previousPracticeBySkill=new Map();
  for(const row of practices){
    const skill=String(row?.skill||"Mixed review");
    const score=Number.isFinite(Number(row?.score))?Number(row.score):null;
    const previous=previousPracticeBySkill.get(skill);
    const delta=score!=null&&Number.isFinite(previous)?score-previous:null;
    events.push({
      id:"practice:"+(row.id||row.createdAt||events.length),
      at:row.createdAt,
      source:"practice",
      label:skill,
      detail:score==null?"Practice recorded":score+"% · "+String(row?.outcome||"practice"),
      change:delta,
      gain:delta!=null&&delta>=8,
      evidenceOnly:delta==null,
    });
    if(score!=null)previousPracticeBySkill.set(skill,score);
  }

  const topik=(topikAttempts||[])
    .filter(row=>row?.submitted&&row?.scored&&Number.isFinite(row?.verifiedPercent)&&validTime(row?.completedAt||row?.startedAt)!=null)
    .sort((a,b)=>validTime(a.completedAt||a.startedAt)-validTime(b.completedAt||b.startedAt));
  topik.forEach((row,index)=>{
    const score=Number(row.verifiedPercent);
    const previous=index>0?Number(topik[index-1].verifiedPercent):null;
    const delta=Number.isFinite(previous)?score-previous:null;
    events.push({
      id:"topik:"+(row.id||row.paperId||index)+":"+(row.completedAt||row.startedAt),
      at:row.completedAt||row.startedAt,
      source:"verified_topik",
      label:"Verified TOPIK attempt",
      detail:score+"%",
      change:delta,
      gain:delta!=null&&delta>=2,
      evidenceOnly:false,
    });
  });

  for(const row of tutorInterventions||[]){
    if(validTime(row?.recommendedAt)==null)continue;
    events.push({
      id:"tutor:"+(row.id||row.recommendedAt),
      at:row.recommendedAt,
      source:"tutor",
      label:"Tutor intervention opened",
      detail:row.title||row.skill||row.kind||"Tutor-guided action",
      change:null,
      gain:false,
      evidenceOnly:true,
    });
  }

  return events
    .sort((a,b)=>validTime(b.at)-validTime(a.at))
    .slice(0,Math.max(1,Number(limit||12)));
}

export function buildProgressModel({
  currentLevel={},
  targetLevel={},
  completedPathCount=0,
  totalPathLessons=0,
  studyResults=[],
  mistakes=[],
  practiceAttempts=[],
  topikAttempts=[],
  tutorInterventions=[],
}={}){
  const latestStudy=Array.isArray(studyResults)&&studyResults.length?studyResults[0]:null;
  const latestStudyPercent=latestStudy&&Number(latestStudy.total)>0
    ? Math.round((Number(latestStudy.score||0)/Number(latestStudy.total))*100)
    : null;

  const weakSkills=rankWeakSkills(mistakes,Date.now(),3);
  const dueWeaknesses=(mistakes||[]).filter(item=>{
    const t=Date.parse(item?.nextReviewAt||"");
    return Number.isFinite(t)&&t<=Date.now();
  }).length;

  const practice=summarizePracticeEvidence(practiceAttempts);
  const topikDiagnosis=diagnoseTopikWeaknesses(topikAttempts);
  const topikTrajectory=buildTopikTrajectory(topikAttempts);

  const latestIntervention=(tutorInterventions||[]).at(-1)||null;
  const timeline=buildEvidenceTimeline({studyResults,practiceAttempts,topikAttempts,tutorInterventions});
  const latestInterventionOutcome=latestIntervention
    ? evaluateTutorIntervention(latestIntervention,{practiceAttempts,topikAttempts})
    : null;

  const recentGains=timeline
    .filter(row=>row.gain)
    .slice(0,4)
    .map(row=>({
      kind:row.source,
      label:row.label,
      detail:(row.change>=0?"+":"")+row.change+" pts · "+row.detail,
      at:row.at,
    }));

  const unresolved=[];
  for(const row of weakSkills){
    unresolved.push({
      kind:"weakness",
      label:row.skill,
      detail:row.due
        ? row.due+" due review"+(row.due===1?"":"s")
        : "priority score "+row.score,
    });
  }
  if(topikDiagnosis.primary&&Number.isFinite(topikDiagnosis.primary.accuracy)){
    unresolved.push({
      kind:"topik",
      label:topikDiagnosis.primary.skillLabel,
      detail:topikDiagnosis.primary.accuracy+"% verified accuracy",
    });
  }

  const skillMap=buildSkillEvidenceMap({mistakes,practiceAttempts,topikAttempts});
  const insights=buildProgressInsights({skillMap,weaknesses:{dueCount:dueWeaknesses}});
  return {
    levelContext:{
      currentId:currentLevel.id||"",
      currentLabel:currentLevel.label||"",
      targetId:targetLevel.id||"",
      targetLabel:targetLevel.label||"",
      topikRange:currentLevel.topik||"",
      note:"This is Hallium learning context, not an official proficiency certification.",
    },
    path:{
      completed:Number(completedPathCount||0),
      total:Number(totalPathLessons||0),
      percent:pct(completedPathCount,totalPathLessons),
      source:"curriculum_completion",
    },
    structuredStudy:{
      latestPercent:latestStudyPercent,
      attempts:Array.isArray(studyResults)?studyResults.length:0,
      source:"hallium_structured_tests",
    },
    weaknesses:{
      dueCount:dueWeaknesses,
      top:weakSkills,
      source:"mistake_memory",
    },
    practice:{
      ...practice,
      source:"practice_evidence",
    },
    topik:{
      verifiedAttempts:topikTrajectory.verifiedAttempts,
      scoreTrend:topikTrajectory.scoreTrend,
      primaryWeakness:topikDiagnosis.primary,
      verifiedWeaknessCount:topikDiagnosis.verifiedWeaknessCount,
      source:"verified_topik_only",
    },
    tutor:{
      interventions:(tutorInterventions||[]).length,
      latest:latestIntervention,
      latestOutcome:latestInterventionOutcome,
      source:"tutor_intervention_memory",
    },
    skillMap,
    insights,
    recentGains,
    timeline,
    timelineNote:"Curriculum completion is shown as a current snapshot because historical lesson records do not carry reliable completion timestamps.",
    unresolved:unresolved.slice(0,5),
    masteryScore:null,
    disclaimer:"Hallium keeps progress dimensions separate instead of collapsing them into one mastery percentage.",
  };
}
