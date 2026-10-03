# TwinMem Pilot 12 results — posterior-predictive null mixture

**Executed by GitHub Actions on 3 October 2026.**  
**Status:** reproducible synthetic research experiment only.

Pilot 12 freezes:
- baseline = 48 labels/source
- delta = 0.25
- alpha = 0.10
- stages 8 / 12 / 24 / 48
- Beta(2,2) prior

There is no null-handling hyperparameter grid.

## Development result

| Scenario | Detection | Mean labels/source |
|---|---:|---:|
| Stationary | **2.0% false alarms** | 47.36 |
| Moderate shift | **51.33%** | **40.45** |
| Severe shift | **97.67%** | **22.47** |

Detection goals:
- stationary ≤10% ✅
- moderate ≥80% ❌
- severe ≥90% ✅

Efficiency:
- moderate ≤36 ❌
- severe ≤24 ✅

**Development all-goals result: FAIL.**

Therefore:
- held-out unbiased evaluation: not run
- bias stress: not run

## Main finding

Using the full Beta posterior predictive as both null and a diffuse shifted-Beta alternative stabilizes specificity but loses too much moderate-shift power.

Compared with Pilot 11's worst-case interval, this is less conservative, but still far below the required 80% moderate detection.

## Likely reason

The alternative model also carries substantial posterior uncertainty because it preserves the baseline posterior concentration.

That makes the alternative predictive broad, reducing the likelihood-ratio separation between:
- baseline uncertainty, and
- a moderate reliability shift.

## Next hypothesis

Keep the **posterior-predictive null** but restore Pilot 9's **point alternatives**:

- null: integrate over baseline Beta posterior
- alternative: point p = posterior mean ±0.25
- global mixture across sources/directions
- alpha 0.10 and stages frozen

This is still a coherent conditional Bayesian comparison:
a proper null mixture vs degenerate point alternatives.

No delta/alpha retuning is needed.

## Limits

- synthetic profiles only
- correctness labels are privileged simulator truth
- posterior-predictive evidence is Bayesian, not uniform frequentist anytime-validity
- no human data
- no production Hallium changes

Production Hallium remains untouched.
