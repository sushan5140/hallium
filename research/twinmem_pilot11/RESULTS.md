# TwinMem Pilot 11 results — conservative null interval

**Executed by GitHub Actions on 3 October 2026.**  
**Status:** reproducible synthetic research experiment only.

Pilot 11 freezes:
- baseline = 48 labels/source
- Pilot-9 delta = 0.25
- Pilot-9 alpha = 0.10
- stages 8 / 12 / 24 / 48

Only null handling changes from a point p0 to a conservative interval.

## Development result

| Interval level | Stationary false alarm | Moderate detection | Moderate labels/source | Severe detection | Severe labels/source | All goals |
|---:|---:|---:|---:|---:|---:|---|
| 70% | **0.77%** | 45.77% | 43.78 | 96.92% | 26.60 | ❌ |
| 80% | 1.92% | 46.92% | 43.77 | 96.54% | 29.46 | ❌ |
| 90% | **0.38%** | 41.92% | 44.42 | 90.77% | 34.49 | ❌ |
| 95% | **0.38%** | 20.00% | 47.25 | 83.46% | 38.57 | ❌ |

**No interval level passes all development goals.**

Therefore:
- selected interval: **none**
- held-out unbiased evaluation: **not run**
- bias stress: **not run**

## Main finding

The conservative-null idea solves the wrong side of the tradeoff too aggressively.

Specificity becomes excellent:
- stationary false alarms stay between ~0.4% and 1.9%

But moderate-shift power collapses:
- best moderate detection is only 46.92%, far below the 80% target

and label cost becomes too high:
- ~43.8–47.2 labels/source on moderate shift

Even severe-shift efficiency degrades as the interval widens.

## Interpretation

Choosing the null value most favorable to H0 inside an uncertainty interval is robust to p0 estimation noise, but is too conservative for this problem.

That means Pilot 10's failure should not be addressed by a simple worst-case null interval if the current detection/efficiency goals are retained.

## Next hypothesis

Use a **mixture over null uncertainty** instead of a worst-case null.

Candidate direction:
- baseline Beta posterior from 48 labels/source
- integrate recent-data likelihood over the baseline posterior for the null predictive
- compare with an alternative mixture that represents reliability shifts
- keep Pilot-9 stages / delta / alpha / goals fixed where possible

This should retain baseline uncertainty without allowing H0 to perfectly chase every recent empirical rate.

## Limits

- synthetic profiles only
- correctness labels are privileged simulator truth
- interval is based on a normal approximation to Beta posterior uncertainty
- conservative-null LR is a robustness heuristic, not a formal e-process
- no human data
- no production Hallium changes

Production Hallium remains untouched.
