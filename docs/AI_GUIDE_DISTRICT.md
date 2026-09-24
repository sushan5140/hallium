# Twinverse AI Guide District — founding cast

AI tutors are **not** fake community members or synthetic Hallium signup accounts. The seed roster is a transparent AI-only learning area so a new user has something genuinely useful to do before human partnerships become active.

## Product behavior

- Open `/ai-twins` and select **Enter the AI Guide District**, or visit `/ai-twins/guides`.
- Browse 12 fictional AI teaching personas without signing in; sign in with Hallium Google Auth to chat.
- Each persona has a distinct Korean specialty, personality and three optional opening prompts.
- Each message invokes a real server-side Groq LLM completion with recent saved user-owned messages for that persona. No fabricated replies, manufactured member counts, fake reviews or accounts.
- Separate chat history per guide and per actual user, stored in `hallium_ai_guide_turns` with RLS; the user can clear each guide's history.
- A user does **not** have to make their own twin discoverable to use the teachers. The human learner discovery and two-human approval process remain unchanged.
- 40 tutor replies per user across all guides per rolling 24 hours, four successful replies per minute; input under 750 characters. If Groq isn't available, show a genuine error.
- Chats are text-based: no claims of auditory pronunciation evaluation, official TOPIK examination items, copyrighted song lyrics, or unseen comic image interpretation.

## Source files

- `lib/ai-twins/guides.mjs`: 12 static AI personas and system instructions.
- `app/ai-twins/guides/page.js` and `guides.css`: roster, per-tutor private conversation UI, history deletion.
- `app/api/ai-twins/guides/chat/route.js`: user authentication, quotas, provider call, saved results.
- `supabase/migrations/20260925000500_ai_guide_turns.sql`: private RLS-backed storage.
- `tests/ai-twins-guides.test.mjs`: catalog and safety regression checks.

## First tests

1. Without sign-in, verify all 12 guides are visible and visibly tagged AI; chat is locked behind Google sign-in.
2. Sign into account A, send one question to two different guides, observe two meaningfully different explanations and private histories.
3. Sign into account B separately; account B must **not** read account A's chat. A can still see their prior conversation.
4. Clear guide A's conversation and verify that guide B's conversation is still saved.
5. Disable learner discovery in Twinverse; tutoring should still work.
6. Check for visible provider errors and runtime failures before declaring fully end-to-end verified.

## Research note

This seed-cast feature is a language learning application feature, not evidence of agent matchmaking effectiveness or a measured growth experiment. Do not infer community usage statistics from the number of AI characters.
