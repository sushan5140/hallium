# TwinMem Pilot 6 — sequential uncertainty-aware drift detection

Pilot 5 passes the held-out drift criterion but always requires **48 labeled observations per source**.

Pilot 6 freezes the Pilot-5 detector:

- meaningful change margin: 0.05
- z = 1.96
- maximum window: 48 labels/source

and changes only **how labels are collected**.

## Sequential stages

Nested prefixes from one shuffled evidence stream:

`8 → 12 → 24 → 48` labels/source.

Early drift requires **two consecutive stages** whose uncertainty-aware lower-bound signal exceeds the frozen margin. This is deliberately conservative to avoid recreating Pilot 4's false-alarm problem.

If no early stop occurs, the 48-label stage uses the exact Pilot-5 final decision.

There is no hyperparameter tuning in Pilot 6.

## Predeclared criteria

Detection:
- stationary false alarms <= 10%
- moderate detection >= 80%
- severe detection >= 90%

Efficiency goals:
- moderate shift mean labels/source <= 36
- severe shift mean labels/source <= 24

Stationary cases are allowed to consume the full 48-label window; the main goal is to stop early when a shift is clear.

## Metrics

Per scenario:
- sequential detection rate
- fixed-48 Pilot-5 detection rate on the same streams
- mean / median labels per source
- stop distribution at 8 / 12 / 24 / 48
- mean total labels across three sources
- expected downstream budget-aware retrieval accuracy

## Limits

Synthetic research only. Correctness labels remain privileged simulator truth. Sequential sampling here is not evidence that production Hallium can obtain these labels at the same cost.
