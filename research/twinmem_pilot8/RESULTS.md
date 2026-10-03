# TwinMem Pilot 8 results — alpha-spent early stopping

**Executed by GitHub Actions on 3 October 2026.**  
**Status:** reproducible synthetic research experiment only.

Pilot 8 adds explicit multiplicity control to the early sequential looks:

- early stages: 8, 12, 24 labels/source
- candidate total early familywise alpha budgets: 0.03, 0.05, 0.07
- spending shapes: front / equal / late
- each stage additionally Bonferroni-corrected across 3 source types
- final stage 48 remains the frozen Pilot-5 decision

## Development result

**No candidate passed all predeclared development goals.**

Therefore:
- selected candidate: **none**
- held-out evaluation: **not run by design**

## Candidate summary

| Early alpha | Shape | Stationary false alarm | Moderate detection | Moderate labels/source | Severe detection | Severe labels/source | Detection pass | Efficiency pass |
|---:|---|---:|---:|---:|---:|---:|---|---|
| 0.03 | front | 0.91% | 79.55% | 43.58 | 100% | 25.75 | ❌ | ❌ |
| 0.03 | equal | 0.45% | 79.09% | 45.42 | 100% | 28.33 | ❌ | ❌ |
| 0.03 | late | 0.45% | 79.55% | 41.16 | 100% | 22.87 | ❌ | ❌ |
| 0.05 | front | 0.45% | 75.45% | 43.84 | 100% | 26.18 | ❌ | ❌ |
| 0.05 | equal | 0.45% | 75.45% | 41.00 | 100% | 21.60 | ❌ | ❌ |
| 0.05 | late | 0.91% | 75.45% | 41.95 | 100% | 24.44 | ❌ | ❌ |
| 0.07 | front | 0.91% | 81.36% | 39.93 | 100% | 20.25 | ✅ | ❌ |
| 0.07 | equal | 0.91% | 81.36% | 39.27 | 100% | 19.38 | ✅ | ❌ |
| 0.07 | late | 0.91% | 81.36% | **39.16** | 100% | **19.38** | ✅ | ❌ |

## Main negative finding

The stronger multiplicity control dramatically improves specificity, but it makes early evidence too conservative for the moderate-shift label-cost target.

Closest candidate:
- alpha budget 0.07
- late spending
- stationary false alarms **0.91%**
- moderate detection **81.36%**
- moderate mean labels/source **39.16**
- severe detection **100%**
- severe mean labels/source **19.38**

This passes the detection criteria but misses the moderate efficiency target ≤36 by about **3.16 labels/source**.

## Comparison with Pilot 7

Pilot 7 heuristic strong-stop rule:
- stationary false alarms: 5.2%
- moderate detection: 85.2%
- moderate labels/source: 31.02
- severe labels/source: 13.14

Pilot 8 strongest controlled candidate:
- stationary false alarms: 0.91%
- moderate detection: 81.36%
- moderate labels/source: 39.16
- severe labels/source: 19.38

So the explicit Bonferroni-style early-look control buys much stronger specificity but gives back too much efficiency.

## Research conclusion

Simple stage-wise alpha spending with source-wise Bonferroni correction is **too conservative** for the current moderate-drift efficiency target.

The next statistical direction should seek power without abandoning explicit error control.

Promising options:
- e-values / test martingales for Bernoulli reliability drift
- mixture sequential probability ratio tests
- source-adaptive spending instead of correcting all 3 sources equally
- hierarchical testing that first asks whether any reliability drift exists, then localizes the source
- confidence sequences / empirical-Bernstein style boundaries

## Limits

- synthetic profiles only
- correctness labels are privileged simulator truth
- Beta-normal approximation remains in the score
- final Pilot-5 rule is outside the early alpha budget
- no held-out Pilot-8 result because no development candidate passed
- no human data
- no production Hallium changes

Production Hallium remains untouched.
