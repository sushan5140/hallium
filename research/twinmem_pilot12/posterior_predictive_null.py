#!/usr/bin/env python3
"""TwinMem Pilot 12: posterior-predictive null mixture.

RESEARCH ONLY. Synthetic profiles only. No production Hallium behavior.

Pilot 10 showed point plug-in p0 is fragile.
Pilot 11 showed worst-case null intervals are too conservative.

Pilot 12 freezes:
- baseline = 48 labels/source
- delta = 0.25
- alpha = 0.10
- stages = 8, 12, 24, 48

No null-handling hyperparameter is tuned.

For each source, baseline labels yield a Beta posterior Beta(a,b).
Null evidence for the recent Bernoulli sequence is the Beta posterior predictive.
Alternative evidence uses two Beta distributions with the SAME concentration
a+b but means shifted by +/- delta. The global Bayes-factor-style statistic is
an equal mixture across 3 sources x 2 directions.

This has a coherent Bayesian predictive interpretation conditional on the
baseline posterior. It is not claimed to provide uniform frequentist
anytime-validity for every fixed true p.
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

DEV_REPEATS = 300
TEST_REPEATS = 500
BASELINE_POOL_PROFILES = 380
RECENT_POOL_PROFILES = 360

BASELINE_DEV_SEED = 20262101
DEV_STATIONARY_SEED = 20262111
DEV_MODERATE_SEED = 20262112
DEV_SEVERE_SEED = 20262113

BASELINE_TEST_SEED = 20262121
TEST_STATIONARY_SEED = 20262122
TEST_MODERATE_SEED = 20262123
TEST_SEVERE_SEED = 20262124

MODERATE_SHIFT_NOISE = p3.MODERATE_SHIFT_NOISE
SEVERE_SHIFT_NOISE = p3.SEVERE_SHIFT_NOISE
SOURCES = tuple(p5.SOURCES)

PRIOR_A = 2.0
PRIOR_B = 2.0

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


def estimate_posteriors(raw, seed):
    rng = random.Random(seed)
    out = {}
    for source in SOURCES:
        sample = rng.sample(raw[source], BASELINE_N)
        correct = sum(sample)
        out[source] = {
            "a": correct + PRIOR_A,
            "b": BASELINE_N - correct + PRIOR_B,
        }
    return out


def shift_posterior_means(posteriors, pattern):
    out = {}
    for source in SOURCES:
        a = posteriors[source]["a"]
        bb = posteriors[source]["b"]
        concentration = a + bb
        mean = a / concentration
        shifted = min(0.98, max(0.02, mean + pattern[source]))
        out[source] = {
            "a": shifted * concentration,
            "b": (1.0 - shifted) * concentration,
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


def log_beta(a, bb):
    return math.lgamma(a) + math.lgamma(bb) - math.lgamma(a + bb)


def log_predictive_sequence(correct, total, a, bb):
    wrong = total - correct
    return log_beta(a + correct, bb + wrong) - log_beta(a, bb)


def alternative_beta(a, bb, direction):
    concentration = a + bb
    mean = a / concentration
    alt_mean = min(0.98, max(0.02, mean + direction * DELTA))
    return alt_mean * concentration, (1.0 - alt_mean) * concentration


def global_log_bayes_factor(posteriors, streams, n):
    log_bfs = []

    for source in SOURCES:
        a = posteriors[source]["a"]
        bb = posteriors[source]["b"]
        correct = sum(streams[source][:n])
        null_log = log_predictive_sequence(correct, n, a, bb)

        for direction in (-1.0, 1.0):
            alt_a, alt_b = alternative_beta(a, bb, direction)
            alt_log = log_predictive_sequence(correct, n, alt_a, alt_b)
            log_bfs.append(alt_log - null_log)

    return p9.logsumexp(log_bfs) - math.log(len(log_bfs))


def sequential_decision(posteriors, recent_profiles, seed):
    streams = shuffled_streams(recent_profiles, seed)
    threshold = math.log(1.0 / ALPHA)
    trace = []

    for stage in STAGES:
        log_bf = global_log_bayes_factor(posteriors, streams, stage)
        hit = log_bf >= threshold
        trace.append({
            "labels_per_source": stage,
            "log_bayes_factor": log_bf,
            "threshold": 1.0 / ALPHA,
            "drift_signal": hit,
        })
        if hit:
            return {
                "drift": True,
                "labels_per_source": stage,
                "stop_reason": "posterior_predictive_crossing",
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
    repeats,
    bias_pattern=None,
):
    detections = []
    labels = []
    stops = Counter()

    for rep in range(repeats):
        posteriors = estimate_posteriors(
            baseline_observations,
            baseline_seed_base + rep,
        )
        if bias_pattern is not None:
            posteriors = shift_posterior_means(posteriors, bias_pattern)

        result = sequential_decision(
            posteriors,
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
    repeats,
    seed_offset,
    bias_pattern=None,
):
    d = {
        "stationary": distribution(
            baseline_observations, pools["stationary"],
            100000 + seed_offset, 200000 + seed_offset,
            repeats, bias_pattern
        ),
        "moderate": distribution(
            baseline_observations, pools["moderate"],
            110000 + seed_offset, 210000 + seed_offset,
            repeats, bias_pattern
        ),
        "severe": distribution(
            baseline_observations, pools["severe"],
            120000 + seed_offset, 220000 + seed_offset,
            repeats, bias_pattern
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


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    dev_baseline = b.generate(
        BASELINE_DEV_SEED, BASELINE_POOL_PROFILES, "p12devbase"
    )
    dev_raw = baseline_raw(dev_baseline)
    dev_pools = {
        "stationary": b.generate(
            DEV_STATIONARY_SEED, RECENT_POOL_PROFILES, "p12devstat"
        ),
        "moderate": generate_with_noise(
            DEV_MODERATE_SEED, RECENT_POOL_PROFILES, "p12devmod", MODERATE_SHIFT_NOISE
        ),
        "severe": generate_with_noise(
            DEV_SEVERE_SEED, RECENT_POOL_PROFILES, "p12devsev", SEVERE_SHIFT_NOISE
        ),
    }

    development = scenario_bundle(
        dev_raw,
        dev_pools,
        DEV_REPEATS,
        seed_offset=0,
    )

    payload = {
        "status": "synthetic_research_only",
        "limits": [
            "No human learner data",
            "No LLM or vector database",
            "No production Hallium behavior",
            "Correctness labels use simulator truth and are privileged",
            "Bayesian posterior-predictive coherence does not imply uniform frequentist anytime-validity",
            "Alternative Beta models preserve baseline posterior concentration by design",
        ],
        "frozen": {
            "baseline_labels_per_source": BASELINE_N,
            "delta": DELTA,
            "alpha": ALPHA,
            "stages": STAGES,
            "prior_a": PRIOR_A,
            "prior_b": PRIOR_B,
        },
        "development_repeats": DEV_REPEATS,
        "test_repeats": TEST_REPEATS,
        "detection_criteria": DETECTION_CRITERIA,
        "efficiency_goals": EFFICIENCY_GOALS,
        "development": development,
        "heldout_unbiased": None,
        "heldout_bias_stress": None,
    }

    if not development["all_goals_pass"]:
        (OUT / "results.json").write_text(
            json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        print(json.dumps(payload, indent=2))
        return payload

    test_baseline = b.generate(
        BASELINE_TEST_SEED, BASELINE_POOL_PROFILES, "p12testbase"
    )
    test_raw = baseline_raw(test_baseline)
    test_pools = {
        "stationary": b.generate(
            TEST_STATIONARY_SEED, RECENT_POOL_PROFILES, "p12teststat"
        ),
        "moderate": generate_with_noise(
            TEST_MODERATE_SEED, RECENT_POOL_PROFILES, "p12testmod", MODERATE_SHIFT_NOISE
        ),
        "severe": generate_with_noise(
            TEST_SEVERE_SEED, RECENT_POOL_PROFILES, "p12testsev", SEVERE_SHIFT_NOISE
        ),
    }

    payload["heldout_unbiased"] = scenario_bundle(
        test_raw,
        test_pools,
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
