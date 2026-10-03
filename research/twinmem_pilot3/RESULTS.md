# TwinMem Pilot 3 results — budget-aware drift response

**Executed by GitHub Actions on 3 October 2026.**  
**Status:** reproducible synthetic research experiment only.

Pilot 3 freezes Pilot 2's detector and learns only the response action per context budget.

## Frozen detector

- recent labeled window: **24 observations per source**
- drift threshold: **0.20**

## Development-learned action table

| Detector state | 52 words | 105 words | 210 words |
|---|---|---|---|
| No drift | calibrated | calibrated | calibrated |
| Drift detected | **topic_recent** | **calibrated** | **calibrated** |

This exactly targets the Pilot-2 failure: freshness-first is useful under severe drift at the tightest budget, while the larger budgets retain enough evidence for calibrated retrieval to remain preferable.

## Stationary held-out scenario

Detector drift score: **0.0849**  
Detected: **no**

| Method | 52 words | 105 words | 210 words |
|---|---:|---:|---:|
| Frozen calibrated | **93.44%** | **96.15%** | 96.04% |
| Freshness-first | 74.84% | 92.71% | **96.20%** |
| **Budget-aware gate** | **93.44%** | **96.15%** | 96.04% |
| Oracle best-of-two | 97.40% | 97.19% | 96.77% |

The detector did not falsely enter drift mode. The action table preserved calibrated retrieval at every budget.

## Severe source-reliability shift

Detector drift score: **0.4420**  
Detected: **yes**

| Method | 52 words | 105 words | 210 words |
|---|---:|---:|---:|
| Frozen calibrated | 63.65% | **75.05%** | **80.42%** |
| Freshness-first | **86.20%** | 71.67% | 78.75% |
| **Budget-aware gate** | **86.20%** | **75.05%** | **80.42%** |
| Oracle best-of-two | 90.78% | 80.99% | 81.51% |

Compared with frozen calibrated:
- 52 words: **+22.55 pp**
- 105 words: unchanged
- 210 words: unchanged

Unlike Pilot 2, the drift response no longer sacrifices the larger context budgets.

## Moderate unseen source-reliability shift

This noise regime was **not used to learn the action table**.

Detector drift score: **0.4394**  
Detected: **yes**

| Method | 52 words | 105 words | 210 words |
|---|---:|---:|---:|
| Frozen calibrated | 78.07% | **87.66%** | **89.32%** |
| Freshness-first | **85.26%** | 82.66% | 89.11% |
| **Budget-aware gate** | **85.26%** | **87.66%** | **89.32%** |
| Oracle best-of-two | 92.97% | 91.25% | 90.47% |

Compared with frozen calibrated:
- 52 words: **+7.19 pp**
- 105 words: unchanged
- 210 words: unchanged

This is a stronger generalization check than the severe-shift result because the moderate regime was not used in action-table training.

## Main finding

Within this simulator, the combination

1. detect source-reliability drift,
2. then make the retrieval response **context-budget specific**

is more robust than Pilot 2's one global switch.

However, the detector still depends on **24 labeled correctness observations per source**, where correctness comes from privileged simulator truth.

That becomes the next important research bottleneck.

## Next hypothesis

Measure detector reliability as the recent labeled window shrinks.

Questions:
- How many labeled observations/source are needed to keep false switches low under stationarity?
- How many are needed to detect moderate vs severe shift?
- How unstable are gate decisions across repeated calibration samples?
- Can uncertainty-aware abstention be safer than forcing a drift/no-drift decision with too little evidence?

## Limits

- synthetic profiles only
- recent correctness labels use simulator truth
- no human learner data
- no LLM/vector database
- no production Hallium changes
- only a few source-noise regimes
- no real device, RAM, battery, energy, or end-to-end latency benchmark
- no claim that 24 labeled observations/source are practical in production

Production Hallium remains untouched.
