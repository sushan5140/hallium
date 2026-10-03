import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const core = fs.readFileSync("app/hallium-core.js", "utf8");
const client = fs.readFileSync("lib/korean-tts-provider.js", "utf8");
const route = fs.readFileSync("app/api/tts/route.js", "utf8");
const service = fs.readFileSync("services/melotts/app.py", "utf8");
const docker = fs.readFileSync("services/melotts/Dockerfile", "utf8");
const requirements = fs.readFileSync("services/melotts/requirements.txt", "utf8");

test("signed-in Hallium prefers server Korean TTS but Guest Mode stays local", () => {
  assert.match(core, /if \(!guestMode\) \{/);
  assert.match(core, /playServerKoreanTts\(text/);
  assert.match(core, /if \(usedServerVoice\) return true;/);
  assert.match(core, /speakKorean\(text, rateMultiplier\);/);
});

test("browser TTS provider calls only Hallium same-origin proxy and fails closed", () => {
  assert.match(client, /fetch\("\/api\/tts"/);
  assert.match(client, /credentials: "same-origin"/);
  assert.match(client, /timeoutMs = 8000/);
  assert.match(client, /if \(!response\.ok\) return false;/);
  assert.match(client, /String\(blob\.type \|\| ""\)\.startsWith\("audio\/"\)/);
});

test("Hallium TTS proxy remains authenticated, quota limited, bounded and server-keyed", () => {
  assert.match(route, /requireHalliumAiUser\(request\)/);
  assert.match(route, /readBoundedJson\(request, 4000\)/);
  assert.match(route, /text\.length > 500/);
  assert.match(route, /consumeHalliumAiQuota/);
  assert.match(route, /"tts"/);
  assert.match(route, /daily: 300/);
  assert.match(route, /perMinute: 30/);
  assert.match(route, /MELOTTS_SERVICE_URL/);
  assert.match(route, /MELOTTS_SERVICE_TOKEN/);
  assert.match(route, /AbortSignal\.timeout\(7000\)/);
  assert.match(route, /X-Hallium-TTS-Provider/);
});

test("MeloTTS service exposes only Korean synthesis with bearer protection", () => {
  assert.match(service, /TTS\(language="KR"/);
  assert.match(service, /@app\.post\("\/synthesize"\)/);
  assert.match(service, /MELOTTS_SERVICE_TOKEN/);
  assert.match(service, /if payload\.language\.upper\(\) != "KR"/);
  assert.match(service, /Field\(min_length=1, max_length=500\)/);
  assert.match(service, /speed: float = Field\(default=1\.0, ge=0\.7, le=1\.3\)/);
});

test("MeloTTS service is pinned and containerized separately from Next", () => {
  assert.match(requirements, /myshell-ai\/MeloTTS\.git@209145371cff8fc3bd60d7be902ea69cbdb7965a/);
  assert.match(docker, /FROM python:3\.9-slim/);
  assert.match(docker, /python -m unidic download/);
  assert.match(docker, /uvicorn/);
});
