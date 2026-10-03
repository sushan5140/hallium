# TwinMem Pilot 2 — drift-aware gate

Pilot 1 showed that learned source-reliability weights can become stale and fail sharply when the source-quality regime changes.

Pilot 2 tests a narrow synthetic question:

> Can a small recent labeled calibration window detect source-reliability drift and decide when to stop using quality-aware retrieval in favor of freshness-first retrieval?

## Methods

The gate chooses between two already-defined Pilot-1 methods:

- **calibrated** — development-learned source reliability × freshness
- **topic_recent** — exact-skill newest-first retrieval

The gate never changes the downstream evidence reader.

## Leakage control

- Base reliability weights are learned from one development split.
- Gate window size + threshold are tuned only on separate stationary/shifted development scenarios.
- Final stationary and shifted evaluation profiles use separate seeds.
- Recent calibration evidence also comes from profiles separate from the evaluation profiles.

## Detector

For each source type, recent labeled correctness is Beta-smoothed.

Drift score:

```
max_source |recent_weight - baseline_weight|
```

If that exceeds the frozen threshold, choose freshness-first retrieval; otherwise keep calibrated quality-aware retrieval.

This is intentionally simple. It tests whether gating itself is useful before introducing more complex change-point models.

## Baselines

Each final scenario reports:

- frozen calibrated
- freshness-first newest relevant
- drift gate
- oracle best-of-two (descriptive upper bound only)

## Limits

Synthetic research only. The detector receives labels derived from simulator truth. Real Hallium does not automatically have such ground-truth correctness labels, so this is not a deployable production algorithm.
