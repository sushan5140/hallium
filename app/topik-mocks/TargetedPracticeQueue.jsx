"use client";

import {useEffect,useMemo,useState} from "react";
import {diagnoseTopikWeaknesses} from "../../lib/topik/diagnosis";
import {buildTopikPracticeQueue} from "../../lib/topik/practice-router";
import {buildTopikTrajectory,createTopikInterventionSnapshot,evaluateTopikIntervention} from "../../lib/topik/trajectory";
import s from "./studio.module.css";

const STORE="hallium:topik-evidence:v1";
const INTERVENTION_STORE="hallium:topik-interventions:v1";

export default function TargetedPracticeQueue(){
  const [attempts,setAttempts]=useState([]);
  const [interventions,setInterventions]=useState([]);

  useEffect(()=>{
    try{
      const rows=JSON.parse(localStorage.getItem(STORE)||"[]");
      if(Array.isArray(rows))setAttempts(rows);
    }catch{}
    try{
      const rows=JSON.parse(localStorage.getItem(INTERVENTION_STORE)||"[]");
      if(Array.isArray(rows))setInterventions(rows);
    }catch{}
  },[]);

  useEffect(()=>{
    try{
      const key=["hallim","intelligence","v1"].join(":");
      const state=JSON.parse(localStorage.getItem(key)||"{}")||{};
      localStorage.setItem(key,JSON.stringify({
        ...state,
        topik:{...(state.topik||{}),evidence:attempts,interventions,updatedAt:new Date().toISOString()},
      }));
    }catch{}
  },[attempts,interventions]);

  const diagnosis=useMemo(()=>diagnoseTopikWeaknesses(attempts),[attempts]);
  const level=useMemo(()=>{
    const latest=[...attempts]
      .filter(row=>row?.submitted&&(row.level==="I"||row.level==="II"))
      .sort((a,b)=>Date.parse(b.completedAt||b.startedAt||0)-Date.parse(a.completedAt||a.startedAt||0))[0];
    return latest?.level||"I";
  },[attempts]);
  const queue=useMemo(()=>buildTopikPracticeQueue(diagnosis,level,3),[diagnosis,level]);
  const trajectory=useMemo(()=>buildTopikTrajectory(attempts),[attempts]);
  const latestIntervention=interventions.at(-1)||null;
  const impact=useMemo(()=>evaluateTopikIntervention(latestIntervention,attempts),[latestIntervention,attempts]);

  function rememberRecommendation(item){
    if(!item?.weakness)return;
    const snapshot=createTopikInterventionSnapshot(item.weakness,item.route);
    if(!snapshot)return;
    const next=[...interventions,snapshot].slice(-30);
    setInterventions(next);
    try{localStorage.setItem(INTERVENTION_STORE,JSON.stringify(next))}catch{}
  }

  if(!diagnosis.primary)return null;

  return (
    <section className={s.featureNotice} aria-label="Targeted TOPIK practice">
      <strong>Targeted practice queue</strong>
      <span>{diagnosis.primary.reason}</span>
      {trajectory.scoreTrend.status!=="insufficient"&&<span>Verified score trend · {trajectory.scoreTrend.status} · {trajectory.scoreTrend.delta>0?"+":""}{trajectory.scoreTrend.delta} pts</span>}
      {trajectory.mostImprovedSkill&&<span>Improving skill · {trajectory.mostImprovedSkill.skillLabel} · {trajectory.mostImprovedSkill.delta>0?"+":""}{trajectory.mostImprovedSkill.delta} pts</span>}
      {latestIntervention&&<span>Last targeted practice · {latestIntervention.skillLabel} · {impact.status==="insufficient"?"waiting for a later verified attempt":impact.status+" · "+(impact.delta>0?"+":"")+impact.delta+" pts"}</span>}
      <div className={s.resources}>
        {queue.map(item=>(
          <a key={item.priority} className={s.link} href={item.route.href} onClick={()=>rememberRecommendation(item)}>
            {item.priority}. {item.route.label}
          </a>
        ))}
      </div>
    </section>
  );
}
