#!/usr/bin/env python3
"""TwinMem Pilot 13: posterior-predictive null + point alternatives.

RESEARCH ONLY. Synthetic profiles only. No production Hallium behavior.

Pilot 12's posterior-predictive null controlled false alarms, but diffuse shifted
Beta alternatives lost too much moderate-shift power.

Pilot 13 freezes everything except the alternative model:
- null: Beta posterior predictive from 48 baseline labels/source
- alternatives: point reliabilities at posterior mean +/- 0.25
- alpha: 0.10
- stages: 8, 12, 24, 48

No hyperparameter is tuned in this phase.
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
P9 = ROOT / "twinmem_pilot9"
P12 = ROOT / "twinmem_pilot12"
sys.path[:0] = [str(P9), str(P12)]

import mixture_eprocess as p9  # noqa: E402
import posterior_predictive_null as p12  # noqa: E402

OUT = Path(__file__).resolve().parent / "outputs"

BASELINE_N = p12.BASELINE_N
DELTA = p12.DELTA
ALPHA = p12.ALPHA
STAGES = p12.STAGES

DEV_REPEATS = 320
TEST_REPEATS = 500

BASELINE_DEV_SEED = 20262201
DEV_STATIONARY_SEED = 20262211
DEV_MODERATE_SEED = 20262212
DEV_SEVERE_SEED = 20262213

BASELINE_TEST_SEED = 20262221
TEST_STATIONARY_SEED = 20262222
TEST_MODERATE_SEED = 20262223
TEST_SEVERE_SEED = 20262224


def global_log_bayes_factor(posteriors, streams, n):
    log_bfs = []
    for source in p12.SOURCES:
        a = posteriors[source]["a"]
        bb = posteriors[source]["b"]
        correct = sum(streams[source][:n])

        null_log = p12.log_predictive_sequence(correct, n, a, bb)
        mean = a / (a + bb)

        for direction in (-1.0, 1.0):
            p_alt = p9.clip_probability(mean + direction * DELTA)
            alt_log = p12.bernoulli_log_likelihood(correct, n, p_alt)
            log_bfs.append(alt_log - null_log)

    return p9.logsumexp(log_bfs) - math.log(len(log_bfs))


def sequential_decision(posteriors, recent_profiles, seed):
    streams = p12.shuffled_streams(recent_profiles, seed)
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
                "stop_reason": "predictive_null_point_alt_crossing",
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
    import statistics
    from collections import Counter

    detections = []
    labels = []
    stops = Counter()

    for rep in range(repeats):
        posteriors = p12.estimate_posteriors(
            baseline_observations,
            baseline_seed_base + rep,
        )
        if bias_pattern is not None:
            posteriors = p12.shift_posterior_means(posteriors, bias_pattern)

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
        "mean_total_labels_three_sources": statistics.mean(labels) * len(p12.SOURCES),
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
        d["stationary"]["detection_rate"] <= p12.DETECTION_CRITERIA["stationary_false_alarm_max"]
        and d["moderate"]["detection_rate"] >= p12.DETECTION_CRITERIA["moderate_detection_min"]
        and d["severe"]["detection_rate"] >= p12.DETECTION_CRITERIA["severe_detection_min"]
    )
    efficiency_pass = (
        d["moderate"]["mean_labels_per_source"] <= p12.EFFICIENCY_GOALS["moderate_mean_labels_per_source_max"]
        and d["severe"]["mean_labels_per_source"] <= p12.EFFICIENCY_GOALS["severe_mean_labels_per_source_max"]
    )
    return {
        "distributions": d,
        "detection_pass": detection_pass,
        "efficiency_pass": efficiency_pass,
        "all_goals_pass": detection_pass and efficiency_pass,
    }


def make_pools(base_seed, stat_seed, mod_seed, sev_seed, prefix):
    baseline = p12.b.generate(
        base_seed, p12.BASELINE_POOL_PROFILES, prefix + "base"
    )
    raw = p12.baseline_raw(baseline)
    pools = {
        "stationary": p12.b.generate(
            stat_seed, p12.RECENT_POOL_PROFILES, prefix + "stat"
        ),
        "moderate": p12.generate_with_noise(
            mod_seed, p12.RECENT_POOL_PROFILES, prefix + "mod", p12.MODERATE_SHIFT_NOISE
        ),
        "severe": p12.generate_with_noise(
            sev_seed, p12.RECENT_POOL_PROFILES, prefix + "sev", p12.SEVERE_SHIFT_NOISE
        ),
    }
    return raw, pools


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    dev_raw, dev_pools = make_pools(
        BASELINE_DEV_SEED,
        DEV_STATIONARY_SEED,
        DEV_MODERATE_SEED,
        DEV_SEVERE_SEED,
        "p13dev",
    )
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
            "Posterior-predictive null with baseline-dependent point alternatives is Bayesian evidence, not uniform frequentist anytime-validity",
        ],
        "frozen": {
            "baseline_labels_per_source": BASELINE_N,
            "delta": DELTA,
            "alpha": ALPHA,
            "stages": STAGES,
            "prior_a": p12.PRIOR_A,
            "prior_b": p12.PRIOR_B,
            "null_model": "beta_posterior_predictive",
            "alternative_model": "point_posterior_mean_plus_minus_delta",
        },
        "development_repeats": DEV_REPEATS,
        "test_repeats": TEST_REPEATS,
        "detection_criteria": p12.DETECTION_CRITERIA,
        "efficiency_goals": p12.EFFICIENCY_GOALS,
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

    test_raw, test_pools = make_pools(
        BASELINE_TEST_SEED,
        TEST_STATIONARY_SEED,
        TEST_MODERATE_SEED,
        TEST_SEVERE_SEED,
        "p13test",
    )

    payload["heldout_unbiased"] = scenario_bundle(
        test_raw,
        test_pools,
        TEST_REPEATS,
        seed_offset=50000,
    )

    stress = {}
    for idx, (name, pattern) in enumerate(p12.BIAS_PATTERNS.items()):
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
