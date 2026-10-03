-- Move RLS-only helpers out of the exposed public RPC schema.
-- Keep only the minimum schema/function privileges authenticated policies need.

create or replace function hallium_internal.partner_is_active(p_connection uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
 select exists (
   select 1
   from public.hallium_partner_connections c
   where c.id=p_connection
     and c.status='accepted'
     and (c.user_low=(select auth.uid()) or c.user_high=(select auth.uid()))
     and not exists (
       select 1
       from public.hallium_partner_blocks b
       where (b.blocker=c.user_low and b.blocked=c.user_high)
          or (b.blocker=c.user_high and b.blocked=c.user_low)
     )
 );
$$;

create or replace function hallium_internal.partner_can_view(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
 select (p_user=(select auth.uid()))
 or (
   not exists (
     select 1
     from public.hallium_partner_blocks b
     where (b.blocker=p_user and b.blocked=(select auth.uid()))
        or (b.blocker=(select auth.uid()) and b.blocked=p_user)
   )
   and (
     exists(
       select 1
       from public.hallium_partner_profiles p
       where p.user_id=p_user and p.discoverable
     )
     or exists(
       select 1
       from public.hallium_partner_connections c
       where c.status='accepted'
         and (
           (c.user_low=p_user and c.user_high=(select auth.uid()))
           or (c.user_high=p_user and c.user_low=(select auth.uid()))
         )
     )
   )
 );
$$;

revoke all on schema hallium_internal from public, anon, authenticated;
grant usage on schema hallium_internal to authenticated;
revoke all on all tables in schema hallium_internal from public, anon, authenticated;
revoke all on all sequences in schema hallium_internal from public, anon, authenticated;
revoke all on function hallium_internal.partner_is_active(uuid) from public, anon;
revoke all on function hallium_internal.partner_can_view(uuid) from public, anon;
grant execute on function hallium_internal.partner_is_active(uuid) to authenticated;
grant execute on function hallium_internal.partner_can_view(uuid) to authenticated;

drop policy if exists partner_profiles_read on public.hallium_partner_profiles;
create policy partner_profiles_read
on public.hallium_partner_profiles
for select to authenticated
using (hallium_internal.partner_can_view(user_id));

drop policy if exists partner_notes_read on public.hallium_partner_notes;
create policy partner_notes_read
on public.hallium_partner_notes
for select to authenticated
using (
  owner_id=(select auth.uid())
  or exists(
    select 1
    from public.hallium_partner_shares s
    where s.note_id=public.hallium_partner_notes.id
      and hallium_internal.partner_is_active(s.connection_id)
  )
);

drop policy if exists partner_shares_read on public.hallium_partner_shares;
create policy partner_shares_read
on public.hallium_partner_shares
for select to authenticated
using (
  owner_id=(select auth.uid())
  or hallium_internal.partner_is_active(connection_id)
);

drop policy if exists partner_shares_insert on public.hallium_partner_shares;
create policy partner_shares_insert
on public.hallium_partner_shares
for insert to authenticated
with check (
  owner_id=(select auth.uid())
  and hallium_internal.partner_is_active(connection_id)
  and exists(
    select 1
    from public.hallium_partner_notes n
    where n.id=note_id and n.owner_id=(select auth.uid())
  )
);

drop policy if exists partner_joint_read on public.hallium_partner_joint_notes;
create policy partner_joint_read
on public.hallium_partner_joint_notes
for select to authenticated
using (hallium_internal.partner_is_active(connection_id));

drop policy if exists partner_joint_insert on public.hallium_partner_joint_notes;
create policy partner_joint_insert
on public.hallium_partner_joint_notes
for insert to authenticated
with check (
  author_id=(select auth.uid())
  and hallium_internal.partner_is_active(connection_id)
);

drop policy if exists partner_msgs_read on public.hallium_partner_messages;
create policy partner_msgs_read
on public.hallium_partner_messages
for select to authenticated
using (hallium_internal.partner_is_active(connection_id));

drop policy if exists partner_msgs_insert on public.hallium_partner_messages;
create policy partner_msgs_insert
on public.hallium_partner_messages
for insert to authenticated
with check (
  sender_id=(select auth.uid())
  and hallium_internal.partner_is_active(connection_id)
);

drop policy if exists partner_sessions_read on public.hallium_partner_sessions;
create policy partner_sessions_read
on public.hallium_partner_sessions
for select to authenticated
using (hallium_internal.partner_is_active(connection_id));

drop policy if exists partner_sessions_insert on public.hallium_partner_sessions;
create policy partner_sessions_insert
on public.hallium_partner_sessions
for insert to authenticated
with check (
  created_by=(select auth.uid())
  and hallium_internal.partner_is_active(connection_id)
);

drop policy if exists partner_answers_read on public.hallium_partner_answers;
create policy partner_answers_read
on public.hallium_partner_answers
for select to authenticated
using (
  exists(
    select 1
    from public.hallium_partner_sessions s
    where s.id=public.hallium_partner_answers.session_id
      and hallium_internal.partner_is_active(s.connection_id)
  )
);

drop policy if exists partner_answers_insert on public.hallium_partner_answers;
create policy partner_answers_insert
on public.hallium_partner_answers
for insert to authenticated
with check (
  author_id=(select auth.uid())
  and exists(
    select 1
    from public.hallium_partner_sessions s
    where s.id=public.hallium_partner_answers.session_id
      and hallium_internal.partner_is_active(s.connection_id)
  )
);

drop policy if exists partner_answers_update on public.hallium_partner_answers;
create policy partner_answers_update
on public.hallium_partner_answers
for update to authenticated
using (
  author_id=(select auth.uid())
  and exists(
    select 1
    from public.hallium_partner_sessions s
    where s.id=public.hallium_partner_answers.session_id
      and hallium_internal.partner_is_active(s.connection_id)
  )
)
with check (
  author_id=(select auth.uid())
  and exists(
    select 1
    from public.hallium_partner_sessions s
    where s.id=public.hallium_partner_answers.session_id
      and hallium_internal.partner_is_active(s.connection_id)
  )
);

drop policy if exists twin_meetups_insert on public.hallium_twin_meetups;
create policy twin_meetups_insert
on public.hallium_twin_meetups
for insert to authenticated
with check (
  initiated_by=(select auth.uid())
  and (select auth.uid()) in (user_low,user_high)
  and status='proposed'
  and not approved_low
  and not approved_high
  and hallium_internal.partner_can_view(user_low)
  and hallium_internal.partner_can_view(user_high)
  and exists (
    select 1
    from public.hallium_twin_profiles a
    join public.hallium_partner_profiles pa on pa.user_id=a.user_id
    where a.user_id=user_low and a.enabled and pa.discoverable
  )
  and exists (
    select 1
    from public.hallium_twin_profiles b
    join public.hallium_partner_profiles pb on pb.user_id=b.user_id
    where b.user_id=user_high and b.enabled and pb.discoverable
  )
);

drop policy if exists twin_profiles_read on public.hallium_twin_profiles;
create policy twin_profiles_read
on public.hallium_twin_profiles
for select to authenticated
using (
  user_id=(select auth.uid())
  or (enabled and hallium_internal.partner_can_view(user_id))
);

create or replace function public.hallium_twinverse_status()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  milestone_time timestamptz;
  eligible integer;
  visible_founders jsonb;
begin
  if me is null then raise exception 'Sign in required'; end if;

  select reached_at into milestone_time
  from hallium_internal.twinverse_milestone
  where id=1
  for update;

  select count(*)::integer into eligible
  from public.hallium_twin_profiles t
  join public.hallium_partner_profiles p on p.user_id=t.user_id
  where t.enabled and p.discoverable;

  if milestone_time is null and eligible >= 12 then
    update hallium_internal.twinverse_milestone
    set reached_at=now()
    where id=1
    returning reached_at into milestone_time;

    insert into hallium_internal.twinverse_founders(user_id,joined_at)
    select t.user_id,t.joined_at
    from public.hallium_twin_profiles t
    join public.hallium_partner_profiles p on p.user_id=t.user_id
    where t.enabled and p.discoverable
    order by t.joined_at,t.user_id
    limit 12
    on conflict (user_id) do nothing;
  end if;

  if milestone_time is not null then
    update public.hallium_twinverse_phase
    set mode='human',updated_at=now()
    where id=1 and mode<>'human';
  end if;

  select coalesce(jsonb_agg(f.user_id), '[]'::jsonb) into visible_founders
  from hallium_internal.twinverse_founders f
  join public.hallium_twin_profiles t on t.user_id=f.user_id
  join public.hallium_partner_profiles p on p.user_id=f.user_id
  where t.enabled
    and p.discoverable
    and (
      f.user_id=me
      or hallium_internal.partner_can_view(f.user_id)
    );

  return jsonb_build_object(
    'mode',case when milestone_time is null then 'seed' else 'human' end,
    'active_humans',eligible,
    'threshold',12,
    'founder_ids',visible_founders
  );
end;
$$;

revoke all on function public.hallium_twinverse_status() from public, anon;
grant execute on function public.hallium_twinverse_status() to authenticated;

drop function public.hallium_partner_can_view(uuid);
drop function public.hallium_partner_is_active(uuid);
