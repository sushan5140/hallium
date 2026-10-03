-- Curriculum Admin least-privilege closure.
-- Authenticated admins only need SELECT/INSERT/UPDATE through the Data API.

revoke all on table public.hallium_curriculum_admin_state from public, anon, authenticated;
grant select, insert, update on table public.hallium_curriculum_admin_state to authenticated;

drop policy if exists hallium_curriculum_admin_delete on public.hallium_curriculum_admin_state;
