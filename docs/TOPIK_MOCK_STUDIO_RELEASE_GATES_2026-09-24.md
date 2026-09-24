# TOPIK Mock Studio — gated release checklist (24 September 2026)

## What was shipped
- Four newer TOPIK I question-set **external source links** (83, 91, 96, 102), with separately linked listening and reading PDF, answer key, transcript, MP3 and archive landing page.
- 64th TOPIK I external question-set links, as a further historical round. Seven older TOPIK I and seven older TOPIK II existing practice sheets retained; traced their original PDF links to TOPIK GUIDE's actual archive pages and restored them, rather than trusting fabricated source-page slugs.
- Twenty? No: **19 unique practice sheets** (12 I and 7 II). No claim these are all rights-cleared, full-featured mocks.
- UI marks audio, exact-key scoring and rights pending; previous localStorage keys preserved; responsive end-to-end check expanded; no source PDF or MP3 published to the repo; no original questions copied as in-app text.
- Existing timer / pause / resume / local answer storage / writing textboxes remain. Option sheet is not automatically scored. Existing page source links are external.
- Copyright inquiry to NIIED PBT contact topik@korea.kr sent to **topik@korea.kr** from Sushan's connected account (Gmail message ID `1a0d348250ed8176`); awaiting reply. No permission is presumed.

## Remaining gates (do not falsely label complete)
1. Confirm with NIIED in writing whether Hallium may embed PDFs, present question text/graphics in an interactive UI, host/play recordings and keys, and offer optional monetization. Source archive's permissions do not transfer to Hallium.
2. For 83, 91, 96, 102 and 64, fetch actual MP3 and compare **start, middle and end** with question PDF and script. Check the reported round 102 discrepancy.
3. Audit **every** B-form answer choice and point value for each of the 70 TOPIK I questions; review any anomalies against an independent copy. Do not enable auto scoring before that.
4. Only after permission: extract/QA question text and assets and implement question-by-question interface with synchronized listening. Preserve legitimate copyright markings and source credit.
5. E2E check complete mock and scoring with a reference fixture, screen-reader keyboard controls, iOS/Android and desktop browser playback, quiz expiry and restoration across reload, and save/resume after deploy.
6. Source provider may block PDF iframe, cross-origin audio, or robots. Detect and offer external open link; do not proxy copyrighted media without approval.

The original 2026-09-24 26-round audit is available in the user-uploaded `Hallium_TOPIK_I_recovery_audit.md` (not automatically published in this public GitHub repository).

## Distinct counting
- New post-80 original question sets: 4.
- Older TOPIK I including added 64th: 8.
- Older TOPIK II retained: 7.
- All Hallium practice-response sheets: 19.
- Certified in-app audio/auto-scored full timed exams: **0**.

## Corrections to initial audit
- Early summary erroneously suggested legacy PDF links were invented; browser traces on each TOPIK GUIDE archive page confirm that the existing Google Drive links for rounds 36, 37, 41, 47, 52 and 60, plus 35th public PDFs, do match archive URLs. They have been restored. The resource slug for 41 is `41st`, for 52 `52nd` and so on; generated `41th` links were fixed.
- TOPIK GUIDE's 96th page header says year 2025, but the 26-round audit documents 2024 exam administration. Keep year from official schedule, not a mirror's heading.
