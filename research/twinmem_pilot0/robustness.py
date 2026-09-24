#!/usr/bin/env python3
"""Post-hoc stress tests, transparently exploratory and not preregistered."""
import json
import random
from pathlib import Path
import benchmark as b

OUT=Path(__file__).resolve().parent/'outputs'


def evaluate(profiles,name):
    rows=[]
    for p in profiles:
        for skill in b.SKILLS:
            for budget in b.BUDGETS:
                for method in ('topic_recent','source_only','adaptive'):
                    rows.append(b.outcome(p,skill,method,budget))
    return {'scenario':name,'profiles':len(profiles),'queries':len(profiles)*len(b.SKILLS),'summary':b.summarize(rows)}


def main():
    # OBSERVED source-reliability assumptions are deliberately broken:
    # formal tests become noisy while informal self reports become highly reliable.
    baseline=b.SOURCE_NOISE.copy()
    try:
        b.SOURCE_NOISE.update({'verified_assessment':0.36,'practice_result':0.20,'self_report':0.05})
        reversed_quality=b.generate(20260926,240,'shifted')
    finally:
        b.SOURCE_NOISE.clear();b.SOURCE_NOISE.update(baseline)
    result1=evaluate(reversed_quality,'source_quality_shift_not_seen_at_method_design')

    # Post-hoc: remove both recent verified assessments for one target skill per
    # profile; other skills remain. This tests evidence scarcity, not performance on real logs.
    original=b.generate(20260927,240,'scarce')
    scarce=[]
    rng=random.Random(26)
    for p in original:
        remove_skill=rng.choice(b.SKILLS)
        cleaned=tuple(n for n in p.notes if not (n.skill==remove_skill and n.source=='verified_assessment' and n.day>=b.CHANGE_DAY))
        scarce.append(b.Profile(p.id,p.group,p.previous,p.current,cleaned))
    result2=evaluate(scarce,'one_skill_recent_verified_assessments_removed')
    output={'status':'exploratory_robustness_after_primary_holdout_inspection',
        'warning':'The alternate data generators were chosen after inspecting primary results; do not label these preregistered confirmatory findings.',
        'results':[result1,result2]}
    (OUT/'robustness.json').write_text(json.dumps(output,indent=2)+'\n')
    print(json.dumps(output,indent=2))

if __name__=='__main__':main()
