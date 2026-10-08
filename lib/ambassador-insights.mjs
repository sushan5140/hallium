export const PILOT_STAGES=["shortlisted","invited","testing","active","paused","declined"];
const count=v=>Math.max(0,Math.trunc(Number(v)||0));
export function referralFunnel(pilot={}){
 const visits=count(pilot.visits),signups=count(pilot.signups),activated=count(pilot.activated),tested=count(pilot.tested),reviewed=count(pilot.weakness_reviewed),returned=count(pilot.returned_next_day);
 const rate=(n,d)=>d>0?Math.round(100*n/d):null;
 return {visits,signups,activated,tested,reviewed,returned,
 conversion:{visitToSignup:rate(signups,visits),signupToActivated:rate(activated,signups),activatedToTest:rate(tested,activated),testToReview:rate(reviewed,tested)},
 note:"Observational counts, not proof of individual attribution or causation."};
}
export function pilotNextAction(pilot={}){
 const stage=String(pilot.stage||"shortlisted");
 if(stage==="shortlisted")return {label:"Invite for a product test",note:"Request explicit interest before sending a pilot link."};
 if(stage==="invited")return {label:"Await opt-in response",note:"Do not assume participation from an invitation."};
 if(stage==="testing")return {label:"Collect private pilot feedback",note:"Review the creator's experience before approval."};
 if(stage==="active")return {label:"Monitor approved code",note:"Review aggregate attribution; never promise commission."};
 if(stage==="paused")return {label:"Revalidate before reactivation",note:"Confirm permission and status before enabling a code."};
 return {label:"Do not contact automatically",note:"Respect the creator's decision."};
}
export function validReferralCode(value){
 return /^[A-Za-z0-9_-]{2,48}$/.test(String(value||"").trim());
}
