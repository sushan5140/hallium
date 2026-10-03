#!/usr/bin/env python3
"""TwinMem Pilot 14: baseline-information robustness for frozen Pilot 9.

RESEARCH ONLY. Synthetic profiles only. No production Hallium behavior.

Pilot 10 showed:
- 48 baseline labels/source is marginal and fragile
- 96/192 looked stronger on one unbiased robustness curve

Pilot 14 performs the clean follow-up:
- freeze the original Pilot-9 plug-in process
- compare baseline sizes 96 and 192
- use fresh independent baseline/recent pools
- test unbiased and +/-0.03 plug-in misspecification
- do NOT retune delta, alpha, stages, or thresholds
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
P10 = ROOT / "twinmem_pilot10"
sys.path.insert(0, str(P10))

import null_estimation as p10  # noqa: E402

OUT = Path(__file__).resolve().parent / "outputs"

BASELINE_SIZES = (96, 192)
REPEATS = 500

BASELINE_POOL_SEED = 20262301
RECENT_STATIONARY_SEED = 20262311
RECENT_MODERATE_SEED = 20262312
RECENT_SEVERE_SEED = 20262313

ROBUSTNESS_REQUIREMENT = "all_bias_patterns_pass_all_detection_and_efficiency_goals"


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    baseline_pool = p10.b.generate(
        BASELINE_POOL_SEED,
        p10.BASELINE_POOL_PROFILES,
        "p14baseline",
    )
    baseline_raw = p10.baseline_observations(baseline_pool)

    recent = {
        "stationary": p10.b.generate(
            RECENT_STATIONARY_SEED,
            p10.RECENT_POOL_PROFILES,
            "p14stat",
        ),
        "moderate": p10.generate_with_noise(
            RECENT_MODERATE_SEED,
            p10.RECENT_POOL_PROFILES,
            "p14mod",
            p10.MODERATE_SHIFT_NOISE,
        ),
        "severe": p10.generate_with_noise(
            RECENT_SEVERE_SEED,
            p10.RECENT_POOL_PROFILES,
            "p14sev",
            p10.SEVERE_SHIFT_NOISE,
        ),
    }

    matrix = {}
    for size_idx, n in enumerate(BASELINE_SIZES):
        by_pattern = {}
        for pattern_idx, (name, pattern) in enumerate(p10.BIAS_PATTERNS.items()):
            by_pattern[name] = {
                "pattern": pattern,
                **p10.scenario_bundle(
                    baseline_raw,
                    n,
                    recent,
                    seed_offset=10000 * size_idx + 1000 * pattern_idx,
                    repeats=REPEATS,
                    bias_pattern=pattern,
                ),
            }

        robust = all(
            result["all_goals_pass"]
            for result in by_pattern.values()
        )
        matrix[str(n)] = {
            "patterns": by_pattern,
            "robust_across_all_patterns": robust,
        }

    passing_sizes = [
        int(n)
        for n, row in matrix.items()
        if row["robust_across_all_patterns"]
    ]

    payload = {
        "status": "synthetic_research_only",
        "limits": [
            "No human learner data",
            "No LLM or vector database",
            "No production Hallium behavior",
            "Correctness labels use simulator truth and are privileged",
            "Plug-in null misspecification is synthetic",
            "No formal anytime-valid guarantee is claimed under estimated p0",
        ],
        "frozen_pilot9": {
            "delta": p10.DELTA,
            "alpha": p10.ALPHA,
            "stages": p10.STAGES,
        },
        "baseline_sizes": BASELINE_SIZES,
        "repeats_per_size_pattern_scenario": REPEATS,
        "bias_patterns": p10.BIAS_PATTERNS,
        "detection_criteria": p10.DETECTION_CRITERIA,
        "efficiency_goals": p10.EFFICIENCY_GOALS,
        "robustness_requirement": ROBUSTNESS_REQUIREMENT,
        "matrix": matrix,
        "baseline_sizes_robust_across_all_patterns": passing_sizes,
    }

    (OUT / "results.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(payload, indent=2))
    return payload


if __name__ == "__main__":
    main()
