# TwinMem Pilot 2 results — drift-aware gate

**Executed by GitHub Actions on 3 October 2026.**  
**Status:** reproducible synthetic research experiment only.

Pilot 2 asks whether a small recent labeled calibration window can detect that Pilot-1 source-reliability weights have become stale and choose between calibrated quality-aware retrieval and freshness-first retrieval.

## Frozen gate learned on development scenarios

Selected gate:

- recent labeled window: **24 observations per source**
- drift threshold: **0.20**
- stationary development drift score: **0.1671**
- shifted development drift score: **0.4529**
- stationary choice: **calibrated**
- shifted choice: **topic_recent**

The detector therefore separated the two development regimes as intended.

## Stationary held-out scenario

Independent recent-calibration drift score: **0.1671**  
Gate choice: **calibrated**

| Method | 52 words | 105 words | 210 words |
|---|---:|---:|---:|
| Frozen calibrated | 94.01% | 98.07% | 97.92% |
| Freshness-first | 75.68% | 94.84% | 98.18% |
| **Drift gate** | **94.01%** | **98.07%** | **97.92%** |
| Oracle best-of-two | 96.93% | 98.65% | 98.49% |

The gate did not falsely switch under the stationary regime. It preserved calibrated retrieval.

## Source-reliability-shift held-out scenario

Independent recent-calibration drift score: **0.6671**  
Gate choice: **topic_recent**

| Method | 52 words | 105 words | 210 words |
|---|---:|---:|---:|
| Frozen calibrated | 64.74% | **76.25%** | **80.47%** |
| Freshness-first | **87.29%** | 70.78% | 78.18% |
| **Drift gate** | **87.29%** | 70.78% | 78.18% |
| Oracle best-of-two | 90.31% | 81.15% | 81.09% |

## Main finding

The drift detector itself worked in this two-regime simulator: it kept calibrated retrieval when the source-reliability pattern was stable and switched when the source-reliability pattern changed.

However, the gate's **single global action is too coarse**.

Under shift:

- at **52 words**, switching to freshness-first improved accuracy by **+22.55 percentage points**
- at **105 words**, switching reduced accuracy by **-5.47 points**
- at **210 words**, switching reduced accuracy by **-2.29 points**

This means "drift detected" is not enough to decide one retrieval policy for every context budget.

## Research implication

The next sharper hypothesis is:

> Drift response should be budget-aware. Under tight context budgets, stale quality priors may justify freshness-first retrieval, while larger budgets may retain enough evidence diversity for quality-aware retrieval to remain preferable.

A next synthetic phase should therefore freeze the same drift detector but learn a **budget-specific action policy** on development scenarios.

That next phase must keep:
- detector threshold and budget actions tuned only on development scenarios
- untouched held-out stationary/shifted evaluation
- frozen baselines
- oracle only as a descriptive upper bound

## Limits

- synthetic profiles only
- recent correctness labels come from simulator truth
- no human learner data
- no LLM or vector retrieval
- no production Hallium changes
- no device / RAM / energy / end-to-end latency results
- only two broad reliability regimes were tested
- this does not establish a deployable drift detector

Production Hallium remains untouched.
