-- Limit existing Study Partners privileged RPCs to signed-in learners.
-- The earlier migration revoked PUBLIC, but automatic schema grants had given anon explicit EXECUTE.
revoke execute on function public.hallium_partner_can_view(uuid) from anon;
revoke execute on function public.hallium_partner_is_active(uuid) from anon;
revoke execute on function public.hallium_partner_request(uuid) from anon;
revoke execute on function public.hallium_partner_respond(uuid,text) from anon;
