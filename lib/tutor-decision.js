import {
  buildTodayLearningPlan,
  enforceLearningPlanSafety,
  fitPlanToSession,
} from "./learning-intelligence.js";
import {
  applyEvidenceAwarePracticeRoute,
  recommendNextPractice,
} from "./practice-engine.js";

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
  const route=applyEvidenceAwarePracticeRoute(
    session,
    practiceRecommendation,
    dueCount,
  );

  const evidence=[];
  if(dueCount>0)evidence.push({kind:"due_review",label:dueCount+" scheduled review"+(dueCount===1?"":"s")+" due"});
  if(Number.isFinite(latestStudyPct))evidence.push({kind:"study_result",label:"latest structured study result "+latestStudyPct+"%"});
  if(practiceRecommendation?.source==="practice_evidence"){
    evidence.push({
      kind:"practice_evidence",
      label:(practiceRecommendation.freshAttemptCount||0)+" recent practice attempts · "+practiceRecommendation.skill,
    });
  }
  if(completedPathCount>0)evidence.push({kind:"path_progress",label:completedPathCount+" curriculum items completed"});
  if(!evidence.length)evidence.push({kind:"baseline",label:"insufficient performance evidence; building baseline"});

  let confidence="low";
  if(dueCount>0)confidence="high";
  else if(practiceRecommendation?.freshAttemptCount>=5&&Number.isFinite(latestStudyPct))confidence="high";
  else if(practiceRecommendation||Number.isFinite(latestStudyPct)||completedPathCount>0)confidence="medium";

  const primary=route?.steps?.[0]||null;
  const reason=primary?.why||route?.reason||"Build more learning evidence before making a narrower recommendation.";

  return {
    route,
    primary,
    confidence,
    reason,
    evidence,
    practiceRecommendation,
    source:"hallium_tutor_decision",
  };
}
