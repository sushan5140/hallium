#!/usr/bin/env python3
"""TwinMem pilot 0: reproducible SYNTHETIC evidence-selection benchmark.

IMPORTANT: This script runs NO LLM, RAG vector DB, or constrained/edge device.
Memory budget is a limit on words placed into downstream context, not peak RAM.
Retrieval uses structured records and an exact skill index, not embeddings.
Generated labels are construction-time ground truth, not human observations.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import platform
import random
import statistics
import sys
import time
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

SKILLS = ("grammar", "vocabulary", "listening", "speaking")
SOURCE_WEIGHTS = {"verified_assessment": 1.0, "practice_result": 0.67, "self_report": 0.25}
SOURCE_NOISE = {"verified_assessment": 0.06, "practice_result": 0.13, "self_report": 0.32}
SEED_DEV, SEED_TEST = 20260922, 20260925
N_DEV, N_TEST = 60, 480
BUDGETS = (52, 105, 210)
METHODS = ("recency", "topic_recent", "source_only", "adaptive", "full_history")
# All constants are fixed before any held-out evaluation.
QUERY_DAY = 100
CHANGE_DAY = 59
DECISION_HALF_LIFE = 34.0
RANK_HALF_LIFE = 33.0


@dataclass(frozen=True)
class Note:
    id: str
    day: int
    skill: str
    state: str
    source: str
    text: str

    @property
    def words(self):
        return len(self.text.split())

    def as_dict(self):
        return {"id": self.id, "day": self.day, "skill": self.skill,
                "state": self.state, "source": self.source, "text": self.text,
                "words": self.words}


@dataclass(frozen=True)
class Profile:
    id: str
    group: str
    previous: dict
    current: dict
    notes: tuple

    def as_dict(self):
        return {"id": self.id, "group": self.group, "previous": self.previous,
                "current": self.current, "notes": [n.as_dict() for n in self.notes]}


def other(state):
    return "strong" if state == "weak" else "weak"


def generate(seed: int, total: int, prefix: str):
    """Simulated profiles deliberately include drift, stable skills, and contradictory reports.

    Every skill has at least two relatively recent, mostly correct formal assessments;
    this is a deliberately favorable assumption for the quality-aware method.
    """
    rng = random.Random(seed)
    out = []
    for p in range(total):
        previous = {s: rng.choice(("weak", "strong")) for s in SKILLS}
        group = ("stable", "drift", "mixed")[p % 3]
        current = {}
        for s in SKILLS:
            if group == "stable":
                current[s] = previous[s]
            elif group == "drift":
                current[s] = other(previous[s])
            else:
                current[s] = other(previous[s]) if rng.random() < 0.5 else previous[s]
        records = []

        def add(day, skill, source, forced=None):
            truth = previous[skill] if day < CHANGE_DAY else current[skill]
            if forced is not None:
                report = forced
            else:
                report = other(truth) if rng.random() < SOURCE_NOISE[source] else truth
            qualifier = ("Repeated supervised quiz evidence", "Completed Korean-learning exercise",
                         "Learner informal impression")[("verified_assessment", "practice_result", "self_report").index(source)]
            # A neutral stable text footprint; skill mentioned only once in every record.
            text = (f"Day {day}. {qualifier}. The recorded {skill} status is {report}. "
                    f"This dated observation describes performance at that point in the learning history; "
                    f"it may no longer describe the learner's current skill.")
            records.append(Note(f"{prefix}-{p:04d}-n{len(records):02d}", day, skill, report, source, text))

        for skill in SKILLS:
            add(rng.randint(9, 18), skill, "verified_assessment")
            add(rng.randint(30, 41), skill, "practice_result")
            add(rng.randint(73, 79), skill, "verified_assessment")
            add(rng.randint(88, 94), skill, "verified_assessment")
            # Fresh but less reliable statements, including mistaken self-reports.
            if rng.random() < 0.72:
                add(rng.randint(95, 100), skill, "self_report")
        for _ in range(21):
            skill = rng.choice(SKILLS)
            source = rng.choices(tuple(SOURCE_WEIGHTS), weights=(0.17, 0.40, 0.43))[0]
            add(rng.randint(1, 100), skill, source)
        records.sort(key=lambda n: (n.day, n.id))
        out.append(Profile(f"{prefix}-{p:04d}", group, previous, current, tuple(records)))
    return out


def rank(profile, skill, method):
    notes = profile.notes
    if method == "full_history":
        return sorted(notes, key=lambda n: (n.day, n.id), reverse=True)
    if method == "recency":
        return sorted(notes, key=lambda n: (n.day, n.id), reverse=True)
    topic = [n for n in notes if n.skill == skill]
    if method == "topic_recent":
        return sorted(topic, key=lambda n: (n.day, n.id), reverse=True)
    if method == "source_only":
        return sorted(topic, key=lambda n: (SOURCE_WEIGHTS[n.source], n.day, n.id), reverse=True)
    if method == "adaptive":
        return sorted(topic, key=lambda n: (
            SOURCE_WEIGHTS[n.source] * math.exp(-(QUERY_DAY-n.day) / RANK_HALF_LIFE),
            n.day, n.id), reverse=True)
    raise ValueError("unknown method " + method)


def retrieve(profile, skill, method, budget):
    ordered = rank(profile, skill, method)
    if method == "full_history":
        return ordered
    chosen = []
    used = 0
    for n in ordered:
        if used + n.words <= budget:
            chosen.append(n)
            used += n.words
    return chosen


def decide(chosen, skill):
    """Fixed, shared evidence-only reader; no access to profile.current (ground truth)."""
    support = 0.0
    for n in chosen:
        if n.skill != skill:
            continue
        freshness = math.exp(-(QUERY_DAY-n.day) / DECISION_HALF_LIFE)
        support += (+1 if n.state == "strong" else -1) * SOURCE_WEIGHTS[n.source] * freshness
    if support == 0:
        return None
    return "strong" if support > 0 else "weak"


def outcome(profile, skill, method, budget):
    chosen = retrieve(profile, skill, method, budget)
    correct = decide(chosen, skill) == profile.current[skill]
    target = [n for n in chosen if n.skill == skill]
    return {
        "profile": profile.id, "group": profile.group, "skill": skill,
        "method": method, "word_budget": budget if method != "full_history" else "unbounded",
        "truth": profile.current[skill], "predicted": decide(chosen, skill) or "abstain",
        "correct": int(correct), "abstain": int(not target),
        "words": sum(n.words for n in chosen), "notes": len(chosen),
        "target_notes": len(target),
        "obsolete_fraction": round(sum(n.day < CHANGE_DAY for n in target) / max(len(target), 1), 4),
        "verified_current_seen": int(any(n.source == "verified_assessment" and
                                         n.day >= CHANGE_DAY and n.state == profile.current[skill]
                                         for n in target)),
        "chosen_ids": [n.id for n in chosen],
    }


def summarize(rows):
    groups = defaultdict(list)
    for x in rows:
        groups[(x["method"], str(x["word_budget"]))].append(x)
    result = []
    for (method, budget), rs in sorted(groups.items(), key=lambda kv: (kv[0][1],kv[0][0])):
        def avg(field): return sum(row[field] for row in rs) / len(rs)
        result.append({"method": method, "word_budget": budget, "queries": len(rs),
                       "accuracy": round(avg("correct"), 4),
                       "abstain_rate": round(avg("abstain"), 4),
                       "mean_context_words": round(avg("words"), 2),
                       "mean_selected_notes": round(avg("notes"), 2),
                       "verified_current_coverage": round(avg("verified_current_seen"), 4),
                       "mean_obsolete_fraction": round(avg("obsolete_fraction"), 4)})
    return result


def cluster_bootstrap(rows, method_a="adaptive", method_b="topic_recent", n_reps=2000, seed=7201):
    """Paired profile-cluster bootstrap; keep four queries within each simulated learner."""
    rng = random.Random(seed)
    by = defaultdict(lambda: defaultdict(dict))
    for r in rows:
        if r["method"] not in (method_a, method_b) or r["word_budget"] == "unbounded":
            continue
        by[str(r["word_budget"])][r["profile"]][(r["skill"], r["method"])] = r["correct"]
    output = []
    for budget, users in sorted(by.items(), key=lambda x:int(x[0])):
        diffs = []
        for uid, marks in users.items():
            if len(marks) != 2 * len(SKILLS):
                raise AssertionError("incomplete paired profile " + uid)
            diffs.append(sum(marks[(skill,method_a)] - marks[(skill,method_b)] for skill in SKILLS)/len(SKILLS))
        expected = sum(diffs) / len(diffs)
        boot = []
        for _ in range(n_reps):
            boot.append(sum(diffs[rng.randrange(len(diffs))] for _ in diffs)/len(diffs))
        boot.sort()
        output.append({"budget":int(budget),"comparison":method_a+" - "+method_b,
                       "difference":round(expected,4),
                       "95pct_profile_cluster_bootstrap_interval":
                       [round(boot[int(.025*n_reps)],4),round(boot[int(.975*n_reps)-1],4)],
                       "n_profiles":len(diffs),"n_queries":len(diffs)*len(SKILLS)})
    return output


def timing(profiles, reps=12, n_profiles=80):
    """Host CPU selection time only, not downstream LLM, vector store, or edge latency."""
    sample = profiles[:n_profiles]
    out = []
    for method in METHODS:
        budgets = ("unbounded",) if method == "full_history" else BUDGETS
        for budget in budgets:
            # repeat each query and report per-call distribution; avoid warming one strategy alone
            measurements = []
            for _ in range(reps):
                for prof in sample:
                    for skill in SKILLS:
                        start = time.perf_counter_ns()
                        retrieve(prof, skill, method, budget if isinstance(budget,int) else 0)
                        measurements.append((time.perf_counter_ns()-start)/1e6)
            measurements.sort()
            out.append({"method":method,"word_budget":budget,"host":platform.platform(),
                        "runtime":"CPython " + platform.python_version(),
                        "samples":len(measurements),
                        "median_selection_ms":round(statistics.median(measurements),6),
                        "p95_selection_ms":round(measurements[int(.95*len(measurements))-1],6)})
    return out


def write_csv(path, rows):
    if not rows:return
    with path.open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]))
        w.writeheader()
        for r in rows:
            w.writerow({k:json.dumps(v,ensure_ascii=False) if isinstance(v,list) else v for k,v in r.items()})


def validate():
    a=generate(SEED_DEV,2,"unit")
    assert all(n.words<=52 for p in a for n in p.notes)
    for p in a:
        for skill in SKILLS:
            for budget in BUDGETS:
                for method in METHODS:
                    r=outcome(p,skill,method,budget)
                    assert r["words"]<=budget or method == "full_history"
                    assert r["predicted"] in ("strong","weak","abstain")
                    assert len(r["chosen_ids"])==r["notes"]
    assert hashlib.sha256(json.dumps([p.as_dict() for p in a],sort_keys=True).encode()).digest()==hashlib.sha256(json.dumps([p.as_dict() for p in generate(SEED_DEV,2,"unit")],sort_keys=True).encode()).digest()


def run(outdir:Path):
    validate()
    outdir.mkdir(parents=True,exist_ok=True)
    dev=generate(SEED_DEV,N_DEV,"dev")
    holdout=generate(SEED_TEST,N_TEST,"test")
    # All scoring constants defined at module import; dev evaluated for smoke only.
    test_rows=[]
    for p in holdout:
        for skill in SKILLS:
            for budget in BUDGETS:
                for method in METHODS:
                    if method=="full_history" and budget!=BUDGETS[0]:continue
                    test_rows.append(outcome(p,skill,method,budget))
    dev_rows=[outcome(p,s,"adaptive",BUDGETS[0]) for p in dev for s in SKILLS]
    summary=summarize(test_rows)
    ci=cluster_bootstrap(test_rows)
    clocks=timing(holdout)
    write_csv(outdir/"results_summary.csv",summary)
    write_csv(outdir/"holdout_query_results.csv",test_rows)
    write_csv(outdir/"host_cpu_timing.csv",clocks)
    with (outdir/"synthetic_holdout.jsonl").open("w",encoding="utf-8") as f:
        for p in holdout:f.write(json.dumps(p.as_dict(),ensure_ascii=False)+"\n")
    with (outdir/"synthetic_dev.jsonl").open("w",encoding="utf-8") as f:
        for p in dev:f.write(json.dumps(p.as_dict(),ensure_ascii=False)+"\n")
    cfg={"dev_seed":SEED_DEV,"test_seed":SEED_TEST,"dev_profiles":N_DEV,
         "test_profiles":N_TEST,"test_queries":N_TEST*len(SKILLS),"word_budgets":BUDGETS,
         "change_day":CHANGE_DAY,"source_weights":SOURCE_WEIGHTS,
         "source_label_noise":SOURCE_NOISE,"decision_decay_days":DECISION_HALF_LIFE,
         "adaptive_ranking_decay_days":RANK_HALF_LIFE,
         "approach":"metadata-indexed synthetic retrieval + deterministic evidence-only classifier",
         "no_llm_or_edge_execution":True,"source_sha256":hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
         "dataset_sha256":hashlib.sha256((outdir/"synthetic_holdout.jsonl").read_bytes()).hexdigest(),
         "dev_smoke_accuracy":round(sum(r["correct"] for r in dev_rows)/len(dev_rows),4)}
    payload={"config":cfg,"summary":summary,"paired_bootstrap":ci,"host_timing":clocks,
             "accuracy_by_group":[
                 {"method":method,"budget":budget,"group":group,
                  "queries":len(sub),"accuracy":round(sum(r["correct"] for r in sub)/len(sub),4)}
                 for budget in BUDGETS for method in ("recency","topic_recent","source_only","adaptive")
                 for group in ("stable","drift","mixed")
                 if (sub:=[r for r in test_rows if r["method"]==method and r["word_budget"]==budget and r["group"]==group])
             ]}
    (outdir/"results.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    # Export representative failure case(s), chosen programmatically from heldout outputs.
    pairs=defaultdict(dict)
    for r in test_rows:
        if r["word_budget"]==52 and r["method"] in ("adaptive","topic_recent","recency","source_only"):
            pairs[(r["profile"],r["skill"])][r["method"]]=r
    examples=[]
    indexed={p.id:p for p in holdout}
    for (pid,skill),results in pairs.items():
        if len(results)==4 and results["adaptive"]["correct"] and not results["topic_recent"]["correct"]:
            p=indexed[pid]
            examples.append({"profile":pid,"group":p.group,"skill":skill,
                             "old_state":p.previous[skill],"current_true_state":p.current[skill],
                             "methods":{m:{"prediction":r["predicted"],"chosen_ids":r["chosen_ids"]} for m,r in results.items()},
                             "skill_notes":[n.as_dict() for n in p.notes if n.skill==skill]})
        if len(examples)>=3:break
    (outdir/"failure_cases.json").write_text(json.dumps(examples,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    return payload


if __name__=="__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--outdir",type=Path,default=Path(__file__).resolve().parent/"outputs")
    args=parser.parse_args()
    d=run(args.outdir)
    print("SYNTHETIC heldout queries:",d["config"]["test_queries"])
    for s in d["summary"]:print(s)
    print("Paired profile bootstrap:",d["paired_bootstrap"])
    print("Output:",args.outdir)
