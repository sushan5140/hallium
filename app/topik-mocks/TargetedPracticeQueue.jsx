"use client";

import {useEffect,useMemo,useState} from "react";
import {diagnoseTopikWeaknesses} from "../../lib/topik/diagnosis";
import {buildTopikPracticeQueue} from "../../lib/topik/practice-router";
import s from "./studio.module.css";

const STORE="hallium:topik-evidence:v1";

export default function TargetedPracticeQueue(){
  const [attempts,setAttempts]=useState([]);

  useEffect(()=>{
    try{
      const rows=JSON.parse(localStorage.getItem(STORE)||"[]");
      if(Array.isArray(rows))setAttempts(rows);
    }catch{}
  },[]);

  const diagnosis=useMemo(()=>diagnoseTopikWeaknesses(attempts),[attempts]);
  const level=useMemo(()=>{
    const latest=[...attempts]
      .filter(row=>row?.submitted&&(row.level==="I"||row.level==="II"))
      .sort((a,b)=>Date.parse(b.completedAt||b.startedAt||0)-Date.parse(a.completedAt||a.startedAt||0))[0];
    return latest?.level||"I";
  },[attempts]);
  const queue=useMemo(()=>buildTopikPracticeQueue(diagnosis,level,3),[diagnosis,level]);

  if(!diagnosis.primary)return null;

  return (
    <section className={s.featureNotice} aria-label="Targeted TOPIK practice">
      <strong>Targeted practice queue</strong>
      <span>{diagnosis.primary.reason}</span>
      <div className={s.resources}>
        {queue.map(item=>(
          <a key={item.priority} className={s.link} href={item.route.href}>
            {item.priority}. {item.route.label}
          </a>
        ))}
      </div>
    </section>
  );
}
