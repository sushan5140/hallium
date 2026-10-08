import {test} from "node:test";
import assert from "node:assert/strict";
import {partnerPreferences} from "../lib/study-partners/core.mjs";

test("partner preferences are optional",()=>{
 assert.deepEqual(partnerPreferences({}),{goals:[],practiceNeeds:[],cadence:""});
});
