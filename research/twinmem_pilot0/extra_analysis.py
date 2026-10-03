#!/usr/bin/env python3
"""Additional paired comparisons and HOST CPU retrieval scaling, synthetic only."""
import csv
import json
import platform
import random
import statistics
import time
from collections import defaultdict
from pathlib import Path
from benchmark import SKILLS,BUDGETS, Profile,Note, generate,retrieve,cluster_bootstrap,SEED_DEV

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'outputs'


def paired(rows,a,b, reps=3000):
    result=cluster_bootstrap(rows,a,b,n_reps=reps,seed=92046)
    return result


def scale():
    base=generate(SEED_DEV,1,'scale')[0]
    rng=random.Random(1003)
    rows=[]
    for factor in (1,10,100):
        expanded=[]
        for k in range(factor):
            for n in base.notes:
                expanded.append(Note(f'{n.id}-copy{k}',n.day,n.skill,n.state,n.source,n.text))
        p=Profile(base.id+f'x{factor}',base.group,base.previous,base.current,tuple(expanded))
        for method in ('recency','topic_recent','source_only','adaptive'):
            times=[]
            for _ in range(75):
                skill=rng.choice(SKILLS)
                t=time.perf_counter_ns()
                retrieve(p,skill,method,105)
                times.append((time.perf_counter_ns()-t)/1e6)
            times.sort()
            rows.append({'notes_in_history':len(p.notes),'multiplier':factor,'method':method,
                'budget_words':105,'host':platform.platform(),'repeats':len(times),
                'median_selection_ms':round(statistics.median(times),5),
                'p95_selection_ms':round(times[int(.95*len(times))-1],5)})
    with (OUT/'scaling.json').open('w') as f:json.dump(rows,f,indent=2)
    return rows


def main():
    rows=[]
    with (OUT/'holdout_query_results.csv').open() as f:
        for r in csv.DictReader(f):
            r['word_budget']=int(r['word_budget']) if r['word_budget']!='unbounded' else 'unbounded'
            r['correct']=int(r['correct']); rows.append(r)
    comparisons={
      'adaptive_minus_source_only': paired(rows,'adaptive','source_only'),
      'source_only_minus_topic_recent': paired(rows,'source_only','topic_recent'),
      'adaptive_minus_recency': paired(rows,'adaptive','recency')
    }
    scaling=scale()
    payload={'comparisons':comparisons,'scaling':scaling}
    (OUT/'extra_analysis.json').write_text(json.dumps(payload,indent=2)+'\n')
    print(json.dumps(payload,indent=2))


if __name__=='__main__':main()
