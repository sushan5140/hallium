# Hallium + Hangul Lab: localhost integration (not Vercel)

This branch recreates the existing Hallium **main** application as of commit `1e3917bb11c289d83486f37d708689fca7113a3d` and adds the complete Hangul Lab preview as a separate learning section.

## Windows PowerShell — local preview

```powershell
git clone --branch local/hangul-integrated --single-branch https://github.com/sushan5140/hallium.git hallium-local
cd hallium-local
npm ci
npm run dev
```

Open **http://localhost:3000** for Hallium and click **Hangul Lab** from the study tools or the header. Or go straight to **http://localhost:3000/hangul**.

Hangul is a dedicated section with a Back to Hallium button. It contains the six families, syllable builder, sound practice, flashcards and touch/stylus/mouse writing studio copied from the approved GitHub Pages preview. Under the hood the independent static learning UI runs in a same-origin frame served from `public/hangul-lab/`, so it stays separate from the main dashboard and doesn't require a new API key.

For signed-in Hallium features during local testing, add your existing public `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local`. Do not commit `.env.local`, a Groq `AI_API` key, or a service-role key. Google OAuth may require adding `http://localhost:3000/auth/callback` to Supabase redirect allow-list; the Hangul section itself runs without login or Supabase.

This branch explicitly opts out of Vercel Git deployments in `vercel.json` and is checked in GitHub Actions with `npm run build` and HTTP smoke tests against `127.0.0.1:3000`. Production `main`, the Vercel site and existing GitHub Pages Hangul preview were not modified.

`http://localhost:3000` is local to the computer running the dev server: it is not a public URL.
