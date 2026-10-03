# TwinMem Pilot 11 — conservative null interval

Pilot 10 showed that treating an estimated p0 as fixed is fragile.

Pilot 11 freezes:
- baseline = 48 labels/source
- Pilot-9 delta = 0.25
- Pilot-9 alpha = 0.10
- stages 8 / 12 / 24 / 48

Only null handling changes.

## Conservative null

For each source:

1. estimate a Beta(2,2)-smoothed posterior from 48 baseline labels,
2. construct an approximate central interval,
3. for each recent sample, choose the null p inside that interval that maximizes the observed Bernoulli likelihood,
4. compare Pilot-9's same point alternatives against this most H0-favorable null.

If recent empirical reliability lies inside the null interval, the null can match it exactly, greatly reducing spurious evidence caused by p0 estimation noise.

## Development-only interval levels

- 70%
- 80%
- 90%
- 95%

A level must pass the unchanged detection + efficiency goals before any held-out stress is run.

## Held-out stress

The selected level is evaluated on:
- unbiased fresh baseline/recent pools
- all p0 +0.03
- all p0 -0.03
- source-skew ±0.03

## Important limit

This is a conservative robustness heuristic, **not** a formal e-process proof.
