import test from "node:test";
import assert from "node:assert/strict";
import { buildAdaptivePracticeSession } from "../lib/learning-intelligence.js";

const NOW = new Date("2026-10-06T12:00:00Z").getTime();

const scenes = [
  {
    id: "travel",
    label: "Travel & directions",
    topicTags: ["travel"],
  },
  {
    id: "friends",
    label: "Friends",
    topicTags: ["daily_life", "conversation"],
  },
];

test("due review is protected as the first adaptive activity", () => {
  const session = buildAdaptivePracticeSession({
    now: NOW,
    mistakes: [
      {
        id: "m1",
        skill: "Particles",
        misses: 3,
        successfulReviews: 0,
        lastResult: "wrong",
        nextReviewAt: "2026-10-05T12:00:00Z",
        lastSeenAt: "2026-10-01T12:00:00Z",
      },
    ],
    preferences: { dailyMinutes: 15, focuses: ["conversation"], topics: ["travel"] },
    latestStudyPct: 62,
    realKoreanScenes: scenes,
  });

  assert.equal(session.activities[0]?.kind, "due_review");
  assert.equal(session.activities[0]?.required, true);
  assert.equal(session.dueCount, 1);
  assert.equal(session.difficulty, "reinforce");
});

test("practice transfers a ranked weakness instead of repeating only the missed item", () => {
  const session = buildAdaptivePracticeSession({
    now: NOW,
    mistakes: [
      {
        id: "m2",
        skill: "Honorifics",
        misses: 2,
        successfulReviews: 1,
        lastResult: "wrong",
        nextReviewAt: "2026-10-10T12:00:00Z",
        lastSeenAt: "2026-10-04T12:00:00Z",
      },
    ],
    preferences: { dailyMinutes: 20, focuses: ["grammar"], topics: [] },
    latestStudyPct: 75,
  });

  const transfer = session.activities.find((item) => item.kind === "weakness_transfer");
  assert.equal(transfer?.skill, "Honorifics");
  assert.match(transfer?.prompt || "", /new context|fresh but familiar/);
});

test("saved interests can add authored Real Korean after required review", () => {
  const session = buildAdaptivePracticeSession({
    now: NOW,
    preferences: { dailyMinutes: 20, focuses: ["conversation"], topics: ["travel"] },
    latestStudyPct: 82,
    realKoreanScenes: scenes,
  });

  const scene = session.activities.find((item) => item.kind === "real_korean");
  assert.equal(scene?.sceneId, "travel");
  assert.deepEqual(scene?.matchedTopics, ["travel"]);
  assert.equal(scene?.source, "authored_real_korean");
});

test("unsupported or disabled topics do not invent a Real Korean activity", () => {
  const disabled = buildAdaptivePracticeSession({
    now: NOW,
    preferences: { dailyMinutes: 20, focuses: ["conversation"], topics: [] },
    realKoreanScenes: scenes,
  });
  assert.equal(disabled.activities.some((item) => item.kind === "real_korean"), false);

  const unsupported = buildAdaptivePracticeSession({
    now: NOW,
    preferences: { dailyMinutes: 20, focuses: ["conversation"], topics: ["shopping"] },
    realKoreanScenes: scenes,
  });
  assert.equal(unsupported.activities.some((item) => item.kind === "real_korean"), false);
});

test("saved focus changes the drill while staying deterministic", () => {
  const listening = buildAdaptivePracticeSession({
    now: NOW,
    preferences: { dailyMinutes: 15, focuses: ["listening"], topics: [] },
  });
  const drill = listening.activities.find((item) => item.kind === "focus_drill");

  assert.equal(drill?.skill, "listening");
  assert.match(drill?.prompt || "", /Listen once/);
});

test("optional activities stay inside the session budget", () => {
  const session = buildAdaptivePracticeSession({
    now: NOW,
    preferences: { dailyMinutes: 10, focuses: ["conversation"], topics: ["travel"] },
    latestStudyPct: 90,
    realKoreanScenes: scenes,
  });

  assert.ok(session.plannedMinutes <= session.sessionMinutes);
  assert.ok(session.activities.length >= 1);
});

test("required due review survives even when its fixed cost exceeds a tiny remaining plan", () => {
  const session = buildAdaptivePracticeSession({
    now: NOW,
    mistakes: [
      {
        id: "m3",
        skill: "Vocabulary",
        misses: 4,
        lastResult: "wrong",
        nextReviewAt: "2026-10-01T12:00:00Z",
      },
    ],
    preferences: { dailyMinutes: 5, focuses: ["vocabulary"], topics: [] },
    maxActivities: 2,
  });

  assert.equal(session.activities[0]?.kind, "due_review");
  assert.equal(session.activities[0]?.required, true);
});
