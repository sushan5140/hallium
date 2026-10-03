# TwinMem Pilot 6 results — sequential early stopping

**Executed by GitHub Actions on 3 October 2026.**  
**Status:** reproducible synthetic research experiment only.

Pilot 6 keeps Pilot 5's uncertainty-aware drift detector frozen and changes only label collection into nested stages: 8 → 12 → 24 → 48 labels/source.

Early drift requires **two consecutive positive stage signals** before the 48-label maximum. Otherwise the exact Pilot-5 rule is used at 48.

## Predeclared goals

Detection:
- stationary false alarms ≤ 10%
- moderate-shift detection ≥ 80%
- severe-shift detection ≥ 90%

Efficiency:
- moderate mean labels/source ≤ 36
- severe mean labels/source ≤ 24

## Held-out result

| Scenario | Sequential detection | Fixed-48 detection | Mean labels/source | Median | Detection pass |
|---|---:|---:|---:|---:|---|
| Stationary | **4.0% false alarms** | 1.25% | **46.89** | 48 | ✅ |
| Moderate shift | **92.0%** | 91.0% | **37.05** | 48 | ✅ |
| Severe shift | **100%** | 100% | **23.85** | 12 | ✅ |

**Detection criterion: PASS.**

## Stop-stage distribution

### Stationary
- 12 labels/source: 2.75%
- 24: 0.50%
- 48: 96.75%

### Moderate shift
- 12 labels/source: 24.75%
- 24: 8.50%
- 48: 66.75%

### Severe shift
- 12 labels/source: 57.25%
- 24: 14.75%
- 48: 28.00%

No run can stop at 8 because the rule requires two consecutive positive stages.

## Efficiency result

Severe shift:
- target ≤24 labels/source
- observed **23.85**
- **PASS**

Moderate shift:
- target ≤36 labels/source
- observed **37.05**
- **FAIL by 1.05 labels/source**

Therefore the overall predeclared efficiency goal **does not pass**.

## Interpretation

The sequential rule clearly reduces label cost when drift is strong:

- severe shift falls from a fixed 48 labels/source to 23.85 on average, roughly a 50% reduction.
- 57.25% of severe-shift repetitions stop at only 12 labels/source.

Moderate drift is harder:
- detection remains strong at 92%
- but two-thirds of cases still require the full 48-label window
- mean cost misses the target narrowly.

The conservative confirmation rule therefore protects specificity, but remains slightly too slow for moderate drift.

## Important tradeoff

Sequential monitoring raises stationary false alarms from the fixed-48 reference's 1.25% to 4.0%.

That is still below the predeclared 10% ceiling, but shows that repeated looks at accumulating evidence increase the chance of a false positive. The current procedure is not a formal anytime-valid statistical test.

## Next hypothesis

A cost-aware sequential design should tune the **stopping rule on development streams**, not the uncertainty detector itself.

Candidates could include:
- one very-strong early signal vs two ordinary signals
- separate early-stop margins by stage
- explicit continuation/abstention bands
- an anytime-valid or alpha-spending boundary

The next phase should keep:
- Pilot-5 posterior model fixed
- Pilot-3 retrieval response fixed
- held-out detection criteria fixed
- explicit label-cost targets fixed

and optimize only the sequential stopping boundary on development data.

## Limits

- synthetic profiles only
- correctness labels are privileged simulator truth
- sequential repeated looks are not formally optional-stopping safe
- no human data
- no LLM/vector database
- no production Hallium change
- no device/RAM/battery/energy/end-to-end latency measurement

Production Hallium remains untouched.
