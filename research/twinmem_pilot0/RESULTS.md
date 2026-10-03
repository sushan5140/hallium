# TwinMem pilot 0: Synthetic context-budget evidence selection

**Executed:** 25 September 2026. **Status:** reproducible offline ENGINEERING PROOF OF CONCEPT, NOT an LLM evaluation or evidence of on-device system efficiency. This is a follow-on to the on-device RAG reliability question underlying Hallium's AI Doppelgänger research.

## Exact task

Determine a fictional Korean learner's **current** strong/weak status in one of four skills from historical observations when the available **evidence-context word allowance** is restricted. The task is not full RAG question answering, and the generated data are not representative of people.

**480 held-out fictional learner profiles** (160 stable, 160 drifting, 160 mixed) × four skills = **1,920 held-out queries**. Mean 39.92 notes/profile. Separate 60-profile synthetic development smoke set. Generated truth values and the corresponding observations follow a fixed seed; about 6% of fictional verified assessments, 13% of exercise results, and 32% of self-reports are deliberately flipped. Crucial generator limitation: **each skill receives two recent, mostly accurate verified records**. The ranking method assumes declared source reliability; it has no independently learned confidence calibration.

## Result: current-status classification accuracy

| Retrieval policy | 52-word context | 105-word context | 210-word context |
|---|---:|---:|---:|
| Most recent notes regardless of queried skill | 19.22% | 47.34% | 74.79% |
| Exact skill, newest first | 77.03% | 94.74% | 97.71% |
| Exact skill, assessment quality first | 94.32% | 95.57% | 97.29% |
| **Exact skill, quality × freshness** | **94.32%** | **97.50%** | **97.81%** |

Unbounded complete history: **97.45%** with **1,293 mean context words**. Budget-limited strategies average about 33, 98 and 195 context words respectively. **All strategies share a deterministic evidence aggregation rule**, not an LLM. A no-evidence abstention counts as incorrect; a 52-word most-recent global strategy abstained on 75% of skill queries.

### Paired uncertainty for this simulator (not real-world uncertainty)

Profile-cluster bootstrap, four questions clustered per fictional person, 480 persons:

| Adaptive minus comparator | 52 words | 105 words | 210 words |
|---|---:|---:|---:|
| Newest relevant | +17.29 pp [15.31, 19.32] | +2.76 [1.93, 3.65] | +0.10 [-0.26, 0.47] |
| Quality-only | **0.00 pp [0, 0]** | +1.93 [1.15, 2.71] | +0.52 [0.05, 1.04] |

Brackets are 95% profile-bootstrap intervals conditional on **this fixed data generator**. Do not interpret as confidence about real learners or edge hardware. **Strong quality-only retrieval equals adaptive at the tightest budget.** The joint quality×age formula does not demonstrate an added benefit there.

## Concrete failure mechanism

In simulated profile `test-0007`, vocabulary changed **strong → weak**. A day-99 inaccurate self-report said **strong**; a day-91 verified assessment said **weak**. Under the 52-word cap, newest-relevant retrieval selected the self-report and concluded incorrectly. Quality×freshness selected the verified note and concluded the simulator's actual state. This is an illustrative engineered case, not a participant quote or real Hallium record.

## Negative robustness result: source labels can mislead

**Post-hoc exploratory** source-distribution shift: set formal-assessment flip rate to 36% and informal self-report flip rate to 5% (leave algorithms unchanged). At 52 words the supposedly adaptive method fell to **69.58%**, whereas newest-relevant reached **88.12%**. At 105 words adaptive scored **75.73%** versus newest relevant **78.33%**. The quality weighting is a strong assumption—not universally safe. A second post-hoc experiment removed recent formal records for one skill per learner. Both stress tests were specified **after** looking at the primary results; they are not confirmatory tests.

## Host performance: selection only, not true device or deadline metrics

On the analysis host (Linux, CPython), with ~40 notes and a 105-word allowance: adaptive **0.0107 ms** median retrieval selection, newest relevant **0.0098 ms**. With **3,900 duplicated synthetic notes**, adaptive **~0.98 ms**, newest relevant **~0.90 ms**. Excludes embeddings, storage read, index construction, model inference, actual tokenization, end-to-end latency, RAM, battery and power. There is **no enforced time deadline in pilot 0**. Calling these on-device RAG performance gains would be incorrect.

## Implication for next research phase

The sharper testable problem is: **how can evidence freshness and trustworthiness be estimated under a joint context, time and memory budget, particularly when the source-quality prior or observation availability changes?** The appropriate next step is a calibrated reliability estimate + actual retrieval index + on-device end-to-end inference, with equal-budget quality-only and newest-relevant baselines.

## Reproduce, no third-party libraries

From this folder, Python 3.10+:

```bash
python benchmark.py --outdir outputs
python extra_analysis.py
python robustness.py
```

Main scripts and config are versioned here. All underlying synthetic JSONL, ~25k per-query result rows, failure-case dumps, exact full methodological report and plots are also available in the downloadable archive supplied in the corresponding ChatGPT research conversation. The main script reproducibly regenerates these artifacts with the recorded seeds (20260922 dev and 20260925 test). The local result-summary CSV and dataset were byte-for-byte identical in a second clean execution.

This is a separate research branch: no edits to the production Hallium/Supabase twin behavior, user records, or previous paper scaffold.
