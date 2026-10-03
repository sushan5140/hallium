import test from "node:test";
import assert from "node:assert/strict";
import {
  TOPIK_ASSET_STATE,
  TOPIK_RELEASE_STATE,
  TOPIK_RIGHTS_STATE,
  deriveTopikActivationFlags,
} from "../lib/topik/provenance.js";

const verifiedBase = {
  releaseState: TOPIK_RELEASE_STATE.OFFICIAL_RELEASED,
  booklet: TOPIK_ASSET_STATE.STRUCTURE_VERIFIED,
  answerKey: TOPIK_ASSET_STATE.VERIFIED,
  audio: TOPIK_ASSET_STATE.VERIFIED,
  rights: TOPIK_RIGHTS_STATE.PERMISSION_GRANTED,
};

test("manual scoringAllowed true cannot unlock a pending answer key", () => {
  const gates = deriveTopikActivationFlags({
    ...verifiedBase,
    answerKey: TOPIK_ASSET_STATE.PENDING,
    scoringAllowed: true,
  });
  assert.equal(gates.scoringAllowed, false);
});

test("verified answer key with pending rights stays locked", () => {
  const gates = deriveTopikActivationFlags({
    ...verifiedBase,
    rights: TOPIK_RIGHTS_STATE.PENDING,
    scoringAllowed: true,
  });
  assert.equal(gates.scoringAllowed, false);
  assert.equal(gates.inAppQuestionContentAllowed, false);
});

test("verified audio with pending rights stays locked", () => {
  const gates = deriveTopikActivationFlags({
    ...verifiedBase,
    rights: TOPIK_RIGHTS_STATE.PENDING,
    embeddedAudioAllowed: true,
  });
  assert.equal(gates.embeddedAudioAllowed, false);
});

test("all required verified states unlock the synthetic fixture even if legacy booleans are false", () => {
  const gates = deriveTopikActivationFlags({
    ...verifiedBase,
    scoringAllowed: false,
    embeddedAudioAllowed: false,
    inAppQuestionContentAllowed: false,
  });
  assert.deepEqual(gates, {
    scoringAllowed: true,
    embeddedAudioAllowed: true,
    inAppQuestionContentAllowed: true,
  });
});

test("structure errors fail closed even with fully verified assets", () => {
  const gates = deriveTopikActivationFlags(verifiedBase, ["reading expected 40, found 39"]);
  assert.deepEqual(gates, {
    scoringAllowed: false,
    embeddedAudioAllowed: false,
    inAppQuestionContentAllowed: false,
  });
});
