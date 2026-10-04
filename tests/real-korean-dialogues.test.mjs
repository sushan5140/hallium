import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { realKoreanDialogues, realKoreanScenes } from "../lib/real-korean.js";

const partner = fs.readFileSync("app/partner/PartnerKorean.jsx", "utf8");

test("every Real Korean scene has an authored multi-turn dialogue", () => {
  for (const scene of realKoreanScenes()) {
    const dialogues = realKoreanDialogues(scene.id);
    assert.ok(dialogues.length >= 1, "missing dialogue for " + scene.id);
    for (const dialogue of dialogues) {
      assert.ok(dialogue.lines.length >= 3);
      assert.ok(["casual","polite"].includes(dialogue.register));
      assert.ok(dialogue.lines.every((line) => line.korean && line.meaning && line.romanization));
    }
  }
});

test("Partner Korean renders active-scene dialogue packs with full playback", () => {
  assert.match(partner, /realKoreanDialogues\(activeRealScene\?\.id\)/);
  assert.match(partner, /activeRealDialogues\.map/);
  assert.match(partner, /dialogue\.lines\.map\(\(line\) => line\.korean\)\.join/);
  assert.match(partner, /dialogue\.note/);
});

test("dialogue packs preserve explicit register metadata", () => {
  const cafe = realKoreanDialogues("cafe")[0];
  const friends = realKoreanDialogues("friends")[0];
  assert.equal(cafe.register, "polite");
  assert.equal(friends.register, "casual");
});
