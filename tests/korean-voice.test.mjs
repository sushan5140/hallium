import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_KOREAN_VOICE_PREFERENCE,
  clampKoreanRate,
  newerVoicePreference,
  normalizeVoicePreference,
  resolveKoreanVoice,
  speakKoreanText,
} from "../lib/korean-voice.js";

function voice(name, voiceURI, { localService = false, lang = "ko-KR" } = {}) {
  return { name, voiceURI, localService, lang };
}

test("Korean speech rate stays inside the supported natural range", () => {
  assert.equal(clampKoreanRate(0.2), 0.55);
  assert.equal(clampKoreanRate(2), 1.15);
  assert.equal(clampKoreanRate(0.947), 0.95);
  assert.equal(clampKoreanRate("bad"), DEFAULT_KOREAN_VOICE_PREFERENCE.rate);
});

test("saved Korean voice resolves by exact URI before provider preference", () => {
  const voices = [
    voice("Google 한국어", "google-ko"),
    voice("My Device Korean", "device-ko", { localService: true }),
  ];
  const resolved = resolveKoreanVoice({ voiceUri: "device-ko", voiceName: "My Device Korean", rate: 0.95 }, voices);
  assert.equal(resolved.voiceURI, "device-ko");
});

test("missing saved voice falls back to a preferred Korean provider on another device", () => {
  const voices = [
    voice("Generic Korean", "generic-ko"),
    voice("Microsoft SunHi Online (Natural) - Korean", "ms-ko"),
    voice("Local Korean", "local-ko", { localService: true }),
  ];
  const resolved = resolveKoreanVoice({ voiceUri: "missing-uri", voiceName: "Missing Voice", rate: 0.95 }, voices);
  assert.equal(resolved.voiceURI, "ms-ko");
});

test("when no preferred provider exists Hallium prefers a local Korean voice, then first available", () => {
  const local = resolveKoreanVoice({}, [
    voice("Remote Generic", "remote"),
    voice("Device Korean", "local", { localService: true }),
  ]);
  assert.equal(local.voiceURI, "local");

  const first = resolveKoreanVoice({}, [
    voice("First Korean", "first"),
    voice("Second Korean", "second"),
  ]);
  assert.equal(first.voiceURI, "first");
});

test("newer local or cloud voice preference wins by timestamp", () => {
  const local = { voiceName: "Local", rate: 0.9, updatedAt: "2026-10-03T08:10:00Z" };
  const remote = { voiceName: "Remote", rate: 1, updatedAt: "2026-10-03T08:00:00Z" };
  assert.equal(newerVoicePreference(local, remote).voiceName, "Local");
  assert.equal(newerVoicePreference(remote, local).voiceName, "Local");
});

test("voice normalization is fail-safe and speech returns false without browser synthesis", () => {
  assert.deepEqual(normalizeVoicePreference(null), DEFAULT_KOREAN_VOICE_PREFERENCE);
  assert.equal(speakKoreanText("안녕하세요", DEFAULT_KOREAN_VOICE_PREFERENCE), false);
});
