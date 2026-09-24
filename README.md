# Hallium learning dashboard — standalone interactive GitHub Pages preview

This **single-page** static preview is isolated on Hallium's `gh-pages` branch. The production Next.js `main` branch and Vercel domain are **not changed**.

It addresses the uneven screenshot: the full-height three-column desktop grid ensures Today’s Plan, Curriculum, and Adaptive Coach backgrounds and content run to the same lower baseline as the central lesson. Helpful, clearly labeled *sample* practice/goal modules fill the side columns; the full-width Momentum panel sits immediately below the shared baseline.

## Opening

When GitHub Pages is enabled for this repository, select **Deploy from a branch** → `gh-pages` → `/(root)`. Then the sole site entry is:

`https://sushan5140.github.io/hallium/`

No landing page, login, Supabase, API key, or real user data. Open `index.html` directly for an offline-capable preview (Google Font gracefully falls back to local system fonts). Interactions work offline except optional browser Korean speech synthesis support.

## Functions

- Three-step plan and 40-item sample curriculum progress; completed lesson and vocabulary are saved to localStorage.
- Mini vocabulary list with browser TTS, two original teaching questions, review cues and status badges.
- Responsive full-width Momentum and Coach recommendations recalculated from actual **sample actions**. This is deterministic demo logic, **not an AI inference** or an official TOPIK score.
- Mini catalog / learning-route preview modal; 320px to desktop layout.
- Reset sample state, keyboard operation, reduced-motion support, dialog labels, non-navigating route previews.

No real Hallium test content, passwords, documents, private data or copyrighted original TOPIK files are hosted.

For new iterations: update **only the gh-pages branch**, not Vercel's `main`, until the user approves changes for the production app.
