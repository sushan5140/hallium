# TwinMem Pilot 1 — calibrated reliability

**Research-only stacked phase on top of Pilot 0.**

Pilot 0 showed that hand-set source-quality weights can help under a tight synthetic context budget, but also showed a strong failure mode when those source labels become unreliable.

Pilot 1 removes one major assumption: the source weights are **estimated only from a synthetic development split**, then frozen before untouched holdout evaluation.

## Question

Can development-calibrated source reliability + freshness outperform fixed hand-set quality/freshness under equal evidence-context budgets, and what happens when source reliability shifts?

## Design

Primary simulator:
- 120 synthetic development profiles.
- 480 untouched synthetic test profiles.
- four skills per learner.
- 52 / 105 / 210 word evidence-context budgets.
- source reliability estimated with a small Beta(2,2) smoothing prior.
- freshness half-life selected from a fixed grid on development only.
- equal-budget comparison against:
  - newest relevant,
  - fixed source-quality-only,
  - fixed quality × freshness from Pilot 0.

Stress test:
- source reliability is deliberately reversed.
- first evaluate with the **frozen original calibration**.
- then allow a separate shifted development split to recalibrate and evaluate a separate shifted holdout.

This separation distinguishes:
1. robustness to unobserved domain shift, from
2. recoverability when new labeled calibration evidence exists.

## Important limits

This does **not** establish a production memory algorithm.

There is:
- no human data,
- no LLM inference,
- no embedding/vector index,
- no real device benchmark,
- no memory/RAM measurement,
- no energy measurement,
- no real-time deadline,
- no proof that ground-truth source correctness labels are available in production.

The simulator has privileged construction-time truth that real Hallium deployments do not.

## Run

From repository root:

```bash
python research/twinmem_pilot1/calibrated_reliability.py
```

Generated outputs are written under `research/twinmem_pilot1/outputs/` and uploaded by CI.
