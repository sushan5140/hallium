#!/usr/bin/env python3
"""TwinMem pilot 1: dev-calibrated source reliability under fixed context budgets.

RESEARCH ONLY. Synthetic profiles only. No human data, LLM inference, vector DB,
edge-device execution, RAM/power measurement, or production Hallium behavior.

Pilot 0 used hand-set source weights. Pilot 1 estimates source reliability only
from a synthetic development split, tunes one freshness half-life on development,
freezes both, and evaluates untouched synthetic holdout profiles. A separate
source-reliability shift is explicitly a stress test, not a real-world claim.
"""
from __future__ import annotations

import csv
import json
import math
import random
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PILOT0 = ROOT / "twinmem_pilot0"
sys.path.insert(0, str(PILOT0))
import benchmark as b  # noqa: E402

OUT = Path(__file__).resolve().parent / "outputs"
HALF_LIFE_GRID = (14.0, 21.0, 33.0, 45.0, 60.0, 90.0)
DEV_PROFILES = 120
TEST_PROFILES = 480
SHIFT_DEV_PROFILES = 120
SHIFT_TEST_PROFILES = 480
DEV_SEED = 20261001
TEST_SEED = 20261002
SHIFT_DEV_SEED = 20261003
SHIFT_TEST_SEED = 20261004
BETA_PRIOR_CORRECT = 2.0
BETA_PRIOR_WRONG = 2.0


def truth_at(profile, note):
    return profile.previous[note.skill] if note.day < b.CHANGE_DAY else profile.current[note.skill]


def estimate_source_reliability(profiles):
    counts = defaultdict(lambda: [0, 0])
    for profile in profiles:
        for note in profile.notes:
            counts[note.source][1] += 1
            counts[note.source][0] += int(note.state == truth_at(profile, note))
    result = {}
    for source in sorted(b.SOURCE_WEIGHTS):
        correct, total = counts[source]
        posterior_accuracy = (correct + BETA_PRIOR_CORRECT) / (
            total + BETA_PRIOR_CORRECT + BETA_PRIOR_WRONG
        )
        # Convert accuracy into signed-evidence strength on [0.05, 1].
        strength = max(0.05, min(1.0, 2.0 * posterior_accuracy - 1.0))
        result[source] = {
            "correct": correct,
            "total": total,
            "posterior_accuracy": round(posterior_accuracy, 6),
            "weight": round(strength, 6),
        }
    return result


def weights_only(calibration):
    return {source: calibration[source]["weight"] for source in calibration}


def rank_calibrated(profile, skill, weights, half_life):
    topic = [note for note in profile.notes if note.skill == skill]
    return sorted(
        topic,
        key=lambda note: (
            weights[note.source] * math.exp(-(b.QUERY_DAY - note.day) / half_life),
            note.day,
            note.id,
        ),
        reverse=True,
    )


def retrieve_calibrated(profile, skill, budget, weights, half_life):
    chosen, used = [], 0
    for note in rank_calibrated(profile, skill, weights, half_life):
        if used + note.words <= budget:
            chosen.append(note)
            used += note.words
    return chosen


def decide_calibrated(chosen, skill, weights):
    support = 0.0
    for note in chosen:
        if note.skill != skill:
            continue
        freshness = math.exp(-(b.QUERY_DAY - note.day) / b.DECISION_HALF_LIFE)
        support += (
            (1.0 if note.state == "strong" else -1.0)
            * weights[note.source]
            * freshness
        )
    if support == 0:
        return None
    return "strong" if support > 0 else "weak"


def calibrated_outcome(profile, skill, budget, weights, half_life):
    chosen = retrieve_calibrated(profile, skill, budget, weights, half_life)
    predicted = decide_calibrated(chosen, skill, weights)
    return {
        "profile": profile.id,
        "group": profile.group,
        "skill": skill,
        "method": "calibrated",
        "word_budget": budget,
        "truth": profile.current[skill],
        "predicted": predicted or "abstain",
        "correct": int(predicted == profile.current[skill]),
        "abstain": int(predicted is None),
        "words": sum(note.words for note in chosen),
        "notes": len(chosen),
    }


def rows_for(profiles, method, weights=None, half_life=None):
    rows = []
    for profile in profiles:
        for skill in b.SKILLS:
            for budget in b.BUDGETS:
                if method == "calibrated":
                    rows.append(
                        calibrated_outcome(profile, skill, budget, weights, half_life)
                    )
                else:
                    row = b.outcome(profile, skill, method, budget)
                    rows.append(
                        {
                            key: row[key]
                            for key in (
                                "profile",
                                "group",
                                "skill",
                                "method",
                                "word_budget",
                                "truth",
                                "predicted",
                                "correct",
                                "abstain",
                                "words",
                                "notes",
                            )
                        }
                    )
    return rows


def accuracy(rows, budget=None):
    sample = rows if budget is None else [r for r in rows if r["word_budget"] == budget]
    return sum(r["correct"] for r in sample) / len(sample)


def tune_half_life(dev_profiles, weights):
    candidates = []
    for half_life in HALF_LIFE_GRID:
        rows = rows_for(dev_profiles, "calibrated", weights, half_life)
        score = sum(accuracy(rows, budget) for budget in b.BUDGETS) / len(b.BUDGETS)
        candidates.append({"half_life": half_life, "mean_budget_accuracy": score})
    # Deterministic tie break prefers simpler/lower half-life.
    candidates.sort(key=lambda item: (-item["mean_budget_accuracy"], item["half_life"]))
    return candidates[0]["half_life"], candidates


def summarize(rows):
    result = []
    for method in sorted({r["method"] for r in rows}):
        for budget in b.BUDGETS:
            sample = [r for r in rows if r["method"] == method and r["word_budget"] == budget]
            result.append(
                {
                    "method": method,
                    "word_budget": budget,
                    "queries": len(sample),
                    "accuracy": round(sum(r["correct"] for r in sample) / len(sample), 4),
                    "abstain_rate": round(sum(r["abstain"] for r in sample) / len(sample), 4),
                    "mean_context_words": round(sum(r["words"] for r in sample) / len(sample), 2),
                }
            )
    return result


def paired_profile_bootstrap(rows, method_a, method_b, reps=2500, seed=9017):
    rng = random.Random(seed)
    by_budget = defaultdict(lambda: defaultdict(dict))
    for row in rows:
        if row["method"] not in (method_a, method_b):
            continue
        by_budget[row["word_budget"]][row["profile"]][(row["skill"], row["method"])] = row["correct"]
    output = []
    for budget in b.BUDGETS:
        profile_diffs = []
        for _, marks in sorted(by_budget[budget].items()):
            if len(marks) != 2 * len(b.SKILLS):
                raise AssertionError("Incomplete paired profile")
            profile_diffs.append(
                sum(marks[(skill, method_a)] - marks[(skill, method_b)] for skill in b.SKILLS)
                / len(b.SKILLS)
            )
        observed = sum(profile_diffs) / len(profile_diffs)
        boot = []
        for _ in range(reps):
            boot.append(
                sum(profile_diffs[rng.randrange(len(profile_diffs))] for _ in profile_diffs)
                / len(profile_diffs)
            )
        boot.sort()
        output.append(
            {
                "budget": budget,
                "comparison": f"{method_a} - {method_b}",
                "difference": round(observed, 4),
                "interval_95_profile_bootstrap": [
                    round(boot[int(0.025 * reps)], 4),
                    round(boot[int(0.975 * reps) - 1], 4),
                ],
                "profiles": len(profile_diffs),
            }
        )
    return output


def generate_with_noise(seed, total, prefix, noise):
    original = b.SOURCE_NOISE.copy()
    try:
        b.SOURCE_NOISE.clear()
        b.SOURCE_NOISE.update(noise)
        return b.generate(seed, total, prefix)
    finally:
        b.SOURCE_NOISE.clear()
        b.SOURCE_NOISE.update(original)


def write_csv(path, rows):
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    dev = b.generate(DEV_SEED, DEV_PROFILES, "p1dev")
    test = b.generate(TEST_SEED, TEST_PROFILES, "p1test")

    calibration = estimate_source_reliability(dev)
    weights = weights_only(calibration)
    best_half_life, tuning = tune_half_life(dev, weights)

    primary_rows = []
    for method in ("topic_recent", "source_only", "adaptive"):
        primary_rows.extend(rows_for(test, method))
    primary_rows.extend(rows_for(test, "calibrated", weights, best_half_life))

    shift_noise = {
        "verified_assessment": 0.36,
        "practice_result": 0.20,
        "self_report": 0.05,
    }
    shift_dev = generate_with_noise(SHIFT_DEV_SEED, SHIFT_DEV_PROFILES, "p1shiftdev", shift_noise)
    shift_test = generate_with_noise(SHIFT_TEST_SEED, SHIFT_TEST_PROFILES, "p1shifttest", shift_noise)

    shifted_calibration = estimate_source_reliability(shift_dev)
    shifted_weights = weights_only(shifted_calibration)
    shifted_half_life, shifted_tuning = tune_half_life(shift_dev, shifted_weights)

    shift_rows_frozen = []
    for method in ("topic_recent", "source_only", "adaptive"):
        shift_rows_frozen.extend(rows_for(shift_test, method))
    shift_rows_frozen.extend(rows_for(shift_test, "calibrated", weights, best_half_life))

    shift_rows_recalibrated = rows_for(
        shift_test, "calibrated", shifted_weights, shifted_half_life
    )
    for row in shift_rows_recalibrated:
        row["method"] = "recalibrated"

    payload = {
        "status": "synthetic_research_only",
        "limits": [
            "No human learner data",
            "No LLM inference",
            "No vector database",
            "No real device, RAM, battery, or end-to-end latency benchmark",
            "Development labels are simulator truth and are not assumed available in production",
        ],
        "primary": {
            "dev_profiles": DEV_PROFILES,
            "test_profiles": TEST_PROFILES,
            "test_queries_per_method": TEST_PROFILES * len(b.SKILLS) * len(b.BUDGETS),
            "calibration": calibration,
            "selected_half_life": best_half_life,
            "tuning": tuning,
            "summary": summarize(primary_rows),
            "paired_vs_adaptive": paired_profile_bootstrap(
                primary_rows, "calibrated", "adaptive"
            ),
            "paired_vs_source_only": paired_profile_bootstrap(
                primary_rows, "calibrated", "source_only", seed=9018
            ),
        },
        "source_shift": {
            "noise": shift_noise,
            "frozen_original_calibration_summary": summarize(shift_rows_frozen),
            "shift_dev_calibration": shifted_calibration,
            "shift_selected_half_life": shifted_half_life,
            "shift_tuning": shifted_tuning,
            "recalibrated_summary": summarize(shift_rows_recalibrated),
        },
    }

    (OUT / "results.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    write_csv(OUT / "primary_summary.csv", payload["primary"]["summary"])
    write_csv(
        OUT / "shift_frozen_summary.csv",
        payload["source_shift"]["frozen_original_calibration_summary"],
    )
    write_csv(
        OUT / "shift_recalibrated_summary.csv",
        payload["source_shift"]["recalibrated_summary"],
    )

    print(json.dumps(payload, indent=2))
    return payload


if __name__ == "__main__":
    main()
