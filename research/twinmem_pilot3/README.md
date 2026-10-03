# TwinMem Pilot 3 — budget-aware drift response

Pilot 2 detected source-reliability drift correctly in a two-regime synthetic test, but it used one global action. That helped the 52-word budget and hurt 105/210-word budgets.

Pilot 3 freezes Pilot 2's detector:

- 24 recent labeled observations per source
- drift threshold 0.20

and learns only the **response action per context budget**.

## Policy

For each detector regime:

- no drift
- drift detected

and each context budget:

- 52
- 105
- 210 words

development data chooses between:

- calibrated quality-aware retrieval
- freshness-first `topic_recent`

## Leakage control

- detector parameters are inherited/frozen from Pilot 2
- budget actions are learned only on stationary + severe-shift development data
- final stationary/severe-shift evaluation uses separate seeds
- final **moderate-shift** regime is not used to learn the action table
- recent calibration evidence is separate from evaluation profiles

## Why the moderate shift matters

A policy that only works on the exact severe reversal seen in development may be overfit. The unseen intermediate source-noise regime checks whether the detector/action table behaves sensibly between the two extremes.

## Limits

Synthetic research only. The detector still receives correctness labels derived from simulator truth. Real Hallium does not automatically have those labels. No production change is proposed.
