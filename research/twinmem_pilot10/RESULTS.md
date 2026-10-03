# TwinMem Pilot 10 results — plug-in null estimation robustness

**Executed by GitHub Actions on 3 October 2026.**  
**Status:** reproducible synthetic research experiment only.

Pilot 10 freezes Pilot 9 completely:

- delta = 0.25
- alpha = 0.10
- stages 8 / 12 / 24 / 48 labels/source

and varies only the number of baseline labels/source used to estimate the plug-in null p0.

## Baseline-size robustness curve

| Baseline labels/source | Stationary false alarm | Moderate detection | Moderate labels/source | Severe detection | Severe labels/source | All goals |
|---:|---:|---:|---:|---:|---:|---|
| 12 | 49.69% | 72.19% | 35.25 | 98.13% | 21.88 | ❌ |
| 24 | 27.50% | 74.38% | 35.60 | 99.69% | 18.71 | ❌ |
| 48 | **10.00%** | **80.00%** | 31.65 | 98.75% | 16.71 | ✅ |
| 96 | 5.94% | 80.31% | 30.21 | 100% | 15.66 | ✅ |
| 192 | 4.06% | 86.25% | 28.46 | 100% | 14.46 | ✅ |

Minimum passing baseline size in this curve: **48 labels/source**.

However, 48 labels/source passes exactly on both key thresholds:
- stationary false alarm ceiling: 10.0%
- moderate detection floor: 80.0%

That indicates very little robustness margin.

## Separate fresh misspecification stress at 48 labels/source

Fresh baseline + recent pools were generated separately.

| Plug-in null stress | Stationary false alarm | Moderate detection | Moderate labels/source | Severe detection | Severe labels/source | All goals |
|---|---:|---:|---:|---:|---:|---|
| No added bias | **10.75%** | **74.25%** | 33.13 | 99.75% | 18.10 | ❌ |
| All p0 +0.03 | 11.50% | 80.25% | 30.68 | 100% | 15.26 | ❌ |
| All p0 -0.03 | **22.50%** | 77.50% | 34.62 | 98.25% | 20.71 | ❌ |
| Source skew ±0.03 | 14.50% | 89.25% | 27.80 | 100% | 14.40 | ❌ |

**No fresh bias-stress condition passes all goals.**

## Main finding

Pilot 9's plug-in e-process is **sensitive to null-estimation error**.

Small baseline samples produce severe stationary false-alarm inflation:
- 12 labels/source → ~49.7%
- 24 → 27.5%

Even 48 labels/source is only marginally adequate in one curve and fails on fresh pools.

The problem is not simply detector power:
larger baseline samples steadily improve both specificity and moderate-shift detection.

## Statistical interpretation

For a fixed known p0, the likelihood-ratio process has a clean martingale/e-process interpretation.

Replacing p0 with a noisy plug-in estimate breaks that guarantee.

Pilot 10 empirically confirms that this is not just a theoretical caveat: false-positive behavior can change materially with baseline estimation error.

## Next hypothesis

Use **null-uncertainty-aware evidence** rather than a point p0.

Candidate directions:

1. **Conservative null interval**
   - estimate a confidence/credible interval for p0
   - score evidence against the null value within that interval that is most favorable to H0

2. **Mixture over null uncertainty**
   - integrate likelihood under a posterior/distribution for p0
   - compare alternative mixture to null mixture

3. **Split-valid calibration**
   - reserve baseline labels for null construction and calibration separately

4. **Hierarchical source model**
   - share information across source types while retaining source-specific uncertainty

The next phase should freeze Pilot 9's delta/alpha and test only null handling.

## Limits

- synthetic profiles only
- correctness labels use privileged simulator truth
- Beta(2,2) smoothing is a modeling choice
- misspecification stress is synthetic
- no formal anytime-valid guarantee under estimated p0
- no human data
- no production Hallium changes

Production Hallium remains untouched.
