# TwinMem Pilot 1 results — calibrated reliability

**Executed by GitHub Actions on 3 October 2026.**  
**Status:** reproducible synthetic research experiment only.

This phase tests whether source reliability estimated from a synthetic development split can replace Pilot 0's hand-set quality weights. It does **not** evaluate human learners, LLM inference, vector retrieval, on-device execution, RAM, energy, or production Hallium.

## Primary synthetic holdout

Development calibration learned:

| Source | Posterior accuracy | Derived weight |
|---|---:|---:|
| verified assessment | 93.60% | 0.8720 |
| practice result | 86.06% | 0.7213 |
| self report | 71.14% | 0.4228 |

The selected freshness half-life from the fixed development grid was **60 days**.

Held-out classification accuracy:

| Method | 52 words | 105 words | 210 words |
|---|---:|---:|---:|
| Newest relevant | 74.95% | 93.23% | 96.82% |
| Fixed source-quality only | 93.54% | 95.05% | 96.67% |
| Pilot-0 fixed quality × freshness | 93.54% | 96.61% | 96.82% |
| **Dev-calibrated reliability × freshness** | **93.49%** | **97.14%** | **97.03%** |

Paired profile-bootstrap difference versus Pilot-0 fixed adaptive:

- **52 words:** -0.05 pp, 95% simulator bootstrap interval [-0.16, 0.00]
- **105 words:** +0.52 pp [-0.05, +1.09]
- **210 words:** +0.21 pp [-0.21, +0.63]

Interpretation: calibration did **not** produce a clear universal improvement over the hand-set adaptive rule. At 52 words it was slightly worse; at 105/210 words the point estimates were slightly higher but the intervals include zero.

Versus fixed source-quality-only, calibrated retrieval showed a larger synthetic gain at 105 words:

- **105 words:** +2.08 pp [1.20, 2.97]

That result is conditional on this simulator and its development labels.

## Unseen source-reliability shift

Stress generator deliberately changed source error rates to:

- verified assessment: **36% error**
- practice result: **20% error**
- self report: **5% error**

The original calibration was frozen and **not allowed to see this shift**.

| Frozen method | 52 words | 105 words | 210 words |
|---|---:|---:|---:|
| Newest relevant | **88.96%** | 69.90% | 78.44% |
| Fixed source-quality only | 63.02% | 64.69% | 71.35% |
| Pilot-0 fixed quality × freshness | 63.02% | 69.84% | 77.66% |
| Frozen dev-calibrated reliability | 63.12% | **75.47%** | **82.19%** |

The important negative result is the 52-word case: **freshness-only newest-relevant retrieval beats both fixed and learned quality-aware ranking by roughly 26 percentage points when the reliability prior becomes wrong.**

Calibration is therefore not a robustness guarantee. A learned prior can still become stale.

## Recalibration after shift evidence becomes available

A separate shifted development split learned approximately:

- self report weight: **0.9150**
- practice result weight: **0.5995**
- verified assessment weight: **0.3284**

Selected shifted half-life: **33 days**.

A separate shifted holdout then scored:

| Recalibrated method | 52 words | 105 words | 210 words |
|---|---:|---:|---:|
| Shift-recalibrated reliability × freshness | **92.66%** | **94.27%** | **93.91%** |

This demonstrates recoverability **inside the simulator when labeled calibration evidence from the changed regime is available**. It does not establish that Hallium can obtain such labels safely or cheaply in production.

## Research conclusion

Pilot 1 weakens the case for any static "trust this source type" rule.

The sharper design requirement is now:

> A memory selector should estimate reliability dynamically, track calibration drift, and know when to reduce or ignore stale source-quality priors rather than treating them as permanent truth.

A plausible next synthetic phase is a **drift detector / uncertainty-aware gate** that chooses between quality-aware ranking and freshness-first ranking based only on recently observed calibration evidence.

## Limits

- synthetic profiles only
- simulator truth used for development calibration
- no human data
- no LLM
- no vector database
- no on-device benchmark
- no latency deadline
- no RAM / battery / energy measurement
- no claim that production Hallium has access to ground-truth source correctness
- bootstrap intervals describe this simulator, not a target learner population

The production Hallium application remains untouched.
