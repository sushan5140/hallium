# Hallium Companion Tracks — source and deployment notes (2026-09-24)

## Two genuinely separate purposes
- **Korean Companion**: the unchanged main Hallium curriculum, 15 units and 76 lessons/checkpoints (unit 1: 6; units 2–15: 5 each). Existing sign-in, existing Google/Supabase-backed progress, review, TTS, flashcards, word map, grammar and conversations remain in place. `/korean-companion` forwards to `/?view=companion`, and `/companions` offers a route choice.
- **TOPIK Companion**: original, separate `/topik-companion` course with 12 TOPIK I and 10 TOPIK II lessons: 110 vocabulary cards and 44 grammar patterns, 7 Hallium-authored checks per lesson, original examples, local browser progress, review queue and optional countdown for learner-entered exam date. No TOPIK official score or probability claim.

## Scope of paper audit in this pass
- Read searchable pages from **each** of the original user's seven TOPIK I (35, 36, 37, 41, 47, 52, 60) and seven TOPIK II (same rounds) sets in the two user-provided compiled PDFs (their cover, listening, reading, and II writing sections). Automated scan covers every page in each selected range, used only to suggest **candidate task topics and grammar**, not to produce purported exact term frequencies.
- Validated exam formats, booklet status, source links, and sample reading items in the **four** newer TOPIK I sets 83, 91, 96, 102, using the uploaded 26-round source audit and publicly viewable 83/91/96/102 question PDF page samples. Did **not** have a full local text extract or item-by-item review of all four newer PDFs; their labels are explicitly SAMPLE INSPECTED. Avoid inventing per-round word frequency claims.
- Additional 64th TOPIK I paper is linked in the mock catalog but was **not** part of either owner compiled PDF and was **not** mined for word frequencies here.

## What “paper-based” means in lesson copy
The learning objectives reflect observed types of tasks: TOPIK I basic meaning and topic matching, prices/counting, notices, daily schedules, passage connectors, intent/purpose; TOPIK II more formal reading, headlines, reporting, comparisons, explanation and writing 51–54. This is not a complete official NIIED lesson list. The copied examination passages, illustrated items, MP3 and full answer keys are **not** in these lessons.

## Nonnegotiable limitations
- A Korean vocabulary word and grammar pattern as short linguistic facts can inform original instruction; do not copy whole question passages, answer lists, illustrations, MP3 or scripts into public course content without explicit rights clearance.
- Source labels list relevant **theme evidence** and do not assert that each listed item appeared in every cited examination. A broad keyword in a machine scan is not accurate individual question or frequency attribution.
- Hallium's generated mini-check questions are original **course quizzes**, not scored authentic TOPIK tests.
- 83/91/96/102 original MP3 content and complete answer keys remain pending separate verification and NIIED authorization, as documented in `docs/TOPIK_MOCK_STUDIO_RELEASE_GATES_2026-09-24.md`.

## Local persistence
TOPIK Companion uses `hallium:topik-companion:v1`, never any key used by the existing Korean curriculum or `hallium:topik-pbt-mocks:v1`. Switching paths must not reset pre-existing answers.
