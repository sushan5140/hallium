#!/usr/bin/env python3
"""TwinMem Pilot 9: estimated-null mixture likelihood-ratio e-process.

RESEARCH ONLY. Synthetic profiles only. No production Hallium behavior.

Pilot 8 showed simple Bonferroni alpha spending was too conservative.
Pilot 9 uses a mixture likelihood-ratio process that, for a fixed known null,
is a nonnegative martingale/e-process and can be monitored repeatedly.

Important caveat: the null reliability probabilities here are estimated from a
separate synthetic baseline pool, so formal finite-sample anytime-validity is
not claimed.

Global e-value:
- 3 source types
- 2 drift directions per source (p0 +/- delta)
- equal-weight mixture of 6 likelihood ratios

Stop at the first stage where E >= 1/alpha.
"""
from __future__ import annotations

import json
import math
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
DELTAS = (0.10, 0.15, 0.20, 0.25)
ALPHAS = (0.05, 0.08, 0.10)

DEV_REPEATS = 240
TEST_REPEATS = 500
CALIBRATION_PROFILES = 320
TEST_PROFILES = 480

BASE_SEED = 20261801
DEV_STATIONARY_SEED = 20261811
DEV_MODERATE_SEED = 20261812
DEV_SEVERE_SEED = 20261813
TEST_STATIONARY_RECENT_SEED = 20261821
TEST_MODERATE_RECENT_SEED = 20261822
TEST_SEVERE_RECENT_SEED = 20261823
TEST_STATIONARY_SEED = 20261831
TEST_MODERATE_SEED = 20261832
TEST_SEVERE_SEED = 20261833

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
ACTION_TABLE = {
    "no_drift": {"52": "calibrated", "105": "calibrated", "210": "calibrated"},
    "drift": {"52": "topic_recent", "105": "calibrated", "210": "calibrated"},
}


def generate_with_noise(seed, total, prefix, noise):
    return p1.generate_with_noise(seed, total, prefix, noise)


def shuffled_streams(profiles, seed):
    rng = random.Random(seed)
    raw = p5.observations_by_source(profiles)
    streams = {}
    for source in SOURCES:
        vals = list(raw[source])
        rng.shuffle(vals)
        if len(vals) < max(STAGES):
            raise AssertionError(f"insufficient observations for {source}")
        streams[source] = vals
    return streams


def clip_probability(p):
    return min(0.98, max(0.02, p))


def bernoulli_log_lr(correct, total, p_alt, p0):
    p_alt = clip_probability(p_alt)
    p0 = clip_probability(p0)
    wrong = total - correct
    return (
        correct * math.log(p_alt / p0)
        + wrong * math.log((1.0 - p_alt) / (1.0 - p0))
    )


def logsumexp(values):
    m = max(values)
    return m + math.log(sum(math.exp(v - m) for v in values))


def global_log_evalue(base_p, streams, n, delta):
    log_lrs = []
    for source in SOURCES:
        correct = sum(streams[source][:n])
        p0 = base_p[source]
        for direction in (-1.0, 1.0):
            p_alt = clip_probability(p0 + direction * delta)
            log_lrs.append(bernoulli_log_lr(correct, n, p_alt, p0))
    return logsumexp(log_lrs) - math.log(len(log_lrs))


def sequential_decision(base_p, profiles, seed, delta, alpha):
    streams = shuffled_streams(profiles, seed)
    threshold = math.log(1.0 / alpha)
    trace = []

    for stage in STAGES:
        log_e = global_log_evalue(base_p, streams, stage, delta)
        hit = log_e >= threshold
        trace.append({
            "labels_per_source": stage,
            "log_evalue": log_e,
            "evalue": math.exp(min(log_e, 700)),
            "threshold": 1.0 / alpha,
            "drift_signal": hit,
        })
        if hit:
            return {
                "drift": True,
                "labels_per_source": stage,
                "stop_reason": "mixture_evalue_crossing",
                "trace": trace,
            }

    return {
        "drift": False,
        "labels_per_source": max(STAGES),
        "stop_reason": "no_crossing_by_max_stage",
        "trace": trace,
    }


def distribution(base_p, profiles, seed_base, delta, alpha, repeats):
    detections, labels = [], []
    stops, reasons = Counter(), Counter()

    for rep in range(repeats):
        r = sequential_decision(
            base_p, profiles, seed_base + rep, delta, alpha
        )
        detections.append(int(r["drift"]))
        labels.append(r["labels_per_source"])
        stops[r["labels_per_source"]] += 1
        reasons[r["stop_reason"]] += 1

    return {
        "repeats": repeats,
        "detection_rate": sum(detections) / repeats,
        "mean_labels_per_source": statistics.mean(labels),
        "median_labels_per_source": statistics.median(labels),
        "mean_total_labels_three_sources": statistics.mean(labels) * len(SOURCES),
        "stop_counts": {str(stage): stops[stage] for stage in STAGES},
        "stop_rates": {str(stage): stops[stage] / repeats for stage in STAGES},
        "stop_reasons": dict(sorted(reasons.items())),
    }


def candidate(base_p, pools, delta, alpha):
    d = {
        "stationary": distribution(
            base_p, pools["stationary"], 110000 + int(delta*1000) + int(alpha*10000), delta, alpha, DEV_REPEATS
        ),
        "moderate": distribution(
            base_p, pools["moderate"], 120000 + int(delta*1000) + int(alpha*10000), delta, alpha, DEV_REPEATS
        ),
        "severe": distribution(
            base_p, pools["severe"], 130000 + int(delta*1000) + int(alpha*10000), delta, alpha, DEV_REPEATS
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
        "delta": delta,
        "alpha": alpha,
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
        c["alpha"],
        c["delta"],
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

    base_profiles = b.generate(BASE_SEED, 240, "p9base")
    base_stats = p5.baseline_stats(base_profiles)
    base_p = {source: base_stats[source]["mean"] for source in SOURCES}
    calibration = p1.estimate_source_reliability(base_profiles)
    weights = p1.weights_only(calibration)
    half_life, _ = p1.tune_half_life(base_profiles, weights)

    dev_pools = {
        "stationary": b.generate(DEV_STATIONARY_SEED, CALIBRATION_PROFILES, "p9devstat"),
        "moderate": generate_with_noise(
            DEV_MODERATE_SEED, CALIBRATION_PROFILES, "p9devmod", MODERATE_SHIFT_NOISE
        ),
        "severe": generate_with_noise(
            DEV_SEVERE_SEED, CALIBRATION_PROFILES, "p9devsev", SEVERE_SHIFT_NOISE
        ),
    }

    candidates = [
        candidate(base_p, dev_pools, delta, alpha)
        for delta in DELTAS
        for alpha in ALPHAS
    ]
    selected = select_candidate(candidates)

    payload = {
        "status": "synthetic_research_only",
        "limits": [
            "No human learner data",
            "No LLM or vector database",
            "No production Hallium behavior",
            "Correctness labels use simulator truth and are privileged",
            "Null reliability probabilities are estimated, so formal e-process guarantees are not claimed",
            "Alternative drift sizes are fixed point alternatives mixed equally",
            "No device/RAM/battery/energy/end-to-end latency measurement",
        ],
        "stages": STAGES,
        "deltas": DELTAS,
        "alphas": ALPHAS,
        "mixture_components": len(SOURCES) * 2,
        "development_repeats": DEV_REPEATS,
        "test_repeats": TEST_REPEATS,
        "detection_criteria": DETECTION_CRITERIA,
        "efficiency_goals": EFFICIENCY_GOALS,
        "base_null_probabilities": base_p,
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

    payload["selected_candidate"] = selected

    recent = {
        "stationary": b.generate(
            TEST_STATIONARY_RECENT_SEED, CALIBRATION_PROFILES, "p9teststatrecent"
        ),
        "moderate": generate_with_noise(
            TEST_MODERATE_RECENT_SEED, CALIBRATION_PROFILES, "p9testmodrecent", MODERATE_SHIFT_NOISE
        ),
        "severe": generate_with_noise(
            TEST_SEVERE_RECENT_SEED, CALIBRATION_PROFILES, "p9testsevrecent", SEVERE_SHIFT_NOISE
        ),
    }

    delta = selected["delta"]
    alpha = selected["alpha"]
    heldout_dist = {
        "stationary": distribution(base_p, recent["stationary"], 210000, delta, alpha, TEST_REPEATS),
        "moderate": distribution(base_p, recent["moderate"], 220000, delta, alpha, TEST_REPEATS),
        "severe": distribution(base_p, recent["severe"], 230000, delta, alpha, TEST_REPEATS),
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
        "stationary": b.generate(TEST_STATIONARY_SEED, TEST_PROFILES, "p9stattest"),
        "moderate": generate_with_noise(TEST_MODERATE_SEED, TEST_PROFILES, "p9modtest", MODERATE_SHIFT_NOISE),
        "severe": generate_with_noise(TEST_SEVERE_SEED, TEST_PROFILES, "p9sevtest", SEVERE_SHIFT_NOISE),
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
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(payload, indent=2))
    return payload


if __name__ == "__main__":
    main()
