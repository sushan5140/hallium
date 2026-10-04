import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { rankRealKoreanScenes } from "../lib/learning-intelligence.js";
import { realKoreanScenes } from "../lib/real-korean.js";

const core = fs.readFileSync("app/hallium-core.js", "utf8");

test("travel interest ranks the authored travel scene first", () => {
  const ranked = rankRealKoreanScenes(realKoreanScenes(), {
    dailyMinutes:15,
    focuses:["conversation"],
    topics:["travel"],
  });
  assert.equal(ranked[0]?.id, "travel");
  assert.deepEqual(ranked[0]?.matchedTopics, ["travel"]);
});

test("food interest ranks the authored cafe scene first", () => {
  const ranked = rankRealKoreanScenes(realKoreanScenes(), {
    dailyMinutes:15,
    focuses:["conversation"],
    topics:["food"],
  });
  assert.equal(ranked[0]?.id, "cafe");
});

test("conversation interest can surface social Real Korean scenes", () => {
  const ranked = rankRealKoreanScenes(realKoreanScenes(), {
    dailyMinutes:15,
    focuses:["conversation"],
    topics:["conversation"],
  }, 5);
  const ids = new Set(ranked.map((item) => item.id));
  assert.ok(ids.has("friends"));
  assert.ok(ids.has("repair"));
});

test("unsupported topic does not invent a Real Korean scene match", () => {
  const ranked = rankRealKoreanScenes(realKoreanScenes(), {
    dailyMinutes:15,
    focuses:["conversation"],
    topics:["shopping"],
  });
  assert.deepEqual(ranked, []);
});

test("explicitly disabled topics disable Real Korean interest routing", () => {
  const ranked = rankRealKoreanScenes(realKoreanScenes(), {
    dailyMinutes:15,
    focuses:["conversation"],
    topics:[],
  });
  assert.deepEqual(ranked, []);
});

test("Hallium home uses the same saved interests for lesson and Real Korean ranking", () => {
  assert.match(core, /rankInterestLessons\([\s\S]*learningPreferences/);
  assert.match(core, /rankRealKoreanScenes\([\s\S]*learningPreferences/);
  assert.match(core, /REAL KOREAN FOR YOUR INTERESTS/);
  assert.match(core, /navigate\("partner"\)/);
});

test("interest routing remains optional and separate from due-review safety", () => {
  const realIndex = core.indexOf("const realKoreanSceneRecommendations");
  const fallbackIndex = core.indexOf("const fallbackLearningRoute = buildTodayLearningPlan");
  const safetyIndex = core.indexOf("const safeLearningRoute = enforceLearningPlanSafety");
  assert.ok(realIndex >= 0);
  assert.ok(fallbackIndex >= 0);
  assert.ok(safetyIndex >= 0);
  assert.ok(safetyIndex > fallbackIndex);
  assert.match(core, /enforceLearningPlanSafety\(learningRouteRecord\?\.result \|\| fallbackLearningRoute, fallbackLearningRoute\)/);
});
