alter table public.hallium_partner_connections
  add column if not exists request_context jsonb not null default '{}'::jsonb
  check (jsonb_typeof(request_context)='object');

drop function if exists public.hallium_partner_request(uuid);

create or replace function public.hallium_partner_request(
  p_other uuid,
  p_context jsonb default '{}'::jsonb
)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  lo uuid;
  hi uuid;
  existing public.hallium_partner_connections%rowtype;
  result uuid;
  safe_context jsonb;
begin
  if me is null or p_other is null or me=p_other then
    raise exception 'Invalid partner request';
  end if;

  if not exists (select 1 from public.hallium_partner_profiles where user_id=me and discoverable)
    or not exists (select 1 from public.hallium_partner_profiles where user_id=p_other and discoverable)
  then
    raise exception 'Both learners must opt in to partner discovery';
  end if;

  if exists(
    select 1 from public.hallium_partner_blocks
    where (blocker=me and blocked=p_other) or (blocker=p_other and blocked=me)
  ) then
    raise exception 'This learner is unavailable';
  end if;

  if jsonb_typeof(coalesce(p_context,'{}'::jsonb)) <> 'object' then
    raise exception 'Invalid request context';
  end if;

  safe_context := jsonb_strip_nulls(jsonb_build_object(
    'goal', left(coalesce(p_context->>'goal',''), 32),
    'practiceNeed', left(coalesce(p_context->>'practiceNeed',''), 32),
    'cadence', left(coalesce(p_context->>'cadence',''), 24),
    'availability', left(coalesce(p_context->>'availability',''), 80),
    'helpsWith', left(coalesce(p_context->>'helpsWith',''), 24),
    'gainsHelp', left(coalesce(p_context->>'gainsHelp',''), 24),
    'fitScore', case
      when (p_context->>'fitScore') ~ '^[0-9]{1,3}$'
      then least(100, greatest(0, (p_context->>'fitScore')::int))
      else null
    end
  ));

  lo := least(me,p_other);
  hi := greatest(me,p_other);

  select * into existing
  from public.hallium_partner_connections
  where user_low=lo and user_high=hi
  for update;

  if found and existing.status in ('pending','accepted') then
    return existing.id;
  end if;

  if found then
    update public.hallium_partner_connections
      set status='pending',
          requested_by=me,
          request_context=safe_context,
          updated_at=now()
      where id=existing.id
      returning id into result;
  else
    insert into public.hallium_partner_connections(
      user_low,user_high,requested_by,request_context
    )
    values(lo,hi,me,safe_context)
    returning id into result;
  end if;

  return result;
end;
$$;

revoke all on function public.hallium_partner_request(uuid,jsonb) from public;
grant execute on function public.hallium_partner_request(uuid,jsonb) to authenticated;
