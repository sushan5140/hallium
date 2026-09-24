import { test } from "node:test";
import assert from "node:assert/strict";
import { AI_GUIDES, getAiGuide, guideSystemPrompt, cleanChatText } from "../lib/ai-twins/guides.mjs";

test("exactly twelve unique, explicitly fictional tutor profiles", () => {
  assert.equal(AI_GUIDES.length, 12);
  assert.equal(new Set(AI_GUIDES.map(g => g.id)).size, 12);
  for (const guide of AI_GUIDES) {
    assert.ok(guide.name && guide.title && guide.specialty && guide.goal && guide.emoji);
    assert.equal(guide.starts.length, 3);
    assert.equal(getAiGuide(guide.id), guide);
    assert.match(guideSystemPrompt(guide), /FICTIONAL AI Korean-learning guide/);
    assert.match(guideSystemPrompt(guide), /NOT a human account/);
  }
});
test("unknown guide IDs cannot create a model prompt", () => {
  assert.equal(getAiGuide("definitely-not-a-tutor"), null);
  assert.throws(() => guideSystemPrompt({ id: "fake" }), /Unknown AI guide/);
});
test("text normalization enforces input bounds and control-character filtering", () => {
  assert.equal(cleanChatText("  안녕하세요\u0000!  "), "안녕하세요 !");
  assert.equal(cleanChatText(null), "");
  assert.equal(cleanChatText("x".repeat(900)).length, 750);
});
test("audio tutor discloses the text-only limitation", () => {
  const yuna = getAiGuide("yuna");
  assert.match(yuna.goal, /cannot hear/);
  assert.match(guideSystemPrompt(yuna), /never claim you evaluated their actual spoken audio/);
});
test("copyrighted media tutor uses original lines and manhwa guide uses original stories", () => {
  assert.match(getAiGuide("sora").goal, /original/);
  assert.match(getAiGuide("ara").goal, /ORIGINAL/);
});
