-- Hallium AI Guide conversations: genuine LLM tutor replies, never fake social accounts.
-- The 12 guide identities are app-defined fictional AI characters, not auth.users rows.
create table if not exists public.hallium_ai_guide_turns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  guide_id text not null check (guide_id in ('nari','min','jun','yuna','bomi','dae','hobi','sora','hana','ara','jiwoo','tae')),
  user_message text not null check (char_length(trim(user_message)) between 1 and 750),
  assistant_message text not null check (char_length(trim(assistant_message)) between 1 and 2600),
  created_at timestamptz not null default now()
);
create index if not exists hallium_ai_guide_user_guide_recent
  on public.hallium_ai_guide_turns(user_id, guide_id, created_at desc);
create index if not exists hallium_ai_guide_user_recent
  on public.hallium_ai_guide_turns(user_id, created_at desc);
alter table public.hallium_ai_guide_turns enable row level security;
revoke all on table public.hallium_ai_guide_turns from public,anon,authenticated;
grant select,insert,delete on table public.hallium_ai_guide_turns to authenticated;
create policy ai_guide_turns_select on public.hallium_ai_guide_turns
 for select to authenticated using (user_id = (select auth.uid()));
create policy ai_guide_turns_insert on public.hallium_ai_guide_turns
 for insert to authenticated with check (user_id = (select auth.uid()));
create policy ai_guide_turns_delete on public.hallium_ai_guide_turns
 for delete to authenticated using (user_id = (select auth.uid()));
