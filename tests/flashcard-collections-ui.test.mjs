import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync("app/flashcards/page.js", "utf8");
const browser = fs.readFileSync("app/flashcards/FlashcardCollectionsBrowser.js", "utf8");

test("Flashcards route renders the collection browser", () => {
  assert.match(page, /FlashcardCollectionsBrowser/);
  assert.doesNotMatch(page, /StarterFlashcardsBridge \/>/);
});

test("Starter collection remains available through the existing evidence bridge", () => {
  assert.match(browser, /StarterFlashcardsBridge/);
  assert.match(browser, /id:\s*"starter"/);
});

test("Real Korean collections come from the shared collection adapter", () => {
  assert.match(browser, /realKoreanFlashcards/);
  assert.match(browser, /collectionId/);
  assert.doesNotMatch(browser, /지하철역이 어디예요/);
});

test("collection tabs are accessible and switchable", () => {
  assert.match(browser, /role="tablist"/);
  assert.match(browser, /role="tab"/);
  assert.match(browser, /aria-selected/);
  assert.match(browser, /setActiveId/);
});

test("generic collections preserve Korean, meaning, romanization and register context", () => {
  assert.match(browser, /card\.korean/);
  assert.match(browser, /card\.meaning/);
  assert.match(browser, /romanization/);
  assert.match(browser, /register/);
});
