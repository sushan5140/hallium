import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  clampKoreanRate,
  newerVoicePreference,
} from "../lib/korean-voice.js";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("published Hallium curriculum keeps a multiskill release invariant", () => {
  const source = read("app/hallium-core.js");
  assert.match(source, /const curriculumQuality = \(\(\) => \{/);
  assert.match(source, /row\.listening && row\.shadowing && row\.dictation && row\.production && row\.checkpoint/);
  assert.match(source, /coverageExemptions/);
  assert.match(source, /curriculumAudit\(units\)/);
});

test("signed-in hydration is account-safe and completes before the app unlocks", () => {
  const source = read("app/hallium-core.js");
  assert.match(source, /setAuthReady\(false\);\s*await hydrateFromCloud\(user\);[\s\S]*?setAuthReady\(true\);/);
  assert.match(source, /localLearnerStateBelongsToUser\(localOwnerId, user\.id\)/);
  assert.match(source, /clearCanonicalLearnerCache\(\)/);
  assert.match(source, /claimLocalOwner\(user\.id\)/);
  assert.match(source, /await pushCloudState\(user, snapshot\)/);
});

test("cloud merge preserves completion and furthest lesson progress", () => {
  const source = read("app/hallium-core.js");
  assert.match(source, /completed:\s*!!\(localEntry\?\.completed \|\| remoteEntry\?\.completed\)/);
  assert.match(source, /stepIndex:\s*Math\.max\(Number\(localEntry\?\.stepIndex \|\| 0\), Number\(remoteEntry\?\.stepIndex \|\| 0\)\)/);
});

test("timestamped learner records choose the newer local or cloud value", () => {
  const source = read("app/hallium-core.js");
  assert.match(source, /function newestByTimestamp\(/);
  assert.match(source, /return aTime >= bTime \? a : b/);
  assert.match(source, /newestByTimestamp\(localProfile, remoteProfile, "updatedAt"\)/);
  assert.match(source, /newestByTimestamp\(readAiAudit\(\), stateRead\.data\?\.ai_audit \|\| null\)/);
});

test("native browser voice preference uses timestamp conflict resolution", () => {
  const local = { voiceName: "Local newer", rate: 0.9, updatedAt: "2026-10-03T10:05:00Z" };
  const remote = { voiceName: "Remote older", rate: 1, updatedAt: "2026-10-03T10:00:00Z" };
  assert.equal(newerVoicePreference(local, remote).voiceName, "Local newer");

  const remoteNewer = { voiceName: "Remote newer", rate: 1.05, updatedAt: "2026-10-03T10:10:00Z" };
  assert.equal(newerVoicePreference(local, remoteNewer).voiceName, "Remote newer");
});

test("slow native-browser practice remains a multiplier over account pace", () => {
  assert.equal(clampKoreanRate(1.0 * 0.9), 0.9);
  assert.equal(clampKoreanRate(0.8 * 0.9), 0.72);
  assert.equal(clampKoreanRate(0.55 * 0.9), 0.55, "slow practice must still honor the safe minimum");

  const source = read("app/hallium-core.js");
  assert.match(source, /speakKoreanText\(text \+ "  " \+ text, voicePreference, \{ rateMultiplier: 0\.92 \}\)/);
  assert.match(source, /speakKoreanText\(text \+ ", " \+ text \+ ", " \+ text, voicePreference, \{ rateMultiplier: 0\.9 \}\)/);
});

test("Guest Mode remains local-only while signed-in cloud writes stay canonical", () => {
  const entry = read("app/page.js");
  const core = read("app/hallium-core.js");
  assert.match(entry, /scopedLearnerStorageKey\(learnerProfileKey, true\)/);
  assert.doesNotMatch(entry, /localStorage\.setItem\(learnerProfileKey\s*,/);
  assert.match(core, /if \(guestMode \|\| !authUser \|\| !syncHydrated\) return/);
  assert.match(core, /scopedLearnerStorageKey\(lessonKey, false\)/);
});


test("learning preferences are timestamped and merged by recency", () => {
  const source = read("app/hallium-core.js");
  assert.match(
    source,
    /merged\.preferences = newestByTimestamp\(local\?\.preferences, remote\?\.preferences, "updatedAt"\)/,
    "Cross-device H-P6 preferences must use timestamp conflict resolution"
  );
  assert.match(
    source,
    /const persisted = \{ \.\.\.next, updatedAt: new Date\(\)\.toISOString\(\) \}/,
    "Preference changes must persist an updatedAt timestamp"
  );
  assert.match(source, /setLearningPreferences\(normalizeLearningPreferences\(intelligence\?\.preferences/);
});
