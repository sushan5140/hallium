import test from "node:test";
import assert from "node:assert/strict";
import { recentPracticeEvidence, recommendNextPractice } from "../lib/practice-engine.js";

const NOW = new Date("2026-10-04T00:00:00.000Z");

test("freshness filter keeps recent attempts", () => {
  const rows = recentPracticeEvidence([
    { createdAt:"2026-09-25T00:00:00.000Z", skill:"Listening" },
    { createdAt:"2026-09-20T00:00:00.000Z", skill:"Grammar" },
  ], { maxAgeDays:21, now:NOW });
  assert.equal(rows.length,2);
});

test("freshness filter removes stale attempts beyond the routing window", () => {
  const rows = recentPracticeEvidence([
    { createdAt:"2026-08-01T00:00:00.000Z", skill:"Listening" },
    { createdAt:"2026-10-01T00:00:00.000Z", skill:"Grammar" },
  ], { maxAgeDays:21, now:NOW });
  assert.equal(rows.length,1);
  assert.equal(rows[0].skill,"Grammar");
});

test("legacy evidence without timestamps remains usable rather than failing closed", () => {
  const rows = recentPracticeEvidence([{ score:30,outcome:"relearn",skill:"Vocabulary" }], {
    maxAgeDays:21,
    now:NOW,
  });
  assert.equal(rows.length,1);
});

test("stale severe weakness cannot override a fresh current weakness", () => {
  const rec = recommendNextPractice({
    now:NOW,
    maxAgeDays:21,
    dueCount:0,
    attempts:[
      { score:5,outcome:"relearn",skill:"Register choice",mode:"scenario_choice",createdAt:"2026-08-01T00:00:00.000Z" },
      { score:45,outcome:"relearn",skill:"Listening recall",mode:"lesson_dictation",createdAt:"2026-10-03T00:00:00.000Z" },
    ],
  });
  assert.equal(rec.kind,"companion");
  assert.equal(rec.skill,"Listening recall");
  assert.equal(rec.freshAttemptCount,1);
});

test("all-stale weakness evidence leaves the normal route untouched", () => {
  const rec = recommendNextPractice({
    now:NOW,
    maxAgeDays:21,
    dueCount:0,
    attempts:[
      { score:10,outcome:"relearn",skill:"Register choice",createdAt:"2026-08-01T00:00:00.000Z" },
      { score:20,outcome:"relearn",skill:"Grammar",createdAt:"2026-08-02T00:00:00.000Z" },
    ],
  });
  assert.equal(rec,null);
});

test("due review still wins even when practice evidence is stale", () => {
  const rec = recommendNextPractice({
    now:NOW,
    maxAgeDays:21,
    dueCount:2,
    attempts:[
      { score:10,outcome:"relearn",skill:"Grammar",createdAt:"2026-08-01T00:00:00.000Z" },
    ],
  });
  assert.equal(rec.kind,"review_queue");
  assert.equal(rec.source,"due_review");
});
