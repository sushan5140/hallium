# Hallium TOPIK ingestion pipeline

Batch 1 foundation · 2 October 2026

This pipeline exists to stop a source link from becoming an active exam feature by accident.

## States

A candidate round is first classified as one of:

- `OFFICIAL_RELEASED`
- `LEGACY_ARCHIVE`
- `RECONSTRUCTED`
- `PRACTICE`
- `NO_RELEASE_EVIDENCE`

Each asset is separately gated:

- booklet
- answer key
- transcript
- audio
- reuse / copyright permission

The presence of a URL is **not** verification.

## Required PBT structure

TOPIK I:
- Listening: 30
- Reading: 40

TOPIK II:
- Listening: 50
- Writing: 4
- Reading: 50

Anything else is quarantined rather than silently normalized.

## Activation rules

A paper may be visible as an external, source-linked practice sheet while scoring/audio remain disabled.

Automatic scoring requires:
1. official released round,
2. validated booklet/form,
3. fully verified matching answer key,
4. permission compatible with the intended in-app use.

Embedded audio requires:
1. official released round,
2. audio acoustically matched against paper + transcript at beginning/middle/end,
3. permission compatible with in-app playback.

In-app reproduction of question text/graphics requires explicit compatible reuse permission.

## Current audited newer TOPIK I rounds

The structured registry currently carries the 24 September 2026 audit for:
- 83
- 91
- 96
- 102

Round 64 is also represented as a historical source-linked question set with its unresolved key/audio gates preserved.

No unreleased round is fabricated to increase the catalog count.

## Batch 2 handoff

Batch 2 may build question-by-question scoring and listening only from assets whose gate is promoted to `VERIFIED`. Existing local practice responses must remain compatible during any catalog conversion.
