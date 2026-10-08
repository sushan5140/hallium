"use client";
import {useState} from "react";
import {CONTRIBUTION_TYPES,contributionDraftText} from "../../../lib/community/contributions.mjs";
const initial={type:"practice_idea",title:"",context:"",suggestion:"",source:"",rightsConfirmed:false,anonymousPreference:true,permissionToContact:false};
export default function ContributionStudio(){
 const [draft,setDraft]=useState(initial);const [error,setError]=useState("");const [status,setStatus]=useState("");
 const set=(key,value)=>setDraft(current=>({...current,[key]:value}));
 async function copy(){
  const output=contributionDraftText(draft);
  if(!output.valid){setError(output.errors.join(" "));setStatus("");return;}
  setError("");
  try{await navigator.clipboard.writeText(output.text);setStatus("Draft copied. Nothing has been submitted or published.");}
  catch{setStatus("Clipboard was unavailable. Select your text fields to copy manually.");}
 }
 return <main className="publicPage">
  <header className="publicNav"><a className="publicBrand" href="/"><i>ㅎ</i><span><b>Hallim</b><small>한림</small></span></a><nav><a href="/community">Community</a><a href="/creator-kit">Creator kit</a></nav></header>
  <section className="publicHero"><span className="eyebrow">CONTRIBUTION STUDIO</span><h1>Make the suggestion easy to review.</h1><p>Compose a structured draft locally, check your rights, then copy it. This version does not upload, submit, or publicly post anything.</p></section>
  <section className="publicSection"><div className="feedbackCard" style={{maxWidth:800,margin:"auto"}}>
   <label><span>Contribution type</span><select value={draft.type} onChange={e=>set("type",e.target.value)}>{CONTRIBUTION_TYPES.map(x=><option key={x} value={x}>{x.replaceAll("_"," ")}</option>)}</select></label>
   <label><span>Title</span><input value={draft.title} maxLength={100} onChange={e=>set("title",e.target.value)} placeholder="What should change?" /></label>
   <label><span>Current context</span><textarea value={draft.context} maxLength={800} onChange={e=>set("context",e.target.value)} placeholder="Which lesson, example, or real-life situation?" /></label>
   <label><span>Your proposed improvement</span><textarea value={draft.suggestion} maxLength={1800} onChange={e=>set("suggestion",e.target.value)} placeholder="Explain the correction or new learning activity and why it helps." /></label>
   <label><span>Source or attribution (optional)</span><input value={draft.source} maxLength={300} onChange={e=>set("source",e.target.value)} placeholder="Original idea or rights-cleared reference" /></label>
   <label><input type="checkbox" checked={draft.rightsConfirmed} onChange={e=>set("rightsConfirmed",e.target.checked)}/> I own this proposal or have permission to share it.</label>
   <label><input type="checkbox" checked={draft.anonymousPreference} onChange={e=>set("anonymousPreference",e.target.checked)}/> Prefer no public credit</label>
   <label><input type="checkbox" checked={draft.permissionToContact} onChange={e=>set("permissionToContact",e.target.checked)}/> I consent to being contacted if I later submit through an approved channel</label>
   {error&&<p role="alert">{error}</p>}{status&&<p role="status">{status}</p>}
   <button className="publicPrimary" type="button" onClick={copy}>Validate & copy draft</button>
   <button type="button" onClick={()=>{setDraft(initial);setError("");setStatus("");}}>Clear form</button>
   <p><small>Do not paste personal learner records or copyrighted content. This tool drafts locally only; copying is not publication or submission.</small></p>
  </div></section>
 </main>;
}