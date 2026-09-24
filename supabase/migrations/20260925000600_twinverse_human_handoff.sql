-- Once 12 DISTINCT real Hallium learners opt in, permanently graduate Twinverse
-- from the clearly labeled AI-only teaching starter cast to human-first discovery.
-- No artificial auth accounts, profile inflation, chat deletion or forced matches.

alter table public.hallium_twin_profiles
  add column if not exists joined_at timestamptz not null default now();

create schema if not exists hallium_internal;
revoke all on schema hallium_internal from public, anon, authenticated;

create table if not exists hallium_internal.twinverse_milestone (
  id smallint primary key default 1 check (id=1),
  reached_at timestamptz
);
insert into hallium_internal.twinverse_milestone(id,reached_at)
 values(1,null) on conflict (id) do nothing;

create table if not exists hallium_internal.twinverse_founders (
  user_id uuid primary key references public.hallium_twin_profiles(user_id) on delete cascade,
  joined_at timestamptz not null
);
alter table hallium_internal.twinverse_milestone enable row level security;
alter table hallium_internal.twinverse_founders enable row level security;
revoke all on hallium_internal.twinverse_milestone, hallium_internal.twinverse_founders
 from public, anon, authenticated;

create or replace function public.hallium_twinverse_status()
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  milestone_time timestamptz;
  eligible integer;
  visible_founders jsonb;
begin
  if me is null then raise exception 'Sign in required'; end if;

  -- Serialize the one-time transition. Returning to <12 never brings fake users back.
  select reached_at into milestone_time
    from hallium_internal.twinverse_milestone where id=1 for update;

  select count(*)::integer into eligible
    from public.hallium_twin_profiles t
    join public.hallium_partner_profiles p on p.user_id=t.user_id
    where t.enabled and p.discoverable;

  if milestone_time is null and eligible >= 12 then
    update hallium_internal.twinverse_milestone
      set reached_at=now() where id=1 returning reached_at into milestone_time;
    insert into hallium_internal.twinverse_founders(user_id,joined_at)
      select t.user_id,t.joined_at from public.hallium_twin_profiles t
      join public.hallium_partner_profiles p on p.user_id=t.user_id
      where t.enabled and p.discoverable
      order by t.joined_at,t.user_id limit 12
      on conflict (user_id) do nothing;
  end if;

  select coalesce(jsonb_agg(f.user_id), '[]'::jsonb) into visible_founders
    from hallium_internal.twinverse_founders f
    join public.hallium_twin_profiles t on t.user_id=f.user_id
    join public.hallium_partner_profiles p on p.user_id=f.user_id
    where t.enabled and p.discoverable
      and (f.user_id=me or public.hallium_partner_can_view(f.user_id));

  return jsonb_build_object(
    'mode',case when milestone_time is null then 'seed' else 'human' end,
    'active_humans',eligible,
    'threshold',12,
    'founder_ids',visible_founders
  );
end;
$$;
revoke all on function public.hallium_twinverse_status() from public,anon;
grant execute on function public.hallium_twinverse_status() to authenticated;
