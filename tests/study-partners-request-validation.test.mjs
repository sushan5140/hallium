import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("app/api/study-partners/practice/route.js", "utf8");

test("malformed JSON receives a client error before partnership lookup", () => {
  assert.match(route, /try \{ payload=JSON\.parse\(raw\); \}/);
  assert.match(route, /catch \{ return Response\.json\(\{error:"Invalid JSON request\."\},\{status:400\}\); \}/);
});
test("partnership identifiers must be UUID-shaped", () => {
  assert.match(route, /\[1-8\]\[a-f0-9\]\{3\}/);
  assert.match(route, /\[89ab\]\[a-f0-9\]\{3\}/);
  assert.match(route, /Array\.isArray\(payload\)/);
});
