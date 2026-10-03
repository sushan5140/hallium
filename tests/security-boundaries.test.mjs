import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  TOPIK_ASSET_STATE,
  TOPIK_RELEASE_STATE,
  TOPIK_RIGHTS_STATE,
  topikActivationAllowed,
} from "../lib/topik/provenance.js";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("paid Hallium AI routes keep authentication, same-origin and quota guards", () => {
  for (const path of ["app/api/audit/route.js", "app/api/intelligence/route.js"]) {
    const source = read(path);
    assert.match(source, /requireHalliumAiUser/);
    assert.match(source, /consumeHalliumAiQuota/);
    assert.match(source, /readBoundedJson/);
  }
  const guard = read("lib/server/ai-guard.js");
  assert.match(guard, /isHalliumGoogleUser/);
  assert.match(guard, /provider === "google"/);
});

test("every other Groq-backed server route enforces Hallium's Google identity", () => {
  for (const path of [
    "app/api/ai-twins/guides/chat/route.js",
    "app/api/ai-twins/meet/route.js",
    "app/api/study-partners/practice/route.js",
  ]) {
    const source = read(path);
    assert.match(source, /isHalliumGoogleUser/);
    assert.match(source, /status: ?403/);
  }
});

test("Curriculum Admin cannot be bootstrapped directly from a URL view", () => {
  const source = read("app/page.js");
  const allowed = source.match(/const allowedViews = new Set\(\[([^\]]+)\]\);/)?.[1] || "";
  assert.doesNotMatch(allowed, /["']admin["']/);
  assert.match(source, /adminAccess && <button className="admin-studio-shortcut"/);
});

test("global response hardening headers stay enabled", () => {
  const source = read("next.config.js");
  for (const header of [
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Strict-Transport-Security",
    "Content-Security-Policy",
    "Permissions-Policy",
  ]) {
    assert.match(source, new RegExp(header));
  }
  assert.match(source, /object-src 'none'/);
  assert.match(source, /frame-ancestors 'self'/);
});

test("Curriculum Admin database state remains least privilege", () => {
  const source = read("supabase/migrations/20261003000200_security_hardening.sql");
  assert.match(source, /revoke all on table public\.hallium_curriculum_admin_state from public, anon/i);
  assert.match(source, /revoke delete on table public\.hallium_curriculum_admin_state from authenticated/i);
  assert.match(source, /hallium_curriculum_qa_flags_values/);
});

test("TOPIK activation cannot bypass asset and rights verification", () => {
  const base = {
    releaseState: TOPIK_RELEASE_STATE.OFFICIAL_RELEASED,
    booklet: TOPIK_ASSET_STATE.STRUCTURE_VERIFIED,
    answerKey: TOPIK_ASSET_STATE.VERIFIED,
    audio: TOPIK_ASSET_STATE.VERIFIED,
    rights: TOPIK_RIGHTS_STATE.PERMISSION_GRANTED,
  };
  assert.equal(topikActivationAllowed({ ...base, purpose: "scoring" }), true);
  assert.equal(topikActivationAllowed({ ...base, answerKey: TOPIK_ASSET_STATE.PENDING, purpose: "scoring" }), false);
  assert.equal(topikActivationAllowed({ ...base, rights: TOPIK_RIGHTS_STATE.PENDING, purpose: "scoring" }), false);
  assert.equal(topikActivationAllowed({ ...base, audio: TOPIK_ASSET_STATE.BLOCKED, purpose: "audio" }), false);
  assert.equal(topikActivationAllowed({ ...base, releaseState: TOPIK_RELEASE_STATE.LEGACY_ARCHIVE, purpose: "question_content" }), false);
});
