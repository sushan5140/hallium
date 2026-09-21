# Hallium — Structured Korean

Standalone Hallium learning application. The Next.js project is at the **root**
of this repository. It is independent of the legacy Hallim monorepo.

## Features

- Structured Korean curriculum with a separate lesson catalog and daily practice
- Vocabulary, grammar, listening, study checks and review
- Real Korean and Message Makeover
- Google sign-in and learner progress stored in the existing Hallim Supabase project
- Dedicated Back and Practice Home navigation across the application
- Study Partners: opt-in learner profiles, private notes, mutual requests, accepted shared rooms and AI-assisted partner practice

## Develop

Use Node.js 22 or newer:

```bash
npm ci
npm run build
npm run dev
```

## Vercel deployment

Import `sushan5140/hallium` as a **new Vercel project** with these settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root Directory | Repository root (leave blank) |
| Framework | Next.js |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | Framework default |

Set these environment variables separately in Vercel Preview and Production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `AI_API` — your chosen GroqCloud API key variable (Groq, not xAI Grok). The app also accepts `GROQ_API_KEY` or the older `Grok_API` as fallbacks.

Reuse the existing Supabase project so Google sign-in and learning progress
are not lost. Do not commit server API secrets or `.env` files.

Keep the old `hallium.vercel.app` deployment in place while the new project is
being verified. Only then move `hallium.vercel.app` from the legacy Vercel
project to this new project under Settings → Domains. Test Google login,
learning progress, lesson selection, review, and navigation before removing
the old project.

## CI

`.github/workflows/verify.yml` checks `npm ci` and `npm run build` on each
push and pull request to `main`.

## Study Partners (real learners)

Study Partners lives at `/study-partners` on the existing Hallium project and uses the same Google sign-in and Supabase project. The migration in `supabase/migrations/20260922_study_partners_v1.sql` creates independent, Row Level Security-protected tables. Do not delete or replace existing `profiles` or `learner_state`.

Learners must create a nickname and explicitly opt in before they can be discovered. Their initial complementary practice focus is self-described; an eight-question vocabulary/grammar check can supply evidence, or they can import category-level guidance from their own Hallium AI audit. No raw mistake data, notes, or report text is shared. Match suggestions do not claim teaching qualifications.

Partner requests require the *other* learner to accept. Only after acceptance can both send messages, add shared-room notes or share individual private notebook items. Either can end the partnership or block the other, which closes the room under the database policies. Revoking a shared note removes live access but cannot retract a personal copy already saved by the recipient.

The partner practice endpoint `/api/study-partners/practice` checks sign-in, accepted partnership, shared-note permissions, participation by both users and a daily generation limit. With `AI_API` / `GROQ_API_KEY`, Groq can generate three rounds grounded in opted-in shared notes; otherwise a clearly labeled guided fallback uses only the same notes. Answers are not automatically graded. Reports are stored in `hallium_partner_reports`, viewable to admins under RLS for moderation.

Verify sign-in/redirect allow-list for the **actual public hostname** before distributing the feature, particularly if `hallium.vercel.app` still routes to an older Vercel project.
