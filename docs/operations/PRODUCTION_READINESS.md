# Hallium production readiness and incident procedure

## Gates (required before declaring production ready)
1. Mergeable PR is not a passed test suite. Check the exact PR head's `Verify standalone Hallium`, `Hallium Security Gate`, and other applicable workflows for **success**.
2. Confirm the deployed commit corresponds to the intended `main` commit; GitHub merge does not guarantee deployment.
3. Trigger the **Verify Hallium production health** workflow manually. It checks /api/health, /offline and /community without any user tokens.
4. Exercise authenticated sign-in, lesson continuation, private sync, practice and review on staging or a permitted non-sensitive test account. Never use a real learner's data for smoke tests.
5. Verify cache-control of health endpoint and that /sw.js does not retain authenticated responses.
6. Monitor logs and incidents in the actual deployment platform, separately from successful build status.

## Incident posture
- If public health fails: verify deployment status and external network before declaring application outage.
- If private auth, persistence or data isolation is degraded: halt rollout; investigate RLS and access logs before retrying. Do not print tokens or learner records.
- If new release regresses behavior: use the hosting provider's verified rollback to a known-good deployment, then confirm functionality.
- Never automatically retry destructive writes or bypass permission checks to restore availability.

## Limits
The health endpoint tests application liveness, not database readiness, user identity, payment, lesson correctness or the end-to-end learning loop.
Manual smoke scripts are opt-in and cannot prove a deployment exists merely because a PR has merged.
