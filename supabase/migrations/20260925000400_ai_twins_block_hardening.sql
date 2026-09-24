-- Honor blocks in meetup creation, including blocks from the other participant
-- (the blocks table intentionally hides rows where the caller is not the blocker).
drop policy if exists twin_meetups_insert on public.hallium_twin_meetups;
create policy twin_meetups_insert on public.hallium_twin_meetups
 for insert to authenticated with check (
  initiated_by = (select auth.uid())
  and (select auth.uid()) in (user_low,user_high)
  and status = 'proposed' and not approved_low and not approved_high
  and public.hallium_partner_can_view(user_low)
  and public.hallium_partner_can_view(user_high)
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
 );
