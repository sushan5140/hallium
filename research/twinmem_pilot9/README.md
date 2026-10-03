# TwinMem Pilot 9 — mixture likelihood-ratio e-process

Pilot 8's Bonferroni alpha spending was too conservative.

Pilot 9 tests an estimated-null mixture likelihood-ratio process.

For each source, the null is its baseline correctness probability `p0`.
For a candidate drift size `delta`, two point alternatives are used:

- `p0 - delta`
- `p0 + delta`

The global e-value is an equal mixture across:
- 3 source types
- 2 drift directions

Total: 6 likelihood-ratio components.

The process is checked at 8, 12, 24, and 48 labels/source and stops once:

`E >= 1 / alpha`

## Candidate grid

Development-only:
- delta: 0.10, 0.15, 0.20, 0.25
- alpha: 0.05, 0.08, 0.10

A candidate must pass the same detection and efficiency goals as Pilots 6–8.

## Why this is attractive

For a **fixed known null**, a likelihood-ratio mixture is a nonnegative martingale/e-process, so repeated monitoring does not require separate alpha spending at every look.

## Important caveat

Here `p0` is estimated from a separate synthetic baseline pool rather than known exactly. Therefore Pilot 9 is **e-process-style**, not a formal proof of finite-sample anytime validity.

No production Hallium change is proposed.
