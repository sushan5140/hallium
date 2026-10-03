import test from "node:test";
import assert from "node:assert/strict";
import {
  buildQuestionManifest,
  displayQuestionNumber,
  questionAudioCue,
  scoreObjectiveAttempt,
  validateAudioBundle,
  validateScoringBundle,
} from "../lib/topik/exam-engine.js";

const paper = {
  id: "fixture-I",
  level: "I",
  sections: [
    { id: "listening", count: 2 },
    { id: "reading", count: 2 },
  ],
  provenanceAudit: {
    scoringAllowed: true,
    embeddedAudioAllowed: true,
  },
};

const scoringBundle = {
  paperId: "fixture-I",
  version: "fixture-key-v1",
  verifiedAt: "2026-10-03T00:00:00.000Z",
  source: "https://example.test/verified-key",
  answers: { L1: 1, L2: 4, R1: 2, R2: 3 },
  points: { L1: 10, L2: 10, R1: 20, R2: 20 },
};

const audioBundle = {
  paperId: "fixture-I",
  version: "fixture-audio-v1",
  verifiedAt: "2026-10-03T00:00:00.000Z",
  source: "https://example.test/verified-audio",
  cues: {
    L1: { src: "https://example.test/audio.mp3", start: 0, end: 8 },
    L2: { src: "https://example.test/audio.mp3", start: 8, end: 16 },
  },
};

test("TOPIK I manifest keeps official display numbering separate from local ids", () => {
  const manifest = buildQuestionManifest(paper);
  assert.deepEqual(manifest.map((item) => item.id), ["L1", "L2", "R1", "R2"]);
  assert.equal(displayQuestionNumber(paper, "reading", 1), 31);
});

test("verified scoring bundle must cover every objective response field", () => {
  assert.equal(validateScoringBundle(paper, scoringBundle).valid, true);
  const broken = { ...scoringBundle, answers: { ...scoringBundle.answers } };
  delete broken.answers.R2;
  const audit = validateScoringBundle(paper, broken);
  assert.equal(audit.valid, false);
  assert.match(audit.issues.join(" "), /R2/);
});

test("verified scoring returns section and overall totals", () => {
  const scoredPaper = { ...paper, scoringBundle };
  const result = scoreObjectiveAttempt(scoredPaper, { L1: "1", L2: "2", R1: "2" });
  assert.equal(result.status, "scored");
  assert.equal(result.earned, 30);
  assert.equal(result.possible, 60);
  assert.equal(result.correct, 2);
  assert.equal(result.incorrect, 1);
  assert.equal(result.unanswered, 1);
  assert.equal(result.sections.length, 2);
});

test("provenance gate overrides even a structurally valid key", () => {
  const locked = {
    ...paper,
    provenanceAudit: { ...paper.provenanceAudit, scoringAllowed: false },
    scoringBundle,
  };
  assert.equal(scoreObjectiveAttempt(locked, { L1: "1" }).status, "locked");
});

test("verified question audio cues resolve only when both bundle and provenance allow it", () => {
  assert.equal(validateAudioBundle(paper, audioBundle).valid, true);
  const active = { ...paper, audioBundle };
  assert.equal(questionAudioCue(active, "L2").start, 8);
  const locked = {
    ...active,
    provenanceAudit: { ...paper.provenanceAudit, embeddedAudioAllowed: false },
  };
  assert.equal(questionAudioCue(locked, "L2"), null);
});
