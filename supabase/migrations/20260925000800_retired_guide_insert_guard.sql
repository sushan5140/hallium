-- Defense in depth: even direct authenticated PostgREST INSERTs cannot recreate
-- seed AI guide messages once the one-way human cohort milestone has been reached.
create or replace function hallium_internal.enforce_guide_seed_phase()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare current_phase text;
begin
  select mode into current_phase from public.hallium_twinverse_phase where id=1;
  if current_phase is distinct from 'seed' then
    raise exception 'AI guide teaching has retired; your previous lessons remain available';
  end if;
  return new;
end;
$$;
revoke all on function hallium_internal.enforce_guide_seed_phase()
  from public,anon,authenticated;
drop trigger if exists enforce_guide_seed_phase on public.hallium_ai_guide_turns;
create trigger enforce_guide_seed_phase
 before insert on public.hallium_ai_guide_turns
 for each row execute function hallium_internal.enforce_guide_seed_phase();
