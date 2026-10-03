# TwinMem Pilot 14 — baseline-information robustness

Pilot 10 showed that the frozen Pilot-9 plug-in process improves sharply as baseline evidence grows, but only 48 labels/source received the full fresh misspecification stress.

Pilot 14 asks the clean follow-up:

> Do 96 or 192 baseline labels/source make the original Pilot-9 process robust across fresh unbiased and ±0.03 null misspecification?

## Frozen

- Pilot-9 delta = 0.25
- Pilot-9 alpha = 0.10
- stages 8 / 12 / 24 / 48
- same detection goals
- same efficiency goals
- no detector retuning
- no model change

## Baseline sizes

- 96 labels/source
- 192 labels/source

## Fresh stress patterns

Each baseline size is tested on the same independent recent pools under:

- no added p0 bias
- all p0 +0.03
- all p0 -0.03
- source skew: verified +0.03, self-report -0.03, practice unchanged

500 repeats per size × pattern × scenario.

## Robustness definition

A baseline size is called robust only if **every stress pattern** passes:
- stationary false alarms <= 10%
- moderate detection >= 80%
- severe detection >= 90%
- moderate mean labels/source <= 36
- severe mean labels/source <= 24

This phase has no selection/tuning step.
