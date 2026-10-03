#!/usr/bin/env python3
"""TwinMem Pilot 5: uncertainty-aware source-reliability drift detector.

RESEARCH ONLY. Synthetic profiles only. No production Hallium behavior.

Pilot 4 showed that a fixed point-estimate deviation threshold produces too many
false drift alarms under finite labeled samples. Pilot 5 replaces it with a
conservative lower-bound test:

    |recent_mean - baseline_mean| - z * SE(diff) >= meaningful_margin

where baseline and recent source correctness use Beta(2,2) posteriors.

Detector hyperparameters are selected ONLY on development resamples. Final
stationary/moderate/severe calibration pools and evaluation profiles use
different seeds.
"""
from __future__ import annotations

import json
import math
import random
import statistics
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
P0 = ROOT / "twinmem_pilot0"
P1 = ROOT / "twinmem_pilot1"
P3 = ROOT / "twinmem_pilot3"
sys.path[:0] = [str(P0), str(P1), str(P3)]

import benchmark as b  # noqa: E402
import calibrated_reliability as p1  # noqa: E402
import budget_aware_gate as p3  # noqa: E402

OUT = Path(__file__).resolve().parent / "outputs"

WINDOWS = (8, 12, 24, 48)
MARGINS = (0.05, 0.10, 0.15)
Z_CRITS = (1.64, 1.96, 2.58)

DEV_REPEATS = 160
TEST_REPEATS = 400
CALIBRATION_PROFILES = 260
TEST_PROFILES = 480

BASE_DEV_SEED = 20261401
DEV_STATIONARY_SEED = 20261411
DEV_MODERATE_SEED = 20261412
DEV_SEVERE_SEED = 20261413
TEST_STATIONARY_RECENT_SEED = 20261421
TEST_MODERATE_RECENT_SEED = 20261422
TEST_SEVERE_RECENT_SEED = 20261423
TEST_STATIONARY_SEED = 20261431
TEST_MODERATE_SEED = 20261432
TEST_SEVERE_SEED = 20261433

MODERATE_SHIFT_NOISE = p3.MODERATE_SHIFT_NOISE
SEVERE_SHIFT_NOISE = p3.SEVERE_SHIFT_NOISE

PRIOR_A = 2.0
PRIOR_B = 2.0
SOURCES = tuple(sorted(b.SOURCE_WEIGHTS))

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


def truth_at(profile, note):
    return profile.previous[note.skill] if note.day < b.CHANGE_DAY else profile.current[note.skill]


def observations_by_source(profiles):
    out = defaultdict(list)
    for profile in profiles:
        for note in profile.notes:
            out[note.source].append(int(note.state == truth_at(profile, note)))
    return out


def beta_stats(correct, total):
    a = correct + PRIOR_A
    bb = total - correct + PRIOR_B
    s = a + bb
    mean = a / s
    var = (a * bb) / (s * s * (s + 1.0))
    return {"mean": mean, "variance": var, "correct": correct, "total": total}


def baseline_stats(profiles):
    obs = observations_by_source(profiles)
    return {
        source: beta_stats(sum(obs[source]), len(obs[source]))
        for source in SOURCES
    }


def sample_recent_stats(profiles, per_source_n, seed):
    rng = random.Random(seed)
    obs = observations_by_source(profiles)
    result = {}
    for source in SOURCES:
        values = obs[source]
        if len(values) < per_source_n:
            raise AssertionError(f"insufficient observations for {source}")
        sample = rng.sample(values, per_source_n)
        result[source] = beta_stats(sum(sample), len(sample))
    return result


def uncertainty_signal(base, recent, margin, zcrit):
    per_source = {}
    for source in SOURCES:
        diff = abs(recent[source]["mean"] - base[source]["mean"])
        se = math.sqrt(base[source]["variance"] + recent[source]["variance"])
        lower_bound_change = diff - zcrit * se
        per_source[source] = {
            "absolute_mean_change": diff,
            "standard_error": se,
            "lower_bound_change": lower_bound_change,
        }
    strongest = max(per_source, key=lambda source: per_source[source]["lower_bound_change"])
    score = per_source[strongest]["lower_bound_change"]
    return {
        "drift": score >= margin,
        "strongest_source": strongest,
        "max_lower_bound_change": score,
        "per_source": per_source,
    }


def repeated_detection_rate(profiles, base, window, margin, zcrit, repeats, seed_base):
    decisions = []
    scores = []
    sources = defaultdict(int)
    for rep in range(repeats):
        recent = sample_recent_stats(profiles, window, seed_base + rep)
        signal = uncertainty_signal(base, recent, margin, zcrit)
        decisions.append(int(signal["drift"]))
        scores.append(signal["max_lower_bound_change"])
        sources[signal["strongest_source"]] += 1
    return {
        "rate": sum(decisions) / len(decisions),
        "mean_score": statistics.mean(scores),
        "median_score": statistics.median(scores),
        "strongest_source_counts": dict(sorted(sources.items())),
    }


def dev_candidate(base, pools, window, margin, zcrit):
    stat = repeated_detection_rate(
        pools["stationary"], base, window, margin, zcrit, DEV_REPEATS, 110000 + window * 100
    )
    moderate = repeated_detection_rate(
        pools["moderate"], base, window, margin, zcrit, DEV_REPEATS, 120000 + window * 100
    )
    severe = repeated_detection_rate(
        pools["severe"], base, window, margin, zcrit, DEV_REPEATS, 130000 + window * 100
    )
    meets = (
        stat["rate"] <= CRITERIA["stationary_false_alarm_max"]
        and moderate["rate"] >= CRITERIA["moderate_detection_min"]
        and severe["rate"] >= CRITERIA["severe_detection_min"]
    )
    return {
        "window_per_source": window,
        "meaningful_margin": margin,
        "zcrit": zcrit,
        "stationary_false_alarm_rate": stat["rate"],
        "moderate_detection_rate": moderate["rate"],
        "severe_detection_rate": severe["rate"],
        "meets_development_criteria": meets,
    }


def select_config(candidates):
    passing = [c for c in candidates if c["meets_development_criteria"]]
    if passing:
        # PREDECLARED: smallest label window first, then lowest stationary
        # false alarm, then stronger moderate/severe sensitivity, then more
        # conservative z and larger meaningful margin.
        passing.sort(key=lambda c: (
            c["window_per_source"],
            c["stationary_false_alarm_rate"],
            -c["moderate_detection_rate"],
            -c["severe_detection_rate"],
            -c["zcrit"],
            -c["meaningful_margin"],
        ))
        return passing[0], True

    # Fail-safe reporting path if development has no passing configuration.
    ranked = sorted(candidates, key=lambda c: (
        max(0.0, c["stationary_false_alarm_rate"] - CRITERIA["stationary_false_alarm_max"])
        + max(0.0, CRITERIA["moderate_detection_min"] - c["moderate_detection_rate"])
        + max(0.0, CRITERIA["severe_detection_min"] - c["severe_detection_rate"]),
        c["window_per_source"],
    ))
    return ranked[0], False


def method_budget_accuracy(profiles, weights, half_life):
    methods = {
        "calibrated": p1.rows_for(profiles, "calibrated", weights, half_life),
        "topic_recent": p1.rows_for(profiles, "topic_recent"),
    }
    out = {}
    for method, rows in methods.items():
        out[method] = {}
        for budget in b.BUDGETS:
            sample = [r for r in rows if r["word_budget"] == budget]
            out[method][str(budget)] = sum(r["correct"] for r in sample) / len(sample)
    return out


def expected_policy_accuracy(detection_rate, accuracy):
    result = {}
    for budget in b.BUDGETS:
        k = str(budget)
        no_method = ACTION_TABLE["no_drift"][k]
        drift_method = ACTION_TABLE["drift"][k]
        result[k] = (
            (1 - detection_rate) * accuracy[no_method][k]
            + detection_rate * accuracy[drift_method][k]
        )
    return result


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    base_profiles = b.generate(BASE_DEV_SEED, 220, "p5base")
    base = baseline_stats(base_profiles)
    calibration = p1.estimate_source_reliability(base_profiles)
    weights = p1.weights_only(calibration)
    half_life, _ = p1.tune_half_life(base_profiles, weights)

    dev_pools = {
        "stationary": b.generate(DEV_STATIONARY_SEED, CALIBRATION_PROFILES, "p5devstat"),
        "moderate": generate_with_noise(
            DEV_MODERATE_SEED, CALIBRATION_PROFILES, "p5devmod", MODERATE_SHIFT_NOISE
        ),
        "severe": generate_with_noise(
            DEV_SEVERE_SEED, CALIBRATION_PROFILES, "p5devsev", SEVERE_SHIFT_NOISE
        ),
    }

    candidates = [
        dev_candidate(base, dev_pools, window, margin, zcrit)
        for window in WINDOWS
        for margin in MARGINS
        for zcrit in Z_CRITS
    ]
    selected, dev_pass = select_config(candidates)

    test_recent = {
        "stationary": b.generate(
            TEST_STATIONARY_RECENT_SEED, CALIBRATION_PROFILES, "p5teststatrecent"
        ),
        "moderate": generate_with_noise(
            TEST_MODERATE_RECENT_SEED,
            CALIBRATION_PROFILES,
            "p5testmodrecent",
            MODERATE_SHIFT_NOISE,
        ),
        "severe": generate_with_noise(
            TEST_SEVERE_RECENT_SEED,
            CALIBRATION_PROFILES,
            "p5testsevrecent",
            SEVERE_SHIFT_NOISE,
        ),
    }
    test_profiles = {
        "stationary": b.generate(TEST_STATIONARY_SEED, TEST_PROFILES, "p5stattest"),
        "moderate": generate_with_noise(
            TEST_MODERATE_SEED, TEST_PROFILES, "p5modtest", MODERATE_SHIFT_NOISE
        ),
        "severe": generate_with_noise(
            TEST_SEVERE_SEED, TEST_PROFILES, "p5sevtest", SEVERE_SHIFT_NOISE
        ),
    }

    final_rates = {}
    for i, scenario in enumerate(("stationary", "moderate", "severe")):
        final_rates[scenario] = repeated_detection_rate(
            test_recent[scenario],
            base,
            selected["window_per_source"],
            selected["meaningful_margin"],
            selected["zcrit"],
            TEST_REPEATS,
            210000 + i * 10000,
        )

    final_meets = (
        final_rates["stationary"]["rate"] <= CRITERIA["stationary_false_alarm_max"]
        and final_rates["moderate"]["rate"] >= CRITERIA["moderate_detection_min"]
        and final_rates["severe"]["rate"] >= CRITERIA["severe_detection_min"]
    )

    method_accuracy = {
        scenario: method_budget_accuracy(profiles, weights, half_life)
        for scenario, profiles in test_profiles.items()
    }
    expected = {
        scenario: expected_policy_accuracy(final_rates[scenario]["rate"], method_accuracy[scenario])
        for scenario in ("stationary", "moderate", "severe")
    }

    payload = {
        "status": "synthetic_research_only",
        "limits": [
            "No human learner data",
            "No LLM or vector database",
            "No production Hallium behavior",
            "Correctness labels use simulator truth and are privileged",
            "Beta-normal lower bounds are an approximation",
            "No device/RAM/battery/energy/end-to-end latency measurement",
        ],
        "criteria": CRITERIA,
        "development_repeats": DEV_REPEATS,
        "test_repeats": TEST_REPEATS,
        "candidate_grid": {
            "windows": WINDOWS,
            "meaningful_margins": MARGINS,
            "zcrit": Z_CRITS,
        },
        "selected_config": selected,
        "selected_config_met_development_criteria": dev_pass,
        "development_candidates": candidates,
        "final_detection": final_rates,
        "final_meets_predeclared_criteria": final_meets,
        "base_half_life": half_life,
        "method_accuracy": method_accuracy,
        "expected_policy_accuracy": expected,
    }

    (OUT / "results.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(payload, indent=2))
    return payload


if __name__ == "__main__":
    main()
