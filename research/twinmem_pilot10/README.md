# TwinMem Pilot 10 — plug-in null estimation robustness

Pilot 9's main statistical caveat is that its e-process null probabilities are estimated rather than known.

Pilot 10 freezes Pilot 9:
- delta = 0.25
- alpha = 0.10
- stages 8 / 12 / 24 / 48

and varies only the baseline evidence used to estimate p0.

## Baseline labels/source

- 12
- 24
- 48
- 96
- 192

For every repeat:
1. independently sample the baseline labels/source,
2. estimate p0 with the same Beta(2,2) smoothing family,
3. run the frozen Pilot-9 process on an independent recent stream.

The same detection and efficiency goals remain fixed.

## Descriptive threshold

The smallest baseline sample size passing all goals is reported.

It is not used to retune delta or alpha.

## Mild null-misspecification stress

On separate fresh pools, the minimum passing baseline size is stressed with:

- no bias
- +0.03 to all p0
- -0.03 to all p0
- source skew: verified +0.03, self-report -0.03

This measures how fragile false-positive control and sensitivity are to small plug-in null errors.

## Limits

Synthetic research only. This does not prove anytime-validity under an estimated null.
