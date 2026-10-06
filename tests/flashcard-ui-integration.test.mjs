import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync("app/flashcards/page.js", "utf8");
const browser = fs.readFileSync("app/flashcards/FlashcardCollectionsBrowser.js", "utf8");
const bridge = fs.readFileSync("app/flashcards/StarterFlashcardsBridge.js", "utf8");
const study = fs.readFileSync("public/flashcards-level1/study.js", "utf8");

test("Starter page routes the existing visual deck through the collection browser and evidence bridge", () => {
  assert.match(page, /FlashcardCollectionsBrowser/);
  assert.match(browser, /StarterFlashcardsBridge/);
  assert.doesNotMatch(page, /<iframe/);
});

test("parent bridge is the only place that applies flashcard learning attempts", () => {
  assert.match(bridge, /applyFlashcardAttempt/);
  assert.match(bridge, /hallium:flashcards:attempt/);
  assert.match(bridge, /hallium:flashcards:state/);
  assert.doesNotMatch(study, /adaptiveReviewSchedule/);
  assert.doesNotMatch(study, /applyFlashcardAttempt/);
});

test("iframe emits attempts instead of hard-coding one and three day schedules", () => {
  assert.match(study, /hallium:flashcards:attempt/);
  assert.doesNotMatch(study, /kind==="know"\?3:1/);
  assert.doesNotMatch(study, /86400000/);
});

test("iframe accepts parent mastery state and displays strong or recovering evidence", () => {
  assert.match(study, /hallium:flashcards:state/);
  assert.match(study, /stage==="strong"/);
  assert.match(study, /stage==="recovering"/);
  assert.match(study, /Strong recall/);
  assert.match(study, /Recovering/);
});

test("review-only mode follows evidence state rather than the legacy learn flag", () => {
  assert.match(study, /dueNow/);
  assert.match(study, /\["learning","recovering"\]/);
  assert.doesNotMatch(study, /status==="learn"\)\;if\(first/);
});

test("bridge validates message origin and iframe source", () => {
  assert.match(bridge, /event\.origin !== window\.location\.origin/);
  assert.match(bridge, /event\.source !== frameRef\.current\?\.contentWindow/);
});
