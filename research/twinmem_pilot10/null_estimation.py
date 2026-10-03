#!/usr/bin/env python3
"""TwinMem Pilot 10: plug-in null estimation robustness.

RESEARCH ONLY. Synthetic profiles only. No production Hallium behavior.

Pilot 9 fixed:
- delta = 0.25
- alpha = 0.10
- stages = 8, 12, 24, 48 labels/source

Pilot 10 does NOT retune the detector. It varies only the number of stationary
baseline correctness labels/source used to estimate the null probabilities p0.

For each baseline size, baseline p0 is re-estimated independently per repeat,
then the frozen Pilot-9 mixture likelihood-ratio process is run on independent
recent streams.

After the smallest baseline size meeting all predeclared goals is identified,
a separate fresh stress set applies mild +/-0.03 p0 misspecification.
"""
from __future__ import annotations

import json
import random
import statistics
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
P0 = ROOT / "twinmem_pilot0"
P1 = ROOT / "twinmem_pilot1"
P3 = ROOT / "twinmem_pilot3"
P5 = ROOT / "twinmem_pilot5"
P9 = ROOT / "twinmem_pilot9"
sys.path[:0] = [str(P0), str(P1), str(P3), str(P5), str(P9)]

import benchmark as b  # noqa: E402
import calibrated_reliability as p1  # noqa: E402
import budget_aware_gate as p3  # noqa: E402
import uncertainty_drift as p5  # noqa: E402
import mixture_eprocess as p9  # noqa: E402

OUT = Path(__file__).resolve().parent / "outputs"

BASELINE_LABELS = (12, 24, 48, 96, 192)
DELTA = 0.25
ALPHA = 0.10
STAGES = (8, 12, 24, 48)

REPEATS = 320
BIAS_REPEATS = 400
BASELINE_POOL_PROFILES = 360
RECENT_POOL_PROFILES = 340

BASELINE_POOL_SEED = 20261901
RECENT_STATIONARY_SEED = 20261911
RECENT_MODERATE_SEED = 20261912
RECENT_SEVERE_SEED = 20261913

BIAS_BASELINE_POOL_SEED = 20261921
BIAS_STATIONARY_SEED = 20261922
BIAS_MODERATE_SEED = 20261923
BIAS_SEVERE_SEED = 20261924

MODERATE_SHIFT_NOISE = p3.MODERATE_SHIFT_NOISE
SEVERE_SHIFT_NOISE = p3.SEVERE_SHIFT_NOISE
SOURCES = tuple(p5.SOURCES)

DETECTION_CRITERIA = {
    "stationary_false_alarm_max": 0.10,
    "moderate_detection_min": 0.80,
    "severe_detection_min": 0.90,
}
EFFICIENCY_GOALS = {
    "moderate_mean_labels_per_source_max": 36.0,
    "severe_mean_labels_per_source_max": 24.0,
}

BIAS_PATTERNS = {
    "none": {
        "practice_result": 0.0,
        "self_report": 0.0,
        "verified_assessment": 0.0,
    },
    "all_plus_0_03": {
        "practice_result": 0.03,
        "self_report": 0.03,
        "verified_assessment": 0.03,
    },
    "all_minus_0_03": {
        "practice_result": -0.03,
        "self_report": -0.03,
        "verified_assessment": -0.03,
    },
    "source_skew_0_03": {
        "practice_result": 0.0,
        "self_report": -0.03,
        "verified_assessment": 0.03,
    },
}


def generate_with_noise(seed, total, prefix, noise):
    return p1.generate_with_noise(seed, total, prefix, noise)


def baseline_observations(profiles):
    return p5.observations_by_source(profiles)


def estimate_p0(raw, n, seed):
    rng = random.Random(seed)
    p0 = {}
    for source in SOURCES:
        values = raw[source]
        if len(values) < n:
            raise AssertionError(f"insufficient baseline observations for {source}")
        sample = rng.sample(values, n)
        p0[source] = p5.beta_stats(sum(sample), n)["mean"]
    return p0


def apply_bias(p0, pattern):
    return {
        source: min(0.98, max(0.02, p0[source] + pattern[source]))
        for source in SOURCES
    }


def repeated_distribution(
    baseline_raw,
    baseline_n,
    recent_profiles,
    baseline_seed_base,
    recent_seed_base,
    repeats,
    bias_pattern=None,
):
    detections = []
    labels = []
    stops = Counter()

    for rep in range(repeats):
        p0 = estimate_p0(baseline_raw, baseline_n, baseline_seed_base + rep)
        if bias_pattern is not None:
            p0 = apply_bias(p0, bias_pattern)

        result = p9.sequential_decision(
            p0,
            recent_profiles,
            recent_seed_base + rep,
            DELTA,
            ALPHA,
        )
        detections.append(int(result["drift"]))
        labels.append(result["labels_per_source"])
        stops[result["labels_per_source"]] += 1

    return {
        "repeats": repeats,
        "detection_rate": sum(detections) / repeats,
        "mean_labels_per_source": statistics.mean(labels),
        "median_labels_per_source": statistics.median(labels),
        "mean_total_labels_three_sources": statistics.mean(labels) * len(SOURCES),
        "stop_counts": {str(stage): stops[stage] for stage in STAGES},
        "stop_rates": {str(stage): stops[stage] / repeats for stage in STAGES},
    }


def scenario_bundle(
    baseline_raw,
    baseline_n,
    pools,
    seed_offset,
    repeats,
    bias_pattern=None,
):
    result = {
        "stationary": repeated_distribution(
            baseline_raw,
            baseline_n,
            pools["stationary"],
            100000 + seed_offset,
            200000 + seed_offset,
            repeats,
            bias_pattern,
        ),
        "moderate": repeated_distribution(
            baseline_raw,
            baseline_n,
            pools["moderate"],
            110000 + seed_offset,
            210000 + seed_offset,
            repeats,
            bias_pattern,
        ),
        "severe": repeated_distribution(
            baseline_raw,
            baseline_n,
            pools["severe"],
            120000 + seed_offset,
            220000 + seed_offset,
            repeats,
            bias_pattern,
        ),
    }

    detection_pass = (
        result["stationary"]["detection_rate"]
        <= DETECTION_CRITERIA["stationary_false_alarm_max"]
        and result["moderate"]["detection_rate"]
        >= DETECTION_CRITERIA["moderate_detection_min"]
        and result["severe"]["detection_rate"]
        >= DETECTION_CRITERIA["severe_detection_min"]
    )
    efficiency_pass = (
        result["moderate"]["mean_labels_per_source"]
        <= EFFICIENCY_GOALS["moderate_mean_labels_per_source_max"]
        and result["severe"]["mean_labels_per_source"]
        <= EFFICIENCY_GOALS["severe_mean_labels_per_source_max"]
    )

    return {
        "distributions": result,
        "detection_pass": detection_pass,
        "efficiency_pass": efficiency_pass,
        "all_goals_pass": detection_pass and efficiency_pass,
    }


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    baseline_pool = b.generate(
        BASELINE_POOL_SEED, BASELINE_POOL_PROFILES, "p10baseline"
    )
    baseline_raw = baseline_observations(baseline_pool)

    recent_pools = {
        "stationary": b.generate(
            RECENT_STATIONARY_SEED, RECENT_POOL_PROFILES, "p10stat"
        ),
        "moderate": generate_with_noise(
            RECENT_MODERATE_SEED,
            RECENT_POOL_PROFILES,
            "p10mod",
            MODERATE_SHIFT_NOISE,
        ),
        "severe": generate_with_noise(
            RECENT_SEVERE_SEED,
            RECENT_POOL_PROFILES,
            "p10sev",
            SEVERE_SHIFT_NOISE,
        ),
    }

    curve = []
    for n in BASELINE_LABELS:
        bundle = scenario_bundle(
            baseline_raw,
            n,
            recent_pools,
            seed_offset=n * 100,
            repeats=REPEATS,
        )
        curve.append({
            "baseline_labels_per_source": n,
            **bundle,
        })

    passing = [
        row["baseline_labels_per_source"]
        for row in curve
        if row["all_goals_pass"]
    ]
    minimum_passing = min(passing) if passing else None

    bias_stress = None
    if minimum_passing is not None:
        bias_baseline_pool = b.generate(
            BIAS_BASELINE_POOL_SEED,
            BASELINE_POOL_PROFILES,
            "p10biasbaseline",
        )
        bias_raw = baseline_observations(bias_baseline_pool)
        bias_recent = {
            "stationary": b.generate(
                BIAS_STATIONARY_SEED,
                RECENT_POOL_PROFILES,
                "p10biasstat",
            ),
            "moderate": generate_with_noise(
                BIAS_MODERATE_SEED,
                RECENT_POOL_PROFILES,
                "p10biasmod",
                MODERATE_SHIFT_NOISE,
            ),
            "severe": generate_with_noise(
                BIAS_SEVERE_SEED,
                RECENT_POOL_PROFILES,
                "p10biassev",
                SEVERE_SHIFT_NOISE,
            ),
        }

        bias_stress = {}
        for idx, (name, pattern) in enumerate(BIAS_PATTERNS.items()):
            bias_stress[name] = {
                "pattern": pattern,
                **scenario_bundle(
                    bias_raw,
                    minimum_passing,
                    bias_recent,
                    seed_offset=50000 + idx * 1000,
                    repeats=BIAS_REPEATS,
                    bias_pattern=pattern,
                ),
            }

    payload = {
        "status": "synthetic_research_only",
        "limits": [
            "No human learner data",
            "No LLM or vector database",
            "No production Hallium behavior",
            "Correctness labels use simulator truth and are privileged",
            "Baseline p0 is estimated with Beta(2,2) smoothing",
            "Bias stress is synthetic plug-in null misspecification",
            "No formal anytime-valid guarantee is claimed",
        ],
        "frozen_pilot9": {
            "delta": DELTA,
            "alpha": ALPHA,
            "stages": STAGES,
        },
        "baseline_labels_grid": BASELINE_LABELS,
        "repeats_per_size_scenario": REPEATS,
        "bias_repeats_per_pattern_scenario": BIAS_REPEATS,
        "detection_criteria": DETECTION_CRITERIA,
        "efficiency_goals": EFFICIENCY_GOALS,
        "baseline_size_curve": curve,
        "minimum_passing_baseline_labels_per_source": minimum_passing,
        "bias_patterns": BIAS_PATTERNS,
        "bias_stress": bias_stress,
    }

    (OUT / "results.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(payload, indent=2))
    return payload


if __name__ == "__main__":
    main()
