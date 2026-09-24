-- On mutual approval, materialize the approved AI-twin challenge in existing Study Partners.
-- One transition under a row lock; replays cannot insert multiple sessions.
create or replace function public.hallium_twin_decide(p_meetup uuid, p_accept boolean)
 returns text language plpgsql security definer set search_path = ''
 as $$
 declare
  me uuid := (select auth.uid());
  m public.hallium_twin_meetups%rowtype;
  paired uuid;
  lo uuid;
  hi uuid;
  room_id uuid;
  rounds jsonb;
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
   on conflict (user_low,user_high) do update set status='accepted',updated_at=now()
   returning id into room_id;

  rounds:=jsonb_build_array(
   jsonb_build_object('kind','vocabulary','kicker','01 · TWINVERSE WARM-UP',
    'title','Start your skill swap','prompt',m.plan->'steps'->>0,
    'hint',m.plan->>'summary','source','Approved AI twin meetup'),
   jsonb_build_object('kind','grammar','kicker','02 · SWITCH ROLES',
    'title','Help each other','prompt',m.plan->'steps'->>1,
    'hint',m.plan->>'summary','source','Approved AI twin meetup'),
   jsonb_build_object('kind','together','kicker','03 · BUILD TOGETHER',
    'title',m.plan->>'title','prompt',m.plan->'steps'->>2,
    'hint',m.plan->>'opener','source','Approved AI twin meetup')
  );
  insert into public.hallium_partner_sessions(connection_id,created_by,provider,rounds)
   values(room_id,m.initiated_by,
    case when m.plan->>'source'='groq' then 'groq' else 'guided' end,
    rounds);

  update public.hallium_twin_meetups set status='accepted',updated_at=now() where id=m.id;
  return 'accepted';
 end;
 $$;
revoke all on function public.hallium_twin_decide(uuid,boolean) from public,anon;
grant execute on function public.hallium_twin_decide(uuid,boolean) to authenticated;
