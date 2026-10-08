"use client";
import {useEffect} from "react";
export default function OfflineRegistration(){
 useEffect(()=>{
  if(!("serviceWorker" in navigator))return;
  if(location.protocol!=="https:"&&location.hostname!=="localhost")return;
  const register=()=>navigator.serviceWorker.register("/sw.js",{scope:"/"}).catch(()=>{});
  // Registration is nonblocking and never prevents the learner application from loading.
  if(document.readyState==="complete")register();
  else {window.addEventListener("load",register,{once:true});return()=>window.removeEventListener("load",register);}
 },[]);
 return null;
}