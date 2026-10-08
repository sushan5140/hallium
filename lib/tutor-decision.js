import {
  buildTodayLearningPlan,
  enforceLearningPlanSafety,
  fitPlanToSession,
} from "./learning-intelligence.js";
import {
  applyEvidenceAwarePracticeRoute,
  recommendNextPractice,
} from "./practice-engine.js";
import {diagnoseTopikWeaknesses} from "./topik/diagnosis.js";
import {buildTopikTrajectory} from "./topik/trajectory.js";
import {routeTopikWeakness} from "./topik/practice-router.js";

export function buildTutorDecision({
  mistakes=[],
  latestStudyPct=null,
  completedPathCount=0,
  totalPathLessons=0,
  activeStudyLabel="current level",
  nextLessonTitle="your next lesson",
  preferences,
  candidateRoute=null,
  practiceAttempts=[],
  dueCount=0,
  topikAttempts=[],
  topikLevel="I",
}={}){
  const fallback=buildTodayLearningPlan({
    mistakes,
    latestStudyPct,
    completedPathCount,
    totalPathLessons,
    activeStudyLabel,
    nextLessonTitle,
    preferences,
  });

  const safe=enforceLearningPlanSafety(candidateRoute||fallback,fallback);
  const session=fitPlanToSession(safe,preferences);
  const practiceRecommendation=recommendNextPractice({
    attempts:practiceAttempts,
    dueCount,
  });
  let route=applyEvidenceAwarePracticeRoute(
    session,
    practiceRecommendation,
    dueCount,
  );

  const topikDiagnosis=diagnoseTopikWeaknesses(topikAttempts);
  const topikTrajectory=buildTopikTrajectory(topikAttempts);
  const verifiedTopikWeakness=topikDiagnosis.ranked.find(row=>Number.isFinite(row.accuracy)&&row.actionable)||null;
  const topikRoute=verifiedTopikWeakness?routeTopikWeakness(verifiedTopikWeakness,topikLevel):null;

  if(dueCount===0&&topikRoute&&verifiedTopikWeakness.weaknessScore>=20){
    const step={
      kind:"topik",
      title:topikRoute.label,
      why:verifiedTopikWeakness.reason,
      minutes:10,
      href:topikRoute.href,
      evidenceSkill:verifiedTopikWeakness.skillId,
      evidenceSource:"verified_topik",
    };
    route={...route,steps:[step,...(route.steps||[]).filter(item=>item.kind!=="topik")].slice(0,3)};
  }

  const evidence=[];
  if(dueCount>0)evidence.push({kind:"due_review",label:dueCount+" scheduled review"+(dueCount===1?"":"s")+" due"});
  if(Number.isFinite(latestStudyPct))evidence.push({kind:"study_result",label:"latest structured study result "+latestStudyPct+"%"});
  if(practiceRecommendation?.source==="practice_evidence"){
    evidence.push({
      kind:"practice_evidence",
      label:(practiceRecommendation.freshAttemptCount||0)+" recent practice attempts · "+practiceRecommendation.skill,
    });
  }
  if(verifiedTopikWeakness){
    evidence.push({
      kind:"verified_topik",
      label:verifiedTopikWeakness.skillLabel+" "+verifiedTopikWeakness.accuracy+"% verified accuracy",
    });
  }
  if(topikTrajectory.scoreTrend.status!=="insufficient"){
    evidence.push({
      kind:"topik_trajectory",
      label:"verified TOPIK score trend "+topikTrajectory.scoreTrend.status+" "+(topikTrajectory.scoreTrend.delta>0?"+":"")+topikTrajectory.scoreTrend.delta+" pts",
    });
  }
  if(completedPathCount>0)evidence.push({kind:"path_progress",label:completedPathCount+" curriculum items completed"});
  if(!evidence.length)evidence.push({kind:"baseline",label:"insufficient performance evidence; building baseline"});

  let confidence="low";
  if(dueCount>0)confidence="high";
  else if(practiceRecommendation?.freshAttemptCount>=5&&Number.isFinite(latestStudyPct))confidence="high";
  else if(verifiedTopikWeakness&&verifiedTopikWeakness.confidence>=75)confidence="high";
  else if(practiceRecommendation||verifiedTopikWeakness||Number.isFinite(latestStudyPct)||completedPathCount>0)confidence="medium";

  const primary=route?.steps?.[0]||null;
  const reason=primary?.why||route?.reason||"Build more learning evidence before making a narrower recommendation.";

  return {
    route,
    primary,
    confidence,
    reason,
    evidence,
    practiceRecommendation,
    topik:{
      weakness:verifiedTopikWeakness,
      trajectory:topikTrajectory,
      route:topikRoute,
    },
    source:"hallium_tutor_decision",
  };
}
