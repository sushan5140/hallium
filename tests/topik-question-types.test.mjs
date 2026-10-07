import test from "node:test";
import assert from "node:assert/strict";
import { topikQuestionSkill, annotateQuestionManifest } from "../lib/topik/question-types.js";

test("TOPIK I reading Q31-39 maps to vocab/grammar",()=>{
  const paper={level:"I"};
  const skill=topikQuestionSkill(paper,{section:"reading",displayNumber:31});
  assert.equal(skill.id,"reading_vocab_grammar");
});

test("TOPIK I reading late questions map to inference",()=>{
  const skill=topikQuestionSkill({level:"I"},{section:"reading",displayNumber:70});
  assert.equal(skill.id,"reading_inference");
});

test("TOPIK II writing blocks stay distinct",()=>{
  assert.equal(topikQuestionSkill({level:"II"},{section:"writing",displayNumber:51}).id,"writing_sentence");
  assert.equal(topikQuestionSkill({level:"II"},{section:"writing",displayNumber:53}).id,"writing_data");
  assert.equal(topikQuestionSkill({level:"II"},{section:"writing",displayNumber:54}).id,"writing_essay");
});

test("annotated manifest preserves question identity and adds stable skill labels",()=>{
  const rows=annotateQuestionManifest({level:"II"},[{id:"R1",section:"reading",displayNumber:1,responseType:"choice"}]);
  assert.equal(rows[0].id,"R1");
  assert.equal(rows[0].skillId,"reading_vocab_grammar");
  assert.ok(rows[0].skillLabel);
});
