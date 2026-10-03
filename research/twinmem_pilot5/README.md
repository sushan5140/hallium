# TwinMem Pilot 5 — uncertainty-aware drift detection

Pilot 4 showed that the fixed 0.20 point-estimate drift threshold has unacceptable false alarms under finite labeled samples.

Pilot 5 replaces that detector with an uncertainty-aware lower-bound test.

For each source:

```
absolute posterior mean change
- z × standard error of the baseline/recent difference
```

Drift is declared only when the strongest source's lower-bound change exceeds a meaningful-change margin.

## Development-only selection

Grid:
- labels/source: 8, 12, 24, 48
- meaningful change margin: 0.05, 0.10, 0.15
- z critical value: 1.64, 1.96, 2.58

Each development candidate is resampled 160 times in:
- stationary
- moderate shift
- severe shift

Predeclared development criterion:
- stationary false alarm <= 10%
- moderate detection >= 80%
- severe detection >= 90%

Selection rule, declared before final evaluation:
1. configs meeting all criteria only
2. smallest label window
3. lowest stationary false alarm
4. higher moderate/severe sensitivity
5. more conservative z / larger margin

## Final evaluation

The selected configuration is frozen and tested on entirely separate recent-calibration pools, with 400 resamples/scenario.

The Pilot-3 budget-aware response policy is unchanged:
- no drift: calibrated at every budget
- drift: freshness-first at 52 words, calibrated at 105/210

## Limits

Synthetic research only. Correctness labels still come from privileged simulator truth. The Beta-normal lower bound is an approximation and is not a deployable Hallium mechanism.
