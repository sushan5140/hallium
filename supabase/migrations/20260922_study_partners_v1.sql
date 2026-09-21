-- Study Partners v1: independent, opt-in multiplayer tables. Does not alter existing learner state.
create table if not exists public.hallium_partner_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(trim(nickname)) between 2 and 35),
  level text not null default 'beginner' check (level in ('beginner','elementary','intermediate','advanced')),
  availability text not null default 'Flexible' check (char_length(availability) between 2 and 80),
  strength text not null default 'vocabulary' check (strength in ('vocabulary','grammar')),
  growth_area text not null default 'grammar' check (growth_area in ('vocabulary','grammar')),
  diagnostic jsonb not null default '{}'::jsonb,
  discoverable boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint partner_distinct_areas check (strength <> growth_area)
);
create table if not exists public.hallium_partner_blocks (
  blocker uuid not null references auth.users(id) on delete cascade,
  blocked uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(blocker,blocked),
  constraint partner_no_self_block check (blocker <> blocked)
);
create table if not exists public.hallium_partner_connections (
  id uuid primary key default gen_random_uuid(),
  user_low uuid not null references public.hallium_partner_profiles(user_id) on delete cascade,
  user_high uuid not null references public.hallium_partner_profiles(user_id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled','ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_low,user_high),
  check (user_low < user_high),
  check (requested_by=user_low or requested_by=user_high)
);
create table if not exists public.hallium_partner_notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('vocabulary','grammar')),
  title text not null check (char_length(trim(title)) between 1 and 90),
  meaning text not null check (char_length(trim(meaning)) between 1 and 300),
  example text not null default '' check (char_length(example) <= 240),
  collection text not null default 'My notes' check (char_length(collection) between 1 and 80),
  copied_from uuid,
  created_at timestamptz not null default now()
);
create table if not exists public.hallium_partner_shares (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.hallium_partner_connections(id) on delete cascade,
  note_id uuid not null references public.hallium_partner_notes(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(connection_id,note_id)
);
create table if not exists public.hallium_partner_joint_notes (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.hallium_partner_connections(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1200),
  created_at timestamptz not null default now()
);
create table if not exists public.hallium_partner_reports (
  id uuid primary key default gen_random_uuid(),
  reporter uuid not null references auth.users(id) on delete cascade,
  target uuid not null references auth.users(id) on delete cascade,
  connection_id uuid references public.hallium_partner_connections(id) on delete set null,
  reason text not null check (char_length(trim(reason)) between 1 and 1200),
  created_at timestamptz not null default now(),
  check (reporter<>target)
);
create table if not exists public.hallium_partner_messages (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.hallium_partner_connections(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create table if not exists public.hallium_partner_sessions (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.hallium_partner_connections(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('guided','groq')),
  rounds jsonb not null check (jsonb_typeof(rounds)='array' and jsonb_array_length(rounds)=3),
  created_at timestamptz not null default now()
);
create table if not exists public.hallium_partner_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.hallium_partner_sessions(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  round_index int not null check (round_index between 0 and 2),
  body text not null check (char_length(trim(body)) between 1 and 1200),
  created_at timestamptz not null default now(),
  unique(session_id,author_id,round_index)
);

create index if not exists partner_notes_owner_created on public.hallium_partner_notes(owner_id,created_at desc);
create index if not exists partner_shares_connection on public.hallium_partner_shares(connection_id);
create index if not exists partner_msgs_connection_created on public.hallium_partner_messages(connection_id,created_at);
create index if not exists partner_sessions_connection_created on public.hallium_partner_sessions(connection_id,created_at desc);

-- SECURITY DEFINER avoids recursive RLS between rooms, shares and notes.
create or replace function public.hallium_partner_is_active(p_connection uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
 select exists (
   select 1 from public.hallium_partner_connections c
   where c.id=p_connection and c.status='accepted'
     and (c.user_low=(select auth.uid()) or c.user_high=(select auth.uid()))
     and not exists (
       select 1 from public.hallium_partner_blocks b
       where (b.blocker=c.user_low and b.blocked=c.user_high)
          or (b.blocker=c.user_high and b.blocked=c.user_low)
     )
 );
$$;
revoke all on function public.hallium_partner_is_active(uuid) from public;
grant execute on function public.hallium_partner_is_active(uuid) to authenticated;

create or replace function public.hallium_partner_can_view(p_user uuid)
returns boolean language sql stable security definer set search_path = ''
as $
 select (p_user=(select auth.uid()))
 or (
   not exists (select 1 from public.hallium_partner_blocks b where (b.blocker=p_user and b.blocked=(select auth.uid())) or (b.blocker=(select auth.uid()) and b.blocked=p_user))
   and (exists(select 1 from public.hallium_partner_profiles p where p.user_id=p_user and p.discoverable)
     or exists(select 1 from public.hallium_partner_connections c where c.status='accepted'
       and ((c.user_low=p_user and c.user_high=(select auth.uid())) or (c.user_high=p_user and c.user_low=(select auth.uid())))))
 );
$;
revoke all on function public.hallium_partner_can_view(uuid) from public;
grant execute on function public.hallium_partner_can_view(uuid) to authenticated;

create or replace function public.hallium_partner_request(p_other uuid)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare me uuid := (select auth.uid()); lo uuid; hi uuid; existing public.hallium_partner_connections%rowtype; result uuid;
begin
 if me is null or p_other is null or me=p_other then raise exception 'Invalid partner request'; end if;
 if not exists (select 1 from public.hallium_partner_profiles where user_id=me and discoverable)
   or not exists (select 1 from public.hallium_partner_profiles where user_id=p_other and discoverable)
 then raise exception 'Both learners must opt in to partner discovery'; end if;
 if exists(select 1 from public.hallium_partner_blocks where (blocker=me and blocked=p_other) or (blocker=p_other and blocked=me))
 then raise exception 'This learner is unavailable'; end if;
 lo := least(me,p_other); hi := greatest(me,p_other);
 select * into existing from public.hallium_partner_connections where user_low=lo and user_high=hi for update;
 if found and existing.status in ('pending','accepted') then return existing.id; end if;
 if found then
   update public.hallium_partner_connections set status='pending',requested_by=me,updated_at=now()
   where id=existing.id returning id into result;
 else
   insert into public.hallium_partner_connections(user_low,user_high,requested_by)
   values(lo,hi,me) returning id into result;
 end if;
 return result;
end; $$;
revoke all on function public.hallium_partner_request(uuid) from public;
grant execute on function public.hallium_partner_request(uuid) to authenticated;

create or replace function public.hallium_partner_respond(p_connection uuid,p_action text)
returns void language plpgsql security definer set search_path = ''
as $$
declare me uuid:=(select auth.uid()); c public.hallium_partner_connections%rowtype;
begin
 if me is null or p_action not in ('accepted','declined','cancelled','ended') then raise exception 'Invalid action'; end if;
 select * into c from public.hallium_partner_connections where id=p_connection for update;
 if not found or me not in (c.user_low,c.user_high) then raise exception 'Connection not found'; end if;
 if p_action in ('accepted','declined') then
   if c.status<>'pending' or c.requested_by=me then raise exception 'Only the recipient can respond to a pending request'; end if;
   if p_action='accepted' and exists (select 1 from public.hallium_partner_blocks where (blocker=c.user_low and blocked=c.user_high) or (blocker=c.user_high and blocked=c.user_low)) then raise exception 'This learner is unavailable'; end if;
 elsif p_action='cancelled' then
   if c.status<>'pending' or c.requested_by<>me then raise exception 'Only the sender can cancel their pending request'; end if;
 elsif p_action='ended' then
   if c.status<>'accepted' then raise exception 'Only an active partnership can be ended'; end if;
 end if;
 update public.hallium_partner_connections set status=p_action,updated_at=now() where id=c.id;
end; $$;
revoke all on function public.hallium_partner_respond(uuid,text) from public;
grant execute on function public.hallium_partner_respond(uuid,text) to authenticated;

-- Row access: users alone see their raw learning state; peers see only opt-in learning card.
alter table public.hallium_partner_profiles enable row level security;
alter table public.hallium_partner_blocks enable row level security;
alter table public.hallium_partner_connections enable row level security;
alter table public.hallium_partner_notes enable row level security;
alter table public.hallium_partner_shares enable row level security;
alter table public.hallium_partner_joint_notes enable row level security;
alter table public.hallium_partner_reports enable row level security;
alter table public.hallium_partner_messages enable row level security;
alter table public.hallium_partner_sessions enable row level security;
alter table public.hallium_partner_answers enable row level security;

create policy partner_profiles_read on public.hallium_partner_profiles for select to authenticated
 using (public.hallium_partner_can_view(user_id));
create policy partner_profiles_insert on public.hallium_partner_profiles for insert to authenticated with check (user_id=(select auth.uid()));
create policy partner_profiles_update on public.hallium_partner_profiles for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy partner_blocks_read on public.hallium_partner_blocks for select to authenticated using (blocker=(select auth.uid()));
create policy partner_blocks_insert on public.hallium_partner_blocks for insert to authenticated with check (blocker=(select auth.uid()));
create policy partner_blocks_delete on public.hallium_partner_blocks for delete to authenticated using (blocker=(select auth.uid()));
create policy partner_connections_read on public.hallium_partner_connections for select to authenticated using (user_low=(select auth.uid()) or user_high=(select auth.uid()));
create policy partner_notes_read on public.hallium_partner_notes for select to authenticated
 using (owner_id=(select auth.uid()) or exists(select 1 from public.hallium_partner_shares s where s.note_id=id and public.hallium_partner_is_active(s.connection_id)));
create policy partner_notes_insert on public.hallium_partner_notes for insert to authenticated with check (owner_id=(select auth.uid()));
create policy partner_notes_update on public.hallium_partner_notes for update to authenticated using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()));
create policy partner_notes_delete on public.hallium_partner_notes for delete to authenticated using (owner_id=(select auth.uid()));
create policy partner_shares_read on public.hallium_partner_shares for select to authenticated
 using (owner_id=(select auth.uid()) or public.hallium_partner_is_active(connection_id));
create policy partner_shares_insert on public.hallium_partner_shares for insert to authenticated
 with check (owner_id=(select auth.uid()) and public.hallium_partner_is_active(connection_id)
   and exists(select 1 from public.hallium_partner_notes n where n.id=note_id and n.owner_id=(select auth.uid())));
create policy partner_shares_delete on public.hallium_partner_shares for delete to authenticated using (owner_id=(select auth.uid()));
create policy partner_joint_read on public.hallium_partner_joint_notes for select to authenticated using (public.hallium_partner_is_active(connection_id));
create policy partner_joint_insert on public.hallium_partner_joint_notes for insert to authenticated with check (author_id=(select auth.uid()) and public.hallium_partner_is_active(connection_id));
create policy partner_reports_read on public.hallium_partner_reports for select to authenticated
 using (reporter=(select auth.uid()) or public.is_hallim_admin());
create policy partner_reports_insert on public.hallium_partner_reports for insert to authenticated
 with check (reporter=(select auth.uid()) and (connection_id is null or
 exists(select 1 from public.hallium_partner_connections c where c.id=connection_id
 and (c.user_low=(select auth.uid()) or c.user_high=(select auth.uid()))
 and (c.user_low=target or c.user_high=target))));
create policy partner_msgs_read on public.hallium_partner_messages for select to authenticated using (public.hallium_partner_is_active(connection_id));
create policy partner_msgs_insert on public.hallium_partner_messages for insert to authenticated with check (sender_id=(select auth.uid()) and public.hallium_partner_is_active(connection_id));
create policy partner_sessions_read on public.hallium_partner_sessions for select to authenticated using (public.hallium_partner_is_active(connection_id));
create policy partner_sessions_insert on public.hallium_partner_sessions for insert to authenticated with check (created_by=(select auth.uid()) and public.hallium_partner_is_active(connection_id));
create policy partner_answers_read on public.hallium_partner_answers for select to authenticated
 using (exists(select 1 from public.hallium_partner_sessions s where s.id=session_id and public.hallium_partner_is_active(s.connection_id)));
create policy partner_answers_insert on public.hallium_partner_answers for insert to authenticated
 with check (author_id=(select auth.uid()) and exists(select 1 from public.hallium_partner_sessions s where s.id=session_id and public.hallium_partner_is_active(s.connection_id)));
create policy partner_answers_update on public.hallium_partner_answers for update to authenticated
 using (author_id=(select auth.uid()) and exists(select 1 from public.hallium_partner_sessions s where s.id=session_id and public.hallium_partner_is_active(s.connection_id)))
 with check (author_id=(select auth.uid()) and exists(select 1 from public.hallium_partner_sessions s where s.id=session_id and public.hallium_partner_is_active(s.connection_id)));

grant select,insert,update on public.hallium_partner_profiles to authenticated;
grant select,insert,delete on public.hallium_partner_blocks to authenticated;
grant select on public.hallium_partner_connections to authenticated;
grant select,insert,update,delete on public.hallium_partner_notes to authenticated;
grant select,insert,delete on public.hallium_partner_shares to authenticated;
grant select,insert on public.hallium_partner_joint_notes to authenticated;
grant select,insert on public.hallium_partner_reports to authenticated;
grant select,insert on public.hallium_partner_messages to authenticated;
grant select,insert on public.hallium_partner_sessions to authenticated;
grant select,insert,update on public.hallium_partner_answers to authenticated;
