import {rankWeakSkills} from "./learning-intelligence.js";
import {summarizePracticeEvidence} from "./practice-engine.js";
import {diagnoseTopikWeaknesses} from "./topik/diagnosis.js";
import {buildTopikTrajectory} from "./topik/trajectory.js";
import {evaluateTutorIntervention} from "./tutor-decision.js";

const pct=(done,total)=>total>0?Math.round((Number(done||0)/Number(total))*100):0;

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
  const latestInterventionOutcome=latestIntervention
    ? evaluateTutorIntervention(latestIntervention,{practiceAttempts,topikAttempts})
    : null;

  const recentGains=[];
  if(topikTrajectory.scoreTrend.status==="improving"){
    recentGains.push({
      kind:"topik",
      label:"Verified TOPIK score trend",
      detail:"+"+topikTrajectory.scoreTrend.delta+" pts across verified attempts",
    });
  }
  if(practice.averageScore!=null&&practice.outcomes.strong>practice.outcomes.relearn){
    recentGains.push({
      kind:"practice",
      label:"Recent practice evidence",
      detail:practice.averageScore+"% average across "+practice.attempts+" recent attempts",
    });
  }
  if(latestInterventionOutcome?.status==="evaluated"&&Number(latestInterventionOutcome.delta)>0){
    recentGains.push({
      kind:"tutor",
      label:"Tutor intervention follow-up",
      detail:"+"+latestInterventionOutcome.delta+" pts across "+latestInterventionOutcome.samples+" later relevant attempts",
    });
  }

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
    recentGains:recentGains.slice(0,4),
    unresolved:unresolved.slice(0,5),
    masteryScore:null,
    disclaimer:"Hallium keeps progress dimensions separate instead of collapsing them into one mastery percentage.",
  };
}
