# Hallium — Structured Korean

Standalone Hallium learning application. The Next.js project is at the **root**
of this repository. It is independent of the legacy Hallim monorepo.

## Features

- Structured Korean curriculum with a separate lesson catalog and daily practice
- Vocabulary, grammar, listening, study checks and review
- Real Korean and Message Makeover
- Google sign-in and learner progress stored in the existing Hallim Supabase project
- Dedicated Back and Practice Home navigation across the application

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
- `Grok_API`

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
