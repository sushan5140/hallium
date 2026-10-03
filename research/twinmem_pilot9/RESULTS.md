# TwinMem Pilot 9 results — mixture likelihood-ratio e-process

**Executed by GitHub Actions on 3 October 2026.**  
**Status:** reproducible synthetic research experiment only.

Pilot 9 replaces stage-wise alpha spending with an estimated-null mixture likelihood-ratio process monitored at 8, 12, 24, and 48 labels/source.

## Development selection

Candidate grid:
- delta: 0.10 / 0.15 / 0.20 / 0.25
- alpha: 0.05 / 0.08 / 0.10

Selected:
- **delta = 0.25**
- **alpha = 0.10**
- stopping threshold = **E ≥ 10**

Development result:
- stationary false alarms: **1.67%**
- moderate detection: **93.75%**
- moderate mean labels/source: **28.52**
- severe detection: **100%**
- severe mean labels/source: **16.37**

All development goals passed.

## Independent held-out result

| Scenario | Detection | Mean labels/source | Median labels/source | Goal |
|---|---:|---:|---:|---|
| Stationary | **2.6% false alarms** | **47.54** | 48 | ✅ |
| Moderate shift | **89.2%** | **30.43** | 24 | ✅ |
| Severe shift | **100%** | **14.86** | 12 | ✅ |

Held-out:
- detection goals: **PASS**
- efficiency goals: **PASS**
- all goals: **PASS**

## Stop behavior

### Stationary
- 8 labels/source: 0%
- 12: 0.2%
- 24: 1.6%
- 48: 98.2%

### Moderate shift
- 8 labels/source: 4.8%
- 12: 10.4%
- 24: 49.6%
- 48: 35.2%

### Severe shift
- 8 labels/source: 37.0%
- 12: 28.4%
- 24: 33.8%
- 48: 0.8%

## Comparison with Pilot 7

Pilot 7 heuristic strong-stop rule:
- stationary false alarms: 5.2%
- moderate detection: 85.2%
- moderate labels/source: 31.02
- severe labels/source: 13.14

Pilot 9 mixture process:
- stationary false alarms: **2.6%**
- moderate detection: **89.2%**
- moderate labels/source: **30.43**
- severe labels/source: 14.86

Pilot 9 improves specificity and moderate-shift sensitivity/cost, while severe-shift mean label cost is slightly higher than Pilot 7 but still far below the ≤24 target.

## Comparison with Pilot 8

Pilot 8's closest multiplicity-controlled schedule:
- stationary false alarms: 0.91%
- moderate detection: 81.36%
- moderate labels/source: 39.16
- severe labels/source: 19.38

Pilot 9 recovers substantial power and efficiency while keeping false alarms comfortably below the 10% ceiling.

## Downstream expected accuracy

Frozen Pilot-3 retrieval policy:

Stationary:
- expected 52-word accuracy: **93.44%**

Moderate:
- expected 52-word accuracy: **85.75%**

Severe:
- expected 52-word accuracy: **88.07%**

105/210-word actions remain calibrated.

## Research conclusion

Within this simulator, the mixture likelihood-ratio process is the strongest sequential result so far:

- passes held-out detection goals
- passes held-out label-cost goals
- false alarms materially lower than Pilot 7
- moderate-shift efficiency materially better than Pilot 8

For a **fixed known null**, the likelihood-ratio mixture has an e-process/martingale interpretation suitable for repeated monitoring.

## Remaining caveat

The null source-reliability probabilities are **estimated from a separate baseline sample**, not known exactly.

Therefore Pilot 9 does **not** establish formal finite-sample anytime-valid false-positive control.

## Next hypothesis

Stress-test the estimated-null assumption:

- vary baseline calibration sample size
- introduce mild null misspecification
- assess whether stationary false alarms stay controlled
- compare plug-in p0 with conservative null intervals or mixture-over-null approaches

This should be the next statistical phase before any claim of principled sequential control.

## Limits

- synthetic profiles only
- correctness labels are privileged simulator truth
- null probabilities are estimated
- point alternative deltas are simplified
- no human data
- no production Hallium changes
- no LLM/vector DB or device benchmark

Production Hallium remains untouched.
