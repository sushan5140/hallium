import {test} from "node:test";
import assert from "node:assert/strict";
import {partnershipContinuity} from "../lib/study-partners/core.mjs";

test("new partnership starts from accepted request intent",()=>{
 const c=partnershipContinuity({requestContext:{goal:"topik",practiceNeed:"reading"}});
 assert.equal(c.status,"getting-started");
 assert.equal(c.goal,"topik");
 assert.equal(c.practiceNeed,"reading");
 assert.match(c.nextAction,/accepted request plan/);
});

test("unfinished latest session is surfaced neutrally",()=>{
 const c=partnershipContinuity({
  sessions:[{id:"s1",created_at:"2026-10-08T01:00:00Z"}],
  answers:[{session_id:"s1",round_index:0},{session_id:"s1",round_index:1}],
  shares:[{id:"n1"}],
 });
 assert.equal(c.status,"in-progress");
 assert.equal(c.answeredRounds,2);
 assert.match(c.unfinished,/1 practice round/);
 assert.match(c.nextAction,/Continue the latest/);
});

test("completed round coverage suggests a next shared action",()=>{
 const c=partnershipContinuity({
  sessions:[{id:"s1",created_at:"2026-10-08T01:00:00Z"}],
  answers:[
   {session_id:"s1",round_index:0},
   {session_id:"s1",round_index:1},
   {session_id:"s1",round_index:2},
  ],
  shares:[{id:"n1"},{id:"n2"}],
  jointNotes:[{id:"j1"}],
 });
 assert.equal(c.status,"ready-for-next");
 assert.equal(c.sharedNoteCount,2);
 assert.equal(c.jointNoteCount,1);
 assert.match(c.nextAction,/Generate the next mutual practice/);
});

test("continuity does not depend on private chat content",()=>{
 const c=partnershipContinuity({sessions:[],answers:[],shares:[],jointNotes:[]});
 assert.equal("messages" in c,false);
});
