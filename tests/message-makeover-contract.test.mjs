import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const partner = fs.readFileSync("app/partner/PartnerKorean.jsx", "utf8");
const route = fs.readFileSync("app/api/intelligence/route.js", "utf8");
const core = fs.readFileSync("app/hallium-core.js", "utf8");

test("Message Makeover UI and server use the same Hallium Intelligence action", () => {
  assert.match(partner, /callIntelligence\("message_makeover"/);
  assert.match(route, /message_makeover:/);
  assert.match(route, /if \(action === "message_makeover"\)/);
});

test("Message Makeover server output contract covers every UI field", () => {
  const fields = [
    "bestMatch",
    "romanization",
    "naturalMeaning",
    "why",
    "softer",
    "bolder",
    "funnier",
  ];
  for (const field of fields) {
    assert.ok(partner.includes(`makeoverResult.${field}`), `UI must read ${field}`);
    assert.ok(route.includes(`${field}: ""`), `Server schema must expose ${field}`);
  }
});

test("Message Makeover validates relationship, vibe, intensity and bounded output", () => {
  for (const relationship of ["friend","close_friend","friend_pulling","crush","talking_stage","partner","senior","unsure"]) {
    assert.ok(route.includes(`"${relationship}"`), `Missing relationship allowlist entry ${relationship}`);
  }
  for (const vibe of ["natural","cute","funny","flirty","bold","playful_naughty","caring","dry","polite","make_up"]) {
    assert.ok(route.includes(`"${vibe}"`), `Missing vibe allowlist entry ${vibe}`);
  }
  assert.match(route, /message\.length <= 600/);
  assert.match(route, /intensity >= 0/);
  assert.match(route, /intensity <= 100/);
  assert.match(route, /\[result\.bestMatch,result\.softer,result\.bolder,result\.funnier\]\.every/);
  assert.match(route, /String\(value\)\.length <= 240/);
});

test("Message Makeover stays behind Hallium's authenticated quota-limited Intelligence API", () => {
  assert.match(route, /requireHalliumAiUser\(request\)/);
  assert.match(route, /consumeHalliumAiQuota/);
  assert.match(route, /readBoundedJson\(request, 36000\)/);
});

test("Guest Mode offers only honest built-in makeover demos", () => {
  assert.match(core, /if \(action === "message_makeover"\)/);
  assert.match(core, /findRealKoreanPreset/);
  assert.match(core, /Guest Mode uses the built-in Hallium Real Korean phrase bank/);
});
