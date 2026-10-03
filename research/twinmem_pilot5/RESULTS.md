# TwinMem Pilot 5 results — uncertainty-aware drift detection

**Executed by GitHub Actions on 3 October 2026.**  
**Status:** reproducible synthetic research experiment only.

Pilot 5 replaces Pilot 4's fixed point-estimate drift threshold with a lower-bound change test that accounts for posterior uncertainty.

## Development-selected detector

Grid selection used development resamples only.

Selected configuration:

- **48 labeled observations per source**
- meaningful change margin: **0.05**
- z critical value: **1.96**

Development rates:

- stationary false alarm: **0.625%**
- moderate-shift detection: **86.25%**
- severe-shift detection: **100%**

This met the predeclared 10% / 80% / 90% development criterion.

## Independent held-out evaluation

The selected configuration was frozen and evaluated with **400 resamples per scenario** on separate calibration pools.

| Scenario | Detection rate | Criterion |
|---|---:|---|
| Stationary | **1.00% false alarms** | ≤10% ✅ |
| Moderate shift | **84.25%** | ≥80% ✅ |
| Severe shift | **100%** | ≥90% ✅ |

**Held-out predeclared criterion: PASS.**

## Comparison with Pilot 4

Pilot 4 used the same 48-label window with a fixed point-estimate threshold and falsely declared drift **25.6%** of the time under stationarity.

Pilot 5 reduces that to **1.0%** while retaining:
- 84.25% moderate-shift sensitivity
- 100% severe-shift sensitivity

This supports the hypothesis that the previous failure was largely an uncertainty-calibration problem rather than evidence that reliability drift is undetectable.

## Downstream expected policy accuracy

The Pilot-3 budget-aware response policy remains frozen.

### Stationary

- calibrated 52-word accuracy: **93.54%**
- freshness-first 52-word accuracy: **74.58%**
- expected uncertainty-gated 52-word accuracy: **93.35%**

Only the 1% false-alarm rate causes a small expected loss.

### Moderate shift

- calibrated 52-word accuracy: **77.71%**
- freshness-first: **85.31%**
- expected uncertainty-gated: **84.11%**
- 105/210 remain on calibrated retrieval regardless of drift state

### Severe shift

- calibrated 52-word accuracy: **65.63%**
- freshness-first: **88.33%**
- expected uncertainty-gated: **88.33%**
- 105/210 remain on calibrated retrieval

## What Pilot 5 does not solve

The first development configuration that met all criteria still required **48 labels per source**, or 144 recent labeled observations across the three source types.

Smaller windows traded specificity for sensitivity:

- 8 labels/source could keep false alarms low under conservative settings but missed most moderate/severe shifts.
- 24 labels/source could achieve good specificity and severe-shift sensitivity, but moderate-shift detection remained below the 80% criterion.

So uncertainty-awareness solves the false-alarm instability, but not label efficiency.

## Next hypothesis

A sequential detector may reduce *average* label cost:

1. collect a small initial labeled batch,
2. declare drift early only when evidence is already decisive,
3. otherwise collect more labels,
4. stop at a conservative maximum window,
5. optionally abstain rather than force a decision when evidence stays ambiguous.

This should be evaluated on:
- average labels/source
- stationary false alarms
- moderate/severe detection
- fraction of cases requiring the maximum window
- downstream expected accuracy

## Limits

- synthetic profiles only
- correctness labels are privileged simulator truth
- Beta-normal lower bounds are an approximation
- development grid selection may not generalize beyond tested regimes
- no human data
- no LLM/vector database
- no production Hallium changes
- no device/RAM/battery/energy/end-to-end latency measurement

Production Hallium remains untouched.
