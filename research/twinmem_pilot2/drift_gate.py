#!/usr/bin/env python3
"""TwinMem Pilot 2: drift-aware gate between calibrated and freshness-first retrieval.

RESEARCH ONLY. Synthetic profiles only. No production Hallium behavior.

Pilot 1 showed that a calibrated source-reliability prior can become badly stale
under source-quality shift. Pilot 2 tests whether a small recent labeled
calibration window can detect that mismatch and gate between:
  - calibrated quality-aware retrieval
  - freshness-first newest-relevant retrieval

The detector threshold is tuned on development scenarios only, then frozen for
separate stationary and shifted holdouts. Simulator truth is privileged labels;
this is not assumed available in production.
"""
from __future__ import annotations

import json
import math
import random
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
P0 = ROOT / "twinmem_pilot0"
P1 = ROOT / "twinmem_pilot1"
sys.path.insert(0, str(P0))
sys.path.insert(0, str(P1))
import benchmark as b  # noqa: E402
import calibrated_reliability as p1  # noqa: E402

OUT = Path(__file__).resolve().parent / "outputs"
BASE_DEV_SEED = 20261101
BASE_TEST_SEED = 20261102
SHIFT_DEV_SEED = 20261103
SHIFT_TEST_SEED = 20261104
DEV_PROFILES = 180
TEST_PROFILES = 480
RECENT_WINDOW_SIZES = (12, 24, 48, 96)
THRESHOLDS = (0.05, 0.10, 0.15, 0.20, 0.25)
SHIFT_NOISE = {
    "verified_assessment": 0.36,
    "practice_result": 0.20,
    "self_report": 0.05,
}
SOURCES = tuple(sorted(b.SOURCE_WEIGHTS))


def source_accuracy_observations(profiles):
    obs = defaultdict(list)
    for profile in profiles:
        for note in profile.notes:
            truth = profile.previous[note.skill] if note.day < b.CHANGE_DAY else profile.current[note.skill]
            obs[note.source].append(int(note.state == truth))
    return obs


def recent_reliability_estimate(profiles, per_source_n, seed):
    rng = random.Random(seed)
    observations = source_accuracy_observations(profiles)
    result = {}
    for source in SOURCES:
        values = observations[source][:]
        rng.shuffle(values)
        sample = values[:per_source_n]
        if len(sample) < per_source_n:
            raise AssertionError(f"insufficient labeled observations for {source}")
        # Same Beta(2,2) smoothing family as Pilot 1.
        posterior = (sum(sample) + p1.BETA_PRIOR_CORRECT) / (
            len(sample) + p1.BETA_PRIOR_CORRECT + p1.BETA_PRIOR_WRONG
        )
        result[source] = {
            "n": len(sample),
            "posterior_accuracy": posterior,
            "weight": max(0.05, min(1.0, 2.0 * posterior - 1.0)),
        }
    return result


def drift_score(base_weights, recent_estimate):
    # Max absolute change in source reliability weight.
    return max(
        abs(base_weights[source] - recent_estimate[source]["weight"])
        for source in SOURCES
    )


def gate_choice(base_weights, recent_estimate, threshold):
    return "topic_recent" if drift_score(base_weights, recent_estimate) >= threshold else "calibrated"


def method_rows(profiles, method, weights, half_life):
    if method == "calibrated":
        return p1.rows_for(profiles, "calibrated", weights, half_life)
    return p1.rows_for(profiles, method)


def gated_rows(profiles, choice, base_weights, half_life):
    rows = method_rows(profiles, choice, base_weights, half_life)
    for row in rows:
        row["method"] = "drift_gate"
    return rows


def accuracy(rows):
    return sum(row["correct"] for row in rows) / len(rows)


def budget_accuracy(rows):
    return {
        budget: sum(r["correct"] for r in rows if r["word_budget"] == budget)
        / len([r for r in rows if r["word_budget"] == budget])
        for budget in b.BUDGETS
    }


def tune_gate(stationary_dev, shifted_dev, base_weights, half_life):
    candidates = []
    for window in RECENT_WINDOW_SIZES:
        stationary_recent = recent_reliability_estimate(stationary_dev, window, 101 + window)
        shifted_recent = recent_reliability_estimate(shifted_dev, window, 202 + window)
        for threshold in THRESHOLDS:
            stationary_choice = gate_choice(base_weights, stationary_recent, threshold)
            shifted_choice = gate_choice(base_weights, shifted_recent, threshold)

            stationary_rows = gated_rows(stationary_dev, stationary_choice, base_weights, half_life)
            shifted_rows = gated_rows(shifted_dev, shifted_choice, base_weights, half_life)

            stationary_score = accuracy(stationary_rows)
            shifted_score = accuracy(shifted_rows)
            # Equal weight to no-shift utility and shift utility.
            objective = (stationary_score + shifted_score) / 2
            candidates.append({
                "window_per_source": window,
                "threshold": threshold,
                "stationary_choice": stationary_choice,
                "shifted_choice": shifted_choice,
                "stationary_drift_score": drift_score(base_weights, stationary_recent),
                "shifted_drift_score": drift_score(base_weights, shifted_recent),
                "stationary_accuracy": stationary_score,
                "shifted_accuracy": shifted_score,
                "objective": objective,
            })
    candidates.sort(
        key=lambda x: (
            -x["objective"],
            x["window_per_source"],
            x["threshold"],
        )
    )
    return candidates[0], candidates


def scenario_result(name, profiles, recent_profiles, base_weights, half_life, gate_cfg, seed):
    recent = recent_reliability_estimate(
        recent_profiles, gate_cfg["window_per_source"], seed
    )
    choice = gate_choice(base_weights, recent, gate_cfg["threshold"])

    frozen = method_rows(profiles, "calibrated", base_weights, half_life)
    freshness = method_rows(profiles, "topic_recent", base_weights, half_life)
    gated = gated_rows(profiles, choice, base_weights, half_life)

    # Oracle is descriptive upper bound only; it may choose the better method per query.
    by_key = {}
    for row in frozen:
        by_key[(row["profile"], row["skill"], row["word_budget"])] = {
            "calibrated": row
        }
    for row in freshness:
        by_key[(row["profile"], row["skill"], row["word_budget"])]["topic_recent"] = row

    oracle = []
    for pair in by_key.values():
        best = pair["calibrated"] if pair["calibrated"]["correct"] >= pair["topic_recent"]["correct"] else pair["topic_recent"]
        copy = dict(best)
        copy["method"] = "oracle_best_of_two"
        oracle.append(copy)

    return {
        "scenario": name,
        "recent_estimate": recent,
        "drift_score": drift_score(base_weights, recent),
        "gate_choice": choice,
        "gate_threshold": gate_cfg["threshold"],
        "window_per_source": gate_cfg["window_per_source"],
        "accuracy": {
            "frozen_calibrated": budget_accuracy(frozen),
            "topic_recent": budget_accuracy(freshness),
            "drift_gate": budget_accuracy(gated),
            "oracle_best_of_two": budget_accuracy(oracle),
        },
    }


def generate_with_noise(seed, total, prefix, noise):
    return p1.generate_with_noise(seed, total, prefix, noise)


def mixed_shift_profiles(seed, total, prefix):
    # Half profiles use stationary source noise, half use shifted source noise.
    a = b.generate(seed, total // 2, prefix + "a")
    z = generate_with_noise(seed + 1, total - total // 2, prefix + "b", SHIFT_NOISE)
    return a + z


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    base_dev = b.generate(BASE_DEV_SEED, DEV_PROFILES, "p2basedev")
    base_calibration = p1.estimate_source_reliability(base_dev)
    base_weights = p1.weights_only(base_calibration)
    base_half_life, _ = p1.tune_half_life(base_dev, base_weights)

    stationary_dev = b.generate(BASE_DEV_SEED + 10, DEV_PROFILES, "p2statdev")
    shifted_dev = generate_with_noise(SHIFT_DEV_SEED, DEV_PROFILES, "p2shiftdev", SHIFT_NOISE)

    gate_cfg, tuning = tune_gate(
        stationary_dev, shifted_dev, base_weights, base_half_life
    )

    stationary_test = b.generate(BASE_TEST_SEED, TEST_PROFILES, "p2stattest")
    shifted_test = generate_with_noise(SHIFT_TEST_SEED, TEST_PROFILES, "p2shifttest", SHIFT_NOISE)

    # Recent calibration evidence uses separate profiles from evaluation profiles.
    stationary_recent = b.generate(BASE_TEST_SEED + 20, DEV_PROFILES, "p2statrecent")
    shifted_recent = generate_with_noise(
        SHIFT_TEST_SEED + 20, DEV_PROFILES, "p2shiftrecent", SHIFT_NOISE
    )

    stationary_result = scenario_result(
        "stationary",
        stationary_test,
        stationary_recent,
        base_weights,
        base_half_life,
        gate_cfg,
        7001,
    )
    shifted_result = scenario_result(
        "source_reliability_shift",
        shifted_test,
        shifted_recent,
        base_weights,
        base_half_life,
        gate_cfg,
        7002,
    )

    payload = {
        "status": "synthetic_research_only",
        "limits": [
            "No human learner data",
            "No LLM or vector database",
            "No production Hallium behavior",
            "Recent correctness labels use simulator truth and are privileged",
            "No device, RAM, battery, energy, or end-to-end latency measurement",
        ],
        "base_calibration": base_calibration,
        "base_half_life": base_half_life,
        "gate_config": gate_cfg,
        "tuning_candidates": tuning,
        "scenarios": [stationary_result, shifted_result],
    }

    (OUT / "results.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(payload, indent=2))
    return payload


if __name__ == "__main__":
    main()
