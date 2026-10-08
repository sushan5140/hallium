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

export const TUTOR_INTENT_FOCUS=["conversation","listening","vocabulary","grammar","assessment","topik"];

export function normalizeTutorIntent(value={}){
  const focus=TUTOR_INTENT_FOCUS.includes(value?.focus)?value.focus:"";
  const rawMinutes=Number(value?.minutes);
  const minutes=Number.isFinite(rawMinutes)&&rawMinutes>0
    ? Math.max(5,Math.min(60,Math.round(rawMinutes)))
    : null;
  return {
    focus,
    minutes,
    topikMode:Boolean(value?.topikMode||focus==="topik"),
  };
}

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
  interventionMemory=null,
  intent=null,
}={}){
  const sessionIntent=normalizeTutorIntent(intent||{});
  const effectivePreferences=sessionIntent.minutes||sessionIntent.focus&&sessionIntent.focus!=="topik"
    ? {
        ...(preferences||{}),
        dailyMinutes:sessionIntent.minutes||preferences?.dailyMinutes,
        focuses:sessionIntent.focus&&sessionIntent.focus!=="topik"
          ? [sessionIntent.focus]
          : preferences?.focuses,
      }
    : preferences;
  const fallback=buildTodayLearningPlan({
    mistakes,
    latestStudyPct,
    completedPathCount,
    totalPathLessons,
    activeStudyLabel,
    nextLessonTitle,
    preferences:effectivePreferences,
  });

  const safe=enforceLearningPlanSafety(candidateRoute||fallback,fallback);
  const session=fitPlanToSession(safe,effectivePreferences);
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

  if(dueCount===0&&sessionIntent.topikMode){
    const topikIntentStep=topikRoute&&verifiedTopikWeakness
      ? {
          kind:"topik",
          title:topikRoute.label,
          why:"You chose TOPIK mode for this session, and Hallium has verified weakness evidence for this skill.",
          minutes:Math.min(10,sessionIntent.minutes||10),
          href:topikRoute.href,
          evidenceSkill:verifiedTopikWeakness.skillId,
          evidenceSource:"verified_topik",
        }
      : {
          kind:"topik",
          title:"Build TOPIK evidence",
          why:"You chose TOPIK mode, but Hallium does not have enough verified scored evidence to target a weakness yet.",
          minutes:Math.min(10,sessionIntent.minutes||10),
          href:"/topik-mocks",
          evidenceSkill:"",
          evidenceSource:"learner_intent",
        };
    route={...route,steps:[topikIntentStep,...(route.steps||[]).filter(step=>step.kind!=="topik")].slice(0,3)};
  }else if(dueCount===0&&sessionIntent.focus){
    const focusMap={
      conversation:{kind:"companion",title:"Conversation-focused lesson",why:"You asked Hallium to keep this session focused on conversation."},
      listening:{kind:"companion",title:"Listening-focused lesson",why:"You asked Hallium to keep this session focused on listening."},
      vocabulary:{kind:"vocab",title:"Vocabulary-only focus",why:"You asked Hallium to focus this session on vocabulary."},
      grammar:{kind:"grammar",title:"Grammar-only focus",why:"You asked Hallium to focus this session on grammar."},
      assessment:{kind:"test",title:"Assessment-focused session",why:"You asked Hallium to use this session for measurement and reassessment."},
    };
    const chosen=focusMap[sessionIntent.focus];
    if(chosen){
      const intentStep={...chosen,minutes:Math.min(sessionIntent.minutes||10,chosen.kind==="companion"?10:8),evidenceSource:"learner_intent"};
      route={...route,steps:[intentStep,...(route.steps||[]).filter(step=>step.kind!==intentStep.kind)].slice(0,3)};
    }
  }

  if(dueCount===0&&!sessionIntent.focus&&!sessionIntent.topikMode&&interventionMemory?.snapshot&&interventionMemory?.outcome?.status==="evaluated"){
    const action=interventionMemory.outcome.action;
    const previous=interventionMemory.snapshot;
    if(action!=="switch"&&previous.kind){
      const memoryStep={
        kind:previous.kind,
        title:(action==="escalate"?"Intensify · ":action==="maintain"?"Continue · ":"Repeat · ")+(previous.title||"targeted tutor practice"),
        why:action==="escalate"
          ?"Multiple later attempts remain weak, so Hallium keeps the same target but increases support before switching."
          :action==="maintain"
            ?"Later evidence is improving, so Hallium keeps this intervention long enough to confirm the gain."
            :"Later evidence is not decisive yet, so Hallium repeats the same target before changing direction.",
        minutes:10,
        href:previous.href||"",
        evidenceSkill:previous.skill||"",
        evidenceSource:"intervention_memory",
      };
      route={...route,steps:[memoryStep,...(route.steps||[]).filter(step=>step.kind!==memoryStep.kind)].slice(0,3)};
    }
  }

  const evidence=[];
  if(sessionIntent.focus||sessionIntent.minutes){
    evidence.push({
      kind:"learner_intent",
      label:[
        sessionIntent.topikMode?"TOPIK mode":sessionIntent.focus?sessionIntent.focus+" focus":"",
        sessionIntent.minutes?sessionIntent.minutes+" min available":"",
      ].filter(Boolean).join(" · "),
    });
  }
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
  if(interventionMemory?.outcome?.status==="evaluated"){
    evidence.push({
      kind:"intervention_outcome",
      label:"prior tutor intervention · "+interventionMemory.outcome.action+" · "+(interventionMemory.outcome.delta>=0?"+":"")+interventionMemory.outcome.delta+" pts",
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
    interventionMemory:interventionMemory||null,
    intent:sessionIntent,
    topik:{
      weakness:verifiedTopikWeakness,
      trajectory:topikTrajectory,
      route:topikRoute,
    },
    source:"hallium_tutor_decision",
  };
}


export function createTutorInterventionSnapshot(decision,at=new Date()){
  const primary=decision?.primary;
  if(!primary?.kind)return null;
  const topikWeakness=decision?.topik?.weakness||null;
  const skill=String(primary.evidenceSkill||decision?.practiceRecommendation?.skill||topikWeakness?.skillId||"");
  const baseline=primary.evidenceSource==="verified_topik"
    ? (Number.isFinite(topikWeakness?.accuracy)?Number(topikWeakness.accuracy):null)
    : (Number.isFinite(decision?.practiceRecommendation?.evidenceScore)?Number(decision.practiceRecommendation.evidenceScore):null);
  return {
    id:"tutor-intervention:"+primary.kind+":"+at.toISOString(),
    kind:primary.kind,
    title:primary.title||"",
    skill,
    evidenceSource:primary.evidenceSource||decision?.practiceRecommendation?.source||"",
    baselineScore:baseline,
    recommendedAt:at.toISOString(),
    confidence:decision?.confidence||"low",
    href:primary.href||"",
  };
}

export function evaluateTutorIntervention(snapshot,{practiceAttempts=[],topikAttempts=[]}={}){
  if(!snapshot?.kind||!snapshot?.recommendedAt)return {status:"insufficient",action:"wait",samples:0,delta:null};
  const start=Date.parse(snapshot.recommendedAt);
  if(!Number.isFinite(start))return {status:"insufficient",action:"wait",samples:0,delta:null};

  const points=[];
  if(snapshot.evidenceSource==="verified_topik"){
    for(const attempt of topikAttempts||[]){
      const at=Date.parse(attempt?.completedAt||attempt?.startedAt||"");
      if(!Number.isFinite(at)||at<=start)continue;
      const skill=(attempt.skills||[]).find(row=>row.skillId===snapshot.skill&&Number.isFinite(row.accuracy));
      if(skill)points.push({at,score:Number(skill.accuracy)});
    }
  }else{
    for(const attempt of practiceAttempts||[]){
      const at=Date.parse(attempt?.createdAt||"");
      if(!Number.isFinite(at)||at<=start)continue;
      if(snapshot.skill&&String(attempt?.skill||"")!==snapshot.skill)continue;
      if(Number.isFinite(Number(attempt?.score)))points.push({at,score:Number(attempt.score)});
    }
  }

  points.sort((a,b)=>a.at-b.at);
  if(points.length<2||!Number.isFinite(snapshot.baselineScore)){
    return {
      status:"insufficient",
      action:"wait",
      samples:points.length,
      delta:null,
      latestScore:points.length?points.at(-1).score:null,
    };
  }

  const recent=points.slice(-3);
  const average=recent.reduce((sum,row)=>sum+row.score,0)/recent.length;
  const delta=average-Number(snapshot.baselineScore);
  let action="repeat";
  if(average>=82&&delta>=5)action="switch";
  else if(delta>=8)action="maintain";
  else if(average<55&&delta<=3)action="escalate";

  return {
    status:"evaluated",
    action,
    samples:points.length,
    baselineScore:Math.round(Number(snapshot.baselineScore)*10)/10,
    recentAverage:Math.round(average*10)/10,
    latestScore:Math.round(points.at(-1).score*10)/10,
    delta:Math.round(delta*10)/10,
  };
}
