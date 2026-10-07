const ROUTES={
  I:{
    listening_response:["i01","i04"],
    listening_location:["i03","i05"],
    listening_detail:["i02","i06"],
    listening_main_idea:["i08","i12"],
    listening_inference:["i08","i12"],
    reading_vocab_grammar:["i01","i07"],
    reading_notice_info:["i09","i05"],
    reading_order:["i11","i12"],
    reading_blank:["i07","i08"],
    reading_main_idea:["i12"],
    reading_detail:["i09","i10"],
    reading_inference:["i08","i12"],
  },
  II:{
    listening_response:["ii05"],
    listening_detail:["ii02","ii07"],
    listening_main_idea:["ii03","ii04"],
    listening_inference:["ii06","ii05"],
    reading_vocab_grammar:["ii01","ii03"],
    reading_order:["ii08"],
    reading_blank:["ii03","ii04"],
    reading_main_idea:["ii04","ii07"],
    reading_detail:["ii02","ii07"],
    reading_inference:["ii06","ii08"],
    writing_sentence:["ii09"],
    writing_data:["ii10","ii02"],
    writing_essay:["ii10"],
  },
};

function unitRoute(unitId,skillId){
  return {
    kind:"companion",
    href:"/topik-companion?unit="+encodeURIComponent(unitId)+"&from=diagnosis&skill="+encodeURIComponent(skillId),
    unitId,
  };
}

export function routeTopikWeakness(weakness,level="I"){
  if(!weakness?.skillId) return {
    kind:"mock",
    href:"/topik-mocks",
    label:"Take another TOPIK mock",
    reason:"More evidence is needed before Hallium can target a specific skill.",
  };

  const routes=ROUTES[level]||ROUTES.I;
  const units=routes[weakness.skillId]||[];
  if(units.length){
    const route=unitRoute(units[0],weakness.skillId);
    return {
      ...route,
      label:"Practice "+weakness.skillLabel,
      reason:weakness.reason||"Target the weakest diagnosed skill before another full mock.",
      alternates:units.slice(1).map(id=>unitRoute(id,weakness.skillId)),
    };
  }

  return {
    kind:"mock",
    href:"/topik-mocks?focus="+encodeURIComponent(weakness.section||"reading"),
    label:"Practice "+(weakness.skillLabel||weakness.section||"TOPIK"),
    reason:"No dedicated Hallium lesson matches this block yet; use a focused paper section.",
    alternates:[],
  };
}

export function buildTopikPracticeQueue(diagnosis,level="I",limit=3){
  const rows=(diagnosis?.ranked||[])
    .filter(row=>row?.actionable)
    .slice(0,Math.max(1,limit));

  if(!rows.length) return [{
    priority:1,
    weakness:null,
    route:routeTopikWeakness(null,level),
  }];

  return rows.map((weakness,index)=>({
    priority:index+1,
    weakness,
    route:routeTopikWeakness(weakness,level),
  }));
}
