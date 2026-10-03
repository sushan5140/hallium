#!/usr/bin/env python3
"""TwinMem Pilot 11: conservative null-interval evidence.

RESEARCH ONLY. Synthetic profiles only. No production Hallium behavior.

Pilot 10 showed that Pilot 9's point plug-in null p0 is fragile when p0 is
estimated from finite baseline data.

Pilot 11 freezes:
- baseline labels/source = 48
- Pilot-9 delta = 0.25
- Pilot-9 alpha = 0.10
- stages = 8, 12, 24, 48

Only null handling changes.

For each source:
1. estimate a Beta(2,2) posterior from 48 baseline labels,
2. form an approximate central interval around the posterior mean,
3. for recent evidence, choose the null probability inside that interval that
   maximizes the Bernoulli likelihood (equivalently: clamp recent empirical
   accuracy to the interval),
4. compare the same Pilot-9 point alternatives against that conservative null.

This is a robustness experiment. It is NOT claimed to be a formal e-process.
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
P9 = ROOT / "twinmem_pilot9"
sys.path[:0] = [str(P0), str(P1), str(P3), str(P5), str(P9)]

import benchmark as b  # noqa: E402
import calibrated_reliability as p1  # noqa: E402
import budget_aware_gate as p3  # noqa: E402
import uncertainty_drift as p5  # noqa: E402
import mixture_eprocess as p9  # noqa: E402

OUT = Path(__file__).resolve().parent / "outputs"

BASELINE_N = 48
DELTA = 0.25
ALPHA = 0.10
STAGES = (8, 12, 24, 48)
INTERVAL_LEVELS = (0.70, 0.80, 0.90, 0.95)

DEV_REPEATS = 260
TEST_REPEATS = 500
BASELINE_POOL_PROFILES = 360
RECENT_POOL_PROFILES = 340

BASELINE_DEV_SEED = 20262001
DEV_STATIONARY_SEED = 20262011
DEV_MODERATE_SEED = 20262012
DEV_SEVERE_SEED = 20262013

BASELINE_TEST_SEED = 20262021
TEST_STATIONARY_SEED = 20262022
TEST_MODERATE_SEED = 20262023
TEST_SEVERE_SEED = 20262024

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


def baseline_raw(profiles):
    return p5.observations_by_source(profiles)


def estimate_null(raw, seed, level):
    rng = random.Random(seed)
    z = NormalDist().inv_cdf(0.5 + level / 2.0)
    out = {}
    for source in SOURCES:
        sample = rng.sample(raw[source], BASELINE_N)
        stats = p5.beta_stats(sum(sample), BASELINE_N)
        sd = math.sqrt(stats["variance"])
        lo = max(0.02, stats["mean"] - z * sd)
        hi = min(0.98, stats["mean"] + z * sd)
        out[source] = {
            "mean": stats["mean"],
            "lo": lo,
            "hi": hi,
            "z": z,
        }
    return out


def apply_mean_bias(null_info, pattern):
    out = {}
    for source in SOURCES:
        width_lo = null_info[source]["mean"] - null_info[source]["lo"]
        width_hi = null_info[source]["hi"] - null_info[source]["mean"]
        mean = p9.clip_probability(null_info[source]["mean"] + pattern[source])
        out[source] = {
            "mean": mean,
            "lo": max(0.02, mean - width_lo),
            "hi": min(0.98, mean + width_hi),
            "z": null_info[source]["z"],
        }
    return out


def shuffled_streams(profiles, seed):
    rng = random.Random(seed)
    raw = p5.observations_by_source(profiles)
    streams = {}
    for source in SOURCES:
        vals = list(raw[source])
        rng.shuffle(vals)
        if len(vals) < max(STAGES):
            raise AssertionError(f"insufficient recent observations for {source}")
        streams[source] = vals
    return streams


def bernoulli_log_likelihood(correct, total, p):
    p = p9.clip_probability(p)
    wrong = total - correct
    return correct * math.log(p) + wrong * math.log(1.0 - p)


def conservative_null_p(correct, total, lo, hi):
    empirical = correct / total
    return min(hi, max(lo, empirical))


def global_log_evidence(null_info, streams, n):
    log_lrs = []
    for source in SOURCES:
        correct = sum(streams[source][:n])
        info = null_info[source]
        p_null = conservative_null_p(correct, n, info["lo"], info["hi"])
        null_ll = bernoulli_log_likelihood(correct, n, p_null)

        for direction in (-1.0, 1.0):
            p_alt = p9.clip_probability(info["mean"] + direction * DELTA)
            alt_ll = bernoulli_log_likelihood(correct, n, p_alt)
            log_lrs.append(alt_ll - null_ll)

    return p9.logsumexp(log_lrs) - math.log(len(log_lrs))


def sequential_decision(null_info, profiles, seed):
    streams = shuffled_streams(profiles, seed)
    threshold = math.log(1.0 / ALPHA)
    trace = []

    for stage in STAGES:
        log_e = global_log_evidence(null_info, streams, stage)
        hit = log_e >= threshold
        trace.append({
            "labels_per_source": stage,
            "log_evidence": log_e,
            "threshold": 1.0 / ALPHA,
            "drift_signal": hit,
        })
        if hit:
            return {
                "drift": True,
                "labels_per_source": stage,
                "stop_reason": "conservative_null_crossing",
                "trace": trace,
            }

    return {
        "drift": False,
        "labels_per_source": max(STAGES),
        "stop_reason": "no_crossing_by_max_stage",
        "trace": trace,
    }


def distribution(
    baseline_observations,
    recent_profiles,
    baseline_seed_base,
    recent_seed_base,
    level,
    repeats,
    bias_pattern=None,
):
    detections = []
    labels = []
    stops = Counter()

    for rep in range(repeats):
        null_info = estimate_null(
            baseline_observations,
            baseline_seed_base + rep,
            level,
        )
        if bias_pattern is not None:
            null_info = apply_mean_bias(null_info, bias_pattern)

        result = sequential_decision(
            null_info,
            recent_profiles,
            recent_seed_base + rep,
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
    baseline_observations,
    pools,
    level,
    repeats,
    seed_offset,
    bias_pattern=None,
):
    d = {
        "stationary": distribution(
            baseline_observations, pools["stationary"],
            100000 + seed_offset, 200000 + seed_offset,
            level, repeats, bias_pattern
        ),
        "moderate": distribution(
            baseline_observations, pools["moderate"],
            110000 + seed_offset, 210000 + seed_offset,
            level, repeats, bias_pattern
        ),
        "severe": distribution(
            baseline_observations, pools["severe"],
            120000 + seed_offset, 220000 + seed_offset,
            level, repeats, bias_pattern
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
        "distributions": d,
        "detection_pass": detection_pass,
        "efficiency_pass": efficiency_pass,
        "all_goals_pass": detection_pass and efficiency_pass,
    }


def select_level(candidates):
    passing = [c for c in candidates if c["all_goals_pass"]]
    if not passing:
        return None
    passing.sort(key=lambda c: (
        (
            c["distributions"]["moderate"]["mean_labels_per_source"]
            + c["distributions"]["severe"]["mean_labels_per_source"]
        ) / 2.0,
        c["distributions"]["stationary"]["detection_rate"],
        -c["interval_level"],
    ))
    return passing[0]


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    dev_baseline = b.generate(
        BASELINE_DEV_SEED, BASELINE_POOL_PROFILES, "p11devbase"
    )
    dev_raw = baseline_raw(dev_baseline)
    dev_pools = {
        "stationary": b.generate(
            DEV_STATIONARY_SEED, RECENT_POOL_PROFILES, "p11devstat"
        ),
        "moderate": generate_with_noise(
            DEV_MODERATE_SEED, RECENT_POOL_PROFILES, "p11devmod", MODERATE_SHIFT_NOISE
        ),
        "severe": generate_with_noise(
            DEV_SEVERE_SEED, RECENT_POOL_PROFILES, "p11devsev", SEVERE_SHIFT_NOISE
        ),
    }

    candidates = []
    for idx, level in enumerate(INTERVAL_LEVELS):
        bundle = scenario_bundle(
            dev_raw,
            dev_pools,
            level,
            DEV_REPEATS,
            seed_offset=idx * 1000,
        )
        candidates.append({
            "interval_level": level,
            **bundle,
        })

    selected = select_level(candidates)

    payload = {
        "status": "synthetic_research_only",
        "limits": [
            "No human learner data",
            "No LLM or vector database",
            "No production Hallium behavior",
            "Correctness labels use simulator truth and are privileged",
            "Posterior intervals use a normal approximation to Beta posterior variance",
            "Conservative-null likelihood ratio is a robustness heuristic, not a formal e-process",
        ],
        "frozen_pilot9": {
            "baseline_labels_per_source": BASELINE_N,
            "delta": DELTA,
            "alpha": ALPHA,
            "stages": STAGES,
        },
        "interval_levels": INTERVAL_LEVELS,
        "development_repeats": DEV_REPEATS,
        "test_repeats": TEST_REPEATS,
        "detection_criteria": DETECTION_CRITERIA,
        "efficiency_goals": EFFICIENCY_GOALS,
        "development_candidates": candidates,
        "selected_interval_level": None if selected is None else selected["interval_level"],
        "heldout_unbiased": None,
        "heldout_bias_stress": None,
    }

    if selected is None:
        (OUT / "results.json").write_text(
            json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        print(json.dumps(payload, indent=2))
        return payload

    level = selected["interval_level"]

    test_baseline = b.generate(
        BASELINE_TEST_SEED, BASELINE_POOL_PROFILES, "p11testbase"
    )
    test_raw = baseline_raw(test_baseline)
    test_pools = {
        "stationary": b.generate(
            TEST_STATIONARY_SEED, RECENT_POOL_PROFILES, "p11teststat"
        ),
        "moderate": generate_with_noise(
            TEST_MODERATE_SEED, RECENT_POOL_PROFILES, "p11testmod", MODERATE_SHIFT_NOISE
        ),
        "severe": generate_with_noise(
            TEST_SEVERE_SEED, RECENT_POOL_PROFILES, "p11testsev", SEVERE_SHIFT_NOISE
        ),
    }

    payload["heldout_unbiased"] = scenario_bundle(
        test_raw,
        test_pools,
        level,
        TEST_REPEATS,
        seed_offset=50000,
    )

    stress = {}
    for idx, (name, pattern) in enumerate(BIAS_PATTERNS.items()):
        stress[name] = {
            "pattern": pattern,
            **scenario_bundle(
                test_raw,
                test_pools,
                level,
                TEST_REPEATS,
                seed_offset=60000 + idx * 1000,
                bias_pattern=pattern,
            ),
        }
    payload["heldout_bias_stress"] = stress

    (OUT / "results.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(payload, indent=2))
    return payload


if __name__ == "__main__":
    main()
