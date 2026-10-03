# TwinMem Pilot 8 — alpha-spent early stopping

Pilot 7 meets detection and efficiency goals, but its repeated-look stopping rule is heuristic.

Pilot 8 adds explicit multiplicity control to the **early-stop looks**.

## Frozen

- Pilot-5 posterior reliability model
- meaningful change margin 0.05
- final stage 48 labels/source
- final-stage z = 1.96
- Pilot-3 retrieval response
- detection criteria
- efficiency criteria

## Early looks

At 8, 12, and 24 labels/source, Pilot 8 spends an explicit early familywise alpha budget.

Candidate total early alpha budgets:
- 0.03
- 0.05
- 0.07

Spending shapes:
- front: 50% / 30% / 20%
- equal: 1/3 each
- late: 20% / 30% / 50%

Each stage alpha is additionally Bonferroni-corrected across the 3 source types, then converted to a two-sided normal z boundary.

The 48-label final decision remains the frozen Pilot-5 rule.

## Development-only selection

A candidate must pass:
- stationary false alarms <= 10%
- moderate detection >= 80%
- severe detection >= 90%
- moderate mean labels/source <= 36
- severe mean labels/source <= 24

Among passing candidates, choose the lowest moderate/severe average label cost, then lower stationary false alarm, then smaller early alpha budget.

## Caveat

This is stronger multiplicity control than Pilot 7, but not a proof of full anytime validity:
- the score uses a Beta-normal approximation
- the final fixed Pilot-5 decision is outside the early alpha-spending budget
