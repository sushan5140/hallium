-- Private Hallium curriculum administration state.
create table if not exists public.hallium_curriculum_admin_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  saved_items jsonb not null default '[]'::jsonb
    check (jsonb_typeof(saved_items) = 'array' and pg_column_size(saved_items) <= 200000),
  lesson_notes jsonb not null default '{}'::jsonb
    check (jsonb_typeof(lesson_notes) = 'object' and pg_column_size(lesson_notes) <= 200000),
  qa_flags jsonb not null default '{}'::jsonb
    check (jsonb_typeof(qa_flags) = 'object' and pg_column_size(qa_flags) <= 120000),
  updated_at timestamptz not null default now()
);

alter table public.hallium_curriculum_admin_state enable row level security;

drop policy if exists hallium_curriculum_admin_select on public.hallium_curriculum_admin_state;
create policy hallium_curriculum_admin_select
on public.hallium_curriculum_admin_state
for select to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

drop policy if exists hallium_curriculum_admin_insert on public.hallium_curriculum_admin_state;
create policy hallium_curriculum_admin_insert
on public.hallium_curriculum_admin_state
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

drop policy if exists hallium_curriculum_admin_update on public.hallium_curriculum_admin_state;
create policy hallium_curriculum_admin_update
on public.hallium_curriculum_admin_state
for update to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

drop policy if exists hallium_curriculum_admin_delete on public.hallium_curriculum_admin_state;
create policy hallium_curriculum_admin_delete
on public.hallium_curriculum_admin_state
for delete to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

grant select, insert, update, delete on public.hallium_curriculum_admin_state to authenticated;
