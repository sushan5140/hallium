# Hallium AI Doppelgänger — live two-account pilot

This is the implementation for Hallium’s `/ai-twins` route, separate from the older fictional `/research/ai-twins` sandbox.

## What it does

1. Both people sign into their **own** Google account at the same Hallium deployment.
2. Each enters a public twin name, self-described learning strengths/growth area, availability, interests and a short introduction, then explicitly enables discovery.
3. Either learner chooses the other and presses “Send my twin to meet…”; an authenticated server route sends **four distinct agent turns** (alternating learner summaries) to the existing server-side Groq key, then requests an AI-written, three-step, 15-minute practice plan. If plan generation fails, the dialogue is still actual LLM output and the plan is transparently marked `guided`.
4. The transcript/plan is saved as a pending meeting in Supabase, readable only by the **two participants**. Both human accounts can examine it independently.
5. Each account clicks **Approve** or **Decline**. A locked SQL function checks current consent and blocks; if both approve, it opens (or accepts) the existing Study Partners connection and saves the approved activity as a normal three-round practice session.
6. Each learner clicks “Open your shared study room” to enter the existing Study Partners room and complete the rounds as real learners.

## Research reality

These are **distinct prompted LLM agents** in sequential turns, not independent embodied entities with access to the users’ full private memory. They know only explicitly shared twin/profile summaries; the existing private learning state, saved notes, raw mistakes, emails, CVs and other user records are not passed to the model. We do not claim validated learning or compatibility improvements from a two-account product test.

## Technical references

- UI: `app/ai-twins/page.js` and `app/ai-twins/live.css`
- Server-only orchestration: `app/api/ai-twins/meet/route.js`
- Public summary + plan validators: `lib/ai-twins/live.mjs`
- Tables/RLS/approvals: `supabase/migrations/20260925_ai_twins_pilot.sql`
- Shared study room handoff: `supabase/migrations/20260925_ai_twins_practice_handoff.sql`
- Unit checks: `tests/ai-twins-live.test.mjs`

## Privacy and safety

- Discovery and all proposals require active opt-in; it is OFF by default.
- Enabling a twin also enables Study Partners discoverability. Disabling the twin and discovery does **not** silently delete an already accepted Study Partners relationship; either person can end or block it in Study Partners.
- The server authenticates via `supabase.auth.getUser()` and applies per-user throttling of five meetings per 24 hours.
- Both human approvals are required. No unapproved meetup can create a room, and no client can update approval flags directly.
- Signed-in users can read only meetups in which they participate; no account can approve on behalf of another. All exposed new tables have RLS and explicit grants. Users may opt out/deactivate twins in the UI.
- The profile and transcript are stored in the existing Hallim Supabase project in the same region as the rest of Hallium. Do not put personal identifiers in the opt-in twin intro/interests, since they will be sent to the configured AI provider.
- For real research involving recruited participants, obtain ethical review/consent as required; two siblings trying functionality is only a product test.

## Configuration

Uses `AI_API` or `GROQ_API_KEY` server-side, matching the existing Study Partners practice backend. Do NOT put this secret under `NEXT_PUBLIC_`. Optionally use `GROQ_MODEL` to pin a supported chat-completions model. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are existing Hallium settings.

## Manual verification on TWO actual accounts

- Each sign in and enable a distinct twin, observe the other on the twinverse roster.
- Start a meetup on account A, observe generated turn-by-turn transcript in A and (after refresh) B.
- A approves. The room must **not** open yet. B approves. The existing Study Partners connection must become accepted and contain the AI twin activity in Practice.
- Both submit an answer, sign out/in, verify persistence.
- Test decline, repeated clicks, self-meet rejection, opt-out, and blocking.
- Check production or preview runtime logs for Groq errors if a model call fails. If no provider key exists, the route returns a clear 503 rather than pretending the conversation was AI generated.
