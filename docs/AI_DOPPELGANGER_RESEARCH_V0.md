# Hallium Research Room: AI Doppelgänger (V0)

Status: **private-branch, simulated research prototype — NOT a live user matchmaking service.**

## What exists

Route: `/research/ai-twins` on the research branch. An interactive standalone Hallium demo lets one person describe their Korean learning focus, explicitly opt in, inspect four **fictional** learning twins, view transparent complementary-skill explanations, read a **scripted** twin-to-twin introduction, and approve a 15-minute practice plan **locally**.

- The demo does **not** use a generative model, Supabase, Google login, other people's profiles, an outbound network request, or persistent browser storage.
- The four names and bios are invented fixtures, not Hallium members or actual consent records.
- The 0–100 match score is a hand-designed matching heuristic, **not** a validated prediction of learning outcomes.
- Clicking “Approve” does not send a request, open a real room, or share any private information.
- Nothing from the existing production Study Partners database or RLS policies is modified.

## Research hypothesis (not a claim of measured improvement)

Can reciprocal, evidence-grounded learner-agent matching improve the quality of complementary learning partnerships compared with conventional profile similarity matching **without disclosing raw learning records**?

## Initial design

`lib/ai-twins/demo.mjs` implements a reversible, inspectable score:

- 35 points if candidate's self-reported strength matches the learner's growth area.
- 35 points if learner's strength matches the candidate's growth area.
- up to 15 points for proximity of self-selected Korean level.
- 15 points for overlapping or flexible availability.

Consent and valid, distinct skill categories are **hard gates**. Scores only provide demo ordering; they must not be marketed as science or as inferred teaching competence.

## What a supervised study would require

1. Define an explicit **baseline**: random matching, profile similarity, and Hallium's current complementary-focus matcher.
2. Define outcome measures **before** running an experiment: opt-in acceptance, session completion, partner-reported usefulness, delayed vocabulary/grammar retention, fairness across proficiency levels, and user discomfort.
3. Use consenting adult research participants. Avoid collecting or exposing raw private mistakes or notebook content by default; support revocation and deletion.
4. Separate **offline simulation** from a real controlled user study. Avoid claims about effective learning until evaluated.
5. Use a held-out study group and publish both positive and negative findings. Request research-ethics review as appropriate before recruiting people or processing their learning records.

## Local checks

From the repository root:

```bash
node --test tests/ai-twins-demo.test.mjs
npm ci
npm run build
npm run dev
```

Open `http://localhost:3000/research/ai-twins`. No environment variables are required for this simulated route.

## Next milestone (NOT implemented)

A mutually authorized, authenticated opt-in research cohort using narrowly scoped skill summaries from the existing partner profile architecture, clear AI-agent identity, on-demand explicit permission for each twin interaction, an agreed-on activity, and audit logs. Before implementing this: privacy review, threat model, careful RLS design, and an evaluation protocol. No unattended agent-to-agent messaging with real users.
