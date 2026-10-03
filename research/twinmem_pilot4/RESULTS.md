# TwinMem Pilot 4 results — label efficiency and decision stability

**Executed by GitHub Actions on 3 October 2026.**  
**Status:** reproducible synthetic research experiment only.

Pilot 4 froze the Pilot-3 detector threshold and budget-aware action table, then varied only the number of recent labeled correctness observations per source.

## Predeclared criterion

A label window passes only if all three are true:

- stationary false drift alarms ≤ **10%**
- moderate-shift detection ≥ **80%**
- severe-shift detection ≥ **90%**

Each window/scenario was resampled **250 times**.

## Detection stability

| Labels / source | Stationary false alarm | Moderate detection | Severe detection | Pass? |
|---:|---:|---:|---:|---|
| 4 | 100.0% | 100.0% | 100.0% | No |
| 8 | 100.0% | 100.0% | 100.0% | No |
| 12 | 81.2% | 98.8% | 100.0% | No |
| 24 | 48.4% | 99.6% | 100.0% | No |
| 48 | 25.6% | 100.0% | 100.0% | No |

**Minimum passing window: none.**

## Why it failed

The detector uses the maximum absolute difference between recent and baseline source-reliability weights with a fixed threshold of 0.20.

At small sample sizes, the maximum-of-three statistic is very sensitive to ordinary Bernoulli sampling noise. Even when the source regime is stationary:

- 4 labels/source: mean drift score **0.477**
- 8 labels/source: **0.355**
- 12 labels/source: **0.284**
- 24 labels/source: **0.216**
- 48 labels/source: **0.154**

The 95th percentile of the stationary drift score is still about **0.293** at 48 labels/source, well above the frozen 0.20 threshold.

So Pilot 2/3's apparently clean one-shot stationary decision was not a stable property of the detector. It was one sample from a noisy decision process.

## Downstream consequence

Because false drift alarms only change the 52-word policy, they mainly damage the tight-context stationary case.

Stationary calibrated 52-word accuracy: **93.96%**

Expected 52-word accuracy after stochastic false switching:

| Labels / source | Expected gate accuracy |
|---:|---:|
| 4 | 75.05% |
| 8 | 75.05% |
| 12 | 78.61% |
| 24 | 84.81% |
| 48 | 89.12% |

Meanwhile moderate/severe shift detection is already near-perfect, so the core problem is **specificity**, not sensitivity.

## Research conclusion

The fixed absolute drift threshold is not sample-size aware and is therefore not a credible production-style detector.

The sharper next hypothesis is:

> Drift should be declared only when the recent reliability estimate is inconsistent with the baseline after accounting for posterior uncertainty, rather than when a noisy point estimate crosses a fixed absolute-distance threshold.

A next phase should compare uncertainty-aware detectors such as:

- posterior credible-interval exclusion
- posterior probability that reliability changed by at least a meaningful margin
- or a stationary-null-calibrated threshold

while keeping the Pilot-3 budget-aware response policy frozen.

## Limits

- synthetic profiles only
- correctness labels are privileged simulator truth
- repeated resampling does not represent a human population
- no production Hallium changes
- no LLM/vector database
- no device/RAM/battery/energy/end-to-end latency measurement

Production Hallium remains untouched.
