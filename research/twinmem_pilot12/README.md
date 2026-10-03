# TwinMem Pilot 12 — posterior-predictive null mixture

Pilot 10 showed a point plug-in null is fragile.
Pilot 11 showed a worst-case null interval destroys too much power.

Pilot 12 uses the full baseline Beta posterior as the null predictive model.

## Frozen

- 48 baseline labels/source
- delta = 0.25
- alpha = 0.10
- stages 8 / 12 / 24 / 48
- Beta(2,2) baseline prior
- same detection + efficiency goals

There is **no null-handling hyperparameter grid** in this phase.

## Null model

For each source, 48 baseline labels produce:

`p ~ Beta(a,b)`

For k correct outcomes in n recent observations, the null sequence likelihood is:

`B(a+k, b+n-k) / B(a,b)`

## Alternative model

Two alternative Beta models/source:
- posterior mean shifted -0.25
- posterior mean shifted +0.25

The alternative models preserve the baseline posterior concentration `a+b`.

The global statistic is the equal mixture of 6 Bayes factors:
3 sources × 2 directions.

Stop when the global mixture reaches 10 (=1/alpha).

## Evaluation

Development uses one set of baseline/recent pools.

Only if development passes all unchanged goals do we run fresh held-out:
- unbiased
- all posterior means +0.03
- all -0.03
- source-skew ±0.03

## Statistical interpretation

Conditional on the baseline posterior, this is a coherent Bayesian posterior-predictive comparison.

It is **not** claimed to give uniform frequentist anytime-valid false-positive control.
