#!/usr/bin/env python3
"""TwinMem Pilot 7: development-selected cost-aware sequential stopping.

RESEARCH ONLY. Synthetic profiles only. No production Hallium behavior.

Pilot 6 used a fixed two-consecutive-signal early-stop rule and narrowly missed
the moderate-shift label-cost target.

Pilot 7 keeps the Pilot-5 uncertainty detector and Pilot-3 retrieval response
frozen, and tunes ONLY one stopping-boundary parameter on development streams:

  strong_single_stage_threshold

Early drift is declared when either:
1) two consecutive ordinary drift signals occur, OR
2) one stage has max_lower_bound_change >= strong_single_stage_threshold.

The threshold is selected only on development streams. Final test streams use
different seeds.
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
STRONG_THRESHOLDS = (0.08, 0.10, 0.12, 0.15, 0.18)

DEV_REPEATS = 220
TEST_REPEATS = 500
CALIBRATION_PROFILES = 300
TEST_PROFILES = 480

BASE_SEED = 20261601
DEV_STATIONARY_SEED = 20261611
DEV_MODERATE_SEED = 20261612
DEV_SEVERE_SEED = 20261613
TEST_STATIONARY_RECENT_SEED = 20261621
TEST_MODERATE_RECENT_SEED = 20261622
TEST_SEVERE_RECENT_SEED = 20261623
TEST_STATIONARY_SEED = 20261631
TEST_MODERATE_SEED = 20261632
TEST_SEVERE_SEED = 20261633

MODERATE_SHIFT_NOISE = p3.MODERATE_SHIFT_NOISE
SEVERE_SHIFT_NOISE = p3.SEVERE_SHIFT_NOISE

DETECTION_CRITERIA = {
    "stationary_false_alarm_max": 0.10,
    "moderate_detection_min": 0.80,
    "severe_detection_min": 0.90,
}

EFFICIENCY_GOALS = {
    "moderate_mean_labels_per_source_max": 36.0,
    "severe_mean_labels_per_source_max": 24.0,
}

ACTION_TABLE = {
    "no_drift": {"52": "calibrated", "105": "calibrated", "210": "calibrated"},
    "drift": {"52": "topic_recent", "105": "calibrated", "210": "calibrated"},
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


def sequential_decision(base, profiles, seed, strong_threshold):
    streams = shuffled_observation_streams(profiles, seed)
    consecutive = 0
    trace = []

    for stage in STAGES:
        recent = recent_stats_from_prefix(streams, stage)
        signal = p5.uncertainty_signal(base, recent, MARGIN, ZCRIT)
        ordinary = bool(signal["drift"])
        strong = signal["max_lower_bound_change"] >= strong_threshold

        trace.append({
            "labels_per_source": stage,
            "ordinary_drift_signal": ordinary,
            "strong_drift_signal": strong,
            "max_lower_bound_change": signal["max_lower_bound_change"],
            "strongest_source": signal["strongest_source"],
        })

        if stage == STAGES[-1]:
            return {
                "drift": ordinary,
                "labels_per_source": stage,
                "stop_reason": "final_frozen_pilot5_decision",
                "trace": trace,
            }

        consecutive = consecutive + 1 if ordinary else 0

        if strong:
            return {
                "drift": True,
                "labels_per_source": stage,
                "stop_reason": "strong_single_stage_signal",
                "trace": trace,
            }

        if consecutive >= CONSECUTIVE_REQUIRED:
            return {
                "drift": True,
                "labels_per_source": stage,
                "stop_reason": "two_consecutive_drift_signals",
                "trace": trace,
            }

    raise AssertionError("sequential detector failed to terminate")


def distribution(base, profiles, seed_base, strong_threshold, repeats):
    detections = []
    labels = []
    stops = Counter()
    reasons = Counter()

    for rep in range(repeats):
        result = sequential_decision(
            base, profiles, seed_base + rep, strong_threshold
        )
        detections.append(int(result["drift"]))
        labels.append(result["labels_per_source"])
        stops[result["labels_per_source"]] += 1
        reasons[result["stop_reason"]] += 1

    return {
        "repeats": repeats,
        "detection_rate": sum(detections) / repeats,
        "mean_labels_per_source": statistics.mean(labels),
        "median_labels_per_source": statistics.median(labels),
        "mean_total_labels_three_sources": statistics.mean(labels) * len(p5.SOURCES),
        "stop_counts": {str(stage): stops[stage] for stage in STAGES},
        "stop_rates": {str(stage): stops[stage] / repeats for stage in STAGES},
        "stop_reasons": dict(sorted(reasons.items())),
    }


def candidate_result(base, pools, threshold):
    d = {
        "stationary": distribution(
            base, pools["stationary"], 110000 + int(threshold * 1000), threshold, DEV_REPEATS
        ),
        "moderate": distribution(
            base, pools["moderate"], 120000 + int(threshold * 1000), threshold, DEV_REPEATS
        ),
        "severe": distribution(
            base, pools["severe"], 130000 + int(threshold * 1000), threshold, DEV_REPEATS
        ),
    }

    detection_pass = (
        d["stationary"]["detection_rate"] <= DETECTION_CRITERIA["stationary_false_alarm_max"]
        and d["moderate"]["detection_rate"] >= DETECTION_CRITERIA["moderate_detection_min"]
        and d["severe"]["detection_rate"] >= DETECTION_CRITERIA["severe_detection_min"]
    )
    efficiency_pass = (
        d["moderate"]["mean_labels_per_source"] <= EFFICIENCY_GOALS["moderate_mean_labels_per_source_max"]
        and d["severe"]["mean_labels_per_source"] <= EFFICIENCY_GOALS["severe_mean_labels_per_source_max"]
    )
    return {
        "strong_threshold": threshold,
        "development": d,
        "detection_pass": detection_pass,
        "efficiency_pass": efficiency_pass,
        "all_goals_pass": detection_pass and efficiency_pass,
    }


def select_candidate(candidates):
    passing = [c for c in candidates if c["all_goals_pass"]]
    if not passing:
        return None

    # Predeclared: minimize average moderate/severe label cost, then lower
    # stationary false alarm, then prefer more conservative/higher threshold.
    passing.sort(key=lambda c: (
        (
            c["development"]["moderate"]["mean_labels_per_source"]
            + c["development"]["severe"]["mean_labels_per_source"]
        ) / 2.0,
        c["development"]["stationary"]["detection_rate"],
        -c["strong_threshold"],
    ))
    return passing[0]


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
        k = str(budget)
        no_method = ACTION_TABLE["no_drift"][k]
        drift_method = ACTION_TABLE["drift"][k]
        result[k] = (
            (1.0 - detection_rate) * accuracy[no_method][k]
            + detection_rate * accuracy[drift_method][k]
        )
    return result


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    base_profiles = b.generate(BASE_SEED, 220, "p7base")
    base = p5.baseline_stats(base_profiles)
    calibration = p1.estimate_source_reliability(base_profiles)
    weights = p1.weights_only(calibration)
    half_life, _ = p1.tune_half_life(base_profiles, weights)

    dev_pools = {
        "stationary": b.generate(
            DEV_STATIONARY_SEED, CALIBRATION_PROFILES, "p7devstat"
        ),
        "moderate": generate_with_noise(
            DEV_MODERATE_SEED, CALIBRATION_PROFILES, "p7devmod", MODERATE_SHIFT_NOISE
        ),
        "severe": generate_with_noise(
            DEV_SEVERE_SEED, CALIBRATION_PROFILES, "p7devsev", SEVERE_SHIFT_NOISE
        ),
    }

    candidates = [
        candidate_result(base, dev_pools, threshold)
        for threshold in STRONG_THRESHOLDS
    ]
    selected = select_candidate(candidates)

    payload = {
        "status": "synthetic_research_only",
        "limits": [
            "No human learner data",
            "No LLM or vector database",
            "No production Hallium behavior",
            "Correctness labels use simulator truth and are privileged",
            "Repeated looks are not formal anytime-valid inference",
            "No device/RAM/battery/energy/end-to-end latency measurement",
        ],
        "frozen_detector": {
            "stages": STAGES,
            "meaningful_margin": MARGIN,
            "zcrit": ZCRIT,
            "consecutive_required": CONSECUTIVE_REQUIRED,
        },
        "candidate_strong_thresholds": STRONG_THRESHOLDS,
        "development_repeats": DEV_REPEATS,
        "test_repeats": TEST_REPEATS,
        "detection_criteria": DETECTION_CRITERIA,
        "efficiency_goals": EFFICIENCY_GOALS,
        "development_candidates": candidates,
        "selected_candidate": None,
        "heldout": None,
    }

    if selected is None:
        (OUT / "results.json").write_text(
            json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        print(json.dumps(payload, indent=2))
        return payload

    threshold = selected["strong_threshold"]
    payload["selected_candidate"] = {
        "strong_threshold": threshold,
        "development": selected["development"],
        "detection_pass": selected["detection_pass"],
        "efficiency_pass": selected["efficiency_pass"],
        "all_goals_pass": selected["all_goals_pass"],
    }

    test_recent = {
        "stationary": b.generate(
            TEST_STATIONARY_RECENT_SEED, CALIBRATION_PROFILES, "p7teststatrecent"
        ),
        "moderate": generate_with_noise(
            TEST_MODERATE_RECENT_SEED,
            CALIBRATION_PROFILES,
            "p7testmodrecent",
            MODERATE_SHIFT_NOISE,
        ),
        "severe": generate_with_noise(
            TEST_SEVERE_RECENT_SEED,
            CALIBRATION_PROFILES,
            "p7testsevrecent",
            SEVERE_SHIFT_NOISE,
        ),
    }

    heldout_dist = {
        "stationary": distribution(base, test_recent["stationary"], 210000, threshold, TEST_REPEATS),
        "moderate": distribution(base, test_recent["moderate"], 220000, threshold, TEST_REPEATS),
        "severe": distribution(base, test_recent["severe"], 230000, threshold, TEST_REPEATS),
    }

    heldout_detection_pass = (
        heldout_dist["stationary"]["detection_rate"] <= DETECTION_CRITERIA["stationary_false_alarm_max"]
        and heldout_dist["moderate"]["detection_rate"] >= DETECTION_CRITERIA["moderate_detection_min"]
        and heldout_dist["severe"]["detection_rate"] >= DETECTION_CRITERIA["severe_detection_min"]
    )
    heldout_efficiency_pass = (
        heldout_dist["moderate"]["mean_labels_per_source"] <= EFFICIENCY_GOALS["moderate_mean_labels_per_source_max"]
        and heldout_dist["severe"]["mean_labels_per_source"] <= EFFICIENCY_GOALS["severe_mean_labels_per_source_max"]
    )

    test_profiles = {
        "stationary": b.generate(TEST_STATIONARY_SEED, TEST_PROFILES, "p7stattest"),
        "moderate": generate_with_noise(
            TEST_MODERATE_SEED, TEST_PROFILES, "p7modtest", MODERATE_SHIFT_NOISE
        ),
        "severe": generate_with_noise(
            TEST_SEVERE_SEED, TEST_PROFILES, "p7sevtest", SEVERE_SHIFT_NOISE
        ),
    }
    method_accuracy = {
        scenario: method_budget_accuracy(profiles, weights, half_life)
        for scenario, profiles in test_profiles.items()
    }
    expected_accuracy = {
        scenario: expected_policy_accuracy(
            heldout_dist[scenario]["detection_rate"],
            method_accuracy[scenario],
        )
        for scenario in ("stationary", "moderate", "severe")
    }

    payload["heldout"] = {
        "distributions": heldout_dist,
        "detection_pass": heldout_detection_pass,
        "efficiency_pass": heldout_efficiency_pass,
        "all_goals_pass": heldout_detection_pass and heldout_efficiency_pass,
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
