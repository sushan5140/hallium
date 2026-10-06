import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { mergeFlashcardIntelligence } from "../lib/flashcard-state.js";

test("newer per-card evidence wins during local/cloud merge", () => {
  const merged = mergeFlashcardIntelligence(
    { cards:{a:{lastReviewedAt:"2026-10-06T12:00:00Z",stability:70}}, updatedAt:"2026-10-06T12:00:00Z" },
    { cards:{a:{lastReviewedAt:"2026-10-05T12:00:00Z",stability:30}}, updatedAt:"2026-10-05T12:00:00Z" },
  );
  assert.equal(merged.cards.a.stability, 70);
});

test("saved flashcard ids merge without duplication", () => {
  const merged = mergeFlashcardIntelligence(
    { savedIds:["a","b"], updatedAt:"2026-10-06T12:00:00Z" },
    { savedIds:["b","c"], updatedAt:"2026-10-05T12:00:00Z" },
  );
  assert.deepEqual(new Set(merged.savedIds), new Set(["a","b","c"]));
});

test("Hallium Core derives flashcard catalog from real curriculum lessons", () => {
  const core = fs.readFileSync("app/hallium-core.js","utf8");
  assert.match(core, /lessonVocabularyCards\(units\.flatMap/);
  assert.match(core, /flashcardIntelligenceWithCatalog/);
  assert.match(core, /mergeFlashcardIntelligence/);
});

test("Starter bridge persists into canonical intelligence state", () => {
  const bridge = fs.readFileSync("app/flashcards/StarterFlashcardsBridge.js","utf8");
  assert.match(bridge, /hallim:intelligence:v1/);
  assert.match(bridge, /flashcards:/);
  assert.match(bridge, /savedIds/);
  assert.match(bridge, /hallium:flashcards:changed/);
});

test("Starter iframe emits stable canonical card ids and catalog metadata", () => {
  const study = fs.readFileSync("public/flashcards-level1/study.js","utf8");
  assert.match(study, /cardId:"starter:"\+w\.id/);
  assert.match(study, /catalog:WORDS\.map/);
  assert.match(study, /hallium:flashcards:save/);
});

test("collection browser exposes weak saved and curriculum collections from canonical state", () => {
  const browser = fs.readFileSync("app/flashcards/FlashcardCollectionsBrowser.js","utf8");
  assert.match(browser, /Weak & due/);
  assert.match(browser, /Saved words/);
  assert.match(browser, /source === "curriculum"/);
  assert.match(browser, /weakFlashcardCollection/);
  assert.match(browser, /savedFlashcardCollection/);
});
