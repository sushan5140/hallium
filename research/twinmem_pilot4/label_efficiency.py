#!/usr/bin/env python3
"""TwinMem Pilot 4: label efficiency and drift-decision stability.

RESEARCH ONLY. Synthetic profiles only. No production Hallium behavior.

Pilot 3 used a fixed drift threshold of 0.20 and a budget-aware response policy.
Pilot 4 freezes those choices and varies only the number of recent labeled
correctness observations per source.

Success criterion is declared before evaluation:
- stationary false drift alarm rate <= 10%
- moderate-shift detection rate >= 80%
- severe-shift detection rate >= 90%

Simulator truth supplies correctness labels; this is privileged information.
"""
from __future__ import annotations

import json
import statistics
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
P0 = ROOT / "twinmem_pilot0"
P1 = ROOT / "twinmem_pilot1"
P2 = ROOT / "twinmem_pilot2"
P3 = ROOT / "twinmem_pilot3"
sys.path[:0] = [str(P0), str(P1), str(P2), str(P3)]

import benchmark as b  # noqa: E402
import calibrated_reliability as p1  # noqa: E402
import drift_gate as p2  # noqa: E402
import budget_aware_gate as p3  # noqa: E402

OUT = Path(__file__).resolve().parent / "outputs"

WINDOWS = (4, 8, 12, 24, 48)
REPEATS = 250
THRESHOLD = 0.20

BASE_DEV_SEED = 20261301
RECENT_STATIONARY_SEED = 20261311
RECENT_MODERATE_SEED = 20261312
RECENT_SEVERE_SEED = 20261313
TEST_STATIONARY_SEED = 20261321
TEST_MODERATE_SEED = 20261322
TEST_SEVERE_SEED = 20261323

CALIBRATION_PROFILES = 240
TEST_PROFILES = 480

SEVERE_SHIFT_NOISE = p3.SEVERE_SHIFT_NOISE
MODERATE_SHIFT_NOISE = p3.MODERATE_SHIFT_NOISE

ACTION_TABLE = {
    "no_drift": {"52": "calibrated", "105": "calibrated", "210": "calibrated"},
    "drift": {"52": "topic_recent", "105": "calibrated", "210": "calibrated"},
}

CRITERIA = {
    "stationary_false_alarm_max": 0.10,
    "moderate_detection_min": 0.80,
    "severe_detection_min": 0.90,
}


def generate_with_noise(seed, total, prefix, noise):
    return p1.generate_with_noise(seed, total, prefix, noise)


def percentile(values, q):
    ordered = sorted(values)
    if not ordered:
        return None
    pos = min(len(ordered) - 1, max(0, int(round((len(ordered) - 1) * q))))
    return ordered[pos]


def detector_distribution(profiles, base_weights, window, seed_base):
    scores = []
    decisions = []
    for rep in range(REPEATS):
        recent = p2.recent_reliability_estimate(
            profiles, window, seed_base + rep
        )
        score = p2.drift_score(base_weights, recent)
        scores.append(score)
        decisions.append(int(score >= THRESHOLD))
    return {
        "repeats": REPEATS,
        "window_per_source": window,
        "detection_rate": sum(decisions) / len(decisions),
        "mean_drift_score": statistics.mean(scores),
        "median_drift_score": statistics.median(scores),
        "p05_drift_score": percentile(scores, 0.05),
        "p95_drift_score": percentile(scores, 0.95),
    }


def method_budget_accuracy(profiles, base_weights, half_life):
    rows = {
        "calibrated": p1.rows_for(profiles, "calibrated", base_weights, half_life),
        "topic_recent": p1.rows_for(profiles, "topic_recent"),
    }
    result = {}
    for method, method_rows in rows.items():
        result[method] = {}
        for budget in b.BUDGETS:
            sample = [r for r in method_rows if r["word_budget"] == budget]
            result[method][str(budget)] = (
                sum(r["correct"] for r in sample) / len(sample)
            )
    return result


def expected_policy_accuracy(detection_rate, method_accuracy):
    out = {}
    for budget in b.BUDGETS:
        k = str(budget)
        no_drift_method = ACTION_TABLE["no_drift"][k]
        drift_method = ACTION_TABLE["drift"][k]
        out[k] = (
            (1.0 - detection_rate) * method_accuracy[no_drift_method][k]
            + detection_rate * method_accuracy[drift_method][k]
        )
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    base_dev = b.generate(BASE_DEV_SEED, 180, "p4basedev")
    base_calibration = p1.estimate_source_reliability(base_dev)
    base_weights = p1.weights_only(base_calibration)
    base_half_life, _ = p1.tune_half_life(base_dev, base_weights)

    recent_profiles = {
        "stationary": b.generate(
            RECENT_STATIONARY_SEED, CALIBRATION_PROFILES, "p4statrecent"
        ),
        "moderate_shift": generate_with_noise(
            RECENT_MODERATE_SEED,
            CALIBRATION_PROFILES,
            "p4modrecent",
            MODERATE_SHIFT_NOISE,
        ),
        "severe_shift": generate_with_noise(
            RECENT_SEVERE_SEED,
            CALIBRATION_PROFILES,
            "p4severerecent",
            SEVERE_SHIFT_NOISE,
        ),
    }

    test_profiles = {
        "stationary": b.generate(
            TEST_STATIONARY_SEED, TEST_PROFILES, "p4stattest"
        ),
        "moderate_shift": generate_with_noise(
            TEST_MODERATE_SEED,
            TEST_PROFILES,
            "p4modtest",
            MODERATE_SHIFT_NOISE,
        ),
        "severe_shift": generate_with_noise(
            TEST_SEVERE_SEED,
            TEST_PROFILES,
            "p4severetest",
            SEVERE_SHIFT_NOISE,
        ),
    }

    method_accuracy = {
        scenario: method_budget_accuracy(
            profiles, base_weights, base_half_life
        )
        for scenario, profiles in test_profiles.items()
    }

    rows = []
    for window in WINDOWS:
        distributions = {
            "stationary": detector_distribution(
                recent_profiles["stationary"], base_weights, window, 10000 + window * 100
            ),
            "moderate_shift": detector_distribution(
                recent_profiles["moderate_shift"], base_weights, window, 20000 + window * 100
            ),
            "severe_shift": detector_distribution(
                recent_profiles["severe_shift"], base_weights, window, 30000 + window * 100
            ),
        }

        false_alarm = distributions["stationary"]["detection_rate"]
        moderate_detection = distributions["moderate_shift"]["detection_rate"]
        severe_detection = distributions["severe_shift"]["detection_rate"]

        meets = (
            false_alarm <= CRITERIA["stationary_false_alarm_max"]
            and moderate_detection >= CRITERIA["moderate_detection_min"]
            and severe_detection >= CRITERIA["severe_detection_min"]
        )

        rows.append({
            "window_per_source": window,
            "stationary_false_alarm_rate": false_alarm,
            "moderate_detection_rate": moderate_detection,
            "severe_detection_rate": severe_detection,
            "meets_predeclared_criteria": meets,
            "distributions": distributions,
            "expected_policy_accuracy": {
                scenario: expected_policy_accuracy(
                    distributions[scenario]["detection_rate"],
                    method_accuracy[scenario],
                )
                for scenario in ("stationary", "moderate_shift", "severe_shift")
            },
        })

    passing = [r["window_per_source"] for r in rows if r["meets_predeclared_criteria"]]
    minimum_passing_window = min(passing) if passing else None

    payload = {
        "status": "synthetic_research_only",
        "limits": [
            "No human learner data",
            "No LLM or vector database",
            "No production Hallium behavior",
            "Correctness labels use simulator truth and are privileged",
            "Detection stability is measured across repeated synthetic resampling",
            "No device/RAM/battery/energy/end-to-end latency measurement",
        ],
        "detector_threshold": THRESHOLD,
        "action_table": ACTION_TABLE,
        "criteria": CRITERIA,
        "repeats_per_window_scenario": REPEATS,
        "base_calibration": base_calibration,
        "base_half_life": base_half_life,
        "method_accuracy": method_accuracy,
        "window_results": rows,
        "minimum_passing_window_per_source": minimum_passing_window,
    }

    (OUT / "results.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(payload, indent=2))
    return payload


if __name__ == "__main__":
    main()
