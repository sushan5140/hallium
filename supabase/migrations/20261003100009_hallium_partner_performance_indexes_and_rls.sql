create index if not exists hallium_partner_answers_author_id_idx
  on public.hallium_partner_answers (author_id);
create index if not exists hallium_partner_blocks_blocked_idx
  on public.hallium_partner_blocks (blocked);
create index if not exists hallium_partner_connections_requested_by_idx
  on public.hallium_partner_connections (requested_by);
create index if not exists hallium_partner_connections_user_high_idx
  on public.hallium_partner_connections (user_high);
create index if not exists hallium_partner_joint_notes_author_id_idx
  on public.hallium_partner_joint_notes (author_id);
create index if not exists hallium_partner_joint_notes_connection_id_idx
  on public.hallium_partner_joint_notes (connection_id);
create index if not exists hallium_partner_messages_sender_id_idx
  on public.hallium_partner_messages (sender_id);
create index if not exists hallium_partner_reports_connection_id_idx
  on public.hallium_partner_reports (connection_id);
create index if not exists hallium_partner_reports_reporter_idx
  on public.hallium_partner_reports (reporter);
create index if not exists hallium_partner_reports_target_idx
  on public.hallium_partner_reports (target);
create index if not exists hallium_partner_sessions_created_by_idx
  on public.hallium_partner_sessions (created_by);
create index if not exists hallium_partner_shares_note_id_idx
  on public.hallium_partner_shares (note_id);
create index if not exists hallium_partner_shares_owner_id_idx
  on public.hallium_partner_shares (owner_id);
create index if not exists hallium_twin_meetups_initiated_by_idx
  on public.hallium_twin_meetups (initiated_by);

create or replace function public.is_hallim_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

drop policy if exists learner_state_admin_select on public.learner_state;
drop policy if exists learner_state_select_own on public.learner_state;
drop policy if exists learner_state_select_authorized on public.learner_state;

create policy learner_state_select_authorized
on public.learner_state
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select public.is_hallim_admin())
);
