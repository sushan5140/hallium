# Twinverse: 12 AI guides → 12 real humans (one-way handoff)

Preserve BOTH original Hallium features, with **two clearly separated lanes** while fewer than 12 *real*, opted-in people have joined:

- **Human Twinverse**: real Google accounts, user-authored twin descriptions, AI twin-to-twin proposals, mutual consent, and existing Study Partners practice rooms.
- **Starter AI Guide District**: the twelve transparently labeled fictional Korean teachers. They are NOT Supabase auth users, human-match candidates, member counts or testimonials.

## Automatic transition

A PostgreSQL function `hallium_twinverse_status()` counts DISTINCT primary-key real users who have BOTH `hallium_twin_profiles.enabled=true` and `hallium_partner_profiles.discoverable=true`.

At **12 concurrently eligible real learners**, the first read after that threshold is reached:

1. Permanently latches `hallium_internal.twinverse_milestone.reached_at` under row lock.
2. Records the earliest twelve currently eligible twin profiles by `joined_at` into `hallium_internal.twinverse_founders`.
3. Updates the public, READ-ONLY, one-row `hallium_twinverse_phase` marker to `human`.
4. Hides the AI starter lane on `/ai-twins` and prioritizes eligible members of that founding group in the REAL human discovery roster. Other opted-in real people are still discoverable; no automatic pairing or approval is performed.
5. Blocks further AI teaching responses in `/api/ai-twins/guides/chat` on the server, including a post-generation recheck for concurrent milestone transitions. `/ai-twins/guides` becomes a **read-only private archive** where owners can read/delete their previous lessons. It is not promoted as a live AI community.

The transition is one-way even if somebody later opts out. Counts and founder identities come exclusively from existing real authenticated profiles. The public phase marker contains only `seed` or `human`; it grants anonymous SELECT but **no anonymous mutation**, no SECURITY DEFINER anonymous RPC, and no access to founders or other learner data.

## Testing

- As currently deployed, the database has **zero opted-in twin profiles**; the threshold has not been reached.
- Check two divisions appear while in seed mode; humans remain visible even before 12.
- Confirm disabled twins and fictional guides do not count.
- Before the transition, real learners can independently opt in and request a mutually approved human partnership.
- At the real twelfth opt-in, the next authenticated refresh/AI request latches human mode; guides disappear from the lobby and its chat API returns HTTP 410 for new requests.
- Owners can still view/delete their past guide chats. A stranger cannot read them (existing `hallium_ai_guide_turns` RLS).
- No user data, chat logs or human twin pairing history should be deleted or migrated.
- A person must still approve any proposed human interaction. No synthetic accounts should be inserted to test the milestone on production.

This is a **product rollout mechanism**, NOT experimental evidence of improved learning or genuine user-community engagement.
