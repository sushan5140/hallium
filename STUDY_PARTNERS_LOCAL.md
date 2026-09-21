# Hallium Study Partners — interactive localhost prototype

This branch preserves the main Hallium application and adds the dedicated **/study-partners** route. Nothing is merged into main. Do not publish this branch to Vercel; its vercel.json disables Git deployment of this branch.

## Run on your Windows PC

```powershell
git clone --branch feature/study-partners --single-branch https://github.com/sushan5140/hallium.git hallium-partners
cd hallium-partners
npm ci
npm run dev
```

Open **http://localhost:3000/study-partners**, or open **http://localhost:3000** and follow the **Study Partners** shortcut.

If the repository is already cloned locally on the feature branch, run `git pull --ff-only` then `npm run dev`.

The existing Hallium dashboard and /hangul remain unchanged on this branch.

## Try a complete simulated two-person flow

1. Open Study Partners, browse Discover as Susan; see why Mina is complementary.
2. Send Mina a request. Use the Preview As selector at the bottom of the sidebar to switch to Mina.
3. Open Connections and accept Susan's request. Open Shared Room.
4. Share Mina's **하고** grammar note with Susan. Switch to Susan and share **학교** or **친구** vocabulary.
5. Open the room and generate mutual practice. Switch people to enter answers for each of 3 rounds.
6. Create a personal note, save a separate copy of a received note, collaborate in the shared notebook, message and test revocation/blocking.
7. Adjust skill sliders in My Profile and see Discover suggestions change; toggle discovery off to see eligibility rules.
8. Reset Demo to discard all simulated local state.

Data is stored in this browser only under `hallium:study-partners-local-preview:v1`. No production Supabase records or real users are used. Your real Hallium notebook does not yet exist; all prototype notes are fictional.

## Optional AI provider

With **AI_API** or **GROQ_API_KEY** configured in **.env.local**, the mutual-practice generator tries a local-only Groq route with **only the notes both learners intentionally shared**. If no key is available, generation uses a clearly labeled deterministic, note-grounded practice builder. No automatic handwriting, grammar or teaching-ability scoring is claimed. Never commit .env.local or private keys. In production the local AI route responds with 404.

## Test

GitHub Actions `verify-study-partners-local.yml` runs npm ci, builds full Next.js, starts localhost, checks Hallium /, Hangul /hangul, and /study-partners, and checks the AI route in the production-mode build is disabled.
