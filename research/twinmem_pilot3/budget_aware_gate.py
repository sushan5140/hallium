#!/usr/bin/env python3
"""TwinMem Pilot 3: budget-aware response to detected source-reliability drift.

RESEARCH ONLY. Synthetic profiles only. No production Hallium behavior.

Pilot 2 froze a drift detector that correctly separated stationary vs severe
source-reliability shift, but its one global action helped the 52-word budget
while hurting 105/210-word budgets. Pilot 3 keeps that detector fixed and learns
only a budget-specific action table on development scenarios.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
P0 = ROOT / "twinmem_pilot0"
P1 = ROOT / "twinmem_pilot1"
P2 = ROOT / "twinmem_pilot2"
sys.path[:0] = [str(P0), str(P1), str(P2)]

import benchmark as b  # noqa: E402
import calibrated_reliability as p1  # noqa: E402
import drift_gate as p2  # noqa: E402

OUT = Path(__file__).resolve().parent / "outputs"

DETECTOR_WINDOW = 24
DETECTOR_THRESHOLD = 0.20

BASE_DEV_SEED = 20261201
ACTION_DEV_STATIONARY_SEED = 20261202
ACTION_DEV_SHIFT_SEED = 20261203

TEST_STATIONARY_SEED = 20261211
TEST_SEVERE_SHIFT_SEED = 20261212
TEST_MODERATE_SHIFT_SEED = 20261213

RECENT_STATIONARY_SEED = 20261221
RECENT_SEVERE_SHIFT_SEED = 20261222
RECENT_MODERATE_SHIFT_SEED = 20261223

DEV_PROFILES = 180
TEST_PROFILES = 480
RECENT_PROFILES = 180

SEVERE_SHIFT_NOISE = {
    "verified_assessment": 0.36,
    "practice_result": 0.20,
    "self_report": 0.05,
}

# Not used in action-table training. This is an unseen intermediate regime.
MODERATE_SHIFT_NOISE = {
    "verified_assessment": 0.22,
    "practice_result": 0.17,
    "self_report": 0.12,
}


def generate_with_noise(seed, total, prefix, noise):
    return p1.generate_with_noise(seed, total, prefix, noise)


def rows_by_method(profiles, base_weights, half_life):
    return {
        "calibrated": p1.rows_for(profiles, "calibrated", base_weights, half_life),
        "topic_recent": p1.rows_for(profiles, "topic_recent"),
    }


def budget_accuracy(rows, budget):
    sample = [r for r in rows if r["word_budget"] == budget]
    return sum(r["correct"] for r in sample) / len(sample)


def learn_action_table(stationary_dev, shifted_dev, base_weights, half_life):
    stationary = rows_by_method(stationary_dev, base_weights, half_life)
    shifted = rows_by_method(shifted_dev, base_weights, half_life)

    table = {"no_drift": {}, "drift": {}}
    evidence = {"no_drift": {}, "drift": {}}

    for budget in b.BUDGETS:
        stat_scores = {
            method: budget_accuracy(rows, budget)
            for method, rows in stationary.items()
        }
        shift_scores = {
            method: budget_accuracy(rows, budget)
            for method, rows in shifted.items()
        }
        # Deterministic tie break favors calibrated because it preserves the
        # existing Pilot-1 path when evidence is equal.
        table["no_drift"][str(budget)] = max(
            stat_scores, key=lambda m: (stat_scores[m], m == "calibrated")
        )
        table["drift"][str(budget)] = max(
            shift_scores, key=lambda m: (shift_scores[m], m == "calibrated")
        )
        evidence["no_drift"][str(budget)] = stat_scores
        evidence["drift"][str(budget)] = shift_scores

    return table, evidence


def classify_regime(recent_profiles, base_weights, seed):
    recent = p2.recent_reliability_estimate(
        recent_profiles, DETECTOR_WINDOW, seed
    )
    score = p2.drift_score(base_weights, recent)
    return {
        "recent_estimate": recent,
        "drift_score": score,
        "detected": score >= DETECTOR_THRESHOLD,
        "regime_key": "drift" if score >= DETECTOR_THRESHOLD else "no_drift",
    }


def evaluate_scenario(
    name,
    profiles,
    recent_profiles,
    base_weights,
    half_life,
    action_table,
    seed,
):
    regime = classify_regime(recent_profiles, base_weights, seed)
    base_rows = rows_by_method(profiles, base_weights, half_life)

    budget_policy = {}
    policy_accuracy = {}
    oracle_accuracy = {}

    for budget in b.BUDGETS:
        chosen = action_table[regime["regime_key"]][str(budget)]
        budget_policy[str(budget)] = chosen
        policy_accuracy[str(budget)] = budget_accuracy(base_rows[chosen], budget)

        calibrated = [
            r for r in base_rows["calibrated"] if r["word_budget"] == budget
        ]
        recent = [
            r for r in base_rows["topic_recent"] if r["word_budget"] == budget
        ]
        by_key = {}
        for row in calibrated:
            by_key[(row["profile"], row["skill"])] = {
                "calibrated": row["correct"]
            }
        for row in recent:
            by_key[(row["profile"], row["skill"])]["topic_recent"] = row["correct"]
        oracle_accuracy[str(budget)] = sum(
            max(pair["calibrated"], pair["topic_recent"])
            for pair in by_key.values()
        ) / len(by_key)

    return {
        "scenario": name,
        "detector": regime,
        "budget_policy": budget_policy,
        "accuracy": {
            "frozen_calibrated": {
                str(budget): budget_accuracy(base_rows["calibrated"], budget)
                for budget in b.BUDGETS
            },
            "topic_recent": {
                str(budget): budget_accuracy(base_rows["topic_recent"], budget)
                for budget in b.BUDGETS
            },
            "budget_aware_gate": policy_accuracy,
            "oracle_best_of_two": oracle_accuracy,
        },
    }


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    base_dev = b.generate(BASE_DEV_SEED, DEV_PROFILES, "p3basedev")
    base_calibration = p1.estimate_source_reliability(base_dev)
    base_weights = p1.weights_only(base_calibration)
    half_life, _ = p1.tune_half_life(base_dev, base_weights)

    stationary_dev = b.generate(
        ACTION_DEV_STATIONARY_SEED, DEV_PROFILES, "p3actionstat"
    )
    severe_shift_dev = generate_with_noise(
        ACTION_DEV_SHIFT_SEED,
        DEV_PROFILES,
        "p3actionshift",
        SEVERE_SHIFT_NOISE,
    )
    action_table, action_evidence = learn_action_table(
        stationary_dev, severe_shift_dev, base_weights, half_life
    )

    scenarios = []

    stationary_test = b.generate(
        TEST_STATIONARY_SEED, TEST_PROFILES, "p3stattest"
    )
    stationary_recent = b.generate(
        RECENT_STATIONARY_SEED, RECENT_PROFILES, "p3statrecent"
    )
    scenarios.append(
        evaluate_scenario(
            "stationary",
            stationary_test,
            stationary_recent,
            base_weights,
            half_life,
            action_table,
            8101,
        )
    )

    severe_test = generate_with_noise(
        TEST_SEVERE_SHIFT_SEED,
        TEST_PROFILES,
        "p3severetest",
        SEVERE_SHIFT_NOISE,
    )
    severe_recent = generate_with_noise(
        RECENT_SEVERE_SHIFT_SEED,
        RECENT_PROFILES,
        "p3severerecent",
        SEVERE_SHIFT_NOISE,
    )
    scenarios.append(
        evaluate_scenario(
            "severe_shift",
            severe_test,
            severe_recent,
            base_weights,
            half_life,
            action_table,
            8102,
        )
    )

    moderate_test = generate_with_noise(
        TEST_MODERATE_SHIFT_SEED,
        TEST_PROFILES,
        "p3modtest",
        MODERATE_SHIFT_NOISE,
    )
    moderate_recent = generate_with_noise(
        RECENT_MODERATE_SHIFT_SEED,
        RECENT_PROFILES,
        "p3modrecent",
        MODERATE_SHIFT_NOISE,
    )
    scenarios.append(
        evaluate_scenario(
            "moderate_shift_unseen",
            moderate_test,
            moderate_recent,
            base_weights,
            half_life,
            action_table,
            8103,
        )
    )

    payload = {
        "status": "synthetic_research_only",
        "limits": [
            "No human learner data",
            "No LLM or vector database",
            "No production Hallium behavior",
            "Detector labels use simulator truth and are privileged",
            "Moderate shift was not used to train the action table",
            "No device/RAM/battery/energy/end-to-end latency measurement",
        ],
        "detector": {
            "window_per_source": DETECTOR_WINDOW,
            "threshold": DETECTOR_THRESHOLD,
        },
        "base_calibration": base_calibration,
        "base_half_life": half_life,
        "action_table": action_table,
        "action_development_scores": action_evidence,
        "severe_shift_noise": SEVERE_SHIFT_NOISE,
        "moderate_shift_noise_unseen": MODERATE_SHIFT_NOISE,
        "scenarios": scenarios,
    }

    (OUT / "results.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(payload, indent=2))
    return payload


if __name__ == "__main__":
    main()
