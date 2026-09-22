# Hallium Hangul Lab · Preview 03

A self-contained static learning prototype for the 40 modern Hangul letters, inspired by Hallium's visual language. The existing Next.js production branch and Vercel site are untouched.

**GitHub Pages:** https://sushan5140.github.io/hallium/

## Complete beginner workflow

1. Learn letters in six focused groups: 10 core consonants, 4 aspirated consonants, 5 tense consonants, 6 core vowels, 4 Y-vowels, 11 compound vowels (40 unique letters altogether).
2. Read and hear sample syllables, build consonant + vowel syllable blocks, and practise sound recognition in a selected group or across all 40.
3. Review selected group flashcards and mark recognized letters.
4. Open **Writing studio** to practise every letter, sample syllables, words and short phrases (including 안녕, 한글, and 어떻게 지내요? / How are you?).
5. Trace the faint guide or switch to free writing. Mouse, touchscreen and stylus are supported. Undo, clear, replay sound, save your attempt on this device, or export an image. Switching back to a saved target restores its most recent local attempt.

Progress for explored/recognized/written letters and scores is stored locally in the browser. Handwriting attempts are explicitly **not AI graded**, and the tracing guide is not a certified stroke-order reference; compare visually with the Korean glyph. Browser speech depends on an available Korean system voice, and romanization is only a guide.

## GitHub Pages deployment

The `hangul-lab-preview` branch publishes the root static files `index.html`, `styles.css`, `app.js`, `writing.js` through `.github/workflows/pages.yml` and verifies both scripts before deploying.

No npm, server, API key, login or database is needed for this preview. When this version is approved, selectively integrate the design/learning flows into the independent Hallium Vercel project on `main`; do not copy prototype-local storage over user data.

## Level 1 Flashcard Studio · single-card pilot

The existing GitHub Pages deployment now publishes `flashcards/` at https://sushan5140.github.io/hallium/flashcards/ without touching production Vercel or the original Hangul Lab. Pilot card: **책 — book** from Starter Unit 1 / Everyday objects, including an illustrated reveal card, Korean voice via the browser's Korean speech voice, example sentence, pronunciation note, honest recall self-check, one-card local review schedule, and saved collection. `flashcards/` is static: no Google sign-in, Supabase access, remote tracking, AI billing, or changes to actual learner records. Test the single card before expanding the original Starter vocabulary set. All pilot history is stored under `hallium:flashcard-pilot:book:v1` on this device only; the reset button clears only that key.
