# TwinMem Pilot 13 — posterior-predictive null + point alternatives

Pilot 12's null uncertainty handling was promising for specificity, but diffuse shifted-Beta alternatives lost too much moderate-shift power.

Pilot 13 changes **only the alternative model**.

## Frozen

- 48 baseline labels/source
- null = Beta posterior predictive
- delta = 0.25
- alpha = 0.10
- stages 8 / 12 / 24 / 48
- Beta(2,2) baseline prior
- unchanged detection + efficiency goals
- no hyperparameter grid

## Alternatives

For each source, baseline posterior mean is `m`.

Point alternatives:
- `m - 0.25`
- `m + 0.25`

clipped to valid Bernoulli probabilities.

The null remains integrated over the full Beta posterior.

## Evaluation

Development first.

Only if all development goals pass do we run fresh:
- unbiased
- all posterior means +0.03
- all -0.03
- source-skew ±0.03

## Interpretation

Conditional on baseline data, this is a Bayesian model comparison between:
- a posterior-predictive null mixture, and
- degenerate point alternatives.

It is not claimed to provide uniform frequentist anytime-validity.
