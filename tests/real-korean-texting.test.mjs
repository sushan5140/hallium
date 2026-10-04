import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  casualTextingPatterns,
  casualTextingPatternsForRelationship,
} from "../lib/real-korean.js";

const partner = fs.readFileSync("app/partner/PartnerKorean.jsx", "utf8");
const css = fs.readFileSync("app/globals.css", "utf8");

test("casual texting layer includes omission, tone markers and ending shifts", () => {
  const patterns = casualTextingPatterns();
  const ids = new Set(patterns.map((item) => item.id));
  for (const id of ["drop-subject","short-checkin","soft-ㅋㅋ","soft-ㅎㅎ","ending-ne","ending-jana","reply-eung","maybe-geot-gata"]) {
    assert.ok(ids.has(id), "missing pattern " + id);
  }
  assert.ok(patterns.every((item) => item.before && item.after && item.meaning && item.note));
});

test("senior-safe filtering excludes intimate 반말 texting shortcuts", () => {
  const senior = casualTextingPatternsForRelationship("senior");
  const ids = new Set(senior.map((item) => item.id));
  assert.equal(ids.has("drop-subject"), false);
  assert.equal(ids.has("reply-eung"), false);
  assert.equal(ids.has("soft-ㅋㅋ"), false);
});

test("close-friend filtering keeps natural casual texting patterns", () => {
  const friend = casualTextingPatternsForRelationship("close_friend");
  const ids = new Set(friend.map((item) => item.id));
  assert.ok(ids.has("drop-subject"));
  assert.ok(ids.has("soft-ㅋㅋ"));
  assert.ok(ids.has("ending-jana"));
});

test("Partner Korean exposes before/after texting examples and relationship limits", () => {
  assert.match(partner, /Casual Korean \/ texting/);
  assert.match(partner, /MORE EXPLICIT/);
  assert.match(partner, /MORE TEXT-LIKE/);
  assert.match(partner, /pattern\.safeFor/);
  assert.match(partner, /pattern\.avoidFor/);
  assert.match(partner, /Casual does not mean careless/);
});

test("texting layer collapses to one column on mobile", () => {
  assert.match(css, /\.textingPatternGrid\{display:grid/);
  assert.match(css, /@media\(max-width:760px\)[\s\S]*\.textingPatternGrid\{grid-template-columns:1fr\}/);
});
