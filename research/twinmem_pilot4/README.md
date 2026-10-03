# TwinMem Pilot 4 — label efficiency and decision stability

Pilot 3's budget-aware gate worked in stationary, severe-shift, and an unseen moderate-shift synthetic regime. Its biggest remaining assumption is that the drift detector receives **24 labeled correctness observations per source**.

Pilot 4 freezes:
- drift threshold: **0.20**
- no-drift policy: calibrated at all budgets
- drift policy: freshness-first at 52 words, calibrated at 105/210

and varies only the recent labeled window:

- 4 observations/source
- 8
- 12
- 24
- 48

Each window/scenario is resampled **250 times** to measure decision stability.

## Predeclared success criterion

A window passes only if all three hold:

- stationary false drift alarm rate <= **10%**
- moderate-shift detection >= **80%**
- severe-shift detection >= **90%**

These thresholds are declared in code before result inspection.

## Scenarios

- stationary
- moderate shift
- severe source-reliability reversal

All recent-calibration pools and evaluation profiles use separate seeds.

## Output

For each label window Pilot 4 reports:
- drift detection rate
- drift-score mean/median/5th/95th percentiles
- whether the predeclared criterion is met
- expected downstream budget-aware accuracy after accounting for stochastic gate decisions

## Limits

Synthetic research only. The labels still come from simulator truth. This experiment measures sample efficiency *conditional on having ground-truth correctness labels*; it does not solve how production Hallium would obtain them.
