import test from "node:test";
import assert from "node:assert/strict";
import { buildTopikAttemptEvidence, summarizeTopikEvidence } from "../lib/topik/evidence.js";

const paper = {
  id:"demo-I", round:999, level:"I",
  sections:[
    {id:"listening",count:2},
    {id:"reading",count:2},
  ],
};

test("attempt evidence records completion even when scoring is locked", () => {
  const result=buildTopikAttemptEvidence(paper,{
    answers:{L1:"1",R1:"3"},
    startedAt:"2026-10-07T10:00:00Z",
    finishedAt:"2026-10-07T10:20:00Z",
    submitted:true,
  },{status:"locked"});
  assert.equal(result.submitted,true);
  assert.equal(result.scored,false);
  assert.equal(result.completionPercent,50);
  assert.equal(result.durationSeconds,1200);
});

test("verified section accuracy is preserved when a scored result exists", () => {
  const result=buildTopikAttemptEvidence(paper,{answers:{L1:"1",L2:"2",R1:"3",R2:"4"},submitted:true},{
    status:"scored",percent:75,earned:150,possible:200,
    sections:[
      {section:"listening",correct:2,incorrect:0,unanswered:0},
      {section:"reading",correct:1,incorrect:1,unanswered:0},
    ],
  });
  assert.equal(result.verifiedPercent,75);
  assert.equal(result.sections.find(x=>x.section==="listening").accuracy,100);
  assert.equal(result.sections.find(x=>x.section==="reading").accuracy,50);
});

test("summary identifies the weakest verified section", () => {
  const summary=summarizeTopikEvidence([
    {paperId:"a",submitted:true,scored:true,verifiedPercent:70,sections:[{section:"listening",answered:2,total:2,accuracy:80},{section:"reading",answered:2,total:2,accuracy:60}]},
    {paperId:"b",submitted:true,scored:true,verifiedPercent:80,sections:[{section:"listening",answered:2,total:2,accuracy:90},{section:"reading",answered:2,total:2,accuracy:50}]},
  ]);
  assert.equal(summary.averageVerifiedPercent,75);
  assert.equal(summary.weakestSection.section,"reading");
  assert.equal(summary.weakestSection.accuracy,55);
});


test("question-type summary identifies the weakest verified skill block", () => {
  const summary=summarizeTopikEvidence([
    {
      paperId:"x",submitted:true,scored:true,verifiedPercent:72,
      sections:[{section:"reading",answered:10,total:10,accuracy:72}],
      skills:[
        {skillId:"reading_blank",skillLabel:"Context blank-fill",section:"reading",answered:4,total:4,accuracy:75},
        {skillId:"reading_inference",skillLabel:"Reading inference",section:"reading",answered:6,total:6,accuracy:50},
      ],
    },
  ]);
  assert.equal(summary.weakestSkill.skillId,"reading_inference");
  assert.equal(summary.weakestSkill.accuracy,50);
});

test("unverified attempts keep skill completion but do not invent skill accuracy", () => {
  const result=buildTopikAttemptEvidence(
    {id:"demo-I",round:999,level:"I",sections:[{id:"reading",count:40}]},
    {answers:{R1:"1",R2:"2"},submitted:true},
    {status:"locked"},
  );
  const vocab=result.skills.find(row=>row.skillId==="reading_vocab_grammar");
  assert.ok(vocab);
  assert.equal(vocab.answered,2);
  assert.equal(vocab.accuracy,null);
});
