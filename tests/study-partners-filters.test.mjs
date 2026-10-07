import {test} from "node:test";
import assert from "node:assert/strict";
import {filterPartnerSuggestions,fit} from "../lib/study-partners/core.mjs";

const me={user_id:"a",discoverable:true,level:"beginner",availability:"Evenings",strength:"vocabulary",growth_area:"grammar",diagnostic:{partner_preferences:{goals:["topik"],practiceNeeds:["reading"]}}};
const good={user_id:"b",discoverable:true,level:"beginner",availability:"Evenings",strength:"grammar",growth_area:"vocabulary",diagnostic:{partner_preferences:{goals:["topik"],practiceNeeds:["reading"]}}};
const farther={user_id:"c",discoverable:true,level:"advanced",availability:"Mornings",strength:"grammar",growth_area:"vocabulary",diagnostic:{}};

test("filters narrow ranked suggestions without changing match generation",()=>{
 const rows=[good,farther].map(p=>({...p,match:fit(me,p)})).filter(x=>x.match);
 const filtered=filterPartnerSuggestions(rows,{minScore:80,maxLevelDistance:1});
 assert.equal(filtered.length,1);
 assert.equal(filtered[0].user_id,"b");
});

test("shared-goal and practice filters use explicit overlap only",()=>{
 const rows=[good,farther].map(p=>({...p,match:fit(me,p)})).filter(x=>x.match);
 assert.equal(filterPartnerSuggestions(rows,{sharedGoal:"topik"}).length,1);
 assert.equal(filterPartnerSuggestions(rows,{sharedNeed:"reading"}).length,1);
});

test("mutual and availability filters stay optional",()=>{
 const rows=[good,farther].map(p=>({...p,match:fit(me,p)})).filter(x=>x.match);
 assert.equal(filterPartnerSuggestions(rows,{mutualOnly:true,availabilityOnly:true}).length,1);
});

test("non-discoverable learners never enter the filter stage",()=>{
 assert.equal(fit(me,{...good,discoverable:false}),null);
});
