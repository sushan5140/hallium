export const CONTRIBUTION_TYPES=Object.freeze(["lesson_correction","practice_idea","culture_note","accessibility","creator_demo"]);
export const CONTRIBUTION_STATES=Object.freeze(["draft","under_review","approved","rejected"]);
const trim=(s,max)=>String(s||"").trim().slice(0,max);
export function normalizeContribution(input={}){
 const type=CONTRIBUTION_TYPES.includes(input.type)?input.type:"practice_idea";
 return {type,title:trim(input.title,100),context:trim(input.context,800),suggestion:trim(input.suggestion,1800),
   source:trim(input.source,300),rightsConfirmed:input.rightsConfirmed===true,
   anonymousPreference:input.anonymousPreference!==false,permissionToContact:input.permissionToContact===true};
}
export function validateContribution(input={}){
 const value=normalizeContribution(input);
 const errors=[];
 if(value.title.length<8)errors.push("Add a descriptive title (at least 8 characters).");
 if(value.context.length<20)errors.push("Explain the learning context (at least 20 characters).");
 if(value.suggestion.length<25)errors.push("Explain the proposed change (at least 25 characters).");
 if(!value.rightsConfirmed)errors.push("Confirm you have the rights to share this material.");
 return {valid:errors.length===0,errors,value};
}
export function contributionDraftText(input={}){
 const {valid,errors,value}=validateContribution(input);
 if(!valid)return {valid,errors,text:""};
 const text=["Hallium community contribution","Type: "+value.type.replaceAll("_"," "),
 "Title: "+value.title,"Context: "+value.context,"Proposal: "+value.suggestion,
 "Source / attribution: "+(value.source||"Original contribution"),
 "Rights confirmed: yes","Preferred credit: "+(value.anonymousPreference?"anonymous":"ask before publishing"),
 "Contact consent: "+(value.permissionToContact?"yes":"no"),
 "Submission status: DRAFT ONLY — copying this does not submit or publish it."].join("\n\n");
 return {valid,errors:[],text};
}
