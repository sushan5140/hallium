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

## Book illustration V2 · preserved alternative

The animated V1 is locked at commit `46af1c901d2835549a881212cd72afbc991d213c` on `archive/flashcard-book-v1-locked` and remains live at `/hallium/flashcards/` with its original CSS/JS and local progress key. The alternative `/hallium/flashcards-v2/` keeps the animated card interactions but replaces the ambiguous stacked shape with one unmistakable open hardcover book: facing cream pages with printed lines, spine, visible page thickness, a gold bookmark, and a recognisable hard cover. V2 uses its own local progress key `hallium:flashcard-pilot:book:v2`. Neither preview changes Vercel, Supabase, or the real user's notes. Both are verified independently in Chromium before GitHub Pages publishes.

## Starter Unit 01 — First batch of 12 illustrated vocabulary flashcards

The separate `flashcards-level1/` route on the existing GitHub Pages site covers all 12 words in Hallium's actual Starter Unit 1: Greetings (안녕하세요), Identity (이름, 학생, 친구), Objects (책, 가방, 물, 커피), and Places (학교, 집, 도서관, 카페). Each has a custom meaning-specific, labelled illustration, pronunciation playback, checked Korean example, contrast note, and four practices: picture, Korean-to-meaning recall, listening without visual spoilers, and free-response sentence completion. No MCQs. The book scene is precisely the printed-storybook Book V2 art rather than notebook art; the user sees a separate 책/공책 distinction after revealing.

Learners can choose a category or any of the 12 cards, use previous/next, self-report recall versus needing review, revisit due words, and save a separate local collection. Self-reported recall is deliberately **not** a mastery score. The deck uses its **own** local browser key `hallium:starter-level1:flashcards:v1`; resetting it does not modify the locked one-card V1/V2 preview storage or any production Hallium account. Neither Supabase nor Vercel is touched. To expand beyond 12 or sync real user progress, undertake a separate design/review and production-data integration.

Locked book snapshots: `archive/flashcard-book-v1-locked` and `archive/flashcard-book-v2-locked`. Both original routes remain published. The Pages workflow validates HTML, all JavaScript, both one-card previews, the 12-word deck's meaning-specific visual scenes, mode switching, independent persistence, category navigation, mobile clipping and reduced motion in Chromium before publishing.

### Starter deck visual motion refinement

The original one-card V1/V2 routes stay unchanged. The 12-card Starter route uses a quieter flashcard-specific animation system: a recognisable object/scene remains stable; meaningful details alone move (waving arms for 안녕하세요, a small heart for 친구, slight zipper movement for 가방, water ripples for 물, rising coffee steam for 커피 and 카페, a clock hand for 학교, window warmth for 집, a reading-book page for 도서관, and the printed-book's facing pages for 책). 이름 and 학생 remain intentionally steady so the visual teaches the noun clearly. The first reveal is a short entrance followed by the actual 3-D card flip; large pointer-tilt, generic particles, endless entire-object floating and ornamental shimmer are removed **only** from the 12-card route. Reduced-motion disables these movements. The verified snapshot of the previous Starter deck remains accessible through its commit history.

## Reference-informed Starter card layout · 22 September

KyouStudy screenshots supplied by the user informed the interaction hierarchy (large contextual scene, word and reading audio together, visible meaning, explanation, one natural example and pairing, quick save, bottom two-way self-check). The artwork and UI are Hallium originals and do not reuse KyouStudy's proprietary screenshot photographs or its branding. The default **Learn** mode shows contextual information immediately rather than requiring a flip/MCQ; separate Recall, Listen and Use modes retain a reveal challenge for self-testing. Mobile moves the main card immediately beneath the small header, and keeps the I know this / Learn this buttons visible at the bottom. Corrected 책 is a *printed storybook*, not a blank notebook (공책/노트). GitHub Pages only; no production account writes.


## Public preview Terms & Conditions and Privacy Policy · 22 September 2026

GitHub Pages now publishes `/hallium/terms/` and `/hallium/privacy/`, linked from the Hangul Lab homepage and both locked book cards and the full Starter Unit 1 deck. Policy pages describe the **static GitHub Pages preview only**, including its localStorage keys for practice and writing, browser text-to-speech, Google Fonts and GitHub Pages network requests, deletion, experimental educational limitations, and its distinctness from the signed-in Vercel/Supabase Hallium app. The policy links are in all four entry pages and checked before the Pages publish step. Review and separately tailor the account application's notices before deploying account-based, social or AI features; these preview terms are not a blanket notice for the production app.
