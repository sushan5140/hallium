# Hangul Lab · Hallium preview

An independent, original static Hangul learning prototype, styled with the Hallium V4 design language. The Hallium Next.js production branch is untouched.

This preview includes all 40 modern Hangul letter signs (14 basic consonants, 5 tense consonants, 10 basic vowels, 11 compound vowels); a searchable letter library; sample-syllable browser audio; a consonant + vowel syllable builder; 10-question mixed recognition/listening rounds; flashcards; and local-only progress.

**GitHub Pages preview:** https://sushan5140.github.io/hallium/

**Publishing:** Go to this repository's Settings → Pages → Build and deployment → Source → **GitHub Actions**. The `hangul-lab-preview` branch's workflow will publish only these static files to Pages. This does not change the Vercel production branch, its domain, or Supabase.

**Source:** HTML, CSS and JS are extracted as editable root files during the first workflow run. No Node/npm, API keys, auth, or database are required for the GitHub Pages preview. Device-only progress can be reset from the learning interface.

**Caveat:** Browser speech quality and Korean voice availability vary by device. Romanization is a hint, not a substitute for native recordings.

Review and lock the design and lessons before integrating into Hallium on Vercel.
