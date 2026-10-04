import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  compareRegisterLine,
  realKoreanRegisterGuides,
  registerGuideForRelationship,
} from "../lib/real-korean.js";

const partner = fs.readFileSync("app/partner/PartnerKorean.jsx", "utf8");
const css = fs.readFileSync("app/globals.css", "utf8");

test("register intelligence exposes four concrete social contexts", () => {
  const guides = realKoreanRegisterGuides();
  assert.deepEqual(
    guides.map((guide) => guide.id),
    ["close","neutral_polite","senior","service"]
  );
  assert.ok(guides.every((guide) =>
    guide.speechLevel &&
    guide.tone &&
    guide.useWith.length &&
    guide.avoidWith.length &&
    guide.markers.length &&
    guide.example?.korean &&
    guide.example?.shift &&
    guide.why
  ));
});

test("relationship mapping chooses a safe default register", () => {
  assert.equal(registerGuideForRelationship("close_friend").id, "close");
  assert.equal(registerGuideForRelationship("senior").id, "senior");
  assert.equal(registerGuideForRelationship("unsure").id, "neutral_polite");
  assert.equal(registerGuideForRelationship("unknown-value").id, "neutral_polite");
});

test("register comparison refuses to invent unsupported deterministic Korean", () => {
  const result = compareRegisterLine("Please review my astrophysics paper tomorrow", "senior");
  assert.equal(result.preset, null);
  assert.match(result.caution, /does not have a register-safe deterministic line/i);
});

test("register comparison returns a safe authored line when available", () => {
  const result = compareRegisterLine("Where is the subway station?", "unsure");
  assert.equal(result.guide.id, "neutral_polite");
  assert.equal(result.preset?.register, "polite");
  assert.equal(result.preset?.bestMatch, "지하철역이 어디예요?");
  assert.equal(result.caution, null);
});

test("Partner Korean renders social-distance guidance, examples and warnings", () => {
  assert.match(partner, /Register intelligence/);
  assert.match(partner, /Same meaning\. Different social distance\./);
  assert.match(partner, /activeRegisterGuide\.useWith\.map/);
  assert.match(partner, /activeRegisterGuide\.avoidWith\.map/);
  assert.match(partner, /activeRegisterGuide\.markers\.map/);
  assert.match(partner, /activeRegisterGuide\.why/);
});

test("register intelligence has a single-column mobile fallback", () => {
  assert.match(css, /\.registerGuideGrid\{display:grid/);
  assert.match(css, /@media\(max-width:760px\)[\s\S]*\.registerGuideGrid\{grid-template-columns:1fr\}/);
});
