export const TOPIK_SKILL_BLOCKS = Object.freeze({
  listening_response: "Listening response",
  listening_location: "Listening place / situation",
  listening_detail: "Listening detail",
  listening_main_idea: "Listening main idea",
  listening_inference: "Listening inference",
  reading_vocab_grammar: "Vocabulary / grammar",
  reading_notice_info: "Notices / practical information",
  reading_order: "Sentence / paragraph ordering",
  reading_blank: "Context blank-fill",
  reading_main_idea: "Main idea / topic",
  reading_detail: "Reading detail",
  reading_inference: "Reading inference",
  writing_sentence: "Sentence completion",
  writing_data: "Data / graph writing",
  writing_essay: "Essay writing",
  other: "Other",
});

function block(id,label,section,start,end){
  return {id,label,section,start,end};
}

const TOPIK_I = [
  block("listening_response",TOPIK_SKILL_BLOCKS.listening_response,"listening",1,6),
  block("listening_location",TOPIK_SKILL_BLOCKS.listening_location,"listening",7,10),
  block("listening_detail",TOPIK_SKILL_BLOCKS.listening_detail,"listening",11,20),
  block("listening_main_idea",TOPIK_SKILL_BLOCKS.listening_main_idea,"listening",21,26),
  block("listening_inference",TOPIK_SKILL_BLOCKS.listening_inference,"listening",27,30),

  block("reading_vocab_grammar",TOPIK_SKILL_BLOCKS.reading_vocab_grammar,"reading",31,39),
  block("reading_notice_info",TOPIK_SKILL_BLOCKS.reading_notice_info,"reading",40,48),
  block("reading_order",TOPIK_SKILL_BLOCKS.reading_order,"reading",49,54),
  block("reading_blank",TOPIK_SKILL_BLOCKS.reading_blank,"reading",55,58),
  block("reading_main_idea",TOPIK_SKILL_BLOCKS.reading_main_idea,"reading",59,64),
  block("reading_detail",TOPIK_SKILL_BLOCKS.reading_detail,"reading",65,68),
  block("reading_inference",TOPIK_SKILL_BLOCKS.reading_inference,"reading",69,70),
];

const TOPIK_II = [
  block("listening_response",TOPIK_SKILL_BLOCKS.listening_response,"listening",1,10),
  block("listening_detail",TOPIK_SKILL_BLOCKS.listening_detail,"listening",11,20),
  block("listening_main_idea",TOPIK_SKILL_BLOCKS.listening_main_idea,"listening",21,30),
  block("listening_inference",TOPIK_SKILL_BLOCKS.listening_inference,"listening",31,50),

  block("writing_sentence",TOPIK_SKILL_BLOCKS.writing_sentence,"writing",51,52),
  block("writing_data",TOPIK_SKILL_BLOCKS.writing_data,"writing",53,53),
  block("writing_essay",TOPIK_SKILL_BLOCKS.writing_essay,"writing",54,54),

  block("reading_vocab_grammar",TOPIK_SKILL_BLOCKS.reading_vocab_grammar,"reading",1,4),
  block("reading_order",TOPIK_SKILL_BLOCKS.reading_order,"reading",5,8),
  block("reading_blank",TOPIK_SKILL_BLOCKS.reading_blank,"reading",9,12),
  block("reading_main_idea",TOPIK_SKILL_BLOCKS.reading_main_idea,"reading",13,24),
  block("reading_detail",TOPIK_SKILL_BLOCKS.reading_detail,"reading",25,38),
  block("reading_inference",TOPIK_SKILL_BLOCKS.reading_inference,"reading",39,50),
];

export function topikQuestionSkill(paper, item) {
  if (!paper || !item) return {id:"other",label:TOPIK_SKILL_BLOCKS.other,section:item?.section||""};
  const ranges = paper.level === "II" ? TOPIK_II : TOPIK_I;
  const number = Number(item.displayNumber || item.localIndex || 0);
  return ranges.find((row) => row.section === item.section && number >= row.start && number <= row.end)
    || {id:"other",label:TOPIK_SKILL_BLOCKS.other,section:item.section,start:number,end:number};
}

export function annotateQuestionManifest(paper, manifest = []) {
  return manifest.map((item) => {
    const skill = topikQuestionSkill(paper,item);
    return {...item,skillId:skill.id,skillLabel:skill.label};
  });
}
