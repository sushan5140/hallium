import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEMO_TWINS, matchTwins, rankTwins, createPracticePlan, scriptedMeetup
} from "../lib/ai-twins/demo.mjs";

const you = {
  id: "you", name: "Alex", consent: true, level: "beginner",
  strength: "vocabulary", growth: "grammar", slot: "Evening"
};
const minji = DEMO_TWINS.find(person => person.id === "demo-minji");

test("two-way complementary pair gets a transparent 100-point heuristic score", () => {
  const match = matchTwins(you, minji);
  assert.equal(match.score, 100);
  assert.equal(match.mutual, true);
  assert.equal(match.helpForMe, true);
  assert.equal(match.helpForThem, true);
  assert.equal(match.slotMatch, true);
});

test("no consent means no matchmaking, including opt-out candidates", () => {
  assert.equal(matchTwins({ ...you, consent: false }, minji), null);
  assert.equal(matchTwins(you, { ...minji, consent: false }), null);
  assert.deepEqual(rankTwins({ ...you, consent: false }, DEMO_TWINS), []);
});

test("same identity, invalid categories, and missing consent are excluded", () => {
  assert.equal(matchTwins(you, { ...you }), null);
  assert.equal(matchTwins(you, { ...minji, growth: "grammar", strength: "grammar" }), null);
  assert.equal(matchTwins(you, { ...minji, slot: "Never" }), null);
});

test("time mismatch and level distance lower score without inventing a learning outcome", () => {
  const match = matchTwins(you, { ...minji, slot: "Morning", level: "advanced" });
  assert.equal(match.mutual, true);
  assert.equal(match.score, 70);
  assert.equal(match.slotMatch, false);
  assert.ok(match.reasons.some(reason => reason.includes("times differ")));
});

test("ranking excludes opt-out profiles and is non-increasing", () => {
  const ranked = rankTwins(you, [...DEMO_TWINS, { ...minji, id: "no-consent", consent: false }]);
  assert.equal(ranked.length, DEMO_TWINS.length);
  assert.equal(ranked[0].other.id, "demo-minji");
  assert.ok(ranked.every((candidate, i) => i === 0 || candidate.score <= ranked[i-1].score));
});

test("practice plan and conversation use fictional profile strengths, not private notes", () => {
  const match = matchTwins(you, minji);
  const plan = createPracticePlan(you, match);
  assert.equal(plan.agenda.length, 3);
  assert.match(plan.agenda[0], /grammar/);
  assert.match(plan.agenda[1], /vocabulary/);
  assert.equal(scriptedMeetup(you, match).length, 4);
  assert.equal(createPracticePlan({ ...you, consent: false }, match), null);
});
