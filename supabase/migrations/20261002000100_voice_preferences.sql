-- Hallium account-level Korean voice preference.
-- Applied to production project liyhjtyadbeozwjtrqqr on 2026-10-02.
create table if not exists public.hallium_voice_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  voice_uri text,
  voice_name text,
  rate numeric(4,2) not null default 0.95 check (rate >= 0.55 and rate <= 1.15),
  updated_at timestamptz not null default now()
);

alter table public.hallium_voice_preferences enable row level security;

drop policy if exists hallium_voice_preferences_read on public.hallium_voice_preferences;
create policy hallium_voice_preferences_read
on public.hallium_voice_preferences
for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists hallium_voice_preferences_insert on public.hallium_voice_preferences;
create policy hallium_voice_preferences_insert
on public.hallium_voice_preferences
for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists hallium_voice_preferences_update on public.hallium_voice_preferences;
create policy hallium_voice_preferences_update
on public.hallium_voice_preferences
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

grant select, insert, update on public.hallium_voice_preferences to authenticated;
