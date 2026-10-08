import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { applyEvidenceAwarePracticeRoute, recommendNextPractice } from "../lib/practice-engine.js";

const core = fs.readFileSync("app/hallium-core.js","utf8");

test("due review always outranks evidence-based practice", () => {
  const rec = recommendNextPractice({
    dueCount:2,
    attempts:[{score:10,outcome:"relearn",skill:"Listening",mode:"lesson_listening"}],
  });
  assert.equal(rec.kind,"review_queue");
  assert.equal(rec.source,"due_review");
});

test("listening weakness routes to contextual Companion practice", () => {
  const rec = recommendNextPractice({
    dueCount:0,
    attempts:[
      {score:30,outcome:"relearn",skill:"Listening recall",mode:"lesson_dictation"},
      {score:45,outcome:"relearn",skill:"Listening recall",mode:"lesson_listening"},
    ],
  });
  assert.equal(rec.kind,"companion");
  assert.equal(rec.skill,"Listening recall");
});

test("register weakness routes to Real Korean", () => {
  const rec = recommendNextPractice({
    dueCount:0,
    attempts:[
      {score:20,outcome:"relearn",skill:"Register choice",mode:"scenario_choice"},
      {score:40,outcome:"relearn",skill:"Register choice",mode:"scenario_choice"},
    ],
  });
  assert.equal(rec.kind,"real_korean");
});

test("grammar weakness routes to grammar practice", () => {
  const rec = recommendNextPractice({
    dueCount:0,
    attempts:[{score:40,outcome:"relearn",skill:"Sentence building",mode:"lesson_build"}],
  });
  assert.equal(rec.kind,"grammar");
});

test("route overlay keeps review first when anything is due", () => {
  const route = {steps:[
    {kind:"companion",title:"Continue lesson"},
    {kind:"grammar",title:"Grammar"},
  ]};
  const next = applyEvidenceAwarePracticeRoute(route,{kind:"review_queue",title:"Review due weaknesses",why:"Due"},3);
  assert.equal(next.steps[0].kind,"review_queue");
  assert.equal(next.steps.length,3);
});

test("route overlay promotes evidence practice when review is clear", () => {
  const route = {steps:[
    {kind:"companion",title:"Continue lesson"},
    {kind:"test",title:"Study check"},
    {kind:"vocab",title:"Vocabulary"},
  ]};
  const next = applyEvidenceAwarePracticeRoute(route,{
    kind:"grammar",
    title:"Rebuild the grammar pattern",
    why:"Recent evidence points to grammar.",
    source:"practice_evidence",
    skill:"Sentence building",
  },0);
  assert.equal(next.steps[0].kind,"grammar");
  assert.equal(next.evidenceRecommendation.skill,"Sentence building");
});

test("strong-only evidence does not override the route", () => {
  const rec = recommendNextPractice({
    dueCount:0,
    attempts:[
      {score:95,outcome:"strong",skill:"Listening",mode:"lesson_listening"},
      {score:100,outcome:"strong",skill:"Grammar",mode:"study_test"},
    ],
  });
  assert.equal(rec,null);
});

test("Hallium applies H-P8 routing only after H-P6 safety and session fitting", () => {
  const safety = core.indexOf("const tutorDecision = buildTutorDecision");
  const session = core.indexOf("candidateRoute: learningRouteRecord",safety);
  const evidence = core.indexOf("const activeLearningRoute = tutorDecision.route",session);
  assert.ok(safety >= 0 && session > safety && evidence > session);
});

test("Hallium supports Real Korean as an evidence destination", () => {
  assert.match(core,/real_korean: "Open Real Korean"/);
  assert.match(core,/if \(kind === "real_korean"\) \{[\s\S]*navigate\("partner"\)/);
});

test("AI snapshot receives compact practice evidence and next-practice context", () => {
  assert.match(core,/practiceEvidence: \{[\s\S]*summary: summarizePracticeEvidence\(practiceEvidence\)/);
  assert.match(core,/nextPractice: evidencePracticeRecommendation/);
});
