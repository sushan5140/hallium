# TwinMem Pilot 7 results — development-selected cost-aware stopping

**Executed by GitHub Actions on 3 October 2026.**  
**Status:** reproducible synthetic research experiment only.

Pilot 7 keeps the Pilot-5 uncertainty detector and Pilot-3 retrieval response frozen, and tunes only a stronger single-stage early-stop threshold on development streams.

## Development selection

Candidate strong thresholds:
- 0.08
- 0.10
- 0.12
- 0.15
- 0.18

A candidate had to pass the same detection and efficiency goals used in Pilot 6.

Selected threshold: **0.08**

Development result for 0.08:

- stationary false alarms: **4.09%**
- moderate detection: **88.18%**
- moderate mean labels/source: **31.98**
- severe detection: **100%**
- severe mean labels/source: **14.82**

Development goals: **PASS**

## Independent held-out result

| Scenario | Detection | Mean labels/source | Median labels/source | Goal |
|---|---:|---:|---:|---|
| Stationary | **5.2% false alarms** | **46.28** | 48 | Detection ✅ |
| Moderate shift | **85.2%** | **31.02** | 24 | Detection + efficiency ✅ |
| Severe shift | **100%** | **13.14** | 8 | Detection + efficiency ✅ |

Held-out:
- detection goals: **PASS**
- efficiency goals: **PASS**
- all goals: **PASS**

## Stop behavior

### Stationary
- 8 labels/source: 4.0%
- 12: 0.2%
- 24: 0.2%
- 48: 95.6%

### Moderate shift
- 8 labels/source: 23.8%
- 12: 9.4%
- 24: 17.0%
- 48: 49.8%

### Severe shift
- 8 labels/source: 65.0%
- 12: 10.2%
- 24: 21.6%
- 48: 3.2%

## Comparison with Pilot 6

Pilot 6:
- moderate mean labels/source: **37.05**
- severe mean labels/source: **23.85**
- stationary false alarms: **4.0%**

Pilot 7:
- moderate mean labels/source: **31.02**
- severe mean labels/source: **13.14**
- stationary false alarms: **5.2%**

So the stronger single-stage override substantially reduces label cost while increasing stationary false alarms only modestly and still remaining below the 10% ceiling.

## Downstream expected accuracy

Using the frozen Pilot-3 action table:

Stationary:
- expected 52-word accuracy: **93.34%**

Moderate shift:
- expected 52-word accuracy: **85.66%**

Severe shift:
- expected 52-word accuracy: **86.04%**

105/210-word decisions remain on calibrated retrieval.

## Research conclusion

Within this synthetic setup, a cost-aware sequential stopping boundary can preserve the uncertainty-aware detector’s specificity/sensitivity while materially reducing average labeled evidence requirements.

The strongest remaining statistical caveat is **optional stopping**:
this repeated-look rule is not an anytime-valid statistical test.

## Next hypothesis

The next phase should replace heuristic repeated-look stopping with an **anytime-valid or alpha-spending sequential boundary** and test whether it can retain similar cost savings with explicit false-positive control.

## Limits

- synthetic profiles only
- correctness labels are privileged simulator truth
- repeated looks are not formally anytime-valid
- no human data
- no LLM/vector database
- no production Hallium changes
- no device/RAM/battery/energy/end-to-end latency measurement

Production Hallium remains untouched.
