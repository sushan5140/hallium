import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  HALLIUM_GUEST_STORAGE_SUFFIX,
  clearScopedLearnerStorage,
  isGuestScopedStorageKey,
  localLearnerStateBelongsToUser,
  scopedLearnerStorageKey,
} from "../lib/learner-storage.js";
import {
  KOREAN_VOICE_STORAGE_KEY,
  readLocalVoicePreference,
  writeLocalVoicePreference,
} from "../lib/korean-voice.js";

function memoryStorage() {
  const map = new Map();
  return {
    getItem(key) { return map.has(key) ? map.get(key) : null; },
    setItem(key, value) { map.set(key, String(value)); },
    removeItem(key) { map.delete(key); },
    clear() { map.clear(); },
  };
}

test("guest learner keys never collide with signed-in learner keys", () => {
  const bases = [
    "hallim:learner-profile:v1",
    "hallim:study-results:v1",
    "hallim:ai-audit:v1",
    "hallim:intelligence:v1",
    "hallim:vercel:lessons:v2",
    KOREAN_VOICE_STORAGE_KEY,
  ];
  for (const base of bases) {
    const signed = scopedLearnerStorageKey(base, false);
    const guest = scopedLearnerStorageKey(base, true);
    assert.equal(signed, base);
    assert.equal(guest, base + HALLIUM_GUEST_STORAGE_SUFFIX);
    assert.notEqual(guest, signed);
    assert.equal(isGuestScopedStorageKey(guest), true);
  }
});

test("guest voice preference remains separate from signed-in voice preference", () => {
  const original = globalThis.localStorage;
  globalThis.localStorage = memoryStorage();
  try {
    const signedKey = scopedLearnerStorageKey(KOREAN_VOICE_STORAGE_KEY, false);
    const guestKey = scopedLearnerStorageKey(KOREAN_VOICE_STORAGE_KEY, true);
    writeLocalVoicePreference({ voiceName: "Signed Voice", rate: 0.9, updatedAt: "2026-10-03T08:00:00Z" }, signedKey);
    writeLocalVoicePreference({ voiceName: "Guest Voice", rate: 1.05, updatedAt: "2026-10-03T08:01:00Z" }, guestKey);

    assert.equal(readLocalVoicePreference(signedKey).voiceName, "Signed Voice");
    assert.equal(readLocalVoicePreference(guestKey).voiceName, "Guest Voice");
    assert.equal(readLocalVoicePreference(signedKey).rate, 0.9);
    assert.equal(readLocalVoicePreference(guestKey).rate, 1.05);
  } finally {
    if (original === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = original;
  }
});

test("Hallium guest writes are scoped while cloud hydration stays canonical", () => {
  const source = fs.readFileSync("app/hallium-core.js", "utf8");

  for (const key of ["lessonKey", "studyResultsKey", "aiAuditKey", "intelligenceStateKey", "learnerProfileKey"]) {
    assert.ok(
      source.includes(`scopedLearnerStorageKey(${key}, guestMode)`),
      `Guest storage scoping missing for ${key}`
    );
  }

  assert.ok(
    source.includes("readLocalVoicePreference(scopedLearnerStorageKey(KOREAN_VOICE_STORAGE_KEY, guestMode))"),
    "Guest voice read must use the guest-scoped voice key"
  );
  assert.ok(
    source.includes("scopedLearnerStorageKey(KOREAN_VOICE_STORAGE_KEY, guestMode));"),
    "Guest voice writes must use the guest-scoped voice key"
  );

  assert.ok(
    source.includes("scopedLearnerStorageKey(lessonKey, false)"),
    "Signed-in cloud hydration must write only the canonical lesson key"
  );
  assert.ok(
    source.includes("readIntelligenceState(guestMode).mistakeLog"),
    "Adaptive guest history must read from the guest-scoped intelligence state"
  );
});


test("canonical learner cache is reusable only by its owning Google account", () => {
  assert.equal(localLearnerStateBelongsToUser("", "user-a"), true, "Legacy unowned cache may migrate once");
  assert.equal(localLearnerStateBelongsToUser("user-a", "user-a"), true);
  assert.equal(localLearnerStateBelongsToUser("user-a", "user-b"), false);
  assert.equal(localLearnerStateBelongsToUser("user-a", ""), false);
});

test("clearing canonical learner cache does not delete guest sandbox data", () => {
  const storage = memoryStorage();
  const keys = ["profile", "progress", "voice"];
  for (const key of keys) {
    storage.setItem(scopedLearnerStorageKey(key, false), "signed");
    storage.setItem(scopedLearnerStorageKey(key, true), "guest");
  }

  clearScopedLearnerStorage(storage, keys, false);

  for (const key of keys) {
    assert.equal(storage.getItem(scopedLearnerStorageKey(key, false)), null);
    assert.equal(storage.getItem(scopedLearnerStorageKey(key, true)), "guest");
  }
});

test("Hallium holds the access gate until signed-in cloud hydration finishes", () => {
  const source = fs.readFileSync("app/hallium-core.js", "utf8");
  assert.ok(
    source.includes("setAuthReady(false);\n        await hydrateFromCloud(user);") &&
      source.includes("setAuthReady(true);"),
    "Bootstrap must keep authReady false until hydration completes"
  );
  assert.ok(
    source.includes("localLearnerStateBelongsToUser(localOwnerId, user.id)") &&
      source.includes("clearCanonicalLearnerCache();"),
    "Hydration must reject canonical local cache owned by another account"
  );
  assert.ok(
    source.includes("claimLocalOwner(user.id);"),
    "Successful hydration must claim canonical local cache ownership"
  );
});
