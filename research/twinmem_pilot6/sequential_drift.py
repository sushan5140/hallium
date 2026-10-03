#!/usr/bin/env python3
"""TwinMem Pilot 6: sequential uncertainty-aware drift detection.

RESEARCH ONLY. Synthetic profiles only. No production Hallium behavior.

Pilot 5 achieved stable held-out drift detection but required a fixed 48 labeled
observations per source. Pilot 6 freezes the Pilot-5 uncertainty detector and
feeds it nested evidence stages: 8 -> 12 -> 24 -> 48 observations/source.

To protect specificity, early drift requires TWO CONSECUTIVE stages whose
uncertainty-aware lower-bound signal exceeds the frozen meaningful margin.
If no early stop occurs, the 48-label stage uses the exact Pilot-5 decision.

No hyperparameters are tuned in this phase.
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
sys.path[:0] = [str(P0), str(P1), str(P3), str(P5)]

import benchmark as b  # noqa: E402
import calibrated_reliability as p1  # noqa: E402
import budget_aware_gate as p3  # noqa: E402
import uncertainty_drift as p5  # noqa: E402

OUT = Path(__file__).resolve().parent / "outputs"

STAGES = (8, 12, 24, 48)
MARGIN = 0.05
ZCRIT = 1.96
CONSECUTIVE_REQUIRED = 2
REPEATS = 400
CALIBRATION_PROFILES = 280
TEST_PROFILES = 480

BASE_SEED = 20261501
RECENT_STATIONARY_SEED = 20261511
RECENT_MODERATE_SEED = 20261512
RECENT_SEVERE_SEED = 20261513
TEST_STATIONARY_SEED = 20261521
TEST_MODERATE_SEED = 20261522
TEST_SEVERE_SEED = 20261523

MODERATE_SHIFT_NOISE = p3.MODERATE_SHIFT_NOISE
SEVERE_SHIFT_NOISE = p3.SEVERE_SHIFT_NOISE

ACTION_TABLE = {
    "no_drift": {"52": "calibrated", "105": "calibrated", "210": "calibrated"},
    "drift": {"52": "topic_recent", "105": "calibrated", "210": "calibrated"},
}

DETECTION_CRITERIA = {
    "stationary_false_alarm_max": 0.10,
    "moderate_detection_min": 0.80,
    "severe_detection_min": 0.90,
}

EFFICIENCY_GOALS = {
    "moderate_mean_labels_per_source_max": 36.0,
    "severe_mean_labels_per_source_max": 24.0,
}


def generate_with_noise(seed, total, prefix, noise):
    return p1.generate_with_noise(seed, total, prefix, noise)


def shuffled_observation_streams(profiles, seed):
    rng = random.Random(seed)
    raw = p5.observations_by_source(profiles)
    streams = {}
    for source in p5.SOURCES:
        values = list(raw[source])
        rng.shuffle(values)
        if len(values) < max(STAGES):
            raise AssertionError(f"insufficient observations for {source}")
        streams[source] = values
    return streams


def recent_stats_from_prefix(streams, n):
    return {
        source: p5.beta_stats(sum(streams[source][:n]), n)
        for source in p5.SOURCES
    }


def sequential_decision(base, profiles, seed):
    streams = shuffled_observation_streams(profiles, seed)
    consecutive = 0
    trace = []

    for stage in STAGES:
        recent = recent_stats_from_prefix(streams, stage)
        signal = p5.uncertainty_signal(base, recent, MARGIN, ZCRIT)
        trace.append({
            "labels_per_source": stage,
            "drift_signal": bool(signal["drift"]),
            "max_lower_bound_change": signal["max_lower_bound_change"],
            "strongest_source": signal["strongest_source"],
        })

        if stage == STAGES[-1]:
            return {
                "drift": bool(signal["drift"]),
                "labels_per_source": stage,
                "stop_reason": "final_frozen_pilot5_decision",
                "trace": trace,
            }

        consecutive = consecutive + 1 if signal["drift"] else 0
        if consecutive >= CONSECUTIVE_REQUIRED:
            return {
                "drift": True,
                "labels_per_source": stage,
                "stop_reason": "two_consecutive_drift_signals",
                "trace": trace,
            }

    raise AssertionError("sequential detector failed to terminate")


def fixed48_decision(base, profiles, seed):
    streams = shuffled_observation_streams(profiles, seed)
    recent = recent_stats_from_prefix(streams, 48)
    signal = p5.uncertainty_signal(base, recent, MARGIN, ZCRIT)
    return bool(signal["drift"])


def detector_distribution(base, profiles, seed_base):
    sequential = []
    fixed = []
    labels = []
    stops = Counter()

    for rep in range(REPEATS):
        seed = seed_base + rep
        result = sequential_decision(base, profiles, seed)
        sequential.append(int(result["drift"]))
        fixed.append(int(fixed48_decision(base, profiles, seed)))
        labels.append(result["labels_per_source"])
        stops[result["labels_per_source"]] += 1

    return {
        "repeats": REPEATS,
        "sequential_detection_rate": sum(sequential) / REPEATS,
        "fixed48_detection_rate": sum(fixed) / REPEATS,
        "mean_labels_per_source": statistics.mean(labels),
        "median_labels_per_source": statistics.median(labels),
        "mean_total_labels_three_sources": statistics.mean(labels) * len(p5.SOURCES),
        "stop_counts": {str(stage): stops[stage] for stage in STAGES},
        "stop_rates": {str(stage): stops[stage] / REPEATS for stage in STAGES},
    }


def method_budget_accuracy(profiles, weights, half_life):
    methods = {
        "calibrated": p1.rows_for(profiles, "calibrated", weights, half_life),
        "topic_recent": p1.rows_for(profiles, "topic_recent"),
    }
    result = {}
    for method, rows in methods.items():
        result[method] = {}
        for budget in b.BUDGETS:
            sample = [r for r in rows if r["word_budget"] == budget]
            result[method][str(budget)] = (
                sum(r["correct"] for r in sample) / len(sample)
            )
    return result


def expected_policy_accuracy(detection_rate, accuracy):
    result = {}
    for budget in b.BUDGETS:
        key = str(budget)
        no_method = ACTION_TABLE["no_drift"][key]
        drift_method = ACTION_TABLE["drift"][key]
        result[key] = (
            (1.0 - detection_rate) * accuracy[no_method][key]
            + detection_rate * accuracy[drift_method][key]
        )
    return result


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    base_profiles = b.generate(BASE_SEED, 220, "p6base")
    base = p5.baseline_stats(base_profiles)
    calibration = p1.estimate_source_reliability(base_profiles)
    weights = p1.weights_only(calibration)
    half_life, _ = p1.tune_half_life(base_profiles, weights)

    recent_pools = {
        "stationary": b.generate(
            RECENT_STATIONARY_SEED, CALIBRATION_PROFILES, "p6statrecent"
        ),
        "moderate": generate_with_noise(
            RECENT_MODERATE_SEED,
            CALIBRATION_PROFILES,
            "p6modrecent",
            MODERATE_SHIFT_NOISE,
        ),
        "severe": generate_with_noise(
            RECENT_SEVERE_SEED,
            CALIBRATION_PROFILES,
            "p6sevrecent",
            SEVERE_SHIFT_NOISE,
        ),
    }

    test_profiles = {
        "stationary": b.generate(
            TEST_STATIONARY_SEED, TEST_PROFILES, "p6stattest"
        ),
        "moderate": generate_with_noise(
            TEST_MODERATE_SEED, TEST_PROFILES, "p6modtest", MODERATE_SHIFT_NOISE
        ),
        "severe": generate_with_noise(
            TEST_SEVERE_SEED, TEST_PROFILES, "p6sevtest", SEVERE_SHIFT_NOISE
        ),
    }

    distributions = {
        "stationary": detector_distribution(base, recent_pools["stationary"], 310000),
        "moderate": detector_distribution(base, recent_pools["moderate"], 320000),
        "severe": detector_distribution(base, recent_pools["severe"], 330000),
    }

    detection_pass = (
        distributions["stationary"]["sequential_detection_rate"]
        <= DETECTION_CRITERIA["stationary_false_alarm_max"]
        and distributions["moderate"]["sequential_detection_rate"]
        >= DETECTION_CRITERIA["moderate_detection_min"]
        and distributions["severe"]["sequential_detection_rate"]
        >= DETECTION_CRITERIA["severe_detection_min"]
    )

    efficiency_pass = (
        distributions["moderate"]["mean_labels_per_source"]
        <= EFFICIENCY_GOALS["moderate_mean_labels_per_source_max"]
        and distributions["severe"]["mean_labels_per_source"]
        <= EFFICIENCY_GOALS["severe_mean_labels_per_source_max"]
    )

    method_accuracy = {
        scenario: method_budget_accuracy(profiles, weights, half_life)
        for scenario, profiles in test_profiles.items()
    }

    expected_accuracy = {
        scenario: expected_policy_accuracy(
            distributions[scenario]["sequential_detection_rate"],
            method_accuracy[scenario],
        )
        for scenario in ("stationary", "moderate", "severe")
    }

    payload = {
        "status": "synthetic_research_only",
        "limits": [
            "No human learner data",
            "No LLM or vector database",
            "No production Hallium behavior",
            "Correctness labels use simulator truth and are privileged",
            "Sequential evidence streams are synthetic nested samples",
            "No device/RAM/battery/energy/end-to-end latency measurement",
        ],
        "frozen_detector": {
            "stages": STAGES,
            "meaningful_margin": MARGIN,
            "zcrit": ZCRIT,
            "consecutive_early_drift_signals_required": CONSECUTIVE_REQUIRED,
            "final_stage_uses_pilot5_rule": True,
        },
        "detection_criteria": DETECTION_CRITERIA,
        "efficiency_goals": EFFICIENCY_GOALS,
        "repeats": REPEATS,
        "distributions": distributions,
        "detection_criteria_pass": detection_pass,
        "efficiency_goals_pass": efficiency_pass,
        "method_accuracy": method_accuracy,
        "expected_policy_accuracy": expected_accuracy,
    }

    (OUT / "results.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(payload, indent=2))
    return payload


if __name__ == "__main__":
    main()
