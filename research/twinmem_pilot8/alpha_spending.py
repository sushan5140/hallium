#!/usr/bin/env python3
"""TwinMem Pilot 8: alpha-spent early stopping with frozen final decision.

RESEARCH ONLY. Synthetic profiles only. No production Hallium behavior.

Pilot 7 met detection + efficiency goals but used heuristic repeated looks.
Pilot 8 explicitly controls the *early-stop* familywise alpha budget across:
- 3 early stages (8, 12, 24 labels/source)
- 3 source types

At stage 48, the frozen Pilot-5 detector remains authoritative:
margin=0.05, z=1.96.

This is an approximate multiplicity-control experiment, not a proof of formal
anytime validity because the Beta-normal score is approximate and the final
fixed rule is treated separately.
"""
from __future__ import annotations

import json
import math
import random
import statistics
import sys
from collections import Counter
from pathlib import Path
from statistics import NormalDist

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

EARLY_STAGES = (8, 12, 24)
FINAL_STAGE = 48
MARGIN = 0.05
FINAL_Z = 1.96
SOURCES = tuple(p5.SOURCES)

ALPHA_BUDGETS = (0.03, 0.05, 0.07)
SPENDING_SHAPES = {
    "front": (0.50, 0.30, 0.20),
    "equal": (1 / 3, 1 / 3, 1 / 3),
    "late": (0.20, 0.30, 0.50),
}

DEV_REPEATS = 220
TEST_REPEATS = 500
CALIBRATION_PROFILES = 300
TEST_PROFILES = 480

BASE_SEED = 20261701
DEV_STATIONARY_SEED = 20261711
DEV_MODERATE_SEED = 20261712
DEV_SEVERE_SEED = 20261713
TEST_STATIONARY_RECENT_SEED = 20261721
TEST_MODERATE_RECENT_SEED = 20261722
TEST_SEVERE_RECENT_SEED = 20261723
TEST_STATIONARY_SEED = 20261731
TEST_MODERATE_SEED = 20261732
TEST_SEVERE_SEED = 20261733

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


def shuffled_streams(profiles, seed):
    rng = random.Random(seed)
    raw = p5.observations_by_source(profiles)
    out = {}
    for source in SOURCES:
        vals = list(raw[source])
        rng.shuffle(vals)
        if len(vals) < FINAL_STAGE:
            raise AssertionError(f"insufficient observations for {source}")
        out[source] = vals
    return out


def recent_stats(streams, n):
    return {
        source: p5.beta_stats(sum(streams[source][:n]), n)
        for source in SOURCES
    }


def stage_z(stage_alpha):
    # Two-sided Bonferroni correction across three source types.
    per_source_alpha = stage_alpha / len(SOURCES)
    return NormalDist().inv_cdf(1.0 - per_source_alpha / 2.0)


def max_lower_bound(base, recent, zcrit):
    per_source = {}
    for source in SOURCES:
        diff = abs(recent[source]["mean"] - base[source]["mean"])
        se = math.sqrt(base[source]["variance"] + recent[source]["variance"])
        lower = diff - zcrit * se
        per_source[source] = lower
    strongest = max(per_source, key=per_source.get)
    return strongest, per_source[strongest]


def schedule(alpha_budget, shape_name):
    weights = SPENDING_SHAPES[shape_name]
    stage_alpha = {
        stage: alpha_budget * weight
        for stage, weight in zip(EARLY_STAGES, weights)
    }
    return {
        "alpha_budget": alpha_budget,
        "shape": shape_name,
        "stage_alpha": stage_alpha,
        "stage_z": {stage: stage_z(a) for stage, a in stage_alpha.items()},
    }


def sequential_decision(base, profiles, seed, sched):
    streams = shuffled_streams(profiles, seed)
    trace = []

    for stage in EARLY_STAGES:
        recent = recent_stats(streams, stage)
        source, lower = max_lower_bound(base, recent, sched["stage_z"][stage])
        hit = lower >= MARGIN
        trace.append({
            "labels_per_source": stage,
            "early_signal": hit,
            "max_lower_bound_change": lower,
            "strongest_source": source,
            "stage_alpha": sched["stage_alpha"][stage],
            "zcrit": sched["stage_z"][stage],
        })
        if hit:
            return {
                "drift": True,
                "labels_per_source": stage,
                "stop_reason": "alpha_spent_early_signal",
                "trace": trace,
            }

    recent = recent_stats(streams, FINAL_STAGE)
    final_signal = p5.uncertainty_signal(base, recent, MARGIN, FINAL_Z)
    trace.append({
        "labels_per_source": FINAL_STAGE,
        "early_signal": False,
        "max_lower_bound_change": final_signal["max_lower_bound_change"],
        "strongest_source": final_signal["strongest_source"],
        "stage_alpha": None,
        "zcrit": FINAL_Z,
    })
    return {
        "drift": bool(final_signal["drift"]),
        "labels_per_source": FINAL_STAGE,
        "stop_reason": "final_frozen_pilot5_decision",
        "trace": trace,
    }


def distribution(base, profiles, seed_base, sched, repeats):
    det, labels = [], []
    stops, reasons = Counter(), Counter()
    for rep in range(repeats):
        r = sequential_decision(base, profiles, seed_base + rep, sched)
        det.append(int(r["drift"]))
        labels.append(r["labels_per_source"])
        stops[r["labels_per_source"]] += 1
        reasons[r["stop_reason"]] += 1

    return {
        "repeats": repeats,
        "detection_rate": sum(det) / repeats,
        "mean_labels_per_source": statistics.mean(labels),
        "median_labels_per_source": statistics.median(labels),
        "mean_total_labels_three_sources": statistics.mean(labels) * len(SOURCES),
        "stop_counts": {
            str(stage): stops[stage] for stage in (*EARLY_STAGES, FINAL_STAGE)
        },
        "stop_rates": {
            str(stage): stops[stage] / repeats
            for stage in (*EARLY_STAGES, FINAL_STAGE)
        },
        "stop_reasons": dict(sorted(reasons.items())),
    }


def candidate(base, pools, alpha_budget, shape_name):
    sched = schedule(alpha_budget, shape_name)
    d = {
        "stationary": distribution(base, pools["stationary"], 110000 + int(alpha_budget*10000), sched, DEV_REPEATS),
        "moderate": distribution(base, pools["moderate"], 120000 + int(alpha_budget*10000), sched, DEV_REPEATS),
        "severe": distribution(base, pools["severe"], 130000 + int(alpha_budget*10000), sched, DEV_REPEATS),
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
        "alpha_budget": alpha_budget,
        "shape": shape_name,
        "schedule": sched,
        "development": d,
        "detection_pass": detection_pass,
        "efficiency_pass": efficiency_pass,
        "all_goals_pass": detection_pass and efficiency_pass,
    }


def select_candidate(candidates):
    passing = [c for c in candidates if c["all_goals_pass"]]
    if not passing:
        return None
    passing.sort(key=lambda c: (
        (
            c["development"]["moderate"]["mean_labels_per_source"]
            + c["development"]["severe"]["mean_labels_per_source"]
        ) / 2.0,
        c["development"]["stationary"]["detection_rate"],
        c["alpha_budget"],
        c["shape"],
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
            result[method][str(budget)] = sum(r["correct"] for r in sample) / len(sample)
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

    base_profiles = b.generate(BASE_SEED, 220, "p8base")
    base = p5.baseline_stats(base_profiles)
    calibration = p1.estimate_source_reliability(base_profiles)
    weights = p1.weights_only(calibration)
    half_life, _ = p1.tune_half_life(base_profiles, weights)

    dev_pools = {
        "stationary": b.generate(DEV_STATIONARY_SEED, CALIBRATION_PROFILES, "p8devstat"),
        "moderate": generate_with_noise(
            DEV_MODERATE_SEED, CALIBRATION_PROFILES, "p8devmod", MODERATE_SHIFT_NOISE
        ),
        "severe": generate_with_noise(
            DEV_SEVERE_SEED, CALIBRATION_PROFILES, "p8devsev", SEVERE_SHIFT_NOISE
        ),
    }

    candidates = [
        candidate(base, dev_pools, a, shape)
        for a in ALPHA_BUDGETS
        for shape in SPENDING_SHAPES
    ]
    selected = select_candidate(candidates)

    payload = {
        "status": "synthetic_research_only",
        "limits": [
            "No human learner data",
            "No LLM or vector database",
            "No production Hallium behavior",
            "Correctness labels use simulator truth and are privileged",
            "Early-look alpha spending is approximate because the score uses a Beta-normal approximation",
            "The final frozen Pilot-5 rule is separate from the early alpha budget",
            "No device/RAM/battery/energy/end-to-end latency measurement",
        ],
        "frozen": {
            "early_stages": EARLY_STAGES,
            "final_stage": FINAL_STAGE,
            "meaningful_margin": MARGIN,
            "final_z": FINAL_Z,
            "source_bonferroni": len(SOURCES),
        },
        "alpha_budgets": ALPHA_BUDGETS,
        "spending_shapes": SPENDING_SHAPES,
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
            json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
        print(json.dumps(payload, indent=2))
        return payload

    payload["selected_candidate"] = selected

    recent = {
        "stationary": b.generate(
            TEST_STATIONARY_RECENT_SEED, CALIBRATION_PROFILES, "p8teststatrecent"
        ),
        "moderate": generate_with_noise(
            TEST_MODERATE_RECENT_SEED, CALIBRATION_PROFILES, "p8testmodrecent", MODERATE_SHIFT_NOISE
        ),
        "severe": generate_with_noise(
            TEST_SEVERE_RECENT_SEED, CALIBRATION_PROFILES, "p8testsevrecent", SEVERE_SHIFT_NOISE
        ),
    }

    sched = selected["schedule"]
    heldout_dist = {
        "stationary": distribution(base, recent["stationary"], 210000, sched, TEST_REPEATS),
        "moderate": distribution(base, recent["moderate"], 220000, sched, TEST_REPEATS),
        "severe": distribution(base, recent["severe"], 230000, sched, TEST_REPEATS),
    }

    detection_pass = (
        heldout_dist["stationary"]["detection_rate"] <= DETECTION_CRITERIA["stationary_false_alarm_max"]
        and heldout_dist["moderate"]["detection_rate"] >= DETECTION_CRITERIA["moderate_detection_min"]
        and heldout_dist["severe"]["detection_rate"] >= DETECTION_CRITERIA["severe_detection_min"]
    )
    efficiency_pass = (
        heldout_dist["moderate"]["mean_labels_per_source"] <= EFFICIENCY_GOALS["moderate_mean_labels_per_source_max"]
        and heldout_dist["severe"]["mean_labels_per_source"] <= EFFICIENCY_GOALS["severe_mean_labels_per_source_max"]
    )

    test_profiles = {
        "stationary": b.generate(TEST_STATIONARY_SEED, TEST_PROFILES, "p8stattest"),
        "moderate": generate_with_noise(TEST_MODERATE_SEED, TEST_PROFILES, "p8modtest", MODERATE_SHIFT_NOISE),
        "severe": generate_with_noise(TEST_SEVERE_SEED, TEST_PROFILES, "p8sevtest", SEVERE_SHIFT_NOISE),
    }
    method_accuracy = {
        s: method_budget_accuracy(p, weights, half_life)
        for s, p in test_profiles.items()
    }
    expected = {
        s: expected_policy_accuracy(heldout_dist[s]["detection_rate"], method_accuracy[s])
        for s in ("stationary", "moderate", "severe")
    }

    payload["heldout"] = {
        "distributions": heldout_dist,
        "detection_pass": detection_pass,
        "efficiency_pass": efficiency_pass,
        "all_goals_pass": detection_pass and efficiency_pass,
        "method_accuracy": method_accuracy,
        "expected_policy_accuracy": expected,
    }

    (OUT / "results.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(json.dumps(payload, indent=2))
    return payload


if __name__ == "__main__":
    main()
