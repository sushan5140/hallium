-- Hallium security hardening: least privilege for Curriculum Admin and
-- authenticated quotas for paid AI endpoints.

revoke all on table public.hallium_curriculum_admin_state from public, anon;
revoke delete on table public.hallium_curriculum_admin_state from authenticated;
drop policy if exists hallium_curriculum_admin_delete on public.hallium_curriculum_admin_state;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='hallium_curriculum_saved_items_limit'
      and conrelid='public.hallium_curriculum_admin_state'::regclass
  ) then
    alter table public.hallium_curriculum_admin_state
      add constraint hallium_curriculum_saved_items_limit
      check (jsonb_array_length(saved_items) <= 300);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname='hallium_curriculum_qa_flags_values'
      and conrelid='public.hallium_curriculum_admin_state'::regclass
  ) then
    alter table public.hallium_curriculum_admin_state
      add constraint hallium_curriculum_qa_flags_values
      check (
        not jsonb_path_exists(
          qa_flags,
          '$.* ? (@ != "review" && @ != "native-review" && @ != "needs-fix" && @ != "approved")'
        )
      );
  end if;
end $$;

create table if not exists public.hallium_ai_request_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null check (bucket in ('audit','intelligence')),
  occurred_at timestamptz not null default now()
);

create index if not exists hallium_ai_request_events_user_bucket_time
  on public.hallium_ai_request_events(user_id,bucket,occurred_at desc);

alter table public.hallium_ai_request_events enable row level security;
revoke all on table public.hallium_ai_request_events from public, anon, authenticated;
grant select, insert on table public.hallium_ai_request_events to authenticated;

drop policy if exists hallium_ai_request_events_select on public.hallium_ai_request_events;
create policy hallium_ai_request_events_select
on public.hallium_ai_request_events
for select to authenticated
using (user_id=(select auth.uid()));

drop policy if exists hallium_ai_request_events_insert on public.hallium_ai_request_events;
create policy hallium_ai_request_events_insert
on public.hallium_ai_request_events
for insert to authenticated
with check (user_id=(select auth.uid()));
