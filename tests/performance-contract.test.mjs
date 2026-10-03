import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const core = fs.readFileSync("app/hallium-core.js", "utf8");
const migration = fs.readFileSync(
  "supabase/migrations/20261003100009_hallium_partner_performance_indexes_and_rls.sql",
  "utf8"
);

test("Real Korean stays out of the eager Hallium client import graph", () => {
  assert.doesNotMatch(core, /import PartnerKorean from "\.\/partner\/PartnerKorean"/);
  assert.match(core, /dynamic\(\(\) => import\("\.\/partner\/PartnerKorean"\)/);
});

test("partner foreign-key columns keep explicit covering indexes", () => {
  const indexes = [
    "hallium_partner_answers_author_id_idx",
    "hallium_partner_blocks_blocked_idx",
    "hallium_partner_connections_requested_by_idx",
    "hallium_partner_connections_user_high_idx",
    "hallium_partner_joint_notes_author_id_idx",
    "hallium_partner_joint_notes_connection_id_idx",
    "hallium_partner_messages_sender_id_idx",
    "hallium_partner_reports_connection_id_idx",
    "hallium_partner_reports_reporter_idx",
    "hallium_partner_reports_target_idx",
    "hallium_partner_sessions_created_by_idx",
    "hallium_partner_shares_note_id_idx",
    "hallium_partner_shares_owner_id_idx",
    "hallium_twin_meetups_initiated_by_idx",
  ];
  for (const index of indexes) {
    assert.ok(migration.includes(index), `Missing covering index ${index}`);
  }
});

test("learner_state uses one equivalent SELECT policy for owner or admin", () => {
  assert.match(migration, /drop policy if exists learner_state_admin_select/);
  assert.match(migration, /drop policy if exists learner_state_select_own/);
  assert.match(migration, /create policy learner_state_select_authorized/);
  assert.match(migration, /user_id = \(select auth\.uid\(\)\)/);
  assert.match(migration, /or \(select public\.is_hallim_admin\(\)\)/);
});

test("admin helper initializes auth uid once per statement", () => {
  assert.match(migration, /where user_id = \(select auth\.uid\(\)\)/);
});
