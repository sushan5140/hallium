# Hallium | Post-80th TOPIK I past-paper provenance audit
Date: 2026-09-24
Scope: genuine released TOPIK I paper-based sessions **after** the 80th (round >= 81); count distinct sessions, not individual audio/reading/writing pages.

## Decision
Only four distinct post-80 rounds appear in the cross-checked released-paper indexes: **83 (2022), 91 (2023), 96 (2024), 102 (2025)**. This is **four exam sessions**, not 15-20. PDF mirrors do not turn one exam into more exams. Do not invent rounds. Source publication date can differ from date of examination (102 was made available on TOPIK GUIDE April 18, 2026).

Authority triangulation:
- TOPIK GUIDE published released-paper index: https://www.topikguide.com/previous-papers/
- Japanese Korean study archive of TOPIK's past released papers: https://kajiritate-no-hangul.com/KENTEI/TOPIK_data.html
- KoreanTopik archive explicitly marks other later rounds NON-PUBLIC: https://www.koreantopik.com/2018/07/download-topik-tests-pdf-audio-answer.html
- Konkuk University Language Institute 91st TOPIK I original booklet/key/audio post: search result title `2023년도 제91회 TOPIK I (PBT) 기출문항` (Konkuk University; the exact public permalink needs verification because the university site may redirect to SSO).
- NIIED format: https://niied.go.kr/web/niied/contents/niied_topik

## Candidate evidence (do not activate automatically)

| Round | PDF reading | PDF listening | Answer sheets | Audio/transcript | Source-round audit |
|---|---|---|---|---|---|
| 102 / 2025 | PDF opened, 19 pages; cover identifies NIIED + 102 + TOPIK I B | PDF opened, 10 pages; NIIED + 102 + TOPIK I B | reading and listening PDFs opened, 1 page each; correct round/level | Audio URL found, not listen-verified. A July 27, 2026 comment reports audio/transcript mismatch: **must compare before enabling audio/scoring** | authentic exam booklet verified; asset matching pending |
| 96 / 2024 | PDF opened, 17 pages; questions 31-70 | PDF opened, 8 pages; questions 1-30 | 2-page combined PDF opened, correct round/level | Transcript PDF opened; audio is an external Google Drive link, playback unverified. A site comment concerns 96 TOPIK **II** audio; not evidence of TOPIK I mismatch. | authentic released question files found; full media QA pending |
| 91 / 2023 | PDF opened, 17 pages; questions 31-70 | PDF opened, 9 pages; questions 1-30 | both 1-page key PDFs opened | Transcript PDF opened; MP3 route found, playback unverified. Published 91st files corroborated by a Korean university. | authentic released question files found; full media QA pending |
| 83 / 2022 | PDF opened, 17 pages; questions 31-70 | PDF opened, 8 pages; questions 1-30 | reading and listening key PDFs opened; spot-check reading Q31=② on PDF and key | transcript PDF opened; MP3 route found, playback unverified. Some archive comments allege errors; each key must be cross-checked | authentic released question files found; full media QA pending |

Evidence source pages:
- 102: https://www.topikguide.com/download-102nd-topik-test-papers/
- 96: https://www.topikguide.com/download-96th-topik-test-papers/
- 91: https://www.topikguide.com/download-91st-topik-test-papers/
- 83: https://www.topikguide.com/download-83rd-topik-test-papers/

Confirmed PDF example (102 TOPIK I):
https://files.topikguide.com/test-papers/102nd-TOPIK-I-Listening-Test-Paper.pdf
https://files.topikguide.com/test-papers/102nd-TOPIK-I-Reading-Test-Paper.pdf
https://files.topikguide.com/test-papers/102nd-TOPIK-I-Listening-Answers.pdf
https://files.topikguide.com/test-papers/102nd-TOPIK-I-Reading-Answers.pdf

## Exclusions
- 81-82, 84-90, 92-95, 97-101, 103+ (as of audit): not verified as *publicly released full TOPIK I original PBT booklets with matching keys and audio* by cross-checked archives. This is a lack of evidence, **not** a claim the exams never took place. 80 is not after 80.
- 99, 100, 105: internet articles include TOPIK II writing reconstructions or TOPIK I post-exam `回忆版` memories/answer commentary. No verified complete released TOPIK I booklet found. Reject as authentic full-paper additions.
- TOPIK II writing-only, paid publishers' `모의고사`, TOPIK Basic sample tests, EPS-TOPIK: not TOPIK I original full-paper evidence.

## Existing Hallium source catalog warning
The older 14-mock code `app/topik-mocks/papers.js` previously inserted Google Drive URLs and reconstructed round-based TOPIK GUIDE slugs without testing each URL. Some ordinals were incorrectly generated (e.g. `52th`, `41th`). Treat its provider URLs and third-party PDFs as **unverified until individually audited**. Passing Next.js/Chromium UI tests establishes interface function, not exam-source provenance.

**Release gate**: Import only after user previews this audit. For the four authentic candidate rounds, the PDF question sheets qualify as real historical material, but mark listening/audio verification PENDING until human content comparison; no automatic correct-answer scoring based on mismatched/unverified media.
