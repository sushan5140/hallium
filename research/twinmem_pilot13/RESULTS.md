# TwinMem Pilot 13 results — posterior-predictive null + point alternatives

**Executed by GitHub Actions on 3 October 2026.**  
**Status:** reproducible synthetic research experiment only.

Pilot 13 changes only one thing from Pilot 12:
- null remains the full Beta posterior predictive
- alternatives become point reliabilities at posterior mean ±0.25

Everything else is frozen:
- 48 baseline labels/source
- alpha = 0.10
- stages 8 / 12 / 24 / 48
- Beta(2,2) baseline prior
- unchanged detection + efficiency goals

## Development result

| Scenario | Detection | Mean labels/source |
|---|---:|---:|
| Stationary | **3.75% false alarms** | 46.81 |
| Moderate shift | **51.56%** | **39.85** |
| Severe shift | **94.38%** | **23.23** |

All goals: **FAIL**

Moderate-shift requirements:
- detection ≥80%; observed **51.56%**
- mean labels/source ≤36; observed **39.85**

Therefore:
- held-out unbiased evaluation was not run
- bias stress was not run

## Main finding

Restoring point alternatives does **not** fix Pilot 12's power loss.

Pilot 12 moderate detection: 51.33%  
Pilot 13 moderate detection: 51.56%

The values are essentially unchanged.

That isolates the bottleneck more clearly:
the broad posterior-predictive null at only 48 baseline labels/source is itself absorbing too much of the moderate reliability shift.

## Interpretation

Pilot 10 already showed that the plug-in process becomes substantially more stable as baseline evidence increases:
- 48 labels/source: marginal pass on one curve, fresh failure
- 96: lower false alarms and improved moderate detection
- 192: stronger still

Pilots 11–13 show that sophisticated uncertainty handling at 48 labels/source sacrifices too much power.

The next clean question is therefore informational:

> Does simply increasing baseline evidence to 96 or 192 labels/source make the original Pilot-9 process robust on fresh unbiased and ±0.03 misspecification stress?

That should be tested before adding more model complexity.

## Limits

- synthetic profiles only
- correctness labels are privileged simulator truth
- posterior-predictive null comparison is Bayesian, not uniform frequentist anytime-validity
- no human data
- no production Hallium changes

Production Hallium remains untouched.
