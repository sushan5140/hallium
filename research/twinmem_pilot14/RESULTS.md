# TwinMem Pilot 14 results — baseline-information robustness

**Executed by GitHub Actions on 3 October 2026.**  
**Status:** reproducible synthetic research experiment only.

Pilot 14 freezes the original Pilot-9 plug-in process:

- delta = 0.25
- alpha = 0.10
- stages 8 / 12 / 24 / 48
- unchanged detection + efficiency goals
- no detector retuning

Only baseline evidence changes:
- 96 labels/source
- 192 labels/source

Each size is tested on fresh:
- unbiased
- all p0 +0.03
- all p0 -0.03
- source-skew ±0.03

500 repeats per size × pattern × scenario.

## 96 baseline labels/source

| Stress | Stationary false alarm | Moderate detection | Moderate labels/source | Severe detection | Severe labels/source | Pass |
|---|---:|---:|---:|---:|---:|---|
| None | 5.6% | 85.6% | 30.22 | 100% | 16.09 | ✅ |
| All p0 +0.03 | 7.6% | 92.2% | 23.99 | 100% | 12.67 | ✅ |
| All p0 -0.03 | **10.8%** | 85.4% | 31.32 | 100% | 16.47 | ❌ |
| Source skew ±0.03 | 9.4% | 96.4% | 22.55 | 100% | 12.27 | ✅ |

Robust across all patterns: **NO**

The only failure is a small specificity miss under the negative p0 bias:
- target stationary false alarm ≤10%
- observed 10.8%

## 192 baseline labels/source

| Stress | Stationary false alarm | Moderate detection | Moderate labels/source | Severe detection | Severe labels/source | Pass |
|---|---:|---:|---:|---:|---:|---|
| None | **3.4%** | 86.8% | 29.95 | 100% | 14.82 | ✅ |
| All p0 +0.03 | 7.0% | 93.8% | 24.60 | 100% | 12.34 | ✅ |
| All p0 -0.03 | **8.8%** | 89.8% | 30.94 | 100% | 16.72 | ✅ |
| Source skew ±0.03 | 8.0% | 97.4% | 21.04 | 100% | 11.55 | ✅ |

Robust across all patterns: **YES**

## Main finding

The information hypothesis is supported in this simulator.

At 48 baseline labels/source:
- Pilot 10 fresh stress failed even without added bias.

At 96:
- 3/4 stress patterns pass
- one specificity miss remains at 10.8%.

At 192:
- **all four fresh stress patterns pass all detection + efficiency goals**.

So the original Pilot-9 high-power process can become empirically robust to the tested ±0.03 null misspecification simply by increasing independent baseline evidence.

## Practical tradeoff

This shifts the bottleneck.

Recent-drift monitoring can remain efficient:
- moderate shift uses roughly 21–31 labels/source
- severe shift roughly 12–17 labels/source

But the learner/source system needs **192 baseline correctness labels per source**, or 576 baseline labeled observations across three source types, before the tested plug-in process has this robustness margin.

That is a large baseline calibration burden.

## Research conclusion

Pilot 14 does not justify deploying the detector.

It establishes a useful synthetic boundary:

> High-power plug-in sequential drift detection appears robust in this simulator when baseline source reliability is estimated from around 192 labeled observations/source, but not reliably at 48 and only marginally at 96.

The next research question should therefore move from detector mathematics to **baseline-label acquisition efficiency**:

- can baseline reliability pool evidence across time/users/tasks safely?
- can hierarchical shrinkage reduce the 192/source burden?
- can active sampling prioritize the source whose reliability uncertainty matters most?
- can trusted assessment outcomes supply labels without manual annotation?

## Limits

- synthetic profiles only
- correctness labels are privileged simulator truth
- ±0.03 misspecification is synthetic
- 192/source is not claimed as a real-world threshold
- plug-in p0 still lacks a formal anytime-valid guarantee under estimation
- no human data
- no production Hallium changes

Production Hallium remains untouched.
