import test from "node:test";
import assert from "node:assert/strict";
import {
  allRealKoreanPhrases,
  findRealKoreanPreset,
  realKoreanGrounding,
  realKoreanScenes,
} from "../lib/real-korean.js";

test("Real Korean foundation covers multiple everyday scenes", () => {
  const scenes = realKoreanScenes();
  const ids = new Set(scenes.map((scene) => scene.id));
  for (const id of ["friends","caring","feelings","repair","cafe","travel","school_work"]) {
    assert.ok(ids.has(id), "missing scene " + id);
  }
  assert.ok(allRealKoreanPhrases().length >= 15);
});

test("casual check-ins resolve to authored natural Korean", () => {
  const result = findRealKoreanPreset("Did you eat yet?", { relationship:"close_friend" });
  assert.equal(result.bestMatch, "밥 먹었어?");
  assert.equal(result.sceneId, "friends");
  assert.equal(result.source, "hallium_real_korean");
});

test("polite public situations resolve to polite authored Korean", () => {
  const result = findRealKoreanPreset("Where is the subway station?", { relationship:"unsure" });
  assert.equal(result.bestMatch, "지하철역이 어디예요?");
  assert.equal(result.register, "polite");
});

test("unsupported register combinations fail closed rather than relabel casual Korean as polite", () => {
  const result = findRealKoreanPreset("I miss you", { relationship:"senior" });
  assert.equal(result, null);
});

test("AI grounding exposes only compact authored scene evidence", () => {
  const result = realKoreanGrounding("Could you help me with this?", { relationship:"senior" });
  assert.deepEqual(Object.keys(result).sort(), ["canonicalKorean","naturalMeaning","note","register","scene"].sort());
  assert.equal(result.register, "polite");
  assert.match(result.canonicalKorean, /도와/);
});

test("unknown messages do not invent local Korean", () => {
  assert.equal(findRealKoreanPreset("Please review my astrophysics paper tomorrow"), null);
});
