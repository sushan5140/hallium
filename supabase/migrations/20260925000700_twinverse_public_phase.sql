-- Publicly readable phase marker contains no identities or private metrics.
-- Guest pages can hide retired AI guides without giving anon access to a SECURITY DEFINER RPC.
create table if not exists public.hallium_twinverse_phase (
 id smallint primary key default 1 check (id=1),
 mode text not null check (mode in ('seed','human')),
 updated_at timestamptz not null default now()
);
insert into public.hallium_twinverse_phase(id,mode)
 select 1,case when reached_at is null then 'seed' else 'human' end
 from hallium_internal.twinverse_milestone where id=1
on conflict (id) do nothing;
alter table public.hallium_twinverse_phase enable row level security;
revoke all on public.hallium_twinverse_phase from public,anon,authenticated;
grant select on public.hallium_twinverse_phase to anon,authenticated;
create policy twinverse_phase_public_read on public.hallium_twinverse_phase
 for select to anon,authenticated using (id=1);

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
  if milestone_time is not null then
    update public.hallium_twinverse_phase
      set mode='human',updated_at=now() where id=1 and mode<>'human';
  end if;

  select coalesce(jsonb_agg(f.user_id), '[]'::jsonb) into visible_founders
    from hallium_internal.twinverse_founders f
    join public.hallium_twin_profiles t on t.user_id=f.user_id
    join public.hallium_partner_profiles p on p.user_id=f.user_id
    where t.enabled and p.discoverable
      and (f.user_id=me or public.hallium_partner_can_view(f.user_id));

  return jsonb_build_object(
    'mode',case when milestone_time is null then 'seed' else 'human' end,
    'active_humans',eligible,'threshold',12,'founder_ids',visible_founders
  );
end;
$$;
revoke all on function public.hallium_twinverse_status() from public,anon;
grant execute on function public.hallium_twinverse_status() to authenticated;
