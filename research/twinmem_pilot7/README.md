# TwinMem Pilot 7 — cost-aware stopping boundary

Pilot 6 passed detection but narrowly missed the moderate-shift efficiency target.

Pilot 7 freezes:
- Pilot-5 uncertainty detector
- stages 8 → 12 → 24 → 48
- ordinary margin 0.05
- z = 1.96
- Pilot-3 retrieval action table
- detection and efficiency criteria

and tunes **only one stopping-boundary parameter** on development streams:

`strong_single_stage_threshold`

## Rule

Early drift is declared if either:
1. two consecutive ordinary drift signals occur, or
2. one stage has a very strong lower-bound change above the selected threshold.

At 48 labels/source, the exact Pilot-5 decision remains authoritative.

## Candidate strong thresholds

- 0.08
- 0.10
- 0.12
- 0.15
- 0.18

## Development-only selection

A candidate must satisfy all predeclared goals on development streams:

Detection:
- stationary false alarms <= 10%
- moderate detection >= 80%
- severe detection >= 90%

Efficiency:
- moderate mean labels/source <= 36
- severe mean labels/source <= 24

Among passing candidates:
1. minimize average moderate/severe label cost
2. lower stationary false alarms
3. prefer the higher/more conservative strong threshold

Only then is the selected rule evaluated on separate held-out streams.

## Limits

Synthetic research only. Correctness labels come from privileged simulator truth. Repeated looks are not formally anytime-valid inference.
