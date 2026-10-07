# Hallium — Complete Continuation / Security Audit Handoff

**Project:** Hallium  
**Repository:** `sushan5140/hallium`  
**Production:** `https://hallium.vercel.app`  
**Current phase:** Post-Batch-2 security + completeness audit  
**Date:** 2026-10-03  
**Status:** Batch 1 ✅ / Batch 2 ✅ / Security closure audit 🔄 in progress

---

## 0. Purpose

This is the full continuation handoff for the current Hallium work. It records:

- what was planned,
- what was implemented,
- database/security changes,
- CI and browser verification,
- bugs and failed approaches,
- exact commits,
- the current security audit,
- gaps already found,
- gaps not yet patched,
- and the exact next execution order.

Another ChatGPT / Claude / Codex session should be able to continue from this file without guessing.

---

# 1. Original batch plan

## Batch 1
- **H-P1** — Account-level preferred Korean voice + remembered speed
- **H-P2** — Official TOPIK paper ingestion + provenance foundation

## Batch 2
- **H-P3** — TOPIK question / answer / audio / scoring pipeline
- **H-P4** — Private Curriculum/Admin Studio

## Batch 3
- **H-P5** — Final Hallium closure audit:
  - native-Korean/content QA
  - curriculum QA
  - responsive/device QA
  - auth/cloud sync QA
  - voice regression
  - TOPIK integration QA
  - security/abuse audit
  - final production closure

---

# 2. Batch 1 — COMPLETE ✅

## H-P1 — Account-level Korean voice preference

### Goal
One Korean voice preference should follow the learner account instead of every Hallium page selecting its own browser TTS voice.

### Final behavior
Hallium now stores:
- preferred `voiceURI`
- voice name
- speaking rate
- update timestamp

Fallback order:
1. exact `voiceURI`
2. matching name
3. preferred Korean provider voice
4. local Korean voice
5. first available Korean voice

### Database
Migration:
`supabase/migrations/20261002000100_voice_preferences.sql`

Production table:
`public.hallium_voice_preferences`

Fields:
- `user_id`
- `voice_uri`
- `voice_name`
- `rate`
- `updated_at`

Security:
- RLS enabled
- signed-in user can only read/write own row
- `user_id = auth.uid()`

Applied to production Supabase project:
`liyhjtyadbeozwjtrqqr`

### Shared voice module
File:
`lib/korean-voice.js`

Important exports:
- `DEFAULT_KOREAN_VOICE_PREFERENCE`
- `clampKoreanRate()`
- `normalizeVoicePreference()`
- `readLocalVoicePreference()`
- `writeLocalVoicePreference()`
- `koreanVoices()`
- `resolveKoreanVoice()`
- `speakKoreanText()`
- `newerVoicePreference()`

`newerVoicePreference()` prevents older cloud/local data from blindly overwriting newer state.

### Main Hallium integration
File:
`app/page.js`

Added:
- voice preference state
- local hydration
- cloud hydration
- timestamp merge
- account sync
- preview voice
- shared preference across Hallium speaking helpers

Affected:
- normal Korean playback
- vocab playback
- syllable practice
- contrast drills
- grammar chunks

Slow-practice controls still multiply the base account speed instead of replacing it.

### Profile UI
Added **Korean voice** panel:
- Korean voice selector
- auto fallback
- pace slider
- sync state
- preview button

Styles:
`app/globals.css`

### TOPIK Companion
File:
`app/topik-companion/TopikCompanion.jsx`

It now:
- reads local preference
- reads account preference when signed in
- merges local/cloud state
- uses shared speech helper
- exposes current base rate

---

## H-P2 — TOPIK ingestion + provenance foundation

### Goal
A URL existing must never imply:
- official release
- matching answer key
- matching audio
- redistribution rights
- valid auto scoring

### Provenance module
File:
`lib/topik/provenance.js`

Release states:
- `OFFICIAL_RELEASED`
- `LEGACY_ARCHIVE`
- `RECONSTRUCTED`
- `PRACTICE`
- `NO_RELEASE_EVIDENCE`

Asset states:
- `VERIFIED`
- `STRUCTURE_VERIFIED`
- `LINKED_UNVERIFIED`
- `PENDING`
- `BLOCKED`
- `MISSING`

Rights states:
- `PERMISSION_GRANTED`
- `LINK_ONLY`
- `PENDING`

### Structure validation
TOPIK I:
- Listening 30
- Reading 40

TOPIK II:
- Listening 50
- Writing 4
- Reading 50

Wrong structure => quarantine.

### Structured audit registry
Explicitly represented:
- 83-I
- 91-I
- 96-I
- 102-I
- 64-I

Important:
`102-I` audio is `BLOCKED` because a reported audio/transcript mismatch remains unresolved.

### Fail-closed ingestion
File:
`lib/topik/ingestion.js`

Candidate requires:
- round
- level
- PBT format
- canonical HTTPS source
- release classification
- valid section structure

Calculates:
- structure issues
- catalog eligibility
- activation eligibility
- quarantine/record decision

Does **not** auto-enable:
- scoring
- embedded audio
- reproduced question content

### Activation rules
Auto scoring requires:
1. official released paper
2. verified/structure-verified booklet
3. verified exact answer key
4. compatible rights

Embedded audio requires:
1. official released paper
2. verified matched audio
3. compatible rights

Question reproduction requires:
- compatible permission

### Catalog integration
File:
`app/topik-mocks/papers.js`

The raw catalog is now provenance-enriched and audited.

### Mock Studio
File:
`app/topik-mocks/MockStudio.jsx`

Visible gate fields:
- Release
- Booklet
- Answer key
- Transcript
- Audio
- Rights

Activation states:
- `LINK_ONLY`
- `QUARANTINED`
- etc.

### Documentation
File:
`docs/TOPIK_INGESTION_PIPELINE_2026-10-02.md`

---

# 3. Batch 1 failures and fixes

## Failure 1 — SSR looked ready before React hydration
Browser QA clicked a visible SSR-rendered paper before React had fully hydrated.

Result:
- click lost
- detail view did not change
- assertions failed

Fix:
- added `data-client-ready="true"` after mount
- browser test waits for that signal

## Failure 2 — dedicated workflow used `next dev`
The new workflow used `npm run dev`, but Hallium’s proven QA uses:
- `npm run build`
- `npm run start`

In CI, SSR worked but client hydration under dev/Turbopack was unreliable.

Fix:
- changed dedicated TOPIK QA to production build/start

### Dedicated workflow
`.github/workflows/verify-topik-provenance.yml`

Pattern:
1. checkout
2. `npm ci`
3. `npm run build`
4. install Playwright Chromium
5. `npm run start`
6. wait for `/topik-mocks`
7. run browser assertions

### Batch 1 closing commit
`babf98957b2f3e3dea3ec5851269fea24cf2d3a9`

Verified:
- Next.js build ✅
- full Hallium browser verification ✅
- dedicated TOPIK Chromium QA ✅
- Supabase RLS check ✅
- Vercel production READY ✅
- live `/topik-mocks` HTTP 200 ✅

---

# 4. Batch 2 — COMPLETE ✅

## H-P3 — TOPIK question / answer / audio / scoring engine

### Goal
Create a real question-level engine while keeping all real unaudited papers fail-closed.

### Engine
File:
`lib/topik/exam-engine.js`

Supports:
- stable question IDs
- section-aware manifest
- TOPIK display numbering
- answer-key validation
- point-map validation
- total score
- section scores
- correct/incorrect/unanswered
- percentage
- key-bundle version
- verification timestamp
- source metadata
- audio-bundle validation
- per-question audio cues

### IDs
Examples:
- `L1`
- `L2`
- `R1`
- `R2`

TOPIK I reading still displays 31–70 while internal IDs stay section-local.

### Scoring bundle requirements
- matching `paperId`
- version
- verified timestamp
- HTTPS source
- exact answer coverage
- answer values 1–4
- positive points
- no unexpected entries

### Scoring status
If provenance disallows scoring:
`status: "locked"`

If bundle malformed:
`status: "invalid"`

If valid:
returns:
- earned
- possible
- percent
- correct
- incorrect
- unanswered
- sections
- bundle version
- source
- verified timestamp

### Audio bundle
Requires:
- matching paper
- version
- verified timestamp
- HTTPS source
- listening-only question IDs
- valid start/end
- HTTPS audio source

Question audio only resolves when provenance allows embedded audio.

### Synthetic verified fixture
Test:
`tests/topik-exam-engine.test.mjs`

Covers:
- manifest generation
- display numbering
- complete key coverage
- scoring totals
- unanswered handling
- provenance override
- verified audio
- audio lock behavior

### Mock Studio integration
Locked production papers show:
- `Auto scoring · locked`
- `Question audio · locked`
- mapped response-field count
- score bundle unavailable
- audio map unavailable

After submit:
- answers remain saved
- no fake score
- provenance reason shown

Future verified papers can show:
- overall score
- section scores
- correct/incorrect/unanswered
- percentage
- verification metadata
- verified question audio

---

## H-P4 — Private Curriculum Admin Studio

### Goal
Use Hallium’s actual live curriculum instead of copying data into a second admin system.

### Existing admin system reused
`public.admin_users`

No second admin identity mechanism was added.

### Admin state table
Migration:
`supabase/migrations/20261003000100_curriculum_admin_studio.sql`

Table:
`public.hallium_curriculum_admin_state`

Stores:
- `saved_items`
- `lesson_notes`
- `qa_flags`
- `updated_at`

RLS requires:
1. signed in
2. row belongs to current user
3. current user exists in `admin_users`

### Audit helper
File:
`lib/curriculum/admin.js`

Functions:
- `lessonCoverage()`
- `curriculumAudit()`
- `teachingItemFromStep()`

Coverage checks:
- word
- explain
- choice
- listening
- shadowing
- dictation
- reading
- build
- finish

### Tests
`tests/curriculum-admin.test.mjs`

Covers:
- full lesson coverage
- gap detection
- saved-item provenance

### Hallium shell integration
File:
`app/page.js`

Admin-only shortcut:
`Curriculum Admin ↗`

### Admin Studio capabilities
- live units
- live lessons
- checkpoints
- vocabulary count
- grammar count
- assessment count
- listening
- dictation
- shadowing
- build/production
- gap detection
- search
- filter gaps/checkpoints/approved
- preview lesson
- jump to first assessment
- private notes
- QA state
- saved teaching item bank

QA states:
- Needs review
- Native Korean review
- Needs fix
- Approved

### Saved Teaching Bank
Can save:
- vocabulary
- grammar
- choices
- listening
- dictation
- reading
- build

Preserves:
- unit
- lesson
- kind
- payload
- timestamp

### Styling
File:
`app/globals.css`

Uses Hallium’s paper/indigo/jade/papaya/sun language instead of generic SaaS admin styling.

---

# 5. Batch 2 QA / bug fix

## Regression mismatch
Existing browser assertion expected:
`Embedded audio · locked`

New UI intentionally says:
`Question audio · locked`

The safety state remained correct.

Fix:
updated shared assertion.

### Dedicated workflow
`.github/workflows/verify-halium-batch2.yml`

Checks:
1. locked dependencies
2. TOPIK engine tests
3. curriculum helper tests
4. admin guard presence
5. Next.js build
6. Playwright
7. production-mode TOPIK exercise

Also watches:
`.github/scripts/verify-topik-mocks.cjs`

### Batch 2 closing commit
`ce93e8f148b31a08ae9b2180494e51e0cf18fe5d`

Verified:
- TOPIK engine tests ✅
- curriculum helper tests ✅
- admin guard checks ✅
- full Next.js compile ✅
- TOPIK Chromium QA ✅
- full Hallium regression ✅
- research regression ✅
- Supabase RLS advisor check ✅
- Vercel production READY ✅

---

# 6. CURRENT WORK — security + completeness audit 🔄

User requested a closure audit focused especially on security.

Audit layers:

## A. Admin Studio access control
Checking:
- route behavior
- admin resolution
- RLS
- privileges
- write surface
- JSON size limits

## B. TOPIK fail-closed behavior
Checking:
- accidental future activation
- boolean/state mismatch
- rights/key/audio bypass

## C. Existing Supabase security advisories
Checking:
- `SECURITY DEFINER`
- EXECUTE grants
- anon exposure
- internal helper exposure
- RLS recursion helpers

## D. Hallium server/API routes
Auditing:
- `/api/audit`
- `/api/intelligence`
- `/api/ai-twins/guides/chat`
- `/api/ai-twins/meet`
- `/api/study-partners/practice`

Focus:
- auth
- same-origin
- body limits
- rate limits
- ownership
- prompt injection
- secret/key handling
- cross-user access
- abuse/DoS

---

# 7. Security checks already completed

## Admin policies inspected

### `admin_users`
Confirmed:
- self-only authenticated SELECT
- anon explicit deny

### `hallium_curriculum_admin_state`
Policies exist for:
- SELECT
- INSERT
- UPDATE
- DELETE

Each requires:
- own row
- existing admin membership

This is secure from cross-user reads, but DELETE is broader than the product needs.

---

# 8. GAPS FOUND — NOT ALL PATCHED YET ⚠️

This section is critical. These were discovered during the current audit and were **not yet all patched** when this handoff was requested.

## S1 — unnecessary DELETE capability
The app never deletes the admin-state row, but DB grants/policies currently include DELETE.

This is not an auth bypass, but violates least privilege.

### Planned fix
- drop DELETE policy
- revoke DELETE
- keep SELECT / INSERT / UPDATE only

**Status:** found, not yet patched

---

## S2 — explicit anon/public revocation
The admin-state table should explicitly revoke privileges from:
- `anon`
- `PUBLIC`

Even though RLS already protects it, explicit revocation makes the intent durable.

**Status:** found, not yet patched

---

## S3 — direct `?view=admin` accepted before membership resolves
The client `allowedViews` contains `admin`.

A non-admin can manually navigate to:
`/?view=admin`

Current protection:
- component denies content
- Supabase RLS blocks data

So there is no confirmed private data leak.

But the client should fail closed too.

### Planned behavior
- wait for auth/admin resolution
- if not admin, immediately fall back to normal Hallium view
- retain component denial as defense in depth

**Status:** found, not yet patched

---

## S4 — internal SECURITY DEFINER helpers directly executable by authenticated users
Live DB inspection confirmed:

- `hallium_partner_can_view(uuid)`
- `hallium_partner_is_active(uuid)`
- `hallium_partner_request(uuid)`
- `hallium_partner_respond(uuid,text)`
- `hallium_twin_decide(uuid,boolean)`
- `hallium_twinverse_status()`

All have:
- `SECURITY DEFINER`
- `search_path = ''`
- anon EXECUTE false
- public EXECUTE false
- authenticated EXECUTE true

Action RPCs legitimately need authenticated EXECUTE:
- request
- respond
- twin decide
- twinverse status

But helper functions:
- `hallium_partner_can_view`
- `hallium_partner_is_active`

appear internal to RLS/policies and may not need direct user execution.

### Planned hardening
Potentially revoke authenticated EXECUTE from the two helpers **only after regression testing proves policy evaluation remains valid**.

Do not apply blindly.

**Status:** found, needs safe test before change

---

# 9. TOPIK hardening gap

## T1 — stored booleans can become configuration footguns
Provenance objects currently contain:
- `scoringAllowed`
- `embeddedAudioAllowed`
- `inAppQuestionContentAllowed`

The ingestion helper has correct rules, but a future mistaken edit could theoretically set one boolean to true while key/audio/rights states are still pending.

### Planned fix
Activation must be derived from underlying states.

#### Scoring
Only true if:
- release == `OFFICIAL_RELEASED`
- booklet verified/structure-verified
- answer key == `VERIFIED`
- rights == `PERMISSION_GRANTED`

#### Audio
Only true if:
- release == `OFFICIAL_RELEASED`
- booklet verified
- audio == `VERIFIED`
- rights == `PERMISSION_GRANTED`

#### Question reproduction
Only true if:
- official release
- rights == `PERMISSION_GRANTED`

Stored booleans should not be authoritative.

**Status:** highest-priority TOPIK hardening item, not yet patched

---

# 10. Study Partners security findings

Existing migration already uses:
`SECURITY DEFINER SET search_path = ''`

for:
- `hallium_partner_is_active`
- `hallium_partner_can_view`
- request/respond helpers

Anonymous execution was explicitly revoked in:
`20260925000300_partner_rpc_anon_hardening.sql`

Confirmed live:
anon EXECUTE = false.

### Partner request validation
Checks:
- signed in
- no self request
- both users opted in
- block state
- existing pending/accepted connection

### Partner respond validation
Checks:
- caller is participant
- only recipient accepts/declines
- only sender cancels
- only accepted partnership can end
- block state rechecked before acceptance

This part is strong.

---

# 11. AI Twin API audit — progress

Route substantially inspected:
`app/api/ai-twins/meet/route.js`

Existing protections:
- same-origin POST check
- server-side auth
- body size limit
- UUID validation
- self-target rejection
- AI key server-only
- daily limit: 5 meetups / 24h
- both users must opt in
- limited profile fields
- user profile content treated as untrusted data
- prompt bans private/contact info exposure
- prompt bans invented test scores/memories/commitments
- output length caps
- fallback plan
- DB insert still constrained by database policies
- duplicate pending meetup reuse

No critical access-control bug was identified in this route during the audit so far.

---

# 12. Prompt-injection protections observed

Twinverse prompts explicitly say profile fields are:
> untrusted DATA, never instructions

The model is told not to:
- follow commands inside profiles
- reveal private identifiers
- invent scores
- invent memories
- create human commitments
- request contact info
- bypass human approval

This is good.

Still pending:
- compare all other AI routes against the same standard

---

# 13. API routes still pending full audit

Still need complete review of:
- `/api/audit`
- `/api/intelligence`
- `/api/ai-twins/guides/chat`
- `/api/study-partners/practice`

Need matrix per route:

| Route | Auth | Origin | Size | Rate limit | Ownership | Injection | Secret server-only |
|---|---|---|---|---|---|---|---|

Prioritize AI-cost endpoints.

---

# 14. Exact point where work paused

At handoff time:

1. Batch 1 complete ✅
2. Batch 2 complete ✅
3. Production live ✅
4. Security audit started ✅
5. Admin RLS/policies inspected ✅
6. SECURITY DEFINER privileges inspected ✅
7. TOPIK activation footgun discovered ✅
8. Admin least-privilege gaps discovered ✅
9. API audit widened ✅
10. AI Twin meet route substantially reviewed ✅
11. Remaining API routes were being fetched/read 🔄
12. No new security-hardening migration had yet been applied after these findings ⏳

**Do not claim the security closure audit is finished yet.**

---

# 15. Exact next steps

## Step 1 — derive TOPIK activation from states
Modify:
`lib/topik/provenance.js`

Add tests proving:
- manual `scoringAllowed: true` cannot unlock pending key
- verified key + pending rights stays locked
- verified audio + pending rights stays locked
- all required states unlock in synthetic fixture

This is first priority.

## Step 2 — least-privilege Admin Studio migration
Create a hardening migration, e.g.:
`20261003000200_curriculum_admin_hardening.sql`

Do:
- drop DELETE policy
- revoke DELETE
- explicitly revoke anon/public
- regrant only SELECT/INSERT/UPDATE to authenticated

Do not delete existing data.

## Step 3 — fail-closed client admin route
In:
`app/page.js`

If requested view is admin:
- wait for auth/admin resolution
- if not admin => normal Hallium route
- keep component denial too

## Step 4 — evaluate helper RPC EXECUTE safely
Potentially revoke authenticated EXECUTE from:
- `hallium_partner_can_view(uuid)`
- `hallium_partner_is_active(uuid)`

Only after testing:
- discovery
- room access
- shared notes
- messages
- sessions
- block handling

If it breaks policy execution, retain grants and document why.

## Step 5 — finish API audit
Review all AI/server routes for:
- auth
- same-origin
- request size
- per-user rate limit
- ownership
- prompt injection
- secret handling
- cross-account data leakage

## Step 6 — add security regression tests
TOPIK:
- no real pending key can score
- no blocked/pending audio can play
- rights gate cannot be bypassed

Admin:
- non-admin admin-route fallback
- no DELETE expected
- RLS/admin membership requirement

API:
- unauthenticated rejects
- oversize rejects
- malformed ID rejects
- cross-origin rejects where applicable

## Step 7 — rerun Supabase advisors
Run:
- security advisor
- performance advisor

Separate:
- new warnings
- legacy warnings

Do not claim legacy warnings fixed unless actually fixed.

## Step 8 — full production regression
Run:
- full Hallium build
- general browser regression
- TOPIK provenance workflow
- Batch 2 workflow
- Study Partners production workflow
- Twinverse tests
- Curriculum Admin tests
- voice behavior
- Vercel READY
- live route sanity checks

---

# 16. Batch 3 / H-P5 after security closure

## Native-Korean QA
Review:
- awkward translations
- unnatural Korean
- honorific consistency
- particles
- beginner grammar explanations
- pronunciation/romanization reliance
- example sentences

## Curriculum QA
Use Admin Studio filters:
- coverage gaps
- native review
- needs fix
- checkpoints

Distinguish intentional omissions from real missing stages.

## Device QA
Desktop:
- 1440

Tablet:
- ~800–1024

Mobile:
- ~390

Check:
- no overflow
- touch targets
- input zoom
- bottom nav overlap
- admin layout
- TOPIK question usability

## Auth/cloud QA
Test:
- signed out
- new account
- old account
- stale local state
- local newer than cloud
- cloud newer than local
- sign out/in
- second browser/device

Especially:
- voice preference
- learner progress
- admin state
- Study Partners

## Voice QA
Test:
- no Korean voices
- one voice
- many voices
- selected voice absent on second device
- rate persistence
- slow-practice multiplier
- TOPIK Companion reuse

## TOPIK QA
Confirm:
- no unverified scores
- no blocked audio
- links work
- answers persist
- submit/reset
- verified synthetic fixture
- mobile flow

---

# 17. Things NOT to do

Do not:
- mark pending TOPIK assets verified just to complete UI
- trust third-party key links for scoring
- embed unmatched audio
- duplicate Hallium curriculum into another admin dataset
- add a second admin identity system
- use hidden links as security
- weaken RLS
- remove block/consent protections
- expose AI keys client-side
- bypass Twinverse human approval
- weaken CI because UI “looks fine”

---

# 18. Current production state

Production:
`https://hallium.vercel.app`

TOPIK Mock Studio:
`https://hallium.vercel.app/topik-mocks`

Known good Batch 2 closing commit:
`ce93e8f148b31a08ae9b2180494e51e0cf18fe5d`

Batch 1 closing commit:
`babf98957b2f3e3dea3ec5851269fea24cf2d3a9`

---

# 19. Current tracker

## Batch 1
- H-P1 Voice preference ✅
- H-P2 TOPIK ingestion/provenance ✅

## Batch 2
- H-P3 TOPIK scoring/audio engine ✅
- H-P4 Curriculum Admin Studio ✅

## Security closure audit
- admin RLS inspection ✅
- SECURITY DEFINER privilege inspection ✅
- TOPIK activation hardening gap found ✅
- admin least-privilege gap found ✅
- client admin route gap found ✅
- API route audit 🔄
- hardening migrations ⏳
- security regression suite ⏳
- final advisors ⏳

## Batch 3
- H-P5 final Hallium closure ⏳

---

# 20. Continuation instruction for the next agent

Continue from **security closure**, not feature development.

Priority:
1. derive TOPIK activation from verified states
2. remove unnecessary Admin Studio DELETE privilege
3. explicitly revoke anon/public access
4. fail closed on direct non-admin `?view=admin`
5. finish API audit
6. safely test internal helper EXECUTE revocation
7. add security regression tests
8. rerun Supabase advisors
9. rerun all production workflows
10. only then start H-P5

Do not reopen Batch 1 or Batch 2 architecture unless a real regression proves a problem.

---

# 21. Current confidence

**Batch 1 / Batch 2 feature completeness:** high  
**Current data-access baseline:** strong due to RLS/admin membership  
**Security closure:** not finished  
**Critical confirmed data leak:** none found so far

Main remaining risks:
- TOPIK activation config footgun
- unnecessary DB privilege
- client admin route presentation not fully fail-closed
- incomplete API-route abuse review
- possible overexposure of internal SECURITY DEFINER helpers

---

# 22. Live continuation update — 2026-10-03 (security closure resumed)

This section supersedes older "not yet patched" statuses where the live repository/database has moved forward.

## Verified repo/database drift since the original handoff

The original handoff was accurate at capture time, but later work had already landed before security closure resumed:

- `supabase/migrations/20261003000200_security_hardening.sql` is present and applied.
  - Curriculum Admin DELETE policy/grant removed.
  - explicit anon/public revocation applied.
  - admin JSON constraints added.
  - authenticated AI request quota table added for audit/intelligence endpoints.
- `supabase/migrations/20261003000300_move_partner_rls_helpers_internal.sql` is present and applied.
  - RLS-only partner helper functions moved to `hallium_internal`.
  - old public helper functions dropped.
  - Study Partner/Twin policies now call internal helpers.
- `app/hallium-core.js` now owns the full Hallium application shell after the guest-mode entry split.
  - URL `allowedViews` does not include `admin`.
  - admin content still independently checks `adminAccess`.
  - direct `?view=admin` therefore fails closed at the URL-routing layer as well as the component/data layers.
- Guest reviewer mode and `hallium_guest_entries` analytics also landed after the original handoff.

## TOPIK activation hardening — completed in this continuation

Problem:
Legacy provenance objects still carried `scoringAllowed`, `embeddedAudioAllowed`, and `inAppQuestionContentAllowed` booleans. They were acting as an additional authority rather than merely historical metadata.

Changes:
- `lib/topik/provenance.js`
  - activation is now derived only from release/asset/rights states plus structure validity.
  - added `deriveTopikActivationFlags()` as the single testable derived gate.
  - stored legacy activation booleans are non-authoritative.
- Added `tests/topik-provenance.test.mjs`.
- Batch 2 CI now runs the provenance regression suite.

Regression cases added:
- manual `scoringAllowed: true` cannot unlock a pending answer key.
- verified key + pending rights remains locked.
- verified audio + pending rights remains locked.
- fully verified synthetic states unlock even when legacy booleans are false.
- structure errors fail closed.

Commits:
- `55679feb5fff0cbbb063c34afe01fe766b957d8c`
- `2d4b6e3bb89f7c6c911138c5bdb9e0a806e65ed7`
- `8fb57c66306390b030643ab6c81b3b7df562b624`
- `f1a6180f1a653d125d3a27ce1e51bb12913e3eef`

## Batch 2 CI shell-split repair

Recent Guest Mode work moved the main Hallium application from `app/page.js` into `app/hallium-core.js`, leaving Batch 2 security grep assertions pointed at the old shell.

Updated `.github/workflows/verify-halium-batch2.yml` to:
- watch `app/hallium-core.js`,
- check `admin_users`, `hallium_curriculum_admin_state`, and `adminAccess` in the real application file,
- assert that the URL allowlist does not expose `admin`.

Commit:
- `6c1e35c3e4788056416f3b3d1aed147455f0ecfb`

## Curriculum Admin final least-privilege pass

Live inspection showed the earlier hardening had already removed authenticated DELETE and anon access, but default table grants still left authenticated with unnecessary:
- REFERENCES
- TRIGGER
- TRUNCATE

Added and applied:
`supabase/migrations/20261003000400_curriculum_admin_least_privilege.sql`

Authenticated now has exactly:
- SELECT
- INSERT
- UPDATE

No admin data was deleted.

Commit:
- `020fb264302f1016b563f01c736a4a9d423e2fd6`

Live verification after migration confirmed the exact authenticated grant set above.

## API audit status after current review

### /api/audit
Has:
- same-origin/auth/Google-user guard via `requireHalliumAiUser`
- bounded JSON body
- authenticated daily + per-minute quota
- server-only AI key
- grounded prompt
- JSON parsing
- no-store on guard/quota failures

### /api/intelligence
Has:
- same-origin/auth/Google-user guard
- bounded JSON body + secondary learner-snapshot size check
- supported-action allowlist
- authenticated daily + per-minute quota
- server-only AI key
- grounded prompts
- server-side structured-output validation

### /api/ai-twins/guides/chat
Has:
- same-origin
- server-side auth + Google-provider check
- body/message limits
- per-user daily + per-minute limits
- private history scoped by user_id + guide_id
- server-only AI key
- permanent human-phase retirement checks before and after provider call

### /api/study-partners/practice
Has:
- same-origin
- server-side auth + Google-provider check
- request-size + UUID validation
- accepted-partnership ownership check
- room-level 24-hour generation cap
- RLS-protected shared-note reads
- prompt treats notes as untrusted data
- grounded-output/source validation
- server-only AI key with guided fallback

### /api/ai-twins/meet
Previously reviewed and still has:
- same-origin
- server-side auth + Google-provider check
- body + UUID validation
- self-target rejection
- opt-in/discoverability requirements
- per-user 24-hour cap
- untrusted-profile prompt handling
- limited public profile fields
- duplicate proposed-meetup reuse
- server-only AI key
- human approval remains required

No critical cross-user data leak was found in the reviewed routes.

## Supabase advisor status after current hardening

Security advisor currently reports:
- internal `hallium_internal` tables with RLS/no policy (intentional private/internal tables; no direct app grants)
- four authenticated SECURITY DEFINER RPC warnings:
  - `hallium_partner_request`
  - `hallium_partner_respond`
  - `hallium_twin_decide`
  - `hallium_twinverse_status`
  These are intentional authenticated action/status RPC surfaces and must not be blindly revoked.
- leaked-password protection disabled. Hallium's active user auth path is Google OAuth, so this warning does not represent the current primary sign-in flow; retain as an account-level platform warning unless password auth is enabled.

Performance advisor still has legacy/performance findings (unindexed foreign keys, owner_korean_study auth-initplan, one multiple-policy warning, unused indexes). Treat separately from the security closure; do not claim fixed.

## Current next execution order

1. Let the updated CI/security workflows finish and inspect any real failures.
2. Add/confirm security regression checks for:
   - unauthenticated AI route rejection
   - cross-origin rejection
   - oversize/malformed body rejection
   - direct non-admin admin-route fallback
3. Re-run security/performance advisors after final DB changes.
4. Run the full production regression matrix:
   - standalone Hallium
   - Batch 2
   - TOPIK provenance
   - Study Partners/Twinverse
   - guest mode
   - Vercel production readiness/live sanity
5. Only after those pass, mark security closure complete and begin H-P5 native-Korean/curriculum/device/auth/voice/TOPIK QA.



---

# 23. Security closure COMPLETE — 2026-10-03

This section supersedes the earlier "security closure in progress" tracker.

## Final fixes landed during closure

### TOPIK fail-closed activation
Completed:
- activation derived from release / asset / rights states + structural validity
- legacy stored allow booleans are non-authoritative
- dedicated provenance regression suite added
- CI exercises the derived gates

Commits:
- `55679feb5fff0cbbb063c34afe01fe766b957d8c`
- `2d4b6e3bb89f7c6c911138c5bdb9e0a806e65ed7`
- `8fb57c66306390b030643ab6c81b3b7df562b624`
- `f1a6180f1a653d125d3a27ce1e51bb12913e3eef`

### Curriculum Admin least privilege
Applied migration:
- `supabase/migrations/20261003000400_curriculum_admin_least_privilege.sql`

Authenticated access is now exactly:
- SELECT
- INSERT
- UPDATE

No authenticated DELETE / TRUNCATE / REFERENCES / TRIGGER privileges remain.

Commit:
- `020fb264302f1016b563f01c736a4a9d423e2fd6`

### Security regression coverage
Expanded:
- framework-independent bounded JSON parser in `lib/server/request-guard.js`
- malformed JSON => 400
- wrong content type => 415
- oversized JSON => 413
- unauthenticated AI route rejection
- cross-origin AI route rejection
- TOPIK provenance hardening tests
- admin URL fail-closed checks
- least-privilege migration assertions

Relevant commits:
- `e9314af999504c433846ac3c29a9b7ce5874007a`
- `1bc24b3be696e84c1eed8c73d850c9de5dcee93c`
- `d66c13e37d8c42fe3c026f0615b829970dad0c95`
- `3c15e9695c507249d3f41f5090c2cab064fa1ad0`
- `5ed3da1f5212a23caa2d339dcefe661b323abdd8`
- `bd1e3794a8c7a961153b10a3bc2b4081fd287ca5`
- `422e6b1757ac631f62849646d19dccd4db97c9d9`

### CI shell-split cleanup
Guest Mode moved the real app shell into `app/hallium-core.js`. Several older regression assertions still read `app/page.js`.

Fixed:
- Batch 2 admin guards
- Starter Flashcards main-link assertion
- Companions/admin regression source
- owner/private Korean menu assertion
- Study Partners production workflow

Commits:
- `6c1e35c3e4788056416f3b3d1aed147455f0ecfb`
- `fd1f11265150519105f21584dc111054f5b808fd`
- `d4948dd7151e968eb3523e8b7e3ff3402fa9c7eb`
- `e965b52bb7c910b8f0ba13f24ced956ff8b3fa5e`
- `a79e26cbab271fa7e3c6a41510d93179550c0409`

Study Partners production integration now runs on `main`, not only its old feature branch.

## Final verification evidence

### Hallium Security Gate
PASS on current production-code state:
- dependency critical-advisory gate
- security/integrity unit tests
- TOPIK provenance regressions
- compile
- hardening headers
- unauthenticated API boundaries
- cross-origin API boundaries

Known good security run commit:
- `422e6b1757ac631f62849646d19dccd4db97c9d9`

No production application/security code changed after this point; subsequent commits only repaired regression workflow/script references.

### Standalone Hallium
On commit:
- `a79e26cbab271fa7e3c6a41510d93179550c0409`

Verified:
- all `tests/*.test.mjs` ✅
- Next.js production build ✅

### Full browser regression
On commit:
- `a79e26cbab271fa7e3c6a41510d93179550c0409`

Verified:
- Starter Flashcards ✅
- responsive layout 320–1440px ✅
- TOPIK Mock Studio + provenance/fail-closed behavior ✅
- unified Hallium dashboard / Companions ✅
- Hangul Lab 320–1600px ✅
- owner-only Korean route/privacy assertions ✅

### Study Partners production integration
On commit:
- `a79e26cbab271fa7e3c6a41510d93179550c0409`

Verified:
- matching/evidence-grounded tests ✅
- integrated build ✅
- Hallium + Hangul + Study Partners smoke checks ✅
- protected Study Partners AI endpoint rejects unauthenticated requests ✅

### Vercel
Production deployment for:
- `a79e26cbab271fa7e3c6a41510d93179550c0409`

State:
- READY ✅

Canonical live routes checked:
- `/` => 200
- `/topik-mocks` => 200
- `/study-partners` => 200
- `/flashcards` => 200

### Supabase advisors
Re-run after the final DB hardening migration.

Remaining security advisor items are documented rather than silently "fixed":
- intentional authenticated SECURITY DEFINER action/status RPCs
- private/internal RLS-with-no-policy information findings
- leaked-password-protection warning (current Hallium user path is Google OAuth)

Performance-advisor findings remain a separate optimization backlog and are not security-closure blockers.

## Security closure verdict

**Security closure: COMPLETE ✅**

No critical confirmed cross-user data leak was found during this audit.

Do not reopen security architecture by default. Reopen only if:
- a new regression fails,
- a new exposed route/RPC is added,
- auth/provider behavior changes,
- password auth is introduced,
- RLS/grants change,
- or a concrete vulnerability is reported.

## Current project phase

Hallium has now moved to:

**Batch 3 / H-P5 — Final Hallium Closure QA 🔄**

Execution order:
1. native-Korean/content QA
2. curriculum coverage QA
3. responsive/device QA beyond current regression matrix
4. auth/cloud-sync QA across account/device states
5. voice preference regression across device/voice availability states
6. final TOPIK usability QA
7. final issue cleanup + production closure



---

# 24. H-P5 native-Korean/content QA — checkpoint 1

H-P5 began against the real live curriculum in `app/hallium-core.js`. No duplicate audit dataset was created.

Audit rule:
- preserve valid Korean variants,
- do not mass-rewrite for style,
- patch only high-confidence grammar-label, teaching-accuracy, or clear naturalness issues.

## Corrections landed

### 1. -데다가 morphology label
Old label:
- `A/V + 는 데다가`

Problem:
- the same lesson uses the adjective example `비싼 데다가`, which the old label did not describe correctly.

New label:
- `A + (으)ㄴ 데다가 / V + 는 데다가`

Explanation now refers to `-(으)ㄴ/는 데다가`.

### 2. Natural app-review sentence
Old:
- `제가 계속 쓰는 이유는 복습이 좋아서예요.`

Revised:
- `제가 계속 쓰는 이유는 복습 기능이 좋아서예요.`

English answer/feedback was updated consistently to refer to the review feature.

### 3. -(으)ㄴ 채로 scope
Old label:
- `A/V + (으)ㄴ 채로`

Revised:
- `Verb + (으)ㄴ 채로`

Explanation now makes explicit that the result/state of an action remains unchanged while another action occurs.

### 4. Reported-statement morphology
Old label:
- `Statement + 다고 하다`

Revised teaching label:
- `V + -(ㄴ/는)다고 / A + -다고 / N + (이)라고 하다`

Explanation now distinguishes present action verbs, descriptive verbs, and nouns, while noting that tense remains inside the reported clause.

Existing valid example retained:
- `회의가 취소됐다고 했어요.`

Commits:
- `4659fa6a463b3880418f624b0095c85a5d52e9d8` — Refine Korean grammar labels and naturalness
- `856721932f94b1ccdfecfc66f71eb0b4a4bd2eea` — Clarify Korean reported statement forms

## Verification

For `4659fa6...`:
- Hallium Security Gate ✅
- standalone Hallium ✅
- Study Partners production integration ✅
- Batch 2 ✅
- full integrated Starter Flashcards / browser regression ✅

For `856721...`:
- Hallium Security Gate ✅
- standalone Hallium ✅
- Hallium Batch 2 ✅
- Study Partners production integration ✅
- pages build/deployment ✅
- integrated Starter Flashcards Chromium exercise ✅
  - final workflow cleanup was still completing when this checkpoint was recorded, but the functional Chromium step itself had passed.

## H-P5 status

Native-Korean/content QA remains **in progress**.

Next:
1. finish the remaining intermediate/advanced curriculum language pass,
2. avoid changing merely stylistic or acceptable Korean variants,
3. then use the existing curriculum audit helpers/Admin Studio for formal coverage QA.


---

# 25. H-P5 curriculum coverage QA — checkpoint 1

Coverage QA is running against the existing `lib/curriculum/admin.js` audit helper and the live `units` curriculum.

Current live curriculum size:
- 15 units
- 76 published lessons/checkpoints
- 15 checkpoints

## Problem found

The old coverage helper treated every absent expected stage as a defect.

That created false-positive gaps for three intentionally specialized Unit 1 lessons:

### Unit 1 · Places around me
Intentional omissions:
- listening — this recognition lesson deliberately uses a short reading passage as receptive input
- shadowing — pronunciation production is deferred to the adjacent movement lesson
- build — the lesson goal is place recognition before sentence production

### Unit 1 · Where are you going?
Intentional omission:
- word — this grammar lesson reuses the place vocabulary introduced immediately before it

### Unit 1 · A tiny first conversation
Intentional omissions:
- word — synthesis lesson recombines already taught Unit 1 vocabulary
- explain — no new grammar is introduced; the goal is integration of prior patterns in conversation

## Audit-model fix

`lessonCoverage()` now:
- accepts lesson-level `coverageExemptions`,
- returns `intentionalOmissions` with `kind` + `reason`,
- excludes documented intentional omissions from `missing`,
- still reports any undocumented expected-stage absence as a real gap.

The live Unit 1 lessons now carry their exception reasons directly through `lessonBase()` metadata.

Admin Studio now:
- marks intentionally omitted stage chips separately with a dashed treatment,
- exposes the stored reason,
- retains the normal gap styling/filter only for genuine unexplained omissions.

Regression test added:
- documented omissions => no real gap
- reasons remain visible through the audit result

Commits:
- `474022d820a33474af78b7eedc149c4a10048772` — Distinguish intentional curriculum omissions from gaps
- `c6059c222a91afab41a8d2387bd227d6b9679924` — Document intentional Unit 1 curriculum omissions
- `4248b6834ea27caff40a80345747ce6a14749c0f` — Test intentional curriculum coverage exemptions
- `36b48eb06c695617188b55e6c78588031bec1ea1` — Show intentional curriculum omissions in Admin Studio
- `b2c2d5c637a04cd41a0c6a8d08496205c4187373` — Style intentional curriculum audit annotations

Verification at checkpoint:
- standalone Hallium on `b2c2d5...` ✅
- Hallium Security Gate on `b2c2d5...` ✅
- longer Batch 2 / Study Partners / Chromium regression runs were still executing when this checkpoint was recorded

## Coverage conclusion so far

After documented Unit 1 exceptions, no unexplained structural gap has been identified in the live curriculum model.

Units 2–15 are generated through `makeUnitLessons()`, which supplies the full normal lesson sequence:
- word
- explain
- choice
- listening
- shadowing
- build
- finish

and each generated unit adds a checkpoint with:
- choice
- dictation
- reading
- finish

Do not remove intentional exemptions merely to make every lesson mechanically identical.


---

# 26. H-P5 auth, voice, and TOPIK usability QA — checkpoint

This checkpoint covers the next H-P5 layers after curriculum coverage QA.

## Auth / cloud-sync QA

### Guest storage isolation

Problem found:
Guest Mode was correctly blocked from direct Supabase learner-state writes, but guest and signed-in sessions still shared the same browser learner keys. A reviewer could therefore create local guest progress and later have that browser-local state merged into a Google account during cloud hydration.

Fix:
- added `lib/learner-storage.js`
- guest learner storage now uses a dedicated `:guest` suffix
- scoped:
  - learner profile
  - lesson progress
  - study results
  - AI audit
  - intelligence/adaptive state
  - Korean voice preference
- referral attribution intentionally remains shared so guest → Google conversion attribution survives

Guest adaptive reads were also corrected so mistake/practice history never reads the signed-in intelligence cache.

Relevant commits:
- `98dd56fda3129fb8cced4adccdeb1f27141872b9`
- `0e9ae8ec277a5875d8bbde2c3d2a2b9e8378995f`
- `4b870e9175a289cb4d24953be6550721353fb7cc`
- `61f40993dfcb3611764840aa5d3c97b4d44d4f45`
- `d95c6ea6e21958894ebea3b901d5d8785e058bb0`

### Cross-account browser isolation

Second problem found:
The canonical signed-in local cache was not account-owned. Google account A could sign out, then account B could sign in on the same browser and local A state could be considered during B's merge.

Fix:
- canonical local learner cache now carries owner identity through `hallim:local-owner:v1`
- local state is reusable only when:
  - it is a legacy unowned cache, or
  - owner ID matches the current Google user ID
- if the cache belongs to a different user:
  - canonical learner cache is cleared before merge
  - guest sandbox keys are untouched
  - referral attribution is untouched
- successful hydration claims the cache for the authenticated user

Important rendering fix:
- signed-in Hallium now keeps `authReady=false` until cloud hydration completes
- this prevents account B from briefly seeing account A's stale local learner state during hydration

Relevant commits:
- `4533d9eb2ee231be04d15efeb5391ca821eee036`
- `a35b36324ebcb2d18cd8367eb154c2bc80bf2117`
- `6b5a90cc8f4f0ac36ae430cb418ff2fe0a3a49ea`
- `9d87e3f7438ef38f2ccd1a8ecfb3bdbdd4ad00f0`

Regression coverage:
- guest keys never collide with canonical account keys
- guest voice preferences remain separate
- guest sandbox survives canonical-cache clearing
- local cache ownership A != B is rejected
- hydration gate remains closed until cloud state is applied

Security Gate + standalone + Study Partners + integrated browser regression passed after the browser test harness correction.

## Korean voice/device QA

Added pure device-independent regression coverage for:
- natural rate clamping
- exact saved voice URI resolution
- missing saved voice on another device
- Microsoft/Google/Samsung/Siri-style preferred provider fallback
- local Korean voice fallback
- first-available fallback
- newer local vs newer cloud preference timestamps
- fail-safe behavior when browser speech synthesis is unavailable

Commit:
- `c4d57bd8cc10fe8a6130a22b899f6a710abb7221`

Verification on that commit:
- standalone Hallium ✅
- Study Partners production integration ✅
- full integrated Starter Flashcards/browser suite ✅

## TOPIK final usability QA

Underlying provenance gating remained correct, but the learner-facing catalog copy had become inconsistent with the now-capable verified scoring engine.

Old catalog copy said:
- there is no automatic score

That was too absolute because Hallium can grade an objective attempt when an exact answer/point bundle has passed the provenance gate.

Updated behavior:
- catalog now says automatic scoring appears only when exact key + point map are verified
- explicitly states Hallium scores are never official TOPIK results
- each paper now shows a plain-language status above the technical provenance panel:
  - `Practice mode only` when interactive scoring/audio is locked
  - `Verified interactive features available` when a verified capability is active
- plain status explains:
  - whether Hallium can grade the paper
  - whether mapped verified question audio is available
  - what the learner should use externally when locked
- the full technical provenance panel remains unchanged underneath

Commits:
- `a5dab413de2e775deb05b3a12b69310e9d2d708d`
- `8cd6663310e0cea3c9191e1c31a336f5658487e4`
- `7333033c289c1497262c6a60a28cf79a70e827b6`

Browser regression now explicitly checks the plain-language `Practice mode only` state.

## Verification / production status

Latest functional commit:
- `7333033c289c1497262c6a60a28cf79a70e827b6`

Verified:
- standalone Hallium ✅
- Hallium Batch 2 ✅
- Study Partners production integration ✅
- dedicated TOPIK provenance/usability Chromium run ✅
- latest Vercel production deployment READY ✅

Security on the combined auth/storage + TOPIK UI path:
- Hallium Security Gate ✅ on `8cd6663310e0cea3c9191e1c31a336f5658487e4`
- no application/security logic changed after that commit; the final `7333033...` commit only adds a browser assertion

Production observability:
- Vercel runtime error clusters, last 24h: **none found**

## H-P5 status after this checkpoint

Completed:
- native-Korean/content QA — targeted high-confidence pass ✅
- curriculum coverage model QA ✅
- current responsive/device regression matrix ✅
- guest / Google / cross-account cloud-state QA ✅
- Korean voice preference/device fallback QA ✅
- final TOPIK provenance/usability QA ✅

Remaining before final production closure:
1. let the broad integrated Chromium cleanup finish on the latest TOPIK assertion commit
2. final issue/CI cleanup only if a real regression appears
3. record production closure and stop changing architecture unless new evidence requires it


---

# 27. H-P5 COMPLETE — production closure

Hallium H-P5 final closure QA is complete.

## Final verified production code checkpoint

Functional code checkpoint:
- `7333033c289c1497262c6a60a28cf79a70e827b6`

Production state:
- Vercel target: production
- deployment state: READY

## Final green matrix

On the final functional code path:

- standalone Hallium tests ✅
- standalone Next.js build ✅
- Hallium Security Gate ✅
- Hallium Batch 2 ✅
- Study Partners production integration ✅
- dedicated TOPIK provenance/usability Chromium regression ✅
- full integrated Chromium regression ✅
  - Starter Flashcards
  - responsive layouts
  - TOPIK
  - unified dashboard / Companions
  - Hangul Lab
  - owner/private Korean route
- Vercel production deployment ✅

Production observability:
- Vercel runtime error clusters in the last 24 hours: none found ✅

## H-P5 areas closed

### Native Korean/content
Targeted high-confidence grammar/naturalness corrections completed.

### Curriculum coverage
Live curriculum audit now distinguishes real gaps from documented intentional omissions.

### Responsive/device
Existing 320–1600px browser regression matrix remains green.

### Auth/cloud sync
Verified and hardened:
- Guest Mode local sandbox
- guest → Google isolation
- Google account A → account B same-browser isolation
- canonical local-cache owner binding
- no cross-account hydration flash
- admin identity remains RLS-backed
- referral attribution remains intentionally shared

### Voice
Verified:
- saved voice
- missing voice on another device
- provider fallback
- local fallback
- rate limits
- cloud/local timestamp merge
- unavailable speech synthesis

### TOPIK
Verified:
- provenance fail-closed activation
- scoring/audio rights gates
- answer persistence
- writing persistence
- mobile
- plain-language locked/verified feature status
- verified scoring wording does not imply an official TOPIK score

## Closure rule

**H-P5: COMPLETE ✅**

Do not reopen the completed closure audits by default.

Reopen only if:
- a new feature changes auth/state ownership,
- a new Supabase table/RPC/API route is exposed,
- TOPIK assets or rights states change,
- a new voice/storage architecture is introduced,
- responsive structure is substantially redesigned,
- CI reports a real regression,
- or a concrete production bug/security issue is observed.

## Current project state

Hallium is now in:

**Production maintenance / feature development**

Preferred workflow from here:
1. define the next feature,
2. implement against the existing architecture,
3. add narrowly-scoped regressions for the changed behavior,
4. preserve the now-closed security/auth/provenance boundaries.


---

# 28. Post-H-P5 feature development — Message Makeover

The original Hallium V4 "Message Makeover" surface already existed in `app/partner/PartnerKorean.jsx`, but its live AI action was disconnected from the server Intelligence allowlist.

## Problem found

UI called:

`callIntelligence("message_makeover", ...)`

but `app/api/intelligence/route.js` did not support `message_makeover`.

Result:
- polished UI existed,
- instant presets worked,
- signed-in AI generation could only fail as unsupported.

## Production fix

Added `message_makeover` to Hallium Intelligence with:
- explicit system task
- strict output schema
- relationship allowlist
- vibe allowlist
- flirt intensity 0–100
- input length <= 600 chars
- bounded Korean/romanization/explanation output
- existing authenticated Google-user guard
- existing same-origin protection
- existing Hallium AI quota
- existing bounded JSON parser
- existing server-only provider key

Required result shape:
- `bestMatch`
- `romanization`
- `naturalMeaning`
- `why`
- `softer`
- `bolder`
- `funnier`

The prompt explicitly preserves intended meaning and disallows invented commitments, consent, threats, explicit sexual content, insults, or personal facts.

Commit:
- `525713c48996069be28b02a4a1d06d43cfc53620`

## Guest Mode

Guest Mode does not fake arbitrary AI translation.

For recognized built-in Hallium preset meanings, it can demonstrate Message Makeover locally using the existing phrase bank:
- Did you eat?
- I miss you
- Are you busy?
- Did you get home?
- Call later?
- Good night / sleep well
- apology / "I didn't mean it"

Unknown free text returns the normal guest fallback and leaves instant presets available.

Commit:
- `39effe3c4fbd5a04d73fb6ad0d9b0482675a2eae`

## Contract regression

Added:
- `tests/message-makeover-contract.test.mjs`

Checks:
- UI/server action names stay aligned
- every UI-read output field exists in the server schema
- relationship/vibe/intensity validation remains present
- output stays bounded
- route remains authenticated/quota-limited
- Guest Mode remains preset-grounded rather than pretending to translate arbitrary text

Initial test assertion incorrectly expected a per-field literal length check even though the production validator correctly bounds all Korean variants through one array `.every()` guard.

Corrected in:
- `a768376e719766a62e5cfbd53841455f08b7d045`

## Capability audit after Makeover wiring

Current frontend Hallium Intelligence actions:
- difficulty
- learning_route
- message_makeover
- mistake_explain
- promotion
- study_plan

Server also supports:
- adaptive_review
- checkpoint

No frontend Intelligence action is currently missing from the server allowlist.

## V4 feature-state check

Confirmed:
- interactive "Your Korean world" vocabulary district map already exists
- review/mistake-memory workflow already exists
- per-account Korean voice preference already exists
- Message Makeover is now functionally wired

Remaining original V4 infrastructure gap:
- **MeloTTS/default high-quality Korean TTS**

Current Hallium voice architecture is browser Web Speech + per-account preference/fallback. There is no MeloTTS or server-side TTS runtime/service in this repository.

Do not deploy a heavyweight Python MeloTTS model directly into the Next/Vercel application runtime without a deliberate inference-service boundary.

### Next infrastructure phase

Design and implement MeloTTS as a separate voice provider/service layer while preserving:
1. current browser speech as fallback,
2. current per-account voice preference,
3. device-safe fallback behavior,
4. no regression to lesson latency,
5. graceful provider failure.


---

# 29. Post-H-P5 infrastructure — MeloTTS provider boundary

Hallium now has a production-safe high-quality Korean TTS provider boundary without bundling Python/PyTorch model inference into the Next.js/Vercel application runtime.

## Architecture

Signed-in learner audio path:

1. Hallium calls `playServerKoreanTts()`.
2. Browser sends same-origin POST to `/api/tts`.
3. Hallium authenticates the Google user and applies the TTS quota.
4. `/api/tts` forwards only the bounded Korean text + rate to the configured MeloTTS container.
5. Audio is streamed back to the browser.
6. If any server/provider/playback step fails, Hallium falls back to the existing remembered browser Korean voice.

Guest Mode:
- does **not** call server MeloTTS.
- continues to use local browser Web Speech only.

This preserves the reviewer/no-cost boundary.

## Hallium browser provider

Added:
- `lib/korean-tts-provider.js`

Behavior:
- same-origin `/api/tts`
- max 500 chars sent
- 8 second client timeout
- requires an audio response
- provider failure returns `false`
- caller immediately falls back to Web Speech

Central `playKorean()` in `app/hallium-core.js` now tries server voice first only for signed-in learners.

Relevant commits:
- `f78e7c94539d5dde6136942c0d4b937afa2b95b0`
- `0b1d9390b3bf100204fdbf30fb75f8d0d881bab0`

## Authenticated Hallium proxy

Added:
- `app/api/tts/route.js`

Security / reliability:
- `requireHalliumAiUser()`
- bounded JSON body
- text length 1–500
- TTS quota: 300/day, 30/minute per authenticated user
- service URL remains server-only
- service bearer token remains server-only
- 7 second upstream timeout
- accepts only audio responses
- no-store response
- provider identity response header

Environment:
- `MELOTTS_SERVICE_URL`
- `MELOTTS_SERVICE_TOKEN`

If no service URL is configured:
- proxy returns 503
- browser client falls back automatically to the existing Web Speech voice

Commit:
- `5baeac29a6e0b6caa80deac74d30b8ed018f6c0c`

## Separate MeloTTS service scaffold

Added under:
- `services/melotts/`

Files:
- `app.py`
- `Dockerfile`
- `requirements.txt`
- `README.md`

Service:
- FastAPI
- Korean-only synthesis
- bearer-protected production endpoint
- health endpoint
- 1–500 character request bound
- speed bound 0.7–1.3
- WAV response
- temp audio cleaned after response
- CPU/GPU/MPS selected through `MELOTTS_DEVICE`

Upstream MeloTTS pinned to:
- `209145371cff8fc3bd60d7be902ea69cbdb7965a`

The upstream MeloTTS project is a Python model runtime and documents Docker/Python usage; this service intentionally stays outside the Next runtime.

Commits:
- `e77e51f38560ae7cb8c64b46d867f4d2d3af665a`
- `dc1b650c23f86d41952a8766ce003411cd369964`
- `c669b2d6e34346bce04ddf14ef6490af42710ac4`
- `cd33639f37040ab2801b3ff90b270a89cbef532d`

## Regression/security coverage

Added:
- `tests/melotts-provider-contract.test.mjs`

Checks:
- signed-in server-first / guest local-only routing
- same-origin proxy usage
- browser fallback behavior
- auth + quota + bounded proxy contract
- server-only MeloTTS URL/token
- Korean-only service
- service bearer protection
- pinned upstream revision
- separate Python container boundary

Security Gate now also:
- rejects unauthenticated `/api/tts`
- rejects cross-origin `/api/tts`
- runs the MeloTTS provider contract test

Commits:
- `f557a75793d830a542074f2b4b300ddf16224ff9`
- `ed4e9af7c433e62465b915531d52e2752fb6fa53`
- `b10634fedaa473c76d9f1d841cdf076735ebc576`

Verification already observed on the provider route code path:
- Hallium Security Gate ✅ on `ed4e9af7...`
- standalone Hallium ✅ on `ed4e9af7...`
- Study Partners production integration ✅ on `ed4e9af7...`

## Activation status

**Hallium MeloTTS integration: READY / SAFE FALLBACK ✅**

**MeloTTS inference provider: NOT YET ACTIVE**

Reason:
- no external container host/service URL is currently connected in this workspace.
- `MELOTTS_SERVICE_URL` and `MELOTTS_SERVICE_TOKEN` must not be invented.

Until a real service is hosted:
- production Hallium continues using the existing browser voice through automatic fallback.
- there is no learner-facing outage.

## Next infrastructure step

1. deploy `services/melotts` to a warm container host suitable for Python/model inference,
2. configure the same bearer token on service + Hallium,
3. set `MELOTTS_SERVICE_URL` and `MELOTTS_SERVICE_TOKEN` in Vercel,
4. health-test the service,
5. verify signed-in Korean audio resolves to the MeloTTS provider,
6. verify service-down behavior falls back to Web Speech,
7. only then call MeloTTS production-active.


---

# 30. Post-H-P5 performance phase — checkpoint

MeloTTS provider activation is intentionally parked. Hallium moved into the previously documented performance backlog.

## Supabase performance cleanup

Performance advisor before this phase reported:
- 14 unindexed foreign-key columns across Study Partners / Twinverse tables
- 4 `owner_korean_study` auth-initplan warnings
- 1 overlapping permissive SELECT-policy warning on `learner_state`
- several unused-index informational findings

### Changes applied

Added covering indexes for all 14 flagged foreign-key columns:
- `hallium_partner_answers.author_id`
- `hallium_partner_blocks.blocked`
- `hallium_partner_connections.requested_by`
- `hallium_partner_connections.user_high`
- `hallium_partner_joint_notes.author_id`
- `hallium_partner_joint_notes.connection_id`
- `hallium_partner_messages.sender_id`
- `hallium_partner_reports.connection_id`
- `hallium_partner_reports.reporter`
- `hallium_partner_reports.target`
- `hallium_partner_sessions.created_by`
- `hallium_partner_shares.note_id`
- `hallium_partner_shares.owner_id`
- `hallium_twin_meetups.initiated_by`

`learner_state`:
- removed the separate own-row and admin SELECT policies
- replaced them with one equivalent `learner_state_select_authorized` policy:
  - own row via `(select auth.uid())`
  - OR admin via `(select public.is_hallim_admin())`

`is_hallim_admin()`:
- keeps the same semantic check against `admin_users`
- wraps `auth.uid()` in a scalar SELECT so it can be initialized once per statement

Live advisor after changes:
- **unindexed foreign-key warning: cleared ✅**
- **multiple permissive learner_state SELECT warning: cleared ✅**

The only remaining performance warning class is the legacy `owner_korean_study` auth-initplan warning.

Important:
Live inspection shows those owner-only policies already use `(select auth.uid())` and `(select auth.jwt())`. They were **not rewritten blindly** merely to silence the advisor.

Unused-index findings were also **not removed**. Current tables are small and "never used yet" is not sufficient evidence that the indexes are unnecessary.

Migration history:
- Supabase version `20261003100009`
- repo file `supabase/migrations/20261003100009_hallium_partner_performance_indexes_and_rls.sql`

Commit:
- `ce5805170d266583893d645244e37ca2d74c3b5d`

## Client bundle cleanup

`app/hallium-core.js` is the main client shell and is roughly 325 KB of source.

`app/partner/PartnerKorean.jsx` is roughly 39.6 KB of route-specific source containing:
- Real Korean phrase bank
- dialogues
- Message Makeover UI
- relationship/vibe controls

Previously it was imported eagerly into every Hallium session.

Changed it to a Next dynamic import:
- no eager `PartnerKorean` import
- feature chunk loads only when Real Korean is opened
- lightweight loading surface shown while the chunk resolves

This moves the ~39.6 KB route-only source out of the eager main import graph without changing learner behavior.

Commit:
- `84c028dd6aa6a3ac6e6607543e10693c3e733b1e`

Observed verification on that commit:
- Hallium Security Gate ✅
- standalone Hallium ✅
- Hallium Batch 2 ✅
- Study Partners production integration ✅

## Performance regression coverage

Added:
- `tests/performance-contract.test.mjs`

Protects:
- Real Korean remains dynamically imported
- all 14 FK covering indexes remain in the migration
- `learner_state` stays on one owner-or-admin SELECT policy
- admin helper keeps statement-level auth initialization

Commit:
- `250994e430b0338bfa3b1ada34308d66da92874f`

Longer browser/build workflows for the regression-only commit were still running when this handoff checkpoint was written.

## Performance phase conclusion

Completed:
- structural FK index backlog ✅
- duplicate learner-state SELECT-policy warning ✅
- one high-value client code-split ✅

Deliberately deferred:
- owner-only RLS linter false-positive/legacy investigation
- deleting unused indexes without workload evidence
- broad curriculum/client refactors that would increase churn without measured benefit

## Next non-Melo track

The only open repository backlog items are research drafts:
- PR #4 — AI Doppelgänger theory/evaluation paper scaffold
- PR #5 — TwinMem Pilot 0 synthetic benchmark

A new stacked research phase has begun:
- branch `research/twinmem-pilot1-calibrated-reliability`
- draft PR #6
- base: Pilot-0 research branch, not production `main`

Pilot 1 tests development-calibrated source reliability under equal context budgets and explicit source-reliability shift. Production Hallium remains untouched.


---

# 31. TwinMem research progression — Pilots 1–6

This research track remains **fully isolated from production Hallium**. All work below lives in stacked draft PRs and synthetic-only branches.

## Pilot 1 — calibrated source reliability

Draft PR: #6  
Branch: `research/twinmem-pilot1-calibrated-reliability`

Question:
Can source reliability learned from a synthetic development split replace Pilot-0 hand-set source weights?

Primary held-out result:
- calibration ≈ tied with fixed adaptive at 52 words
- modest point-estimate gains at 105/210
- no universal improvement
- under unseen source-reliability reversal, frozen quality-aware priors fail badly
- recalibration recovers only when labeled shifted development evidence is available

Important conclusion:
Static source-trust assumptions can become stale.

## Pilot 2 — drift-aware global gate

Draft PR: #7  
Branch: `research/twinmem-pilot2-drift-gate`

Frozen detector:
- 24 recent labeled observations/source
- drift threshold 0.20

Result:
- correctly distinguishes stationary vs shifted regime in the tested simulator
- global switch to freshness-first strongly helps 52-word tight context under shift
- but hurts 105/210 where calibrated retrieval remains stronger

Conclusion:
Drift response must be **context-budget aware**, not one global switch.

## Pilot 3 — budget-aware drift response

Draft PR: #8  
Branch: `research/twinmem-pilot3-budget-aware-gate`

Learned development action table:

No drift:
- 52 → calibrated
- 105 → calibrated
- 210 → calibrated

Drift:
- 52 → topic_recent / freshness-first
- 105 → calibrated
- 210 → calibrated

Held-out:
- stationary preserved calibrated behavior
- severe shift recovered +22.55 pp at 52 words without sacrificing 105/210
- unseen moderate shift recovered +7.19 pp at 52 words while preserving larger budgets

Conclusion:
Budget-aware response is better than global switching in this simulator.

## Pilot 4 — label efficiency / stability of fixed threshold

Draft PR: #9  
Branch: `research/twinmem-pilot4-label-efficiency`

Frozen:
- point-estimate threshold 0.20
- Pilot-3 action table

Predeclared criterion:
- stationary false alarms ≤10%
- moderate detection ≥80%
- severe detection ≥90%

250 resamples/window at 4, 8, 12, 24, 48 labels/source.

Observed:
- 4 labels: stationary false alarm 100%
- 8: 100%
- 12: 81.2%
- 24: 48.4%
- 48: 25.6%

Moderate/severe sensitivity stayed very high.

**No tested window passed.**

Conclusion:
Fixed absolute point-estimate threshold is not sample-size aware and is not credible.

## Pilot 5 — uncertainty-aware drift detector

Draft PR: #10  
Branch: `research/twinmem-pilot5-uncertainty-aware-drift`

Detector:
`|recent posterior mean - baseline posterior mean| - z × SE(diff)`

Development-only grid:
- labels/source 8, 12, 24, 48
- meaningful margin 0.05 / 0.10 / 0.15
- z 1.64 / 1.96 / 2.58

Selection rule:
- only configs meeting 10% / 80% / 90%
- smallest label window first
- then better specificity/sensitivity

Selected:
- 48 labels/source
- margin 0.05
- z 1.96

Independent held-out, 400 resamples/scenario:
- stationary false alarm: **1.0%**
- moderate detection: **84.25%**
- severe detection: **100%**

Predeclared held-out criterion: **PASS**

Important limitation:
Detector still needs 48 labels/source = 144 labeled observations across three source types.

Conclusion:
Uncertainty-awareness fixes specificity, not label efficiency.

## Pilot 6 — sequential early stopping

Draft PR: #11  
Branch: `research/twinmem-pilot6-sequential-drift`

Frozen:
- Pilot-5 detector (margin 0.05, z 1.96)
- Pilot-3 action table
- max 48 labels/source

Stages:
- 8 → 12 → 24 → 48 labels/source

Rule:
- early drift only after two consecutive positive stage signals
- otherwise use exact Pilot-5 decision at 48

Predeclared detection criteria:
- stationary false alarms ≤10%
- moderate detection ≥80%
- severe detection ≥90%

Predeclared efficiency goals:
- moderate mean labels/source ≤36
- severe mean labels/source ≤24

Held-out:
- stationary: 4.0% false alarms, mean 46.89 labels/source
- moderate: 92.0% detection, mean 37.05 labels/source
- severe: 100% detection, mean 23.85 labels/source

Detection criteria: **PASS**

Efficiency:
- severe ≤24: **PASS**
- moderate ≤36: **FAIL by 1.05 labels/source**
- overall efficiency goal: **FAIL**

Stop behavior:
Moderate:
- 12 labels: 24.75%
- 24: 8.50%
- 48: 66.75%

Severe:
- 12 labels: 57.25%
- 24: 14.75%
- 48: 28.00%

Conclusion:
Sequential collection clearly reduces cost for strong drift but the conservative two-confirmation rule remains slightly too slow for moderate drift.

## Exact next research phase

Pilot 7 should optimize **only the sequential stopping boundary on development streams** while freezing:
- Pilot-5 posterior reliability model
- Pilot-5 meaningful margin / z family unless explicitly evaluated as stopping-only boundary multipliers
- Pilot-3 budget-aware retrieval response
- held-out detection criteria
- moderate/severe label-cost targets

Primary goal:
reduce moderate mean labels/source below 36 **without** pushing stationary false alarms above 10% or moderate detection below 80%.

Do not merge any TwinMem pilot into production Hallium.
Do not claim human-study or on-device results.
Do not treat synthetic simulator truth as production-available labels.


---

# 32. TwinMem Pilot 7 — first phase meeting both detection + efficiency targets

Draft PR: #12  
Branch: `research/twinmem-pilot7-cost-aware-stopping`

Pilot 7 keeps frozen:
- Pilot-5 uncertainty-aware detector family
- stages 8 → 12 → 24 → 48 labels/source
- ordinary margin 0.05
- z = 1.96
- Pilot-3 budget-aware retrieval response
- final 48-label Pilot-5 decision
- detection criteria
- label-cost criteria

Only one new stopping parameter is tuned on development streams:
`strong_single_stage_threshold`

Candidate thresholds:
- 0.08
- 0.10
- 0.12
- 0.15
- 0.18

Selection requirements:
Detection:
- stationary false alarms ≤10%
- moderate detection ≥80%
- severe detection ≥90%

Efficiency:
- moderate mean labels/source ≤36
- severe mean labels/source ≤24

Selected on development:
- **strong threshold = 0.08**

Development at selected threshold:
- stationary false alarms 4.09%
- moderate detection 88.18%
- moderate mean labels/source 31.98
- severe detection 100%
- severe mean labels/source 14.82

Independent held-out:
- stationary false alarms: **5.2%**
- stationary mean labels/source: 46.28
- moderate detection: **85.2%**
- moderate mean labels/source: **31.016**
- severe detection: **100%**
- severe mean labels/source: **13.144**

Held-out:
- detection goals ✅
- efficiency goals ✅
- all goals ✅

Compared with Pilot 6:
- moderate labels/source: 37.05 → 31.02
- severe labels/source: 23.85 → 13.14
- stationary false alarms: 4.0% → 5.2%

Main caveat:
Pilot 7 still performs repeated looks at accumulating evidence and is **not anytime-valid inference**. The nominal uncertainty calculation does not itself provide formal optional-stopping control.

Exact next research phase:
**Pilot 8 — explicit sequential false-positive control**

Goal:
replace the heuristic repeated-look stopping boundary with an anytime-valid, alpha-spending, or otherwise explicitly multiplicity-controlled boundary while keeping:
- Pilot-5 posterior reliability model
- Pilot-3 budget-aware retrieval response
- the 10% / 80% / 90% detection criteria
- moderate ≤36 and severe ≤24 label-cost goals

Do not merge this research stack into production Hallium.


---

# 33. TwinMem Pilot 8 — multiplicity-controlled early stopping is too conservative

Draft PR: #13  
Branch: `research/twinmem-pilot8-alpha-spending`

Pilot 8 freezes:
- Pilot-5 posterior reliability model
- early stages 8 / 12 / 24 labels/source
- final stage 48
- meaningful margin 0.05
- final z 1.96
- Pilot-3 retrieval response
- detection criteria
- efficiency criteria

Early-stop control:
- total early alpha budgets: 0.03 / 0.05 / 0.07
- spending shapes: front / equal / late
- each stage Bonferroni-corrected across 3 source types

Development result:
**No one of the 9 schedules passes all detection + efficiency goals.**

Therefore:
- selected candidate: none
- held-out evaluation: not run by design

Closest detection-passing schedule:
- alpha budget 0.07
- late spending
- stationary false alarms 0.91%
- moderate detection 81.36%
- moderate mean labels/source 39.16
- severe detection 100%
- severe mean labels/source 19.38

Detection criteria pass, but moderate efficiency ≤36 fails by ~3.16 labels/source.

Interpretation:
- Pilot 7 heuristic: more efficient but 5.2% stationary false alarms
- Pilot 8 Bonferroni-style control: ~0.9% stationary false alarms but too much moderate label cost

Conclusion:
Simple stage-wise alpha spending plus source-wise Bonferroni is too conservative for this target.

Exact next statistical direction should seek more power with explicit sequential error control, e.g.:
- e-values / test martingales
- mixture sequential probability ratio test
- source-adaptive or hierarchical sequential test
- confidence-sequence boundary

Do not loosen the predeclared detection or efficiency goals post hoc.


---

# 34. TwinMem Pilot 9 — mixture likelihood-ratio process restores power

Draft PR: #14  
Branch: `research/twinmem-pilot9-mixture-eprocess`

Pilot 9 replaces Pilot-8 stage-wise alpha spending with an estimated-null mixture likelihood-ratio process.

Statistic:
- baseline correctness probability `p0` per source
- alternatives `p0 ± delta`
- 3 source types × 2 directions = 6 LR components
- equal-weight mixture e-value
- monitored at 8 / 12 / 24 / 48 labels/source
- stop when `E >= 1/alpha`

Development-only grid:
- delta 0.10 / 0.15 / 0.20 / 0.25
- alpha 0.05 / 0.08 / 0.10

Selected:
- **delta 0.25**
- **alpha 0.10**

Development:
- stationary false alarms 1.67%
- moderate detection 93.75%
- moderate mean labels/source 28.52
- severe detection 100%
- severe mean labels/source 16.37

Independent held-out:
- stationary false alarms **2.6%**
- stationary mean labels/source 47.54
- moderate detection **89.2%**
- moderate mean labels/source **30.432**
- severe detection **100%**
- severe mean labels/source **14.864**

Held-out:
- detection goals ✅
- efficiency goals ✅
- all goals ✅

Comparison:
Pilot 7 heuristic:
- 5.2% stationary false alarms
- 85.2% moderate detection
- 31.02 moderate labels/source
- 13.14 severe labels/source

Pilot 9:
- **2.6%** stationary false alarms
- **89.2%** moderate detection
- **30.43** moderate labels/source
- 14.86 severe labels/source

Interpretation:
Pilot 9 recovers much of Pilot 7's efficiency while providing a cleaner repeated-monitoring statistic than heuristic strong-stop thresholds.

Important statistical caveat:
The likelihood-ratio mixture has a martingale/e-process interpretation only under a **fixed known null**.
Here the null source-reliability probabilities are estimated from a separate synthetic baseline pool.
Therefore formal finite-sample anytime-valid control is **not yet established**.

Exact next phase:
**Pilot 10 — estimated-null robustness**

Stress-test:
- smaller vs larger baseline calibration samples
- null estimation error / mild misspecification
- stationary false-alarm inflation
- moderate/severe sensitivity under perturbed plug-in p0
- possibly conservative null intervals or mixture-over-null alternatives

Do not merge the TwinMem research stack into production Hallium.


---

# 35. TwinMem Pilot 10 — plug-in null is not robust

Draft PR: #15  
Branch: `research/twinmem-pilot10-null-estimation`

Pilot 10 freezes Pilot 9:
- delta = 0.25
- alpha = 0.10
- stages 8 / 12 / 24 / 48
- same detection and efficiency targets

Only the amount/quality of baseline evidence used to estimate null source reliabilities `p0` changes.

Baseline-size robustness curve:

12 labels/source:
- stationary false alarm 49.6875%
- moderate detection 72.1875%
- moderate mean labels/source 35.25
- severe detection 98.125%
- severe mean labels/source 21.875
- FAIL

24:
- stationary false alarm 27.5%
- moderate detection 74.375%
- moderate mean labels/source 35.6
- severe detection 99.6875%
- severe mean labels/source 18.7125
- FAIL

48:
- stationary false alarm **10.0%**
- moderate detection **80.0%**
- moderate mean labels/source 31.65
- severe detection 98.75%
- severe mean labels/source 16.7125
- PASS exactly on both key thresholds

96:
- stationary false alarm 5.9375%
- moderate detection 80.3125%
- moderate mean labels/source 30.2125
- severe detection 100%
- severe mean labels/source 15.6625
- PASS

192:
- stationary false alarm 4.0625%
- moderate detection 86.25%
- moderate mean labels/source 28.4625
- severe detection 100%
- severe mean labels/source 14.4625
- PASS

Minimum passing baseline size on this curve: **48 labels/source**.

Important:
48 is only a marginal pass and has essentially no robustness margin.

Fresh misspecification stress at 48 labels/source:

No added bias:
- stationary false alarm **10.75%**
- moderate detection **74.25%**
- moderate mean labels 33.13
- severe detection 99.75%
- FAIL

All `p0 + 0.03`:
- stationary false alarm 11.5%
- moderate detection 80.25%
- FAIL

All `p0 - 0.03`:
- stationary false alarm **22.5%**
- moderate detection 77.5%
- FAIL

Source skew ±0.03:
- stationary false alarm 14.5%
- moderate detection 89.25%
- FAIL

**No fresh stress condition passes all goals.**

Conclusion:
Pilot 9's plug-in null is empirically fragile. Estimating a point `p0` and treating it as fixed can materially inflate false alarms and alter sensitivity.

Exact next phase:
**Pilot 11 — null-uncertainty-aware evidence**

Freeze:
- Pilot-9 delta 0.25
- Pilot-9 alpha 0.10
- stages 8 / 12 / 24 / 48
- Pilot-3 budget-aware response
- detection and efficiency targets

Change only null handling.

Recommended experiment:
- baseline sample fixed initially at 48 labels/source, because it is the first plug-in curve pass yet fails fresh robustness
- derive a conservative interval for each source's baseline reliability
- when computing evidence for an alternative, choose the null probability inside the interval that is most favorable to H0 / closest to the recent empirical rate
- test multiple interval confidence levels on development only if needed
- then evaluate on fresh unbiased and ±0.03 misspecification streams
- clearly state that this conservative interval method is a robustness experiment, not automatically a formal e-process

Do not loosen goals post hoc.


---

# 36. TwinMem Pilot 11 — conservative null interval destroys power

Draft PR: #16  
Branch: `research/twinmem-pilot11-null-interval`

Pilot 11 freezes:
- baseline 48 labels/source
- Pilot-9 delta 0.25
- Pilot-9 alpha 0.10
- stages 8 / 12 / 24 / 48
- unchanged detection + efficiency goals

Only null handling changes:
- derive approximate posterior interval for each source's baseline reliability
- choose the null p inside the interval that maximizes recent-data likelihood
- compare Pilot-9 alternatives against that most H0-favorable null

Development interval levels:

70%:
- stationary false alarm 0.77%
- moderate detection 45.77%
- moderate mean labels/source 43.78
- severe detection 96.92%
- severe mean labels/source 26.60
- FAIL

80%:
- stationary false alarm 1.92%
- moderate detection 46.92%
- moderate labels 43.77
- severe 96.54%
- severe labels 29.46
- FAIL

90%:
- stationary false alarm 0.38%
- moderate detection 41.92%
- moderate labels 44.42
- severe 90.77%
- severe labels 34.49
- FAIL

95%:
- stationary false alarm 0.38%
- moderate detection 20.0%
- moderate labels 47.25
- severe 83.46%
- severe labels 38.57
- FAIL

No interval passes development.
Therefore:
- selected interval = none
- held-out unbiased evaluation not run
- bias stress not run

Conclusion:
Worst-case null intervals solve plug-in false alarms too aggressively and destroy power/efficiency.

Exact next phase:
**Pilot 12 — posterior-predictive null mixture**

Freeze:
- baseline 48 labels/source
- delta 0.25
- alpha 0.10
- stages 8 / 12 / 24 / 48
- detection/efficiency goals

Use the full Beta baseline posterior as null predictive evidence rather than:
- a point plug-in p0, or
- a worst-case interval p0.

Avoid post-hoc interval tuning.


---

# 37. TwinMem Pilot 12 — posterior-predictive null still loses moderate power

Draft PR: #17  
Branch: `research/twinmem-pilot12-posterior-predictive-null`

Frozen:
- baseline 48 labels/source
- delta 0.25
- alpha 0.10
- stages 8 / 12 / 24 / 48
- Beta(2,2) prior
- unchanged detection + efficiency goals
- no null-handling grid

Null:
- full Beta posterior predictive.

Alternative:
- shifted Beta distributions with same posterior concentration and mean ±0.25.

Development:
- stationary false alarm 2.0%
- stationary mean labels 47.36
- moderate detection **51.33%**
- moderate mean labels **40.45**
- severe detection 97.67%
- severe mean labels 22.47

All goals: FAIL.

Therefore:
- held-out unbiased evaluation not run
- bias stress not run

Conclusion:
Full posterior-predictive null is less conservative than Pilot 11 and controls false alarms well, but diffuse shifted-Beta alternatives lose too much separation/power.

Exact next phase:
**Pilot 13 — posterior-predictive null + Pilot-9 point alternatives**

Freeze:
- baseline 48 labels/source
- delta 0.25
- alpha 0.10
- stages 8 / 12 / 24 / 48
- same goals

Change only alternative model:
- null = Beta posterior predictive
- alternative = point p at posterior mean ±0.25

No delta/alpha retuning.


---

# 38. TwinMem Pilot 13 — point alternatives do not recover power

Draft PR: #18  
Branch: `research/twinmem-pilot13-predictive-null-point-alt`

Frozen:
- baseline 48 labels/source
- null = Beta posterior predictive
- alternatives = point posterior mean ±0.25
- alpha 0.10
- stages 8 / 12 / 24 / 48
- unchanged goals
- no tuning grid

Development:
- stationary false alarm 3.75%
- stationary mean labels 46.81
- moderate detection **51.56%**
- moderate mean labels **39.85**
- severe detection 94.38%
- severe mean labels 23.225

All goals: FAIL.
No held-out stress run.

Conclusion:
Pilot 12's low power was not caused by diffuse alternatives.
The broad uncertainty-aware null with only 48 baseline labels/source is the dominant bottleneck.

Exact next phase:
**Pilot 14 — baseline-information stress for the original Pilot-9 process**

Freeze original Pilot-9:
- delta 0.25
- alpha 0.10
- stages 8 / 12 / 24 / 48
- plug-in p0 process

Compare baseline sizes:
- 96 labels/source
- 192 labels/source

Use fresh unbiased and ±0.03 misspecification stress for each size.
Do not retune detector parameters.

Question:
Does more baseline evidence alone make the high-power Pilot-9 process robust enough, or does systematic p0 misspecification remain fatal?


---

# 39. TwinMem Pilot 14 — 192 baseline labels/source is robust across tested stress matrix

Draft PR: #19  
Branch: `research/twinmem-pilot14-baseline-information`

Pilot 14 freezes the original Pilot-9 process:
- delta 0.25
- alpha 0.10
- stages 8 / 12 / 24 / 48
- unchanged detection + efficiency goals
- no model change
- no detector retuning

Only baseline evidence changes:
- 96 labels/source
- 192 labels/source

Each size is tested on fresh:
- unbiased
- all p0 +0.03
- all p0 -0.03
- source skew: verified +0.03, self-report -0.03

500 repeats per size × pattern × scenario.

## 96 labels/source

Unbiased:
- stationary false alarm 5.6%
- moderate detection 85.6%
- moderate labels 30.216
- severe 100%
- PASS

All +0.03:
- stationary 7.6%
- moderate 92.2%
- moderate labels 23.992
- PASS

All -0.03:
- stationary **10.8%**
- moderate 85.4%
- moderate labels 31.32
- FAIL only on stationary specificity

Source skew ±0.03:
- stationary 9.4%
- moderate 96.4%
- moderate labels 22.552
- PASS

Robust across all patterns: NO.

## 192 labels/source

Unbiased:
- stationary 3.4%
- moderate 86.8%
- moderate labels 29.952
- severe 100%
- PASS

All +0.03:
- stationary 7.0%
- moderate 93.8%
- moderate labels 24.6
- severe 100%
- PASS

All -0.03:
- stationary 8.8%
- moderate 89.8%
- moderate labels 30.944
- severe 100%
- PASS

Source skew ±0.03:
- stationary 8.0%
- moderate 97.4%
- moderate labels 21.04
- severe 100%
- PASS

Robust across all tested patterns: **YES**

Main synthetic boundary:
- 48/source: fresh robustness failure
- 96/source: nearly robust but one 10.8% specificity miss
- **192/source: all tested stress patterns pass**

Important interpretation:
More baseline information alone is enough in this simulator to make the high-power Pilot-9 plug-in detector empirically robust across the tested ±0.03 null stress.

New bottleneck:
- 192 baseline labels/source
- 3 source types
- **576 baseline labeled observations total**

Exact next research focus should move from detector mathematics to **baseline-label acquisition efficiency**, e.g.:
- hierarchical/shrinkage reliability estimation
- active sampling of the source with highest uncertainty/value
- safe pooling across time/tasks/users
- naturally labeled trusted assessment outcomes

Do not treat 192/source as a real-world threshold.
Do not merge the research stack into production Hallium.


---

# 40. Hallium H-P5 closure — security + guest isolation + release gate

Merged PR: #20  
Merge commit: `fa9ad1b7f92f835a4d6914a006ce276282c7480f`

This phase explicitly returned from the parked MeloTTS/TwinMem research track to the production Hallium closure roadmap.

## Security closure verified on live repository state

Already present and verified on `main` before H-P5 merge:

- TOPIK activation flags are derived from release / asset / rights state.
- Stale stored booleans cannot unlock scoring, embedded audio, or in-app question content.
- Curriculum Admin least-privilege migration exists:
  - revoke all from `public`, `anon`, `authenticated`
  - grant only SELECT / INSERT / UPDATE to authenticated
  - DELETE policy removed
- direct startup `?view=admin` is not an allowed boot view.
- `AdminStudio()` still independently fails closed on `adminAccess`.
- `/api/audit` and `/api/intelligence` use shared:
  - same-origin guard
  - supported Google-auth guard
  - bounded JSON body parsing
  - per-user quota events
- Groq-backed AI Twin / Study Partner routes enforce supported Google auth.
- server security headers are covered by CI.

## New regression discovered during H-P5

The first unified browser closure run found a real Guest Mode isolation bug:

`app/page.js -> seedFullReviewProfile()`

was writing the reviewer guest profile into the canonical signed-in key:

`hallim:learner-profile:v1`

instead of the guest-scoped key.

Risk:
Guest reviewer state could survive into the canonical browser cache and contaminate the next signed-in learner session.

## Fix

Guest entry now writes through:

`scopedLearnerStorageKey(learnerProfileKey, true)`

and a regression test guarantees `app/page.js` cannot seed the canonical profile key for Guest Mode.

## Unified H-P5 closure workflow

Added:

- `.github/workflows/verify-hp5-closure.yml`
- `.github/scripts/verify-hp5-closure.cjs`

Coverage includes:

- full `tests/*.test.mjs`
- production Next.js build
- Guest Mode storage isolation
- no manufactured Supabase auth session for guest
- direct admin URL fail-closed behavior
- mobile 390px responsive overflow checks
- tablet 820px responsive overflow checks
- desktop 1440px smoke
- Hallium core
- Hangul
- TOPIK mocks
- Study Partners
- existing TOPIK fail-closed provenance browser path
- unauthenticated API rejection
- cross-origin API rejection
- CSP / X-Frame-Options / nosniff / referrer policy checks

## Final CI status on PR head `623e761768c6fda427ae76ba5af31f8063970515`

- Verify standalone Hallium: **PASS**
- Hallium Security Gate: **PASS**
- Verify Hallium H-P5 closure: **PASS**

## Vercel status at this checkpoint

- Vercel project: `hallium`
- connected repository: `sushan5140/hallium`
- latest known production deployment before this merge remains READY
- release-branch preview deployment is READY
- at the time of this handoff update, Vercel had **not yet surfaced a new production deployment for merge SHA `fa9ad1b...`**
- therefore do **not** claim the Guest Mode storage fix is live on production until a deployment containing the merge SHA is verified

## Exact next step

1. Verify or trigger a Vercel production deployment containing `fa9ad1b7f92f835a4d6914a006ce276282c7480f`.
2. Confirm production is READY.
3. Run final live sanity:
   - landing / Guest Mode
   - Hangul
   - TOPIK mocks
   - Study Partners
   - direct admin denial for non-admin/guest
4. After live production verification, mark H-P5 production closure complete.

MeloTTS/TwinMem research remains parked and is not part of production closure.


---

# 41. H-P5 content / cloud sync / native-browser voice QA

Merged PR: #22  
Merge commit: `afd187c84f139c306153609ebb90dde6007c1816`

This phase continues production Hallium closure while keeping MeloTTS/TwinMem parked.

## New release-contract coverage

Added:
`tests/hp5-release-contracts.test.mjs`

Release invariants now explicitly cover:

### Curriculum / content structure
- published curriculum retains the multiskill release invariant:
  - listening
  - shadowing
  - dictation
  - production
  - checkpoint
- curriculum coverage exemptions remain explicit rather than hiding missing stages
- `curriculumAudit(units)` remains wired into the live curriculum.

### Auth / cloud sync
- signed-in app remains gated while `hydrateFromCloud(user)` runs
- canonical local cache is cleared when it belongs to another user
- local owner is claimed only after merged state is applied
- merged lesson progress preserves:
  - completion from either local or cloud
  - furthest reached step
- timestamped profile / AI audit state keeps the newer record
- merged state is pushed back to cloud only after hydration/merge.

### Guest Mode
- guest entry profile remains guest-scoped
- canonical signed-in learner profile key is not seeded by guest entry
- guest path remains local-only for learner sync.

### Native browser Korean voice
- newer local/cloud voice preference wins by timestamp
- slow practice remains a multiplier over account pace
- rate remains clamped to the supported safe range
- no MeloTTS dependency is required for this closure phase.

## Korean content audit

A source-level review was performed on the live Hallium curriculum/content surface:

- no empty Korean teaching fields found in the scanned curriculum source
- no malformed long standalone jamo sequences found
- placeholder keyword hits were normal HTML form placeholders, not unfinished teaching content
- romanization exists as a secondary learner aid
- UI copy explicitly states that Romanization is only a learner guide
- Hangul remains the primary teaching form
- built-in casual Message Makeover phrases were reviewed at source level with no blocking language issue identified

Important:
This is a structural/editorial source audit, **not native-speaker certification**.

## CI

PR #22:
- Verify standalone Hallium: PASS
- Verify Hallium H-P5 closure: PASS

H-P5 closure browser checks continued to pass after adding these contracts.

## Production observability

Current served production at `https://hallium.vercel.app`:
- authenticated Vercel fetch: HTTP 200
- security headers present
- `/hangul`, `/topik-mocks`, and `/study-partners` responded successfully in live fetch checks
- Vercel runtime error scan for the previous 24h: **no runtime errors found**

## Remaining production blocker

Vercel project:
- `hallium`
- project ID `prj_CMn14LNFYa4bKxjLmG9Vun7WBsIV`
- repository `sushan5140/hallium`

At this checkpoint, Vercel still reports the latest production deployment as older main SHA:

`250994e430b0338bfa3b1ada34308d66da92874f`

The merged H-P5 Guest Mode fix and QA commits are therefore **not yet verified as live in production**.

There is no repo-side `VERCEL_TOKEN` / `VERCEL_PROJECT_ID` CI deployment wiring, and the connected Vercel tool surface does not expose a project-targeted promote/redeploy action for an arbitrary Git commit.

Do not claim final production closure until a deployment containing:
- `fa9ad1b7f92f835a4d6914a006ce276282c7480f` or descendant
- preferably current main including `afd187c84f139c306153609ebb90dde6007c1816`

is observed as READY in production.

## Current H-P5 status

Completed:
- security/abuse audit
- TOPIK fail-closed regression
- guest/auth isolation
- responsive/device CI coverage
- auth/cloud merge regression coverage
- curriculum structural QA
- Korean content source audit
- native-browser voice regression
- TOPIK integration QA
- Study Partners/Twinverse smoke + server guards
- production build/security/header checks

Pending:
- **production deployment of current main**
- final live sanity on that exact production artifact

MeloTTS/TwinMem remains parked.


---

# 42. Production rollout checkpoint

Requested on 3 October 2026 after H-P5 closure.

Purpose:
- force the existing GitHub → Vercel integration to build the current `main` tree
- no application behavior changes in this checkpoint
- Batch 4 remains intentionally not started


---

# 43. H-P5 FINAL PRODUCTION CLOSURE — COMPLETE ✅

Completed on 3 October 2026.

## Production rollout

Production deployment:
- Vercel project: `hallium`
- deployment ID: `dpl_86TfZhSAq66AmjspYTSnamouF15i`
- production alias: `https://hallium.vercel.app`
- deployed Git commit: `6d3a9582529a6ddaa13621c74c118b67e975007a`
- target: production
- state: **READY**
- alias error: none

This deployment contains the H-P5 Guest Mode isolation fix and the merged H-P5 production closure work.

A behavior-neutral source comment was used only to force the existing GitHub → Vercel integration to rebuild current Hallium after documentation-only commits were ignored.

## Live production interactive QA

QA PR: #23
Merged QA workflow commit:
`a486bcaddf3e7e0b96d0c7832105d512024d6581`

Added:
- `.github/scripts/verify-live-production.cjs`
- `.github/workflows/verify-live-production.yml`

The live Chromium suite ran against:
`https://hallium.vercel.app`

Validated successfully:

### Landing / entry
- landing page HTTP 200
- Google entry CTA visible
- Guest entry CTA visible
- Guest Mode entered through the actual CTA

### Guest isolation
- guest session flag created
- fresh guest session UUID created
- canonical signed-in learner profile key remains empty
- guest-scoped learner profile is present
- no synthetic Supabase auth token/session is created
- a separate fresh browser context receives a different guest session ID

### Admin protection
- direct `?guest=1&view=admin` request fails closed
- private Curriculum Studio content is not exposed to guest

### Live learning routes
All responded successfully in production:
- `/`
- `/hangul`
- `/topik-mocks`
- `/study-partners`
- `/flashcards`

### Navigation
- Hangul Lab back navigation points to Hallium dashboard
- Flashcards back navigation points to Hallium dashboard

### Real production flashcard interaction
Chromium successfully:
- opened the Starter flashcard iframe
- selected `책`
- verified displayed Korean word `책`
- bookmarked the card
- moved the card to Learning
- confirmed progress UI updated

### Responsive behavior
Live checks passed at:
- mobile 390×844
- desktop 1440×1000

No horizontal overflow was detected on the audited routes.

### Browser/runtime health
- live browser page-error/console-error assertion: PASS
- standalone Hallium CI on QA branch: PASS
- live production QA workflow: PASS
- Vercel runtime error scan after interactions: **no runtime errors found in the previous hour**

## Final H-P5 status

**H-P5 is COMPLETE.**

Closed areas:
- production rollout
- Guest Mode isolation
- auth/cloud sync QA
- direct-admin denial
- responsive production routes
- TOPIK production smoke
- Hangul production smoke
- Study Partners production smoke
- Flashcards production interaction
- back-navigation checks
- security/runtime health

## Important repository/deployment note

After production was verified on app commit `6d3a958...`, PR #23 merged QA-only files to `main` as `a486bcad...`.

Those later files are CI/QA infrastructure only and do not change Hallium runtime behavior.

Therefore the deployed Hallium application state is current for product code, while `main` may contain newer non-runtime QA/documentation commits.

## Next phase

**Do not start Batch 4 automatically.**

Batch 4 / H-P6 Learning Intelligence begins only when the user explicitly says to start it.

MeloTTS/TwinMem remain parked.


---

# 44. Batch 4 / H-P6 Learning Intelligence — H-P6.1 + H-P6.2

Batch 4 officially started after H-P5 production closure.

## H-P6.1 — deterministic learner intelligence foundation

Main merge:
- `6164eae8dffc6b28054bda4a24b5a4e4db536ea4`

Added:
- `lib/learning-intelligence.js`
- `tests/learning-intelligence.test.mjs`

Core behavior:
- deterministic weakness scoring
- overdue review urgency
- weak-skill ranking
- reinforce / balanced / stretch inference
- deterministic “what should I study next?” plan
- due review gets priority
- AI remains optional enrichment rather than the only recommendation source

Existing Hallium Home/Profile/review/intelligence surfaces now use the same weakness model.

## H-P6.2 — session-aware preferences

Main commit:
- `e421b2371140a65232034cb7d0ff43332d21d04f`

Added learner-controlled:
- daily study time
- practice-focus preferences:
  - conversation
  - listening
  - vocabulary
  - grammar
  - assessment

Preferences:
- live inside existing `intelligence_state`
- sync for signed-in users
- remain local in Guest Mode
- shape optional route ordering
- fit the route to available session time

Profile exposes:
- 10 / 15 / 20 / 30 minute choices
- focus selectors
- current difficulty
- planned minutes
- recommended action count
- highest current weakness

Home learning desk shows the fitted session duration.

## H-P6.2 safety follow-up

Additional main commits:
- `28fbc2f0c3d36c604d2e94950fc85bbfc2001483`
- `331234426ebad6bb7f8cfdf5911ac911e10d834b`
- `52605145cf077e98582e3ca77bf43b25c96a3d80`
- `666f72cd0e4490bd48f3424e613b6e1b6745cb94`
- `95975807990360da76ab685129ccbee998976590`

Safety invariant:
- an AI-generated route cannot move optional conversation/test work ahead of a scheduled due review
- `enforceLearningPlanSafety()` restores required `review_queue` first
- session preferences may reorder optional actions only after required recall

A mechanical literal-newline patch bug was detected immediately by CI, fixed, and the brittle integration assertion was updated to the new safe-route contract.

Final verified current-head checks:
- standalone Hallium: PASS
- Study Partners production integration: PASS
- integrated Starter Flashcards Chromium: PASS

PR #27 was closed unmerged because the H-P6.2 work had already been pushed directly to `main`; merging it would duplicate/diverge history.

## Exact next slice

**H-P6.3 — adaptive review scheduling**

Goal:
replace the coarse fixed success-count review ladder with a deterministic schedule that considers:
- miss count
- consecutive/successful recoveries
- current weakness urgency
- whether the answer was just failed or recovered
- bounded intervals suitable for Hallium’s short-session model

Preserve:
- Guest Mode isolation
- cloud sync behavior
- deterministic-first recommendation policy
- AI as optional enrichment only


---

# 45. Batch 4 / H-P6.3 — adaptive review scheduling COMPLETE

Merged PR: #28  
Merge commit: `680cacdc66514ac52249011cbe9dd1fb80aa3c88`

The old fixed successful-review ladder:

`[3, 7, 14, 30, 60]`

has been removed.

New deterministic scheduler:
`adaptiveReviewSchedule()`

Inputs:
- latest recall correctness
- total miss history
- successful recovery count
- current review urgency
- previous result state

Outputs:
- next interval in days
- review stage:
  - relearn
  - recovering
  - strengthening
  - stable
- bounded stability score
- human-readable scheduling reason

Rules:
- failed recall returns tomorrow
- repeated misses keep spacing short
- fragile recovery can remain close
- clean repeated recovery expands spacing
- high urgency shortens the next successful interval
- max interval is 60 days

Persisted weakness metadata now includes:
- `intervalDays`
- `reviewStage`
- `reviewStability`
- `scheduleReason`
- `nextReviewAt`

Review completion learning-events also include:
- review stage
- review stability
- interval days

Review UI previews the selected next interval before confirmation.

Validation on PR #28:
- standalone Hallium: PASS
- Hallium Security Gate: PASS
- full H-P5 Chromium closure: PASS

Exact next slice:
**H-P6.4 — deterministic weekly study planning**

Goal:
- provide a real 5–7 day evidence-grounded plan even when AI is unavailable
- use due reviews, weakness ranking, session minutes, focus preferences and next lesson
- keep AI as an optional enhancement rather than a dependency


---

# 46. Batch 4 / H-P6.4 + H-P6.5 — LEARNING INTELLIGENCE COMPLETE ✅

Batch 4 is now complete on production-source `main`.

Current product-code merge after H-P6.5:
`4e1ac1e7741c40c1db7e081a0e9dc79f6c104b9d`

## H-P6.4 — deterministic weekly study planning

Main commit:
`75d72b526695074c3ae74e5c776aa3fa1979596b`

Added deterministic local-first 5–7 day study planning grounded in:
- scheduled review items
- ranked weakness evidence
- saved daily session minutes
- saved practice-focus priorities
- latest structured study score
- current study level
- next curriculum lesson

Behavior:
- Hallium creates a useful weekly plan before any AI call
- Guest Mode keeps the local deterministic plan
- signed-in users can optionally receive AI enrichment
- the deterministic plan is passed into AI as grounded context
- the UI labels whether the plan is local or AI-enhanced

## H-P6.5 — interest-aware unlocked lesson routing

Merged PR:
#32

Merge commit:
`4e1ac1e7741c40c1db7e081a0e9dc79f6c104b9d`

Added topic interests:
- Daily life
- Food
- Shopping
- Travel & directions
- Conversation
- Opinions

Rules:
- maximum 3 saved topics
- explicit empty topic list disables interest routing
- recommendations only consider lessons where existing curriculum gating returns `isUnlocked(...) === true`
- future locked lessons are never recommended
- completed unlocked lessons may be revisited
- the current unlocked lesson receives only a small progression boost
- stronger content relevance can still outrank that boost
- mandatory next-lesson progression remains unchanged

New Home surface:
**FOR YOUR INTERESTS**

Shows:
- best unlocked lesson match
- matched topic tags
- unit number
- current/review status
- open/revisit action

Profile now exposes topic-interest controls alongside:
- daily session minutes
- practice-focus preferences

## H-P6 preference sync hardening

Preference records now persist:
`updatedAt`

Local/cloud preference conflicts use:
`newestByTimestamp(local.preferences, remote.preferences, "updatedAt")`

This applies to the existing scoped `intelligence_state`:
- signed-in preferences sync across devices
- Guest Mode remains local/scoped
- stale local preferences no longer blindly override newer cloud preferences

Topic interests are also included in:
- deterministic weekly-plan evidence metadata
- AI learner snapshot
- Home interest recommendations

## H-P6.5 validation

PR #32 final head:
`7ba7db71686c590314cd991449a25ac5c6cf3d0f`

Final required gates:
- Verify standalone Hallium: **PASS**
- Hallium Security Gate: **PASS**
- Verify Hallium H-P5 closure / Chromium: **PASS**

The first CI attempt had one test-fixture mismatch:
- a completed lesson had more topic keyword evidence than the current lesson
- the small progression boost correctly did not overpower stronger relevance
- the test fixture was corrected rather than inflating the algorithmic boost

Obsolete draft:
- PR #26 closed unmerged
- superseded by freshly rebased H-P6.5 PR #32

## Batch 4 final capability matrix

H-P6.1:
- deterministic weakness scoring ✅
- review urgency ✅
- next-best-action route ✅
- AI optional ✅

H-P6.2:
- daily session minutes ✅
- practice-focus preferences ✅
- session-aware route fitting ✅
- due-review safety over preferences/AI ✅
- scoped cloud sync ✅

H-P6.3:
- adaptive review scheduling ✅
- miss/recovery-aware intervals ✅
- bounded 1–60 day spacing ✅
- review-stage/stability metadata ✅

H-P6.4:
- deterministic 5–7 day plan ✅
- review/focus/score/lesson grounding ✅
- Guest Mode local-first behavior ✅
- optional AI enrichment ✅

H-P6.5:
- topic-interest preferences ✅
- prerequisite-safe lesson ranking ✅
- Home interest recommendation ✅
- topic evidence in weekly/AI context ✅
- timestamp-safe cross-device preference precedence ✅

## Batch 4 status

**COMPLETE ✅**

No additional H-P6 slice is required for the originally defined Batch 4 scope:
- learner weakness model
- “what should I study next?”
- spaced/adaptive review scheduling
- session-aware personalization
- deterministic weekly planning
- interest-aware content routing

Do not reopen H-P6 by default unless a concrete regression or new product requirement appears.

MeloTTS/TwinMem research remains parked and separate.


---

# 47. Batch 5 / H-P7 — REAL KOREAN EXPANSION COMPLETE ✅

Batch 5 is complete on production-source `main`.

Current Batch 5 closing merge:
`27c8c8cf55ccb5a2981f73c8952dd92db5a8561f`

## H-P7.1 — shared Real Korean foundation
Merged PR: #33

Added:
- deterministic authored scene/phrase bank
- friends, caring, feelings, making up, café/food, travel/directions, school/work
- natural meaning + romanization + register notes
- controlled softer/bolder/funnier variants
- Guest Message Makeover routes through the same authored bank
- signed-in AI Message Makeover receives compact Hallium-authored grounding
- fail-closed behavior for unknown messages and unsupported register combinations

Important regression found/fixed:
- generic words such as “please” could create false phrase matches
- matcher now ignores generic stopwords and requires meaningful overlap

## H-P7.2 — Real Korean scene packs
Merged PR: #34

Added visible scene-pack learning UI:
- authored Korean
- natural meaning
- register
- romanization toggle
- audio playback
- softer/stronger variants
- responsive mobile layout

## H-P7.3 — natural multi-turn dialogues
Merged PR: #35

Every Real Korean scene now has at least one authored 3+ turn dialogue with:
- explicit casual/polite register
- Korean
- romanization
- natural English meaning
- full-dialogue playback
- contextual usage/register note

## H-P7.4 — Register Intelligence
Merged PR: #36

Teaches register as a social-context system rather than only “casual vs polite”.

Contexts:
- close friend / 반말
- acquaintance or stranger / 해요체
- senior or teacher / honorific-aware speech
- service interaction / compact polite Korean

Each guide includes:
- where it fits
- where not to use it
- common markers/endings
- relationship-shift example
- explanation of why the form sounds natural

Deterministic relationship mapping fails closed when Hallium has no safe authored line.

## H-P7.5 — Casual Korean / texting
Merged PR: #37

Added authored texting-pattern teaching for:
- subject omission
- compressed check-ins
- ㅋㅋ vs ㅎㅎ
- -네 reaction ending
- -잖아 shared-context ending
- 응 vs polite yes forms
- 것 같아 softening

Each pattern shows:
- more explicit form
- more text-like form
- meaning
- explanation
- safe relationship contexts
- contexts to avoid
- audio

Guardrail:
casual shortcuts are not taught as safe defaults for seniors or strangers.

## H-P7.6 — Scenario Practice
Merged PR: #38

Added deterministic real-life practice that grades both meaning and register.

Initial authored scenarios include:
- close friend heading home in heavy rain
- asking a stranger for the subway station
- telling a professor you may be late
- café takeout request
- reacting to a close friend's joke
- repairing a misunderstanding

Behavior:
- 3+ plausible Korean choices
- target register
- authored correct answer
- explanation of social fit
- grammar/register mismatch distinction
- fail-closed invalid scenario/choice handling
- natural-answer audio after mistakes

## H-P7.7 — H-P6 × H-P7 learning-intelligence integration
Merged PR: #39

Real Korean scenes now carry explicit H-P6 topic tags.

The learning-intelligence engine can rank authored Real Korean scenes using the same saved interests used for unlocked-lesson routing.

Grounded mappings include:
- Travel → Travel & directions
- Food → Café & food
- Daily life / Conversation → social Real Korean scenes
- Opinions → repair / school-work contexts where explicitly tagged

Rules:
- unsupported topics such as Shopping do not invent a scene match
- explicit empty topic list disables Real Korean interest routing
- Home now shows **REAL KOREAN FOR YOUR INTERESTS**
- interest routing remains optional
- mandatory due-review safety remains authoritative and cannot be displaced by an interest recommendation

## Batch 5 validation

Every H-P7 slice used the standard Hallium validation gates before merge:
- Verify standalone Hallium ✅
- Hallium Security Gate ✅
- Verify Hallium H-P5 closure / Chromium ✅

The final H-P7.7 closing head:
`1beb705841e2788c8bcba0afa987dd743ec3d7d3`

The final H-P7.7 merge:
`27c8c8cf55ccb5a2981f73c8952dd92db5a8561f`

## Batch 5 capability matrix

H-P7.1:
- shared authored Real Korean foundation ✅
- deterministic Guest Mode phrase routing ✅
- grounded AI Message Makeover ✅

H-P7.2:
- visible real-life scene packs ✅
- audio/register/variants ✅

H-P7.3:
- multi-turn contextual dialogues ✅

H-P7.4:
- social register intelligence ✅
- relationship-aware guidance ✅

H-P7.5:
- natural texting/casual layer ✅

H-P7.6:
- meaning + register scenario practice ✅

H-P7.7:
- H-P6 interest routing connected to H-P7 scenes ✅
- due-review safety preserved ✅

## Batch 5 status

**COMPLETE ✅**

Do not reopen H-P7 by default unless a concrete regression or new Real Korean requirement appears.

## Exact continuation point

Next phase:
**Batch 6 / H-P8 — Practice Engine 2.0**

Start Batch 6 from the current `main` after this handoff update.

Batch 6 should build on:
- H-P6 weakness/review/session/interest intelligence
- H-P7 authored Real Korean scenes/register/texting/dialogues/scenarios
- existing Guest Mode isolation
- existing cloud-sync and security gates

MeloTTS and TwinMem remain parked and are not part of the Batch 6 default continuation path.


---

# 48. Batch 6 / H-P8 — PRACTICE ENGINE 2.0 COMPLETE ✅

Batch 6 is complete on production-source `main`.

The implementation that remains authoritative is the practice-evidence architecture in `lib/practice-engine.js`. A superseded parallel adaptive-session PR (#41) was closed, and a later duplicate implementation was removed in cleanup PR #51 so Hallium has one practice-engine source of truth.

MeloTTS and TwinMem/voice-memory work remain parked and were not touched by Batch 6.

## H-P8.1 — Practice evidence foundation
Merged PR: #42
Merge: `72f941f963e226508f257d775ed7f09a96410b63`

Established deterministic practice-attempt records with:
- practice mode
- scene / skill provenance
- learner response and expected answer
- register-match evidence
- hint/retry counts
- normalized score
- strong / developing / relearn outcome

## H-P8.2 — Persist practice evidence into review memory
Merged PR: #43
Merge: `51b7110dc07ffa02910cf3ee478df1ba6b135857`

Connected non-strong practice outcomes to the existing learner mistake/review memory instead of keeping practice results isolated.

## H-P8.3 — Practice retry and recovery loop
Merged PR: #44
Merge: `cb322fb6f74af6841c33899161f33fb2d1e0a2a7`

Added retry/recovery evidence so Hallium can distinguish a first miss from later recovery rather than treating every attempt as a flat result.

## H-P8.4 — Multi-mode practice evidence
Merged PR: #45
Merge: `5662c467495ecd014eeb8a48895e81728c880fdd`

Generalized the evidence model beyond one exercise surface so multiple practice modes contribute comparable learning evidence.

## H-P8.5 — Companion lesson evidence
Merged PR: #46
Merge: `6e7a81702175cd72c40fbdb6784521eb5d3a0d3e`

Connected lesson/Companion work to the practice-evidence stream so structured study and free practice no longer live as separate learning histories.

## H-P8.6 — Practice evidence summary
Merged PR: #47
Merge: `2ffebf96694d9fadbb055116c8d2febd7b5fbe00`

Added deterministic evidence summaries including:
- recent attempt count
- average score
- outcome counts
- mode counts
- per-skill evidence
- highest current weak skill
- early / growing / multi-mode evidence labels

## H-P8.7 — Evidence-aware next-practice routing
Merged PR: #48
Merge: `d4d5a778945f7a5aca69be2a8745e46f217f567d`

Connected practice evidence back into the H-P6 learning route.

Routing can now recommend an appropriate next surface from the current weak skill, including:
- Real Korean / register / conversation
- listening / lesson context
- grammar
- vocabulary
- reading/context
- focused study check fallback

Safety rule:
scheduled due review remains authoritative and stays ahead of optional evidence-based routing.

## H-P8.8 — Freshness-aware practice evidence
Merged PR: #49
Merge: `d4745a458eb58e06150f612ebe600751b625fd79`

Added evidence freshness so stale attempts do not keep controlling the learner's next-practice recommendation indefinitely.

The practice engine now filters routing evidence by a bounded age window while preserving the underlying stored history.

## Batch 6 cleanup

Superseded PR:
- #41 — closed without merge after the evidence architecture became the accepted H-P8 path.

Cleanup:
- PR #51 removed the duplicate practice-session implementation that was briefly added after H-P8.1–H-P8.8 had already landed.
- `lib/practice-engine.js` remains the single source of truth for Batch 6 practice evidence/routing.

## Batch 6 capability matrix

- normalized practice-attempt evidence ✅
- register-aware scoring ✅
- hints/retries reflected in evidence ✅
- strong / developing / relearn outcomes ✅
- non-strong outcomes feed review memory ✅
- recovery/retry loop ✅
- multi-mode evidence ✅
- Companion lesson evidence ✅
- per-skill evidence summaries ✅
- evidence-aware next-practice routing ✅
- due-review safety preserved ✅
- freshness-aware routing ✅
- Guest/cloud-sync/security architecture preserved ✅
- MeloTTS/TwinMem excluded ✅

## Batch 6 status

**COMPLETE ✅**

Do not reopen H-P8 by default unless a concrete practice regression or a new product requirement appears.

## Exact continuation point

Next phase:
**Batch 7 / H-P9 — Flashcards 2.0**

Start Batch 7 from the current `main` after this handoff update.

MeloTTS and TwinMem remain parked and should continue to be excluded from the default roadmap.


---

# 49. Batch 7 / H-P9 — FLASHCARDS 2.0 COMPLETE ✅

Batch 7 is complete on production-source `main`.

MeloTTS and TwinMem/voice-memory remained parked throughout the batch.

## H-P9.1 — flashcard evidence foundation
Merged PR: #53

Added deterministic card-learning evidence:
- new / learning / recovering / strong states
- attempts, misses, recoveries and streaks
- stability
- adaptive next-review dates
- deck mastery / due summaries

## H-P9.2 — recall-mode evidence
Merged PR: #54

Added distinct evidence for:
- recognition
- production
- listening
- sentence completion

Rules:
- production/listening/sentence recall contribute stronger evidence than recognition-only checks
- reveals and hints reduce evidence strength
- per-mode accuracy remains separately measurable
- unknown modes fail closed to recognition

Important architecture correction:
Flashcards reuse Hallium's existing H-P6 `adaptiveReviewSchedule()`.
There is no second flashcard-only SRS.

## H-P9.3 — shared review-memory adapter
Merged PR: #55

Added adapters from flashcard outcomes into Hallium's existing mistake/review-memory shape.

- failed cards can enter canonical review memory
- recovered cards retain stable identity
- adaptive review metadata is preserved
- missing card IDs fail closed

## H-P9.4 — Starter UI integration
Merged PR: #56

Connected the existing 12-card Starter visual deck to the H-P9 engine.

Architecture:
- static iframe remains presentation
- iframe emits attempts
- parent React bridge validates same-origin/source
- parent applies flashcard evidence logic
- mastery/due state is sent back
- fixed 1-day / 3-day scheduling was removed
- review-only mode now follows evidence

## H-P9.5 — collection adapters
Merged PR: #57

Added source adapters for:
- Starter
- curriculum lesson vocabulary
- Real Korean authored phrases
- weak/due cards
- saved cards

Rules:
- curriculum vocabulary is derived from real lesson `kind:"word"` steps
- repeated vocabulary is deduplicated
- Real Korean cards derive from the shared authored bank
- weak cards derive from evidence
- no second curriculum is maintained

## H-P9.6 — visible collection browser
Merged PR: #58

Added visible Flashcards 2.0 collection switching:
- Starter collection
- Real Korean scene collections
- accessible tabs
- Korean, meaning, romanization, register and note context
- existing Starter evidence bridge preserved

## H-P9.7 — canonical account/core integration
Merged PR: #59
Merge: `0bd6f61ecc3efb155b64f64cc2f99d4f86cfd701`

Closed the remaining state/sync gap:
- flashcard evidence is stored inside existing Hallium `intelligence_state`
- existing learner-state cloud sync therefore carries flashcard state without a new table
- curriculum flashcard catalog is derived directly from Hallium Core lesson objects
- local/cloud flashcard evidence merges per card using latest review timestamp
- saved IDs merge without duplication
- Starter legacy evidence migrates into canonical state
- Starter bookmarks emit stable canonical IDs
- visible Weak & due, Saved, Curriculum and Real Korean collections read shared learner state

## Batch 7 capability matrix

- deterministic flashcard evidence ✅
- new / learning / recovering / strong mastery ✅
- recognition / production / listening / sentence evidence ✅
- hint/reveal evidence penalties ✅
- H-P6 adaptive scheduler reused ✅
- review-memory integration ✅
- Starter visual deck integrated ✅
- fixed local scheduling removed ✅
- curriculum collection adapter ✅
- Real Korean collection adapter ✅
- weak/due collection ✅
- saved collection ✅
- visible collection browser ✅
- canonical intelligence-state persistence ✅
- signed-in cloud-sync path preserved ✅
- local/cloud per-card merge ✅
- MeloTTS/TwinMem excluded ✅

## Batch 7 status

**COMPLETE ✅**

Do not reopen H-P9 by default unless a concrete flashcard regression or new product requirement appears.

## Exact continuation point

Next phase:
**Batch 8 / H-P10 — Hangul → Beginner progression**

Start Batch 8 from current `main`.

Primary goal:
turn the existing Hangul Lab into a measured bridge from letter/syllable reading into the real Beginner curriculum, rather than a disconnected alphabet surface.

---

# 50. Batch 8 / H-P10 — HANGUL → BEGINNER PROGRESSION COMPLETE ✅

Batch 8 is complete on production-source `main`.

## H-P10.1 — readiness foundation
Merged PR: #61

Added measured stages:
- letters
- syllables
- first words
- beginner ready

Readiness uses real evidence:
- recognized letters
- recent sound-practice accuracy
- unique syllable builds
- no-romanization word reading
- writing

## H-P10.2 — syllable → first-word reading bridge
Merged PR: #62

Added a no-romanization reading drill that:
- reuses Hallium's existing Starter vocabulary bank
- shows Korean + meaning choices
- grants evidence only on correct reads
- deduplicates by stable word ID
- feeds the same H-P10 readiness engine

## H-P10.3 — pronunciation decoding micro-drills
Merged PR: #63

Added beginner decoding practice for:
- final consonant neutralization
- liaison
- nasalization
- aspiration
- tensification

Rules:
- Korean sound forms only
- explanations after answering
- only correct decodes persist mastery evidence

## H-P10.4 — final Hangul graduation checkpoint
Merged PR: #64

Beginner unlock requires all five:
- at least 34/40 letters recognized
- at least 8/10 recent sound-practice average
- at least 12 unique syllables built
- at least 6 Starter words read without romanization
- at least 3 pronunciation patterns decoded correctly

## H-P10.5 — Beginner handoff continuity
Merged PR: #65

Graduation now deep-links directly to:
- `unit-1-lesson-1`
- "Meeting someone new"

Continuity behavior:
- no Companion-home detour
- existing lesson progress is restored
- signed-in and Guest Mode both work
- one-time Hangul-complete transition notice
- no duplicate Beginner lesson/onboarding flow

## H-P10.6 — canonical persistence + cloud sync
Merged PR: #66
Merge: `5948772478ec5b14a2ee07227d22d80131d5d9c2`

Closed the final persistence gap:
- Hangul evidence mirrors into `hallim:intelligence:v1.hangul`
- existing `learner_state.intelligence_state` remains the cloud source of truth
- letters, writing, quiz history, syllables, word reads and decoding evidence are preserved
- local/cloud merges union Hangul evidence instead of one device overwriting another
- restored canonical state hydrates the existing static Hangul Lab
- graduation persists `graduatedAt`
- no new Supabase table or parallel sync system

## Batch 8 capability matrix

- letter → syllable → word → Beginner progression ✅
- evidence-based readiness ✅
- no-romanization first-word reading ✅
- pronunciation decoding basics ✅
- final graduation gate ✅
- direct Beginner Lesson 1 handoff ✅
- Guest Mode continuity ✅
- canonical learner-state persistence ✅
- cross-device merge ✅
- cloud restore into Hangul Lab ✅
- graduation timestamp ✅
- no duplicate curriculum/sync system ✅

## Batch 8 status

**COMPLETE ✅**

Do not reopen H-P10 by default unless a concrete Hangul/Beginner transition regression appears.

## Exact continuation point

Next phase:
**Batch 9 / H-P11 — TOPIK Studio 2.0**

Start Batch 9 from current `main`.

Primary goal:
turn TOPIK from a paper viewer into an evidence-aware exam-prep system with real paper structure, skill diagnosis, targeted practice and measurable improvement.


---

# 51. Batch 9 / H-P11 — TOPIK STUDIO 2.0 COMPLETE ✅

Batch 9 is complete on `main`.

## H-P11.1 — TOPIK attempt evidence foundation
Merged PR: #70

Added normalized attempt evidence:
- completion percentage
- attempt duration
- section completion
- verified score enrichment when provenance allows scoring
- verified average
- weakest scored section
- writing completion evidence without fake auto-grading

## H-P11.2 — question-type intelligence
Merged PR: #71

Added Hallium diagnostic taxonomy for TOPIK I / II:
- vocabulary / grammar
- notices / practical information
- ordering
- context blank-fill
- main idea
- detail
- inference
- listening response/detail/main idea/inference
- TOPIK II writing sentence/data/essay blocks

Unverified papers keep completion evidence only and never invent correctness.

## H-P11.3 — weakness diagnosis engine
Merged PR: #72

Weakness ranking combines:
- verified accuracy
- unanswered rate
- repeat exposure
- recency
- evidence confidence

Each weakness exposes:
- weakness score
- confidence
- exposures
- accuracy/unanswered signal
- reason
- actionable state

## H-P11.4 — targeted practice router
Merged PR: #73

Diagnosis now routes into existing Hallium TOPIK Companion lessons where possible.
Examples:
- TOPIK I ordering → i11
- TOPIK II reading flow/order → ii08
- Writing 51–52 → ii09
- essay/data writing → ii10

Fallback:
- focused mock practice when no dedicated Hallium lesson is a strong match

No second TOPIK curriculum or planner was introduced.

## H-P11.5 — score trajectory + improvement tracking
Merged PR: #74

Tracks:
- verified overall mock score trajectory
- per-skill accuracy trajectory
- improving / stable / declining / insufficient
- most improved skill
- most declined skill

Only verified scored evidence can create score or skill improvement claims.

## H-P11.6 — targeted-practice impact loop
Merged PR: #75

Hallium stores recommendation snapshots:
- exact target skill
- baseline verified accuracy
- weakness score
- recommendation timestamp
- route used

Later verified evidence on the exact same skill evaluates:
- helped
- flat
- worse
- insufficient

Unrelated skill gains are never credited to the intervention.

## H-P11.7 — canonical TOPIK persistence + cloud sync
Merged PR: #76
Merge: `737729d67f5353a21361cd4bc236ba5c7de16b38`

TOPIK state now participates in the existing canonical learner sync:
- `hallim:intelligence:v1.topik`
- existing `learner_state.intelligence_state` remains cloud source of truth
- attempt evidence merges across devices
- intervention history merges across devices
- cloud-restored canonical state repopulates TOPIK Studio evidence/intervention stores
- retain up to 80 attempts
- retain up to 30 intervention snapshots
- diagnosis / trajectory / impact remain derived from evidence rather than stale stored summaries
- no new Supabase table
- no second TOPIK sync architecture

## Batch 9 capability matrix

- mock attempt evidence ✅
- verified scoring safeguards preserved ✅
- question-type diagnosis ✅
- weakness ranking ✅
- targeted practice queue ✅
- score trajectory ✅
- per-skill trajectory ✅
- targeted-practice impact measurement ✅
- canonical learner-state persistence ✅
- cross-device merge ✅
- cloud restore into TOPIK Studio ✅
- no duplicate TOPIK architecture ✅

## Batch 9 status

**COMPLETE ✅**

Do not reopen H-P11 by default unless a concrete TOPIK Studio regression appears.

## Exact continuation point

Next phase:
**Batch 10 / H-P12 — Study Partners 2.0**

Start Batch 10 from current `main`.

Primary goal:
turn Study Partners from a static social surface into a trustworthy learner-matching system using level, goals, language practice needs, activity and lightweight compatibility signals while preserving safety, privacy and low-pressure interaction.


---

# 52. Batch 10 / H-P12 — STUDY PARTNERS 2.0 COMPLETE ✅

Batch 10 is complete on `main`.

## H-P12.1 — matching foundation
Merged PR: #78

Study Partners discovery now uses transparent compatibility scoring from opted-in learner signals:
- complementary learning focus
- Korean level distance
- availability compatibility
- evidence-informed vs self-described focus

Discovery remains opt-in and self-matches stay excluded.

## H-P12.2 — goals + practice needs
Merged PR: #79

Added optional learner-selected study intent:
- conversation
- TOPIK
- accountability
- confidence
- reading
- writing

Practice needs:
- speaking
- listening
- reading
- writing
- vocabulary
- grammar

Stored in existing profile diagnostic JSON.
No new table or schema migration.

## H-P12.3 — safe activity + cadence
Merged PR: #80

Added:
- light / regular / intensive study cadence preference
- coarse profile freshness signal

Guardrails:
- no private-message inspection
- no accept/decline reputation scoring
- no public reliability label
- only a small bounded compatibility bonus

## H-P12.4 — discovery filters
Merged PR: #81

Learners can narrow opted-in suggestions by:
- minimum compatibility
- level distance
- shared study goal
- shared practice need
- mutual complement only
- availability match only

Filters can only remove already-eligible suggestions and never reveal hidden learners.

## H-P12.5 — request context + first-session intent
Merged PR: #82

Partner requests now carry sanitized structured study intent:
- goal
- practice need
- cadence
- availability
- complementary learning areas
- fit score

No free-form pre-consent request messages.

Migration:
`20261008000100_partner_request_context.sql`

Accepted requests seed a lightweight first-session plan inside the shared room.

## H-P12.6 — partnership continuity
Merged PR: #83
Merge: `cfec7934370e094e03fa1195e80db8dc20bdc2f5`

Adds neutral continuity from shared-room evidence only:
- latest shared practice session
- saved round responses
- deliberately shared notes
- joint notes
- unfinished shared work
- sensible next action

Private conversation content is not read.
No friendship, relationship-health, or popularity score is created.

## Batch 10 capability matrix

- transparent compatibility scoring ✅
- learning-goal matching ✅
- practice-need matching ✅
- cadence compatibility ✅
- safe activity freshness ✅
- learner-controlled discovery filters ✅
- structured request intent ✅
- mutual-consent request flow preserved ✅
- first-session starter plan ✅
- shared-room continuity ✅
- unfinished-work detection ✅
- next shared action guidance ✅
- block/report/privacy controls preserved ✅
- no hidden-user discovery bypass ✅
- no private-chat scoring ✅

## Batch 10 status

**COMPLETE ✅**

Do not reopen H-P12 by default unless a concrete Study Partners regression appears.

## Exact continuation point

Next phase:
**Batch 11 / H-P13 — AI Tutor 2.0**

Start Batch 11 from current `main`.

Primary goal:
turn the existing Hallium tutor surfaces into one evidence-grounded tutoring loop that uses current learner state, practice history, mistakes, TOPIK evidence and explicit learner intent to choose the next intervention, explain it, observe the result and adapt without inventing mastery or duplicating the existing practice engine.
