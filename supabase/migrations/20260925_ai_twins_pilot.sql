-- Hallium AI twins pilot: opted-in profiles, auditable agent meetings, mutual approval.
-- Existing profiles, learner_state and Study Partners data remain unchanged.
create table public.hallium_twin_profiles (
 user_id uuid primary key references public.hallium_partner_profiles(user_id) on delete cascade,
 enabled boolean not null default false,
 twin_name text not null check (char_length(trim(twin_name)) between 2 and 35),
 intro text not null default '' check (char_length(intro) <= 300),
 interests text not null default '' check (char_length(interests) <= 180),
 tone text not null default 'friendly' check (tone in ('friendly','playful','calm')),
 updated_at timestamptz not null default now()
);
create table public.hallium_twin_meetups (
 id uuid primary key default gen_random_uuid(),
 user_low uuid not null references public.hallium_twin_profiles(user_id) on delete cascade,
 user_high uuid not null references public.hallium_twin_profiles(user_id) on delete cascade,
 initiated_by uuid not null references auth.users(id) on delete cascade,
 status text not null default 'proposed' check (status in ('proposed','accepted','declined')),
 transcript jsonb not null check (jsonb_typeof(transcript) = 'array' and jsonb_array_length(transcript) between 2 and 8 and pg_column_size(transcript) <= 16000),
 plan jsonb not null check (jsonb_typeof(plan) = 'object' and pg_column_size(plan) <= 12000),
 provider text not null default 'groq' check (provider = 'groq'),
 approved_low boolean not null default false,
 approved_high boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint twin_pair_order check (user_low < user_high),
 constraint twin_initiator_in_pair check (initiated_by in (user_low,user_high))
);
create unique index hallium_twin_one_pending_per_pair
 on public.hallium_twin_meetups(user_low,user_high) where status = 'proposed';
create index hallium_twin_meetups_low_recent
 on public.hallium_twin_meetups(user_low,created_at desc);
create index hallium_twin_meetups_high_recent
 on public.hallium_twin_meetups(user_high,created_at desc);

alter table public.hallium_twin_profiles enable row level security;
alter table public.hallium_twin_meetups enable row level security;
revoke all on public.hallium_twin_profiles,public.hallium_twin_meetups from anon;
revoke all on public.hallium_twin_profiles,public.hallium_twin_meetups from authenticated;
grant select,insert,update,delete on public.hallium_twin_profiles to authenticated;
grant select,insert on public.hallium_twin_meetups to authenticated;

create policy twin_profiles_read on public.hallium_twin_profiles
 for select to authenticated using (
 user_id = (select auth.uid())
 or (enabled and public.hallium_partner_can_view(user_id))
);
create policy twin_profiles_insert on public.hallium_twin_profiles
 for insert to authenticated with check (user_id = (select auth.uid()));
create policy twin_profiles_update on public.hallium_twin_profiles
 for update to authenticated using (user_id = (select auth.uid()))
 with check (user_id = (select auth.uid()));
create policy twin_profiles_delete on public.hallium_twin_profiles
 for delete to authenticated using (user_id = (select auth.uid()));

create policy twin_meetups_read on public.hallium_twin_meetups
 for select to authenticated using ((select auth.uid()) in (user_low,user_high));
create policy twin_meetups_insert on public.hallium_twin_meetups
 for insert to authenticated with check (
  initiated_by = (select auth.uid())
  and (select auth.uid()) in (user_low,user_high)
  and status = 'proposed'
  and not approved_low and not approved_high
  and exists (
   select 1 from public.hallium_twin_profiles a
   join public.hallium_partner_profiles pa on pa.user_id = a.user_id
   where a.user_id = user_low and a.enabled and pa.discoverable
  )
  and exists (
   select 1 from public.hallium_twin_profiles b
   join public.hallium_partner_profiles pb on pb.user_id = b.user_id
   where b.user_id = user_high and b.enabled and pb.discoverable
  )
  and not exists (
   select 1 from public.hallium_partner_blocks bl
   where (bl.blocker = user_low and bl.blocked = user_high)
      or (bl.blocker = user_high and bl.blocked = user_low)
  )
 );

-- All state transitions happen under row lock; neither client can impersonate approval.
create function public.hallium_twin_decide(p_meetup uuid, p_accept boolean)
 returns text language plpgsql security definer set search_path = ''
 as $$
 declare
  me uuid := (select auth.uid());
  m public.hallium_twin_meetups%rowtype;
  paired uuid;
  lo uuid;
  hi uuid;
 begin
  if me is null then raise exception 'Sign in required'; end if;
  select * into m from public.hallium_twin_meetups where id=p_meetup for update;
  if not found or me not in (m.user_low,m.user_high) then
   raise exception 'Meeting unavailable';
  end if;
  if m.status <> 'proposed' then return m.status; end if;
  paired := case when me=m.user_low then m.user_high else m.user_low end;
  if not p_accept then
   update public.hallium_twin_meetups set status='declined',updated_at=now() where id=m.id;
   return 'declined';
  end if;
  if not exists (
    select 1 from public.hallium_twin_profiles a
    join public.hallium_partner_profiles p on p.user_id=a.user_id
    where a.user_id=me and a.enabled and p.discoverable
  ) or not exists (
    select 1 from public.hallium_twin_profiles a
    join public.hallium_partner_profiles p on p.user_id=a.user_id
    where a.user_id=paired and a.enabled and p.discoverable
  ) then raise exception 'Both twins must still be opted in'; end if;
  if exists (select 1 from public.hallium_partner_blocks b
    where (b.blocker=me and b.blocked=paired) or (b.blocker=paired and b.blocked=me))
    then raise exception 'Partner unavailable'; end if;
  update public.hallium_twin_meetups
   set approved_low=case when me=user_low then true else approved_low end,
       approved_high=case when me=user_high then true else approved_high end,
       updated_at=now()
   where id=m.id returning * into m;
  if not (m.approved_low and m.approved_high) then return 'proposed'; end if;
  lo:=least(me,paired); hi:=greatest(me,paired);
  insert into public.hallium_partner_connections(user_low,user_high,requested_by,status)
   values(lo,hi,m.initiated_by,'accepted')
   on conflict (user_low,user_high) do update set status='accepted',updated_at=now();
  update public.hallium_twin_meetups set status='accepted',updated_at=now() where id=m.id;
  return 'accepted';
 end;
 $$;
revoke all on function public.hallium_twin_decide(uuid,boolean) from public, anon;
grant execute on function public.hallium_twin_decide(uuid,boolean) to authenticated;
