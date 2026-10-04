import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const partner = fs.readFileSync("app/partner/PartnerKorean.jsx", "utf8");
const css = fs.readFileSync("app/globals.css", "utf8");

test("Partner Korean surfaces the shared authored Real Korean scene bank", () => {
  assert.match(partner, /realKoreanScenes/);
  assert.match(partner, /Real Korean scenes/);
  assert.match(partner, /deterministic Hallium content/);
  assert.match(partner, /activeRealScene\.phrases\.map/);
});

test("scene packs expose register, meaning, audio and controlled variants", () => {
  assert.match(partner, /phrase\.register/);
  assert.match(partner, /phrase\.meaning/);
  assert.match(partner, /playKorean\(phrase\.korean/);
  assert.match(partner, /phrase\.variants\.softer/);
  assert.match(partner, /phrase\.variants\.bolder/);
});

test("scene pack layout has responsive mobile treatment", () => {
  assert.match(css, /\.realSceneCards\{display:grid/);
  assert.match(css, /@media\(max-width:760px\)[\s\S]*\.realSceneCards\{grid-template-columns:1fr\}/);
});
