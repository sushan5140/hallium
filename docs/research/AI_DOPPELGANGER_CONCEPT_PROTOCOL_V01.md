# My AI Twin Made a Study Buddy
## Consent-Gated Reciprocal Agent Negotiation for Human–Human Korean Language Learning
**Research concept + preregistration-ready protocol, v0.1 — 25 September 2026**

**Status:** Proposed research, NOT a completed experiment, accepted paper, validated matchmaking system, or promise of learning improvement. This protocol is separate from the 12 fictional AI tutor cast and the product's growth milestone.

### 1. The one-sentence hook

**Can two AI representatives negotiate a better *human* Korean-language learning partnership than a conventional matching algorithm, using only information each learner agrees to share?**

The AI representatives are a tool for introducing two real people; they are not substitute friends or autonomous agents authorized to agree to a human relationship. The humans retain the last word.

### 2. Research problem, not the product pitch

Language-partner discovery usually begins with static similarities (proficiency, availability, interests) or fixed complementary-skill rules. Both can overlook constraints, inaccurate self-reports, unequal ability to teach, and whether the pair can agree on one *specific* activity. An LLM-mediated dialogue can propose a plan, but may also fabricate abilities, disclose information outside the user's permission, or persuade people with fluent wording rather than substantively better matches.

We ask whether the incremental **agent-to-agent negotiation** offers a measurable advantage over a transparent reciprocal matching rule when all other conditions are controlled. "Complementarity is better" is a **hypothesis to test, not an axiom**: a 2024 study in a different population (scholarly collaborators) found similarity associated with collaboration while complementarity showed no detectable performance effect in that context [8]. We do not generalize its results to beginner Korean learners; it supplies a rival hypothesis.

### 3. Conceptual grounding

- **ICAP and active reciprocal explanation.** The ICAP model proposes differences in engagement between passive, active, constructive and interactive activities. A partnership that requires each learner to *explain* something and *use* a new concept might offer more interactive opportunities than passive content consumption [1]. This rationale does not itself establish that Hallium improves learning.
- **Reciprocal peer teaching.** Learners may alternate teaching and learning roles; systematic review literature supports treating reciprocal teaching as a plausible mechanism to investigate, without assuming any exact effect in Korean learning [2]. More recent work compared scripted pedagogical and teachable agents in collaborative learning [3].
- **AI agents in computer-supported collaborative learning.** A June 2026 systematic review of 46 empirical studies found diverse agent roles and context-dependent non-cognitive outcomes; Hallium's dyadic *formation and practice* mechanism requires its own evaluation [4].
- **Human simulation is uncertain.** Generative agents may capture some individual responses if grounded in rich self-reports, but the existing Hallium twin has only short self-shared attributes. Treat it as a **negotiating representative of a limited learner profile**, NOT an empirically faithful psychological "digital copy" [5].
- **Explicit privacy boundaries.** Privacy decisions should not be delegated solely to a model: prior 2026 privacy research reports limitations of prompts/in-context examples and investigates rule-based disclosure reasoning [6]. Hallium must whitelist attributes *before* any provider call and make both humans approve *after* an agent proposal.

### 4. Research questions

- **RQ1 — Partner formation:** Does an agent-negotiated recommendation improve **mutual acceptance followed by completion of one paired 15-minute Korean practice activity within 7 days** compared with a profile-similarity or reciprocal-rule recommendation?
- **RQ2 — Learner outcomes:** Among randomized eligible users, do learner-level grammar/vocabulary scores or 7-day delayed recall differ across conditions after equal practice opportunity?
- **RQ3 — Mechanism:** Does a specific jointly authored activity and reciprocal teaching role allocation explain any difference in partnership completion, beyond simply showing a friendly AI-generated rationale?
- **RQ4 — Reliability and consent:** How often do agent proposals contain unsupported skill claims, inaccurate Korean, invalid availability claims or disclosure outside the permissioned profile?
- **RQ5 — Equity:** Are invitation acceptance, task completion and error rates materially different by self-reported proficiency and availability constraints?

### 5. Testable hypotheses (prospective)

- **H1 (primary candidate):** A negotiated agent condition increases the share of **eligible assigned dyads** who both accept and complete a session in seven days relative to a pre-specified static matching baseline. Assess with a confidence interval; null and negative effects are legitimate findings.
- **H2 (secondary, not assumed):** A jointly tailored reciprocal-role plan leads to improved delayed item retention versus a standardized activity of equal length and difficulty.
- **H3 (mechanism):** Two-way relevance, as independently rated by BOTH learners, mediates any relationship between condition and completed sessions. Treat mediation as exploratory unless study design and sample support it.
- **H4 (guardrail):** Attribute disclosure outside the explicit allowed schema is zero in programmatic logs; manually coded unsupported agent claims are reported, not hidden.

### 6. Proposed system architecture

```
Account A (opt-in)                    Account B (opt-in)
  ↓ allowed Korean-learning fields      ↓ allowed Korean-learning fields
        Privacy/eligibility gate: two valid public summaries only
                      ↓
           Selection/negotiation condition
             ↙        ↓          ↘
       Similarity  Reciprocal rule  Two prompted LLM agents
             ↘        ↓          ↙
        Transparent proposal + teaching activity
                      ↓
         Separate human A/B approvals
                      ↓
           Existing Hallium Study Partners
                      ↓
       Test → practise → feedback → delayed test
```

The AI starter teachers in `/ai-twins/guides` are **never** real participants or a treatment cohort; their retirement at 12 opted-in humans is a rollout decision, not research evidence.

#### Actual implementation today versus future research instrumentation

Already present:
- `/ai-twins`: two real opted-in users can create summaries, run four sequential LLM dialogue turns, read an AI-/fallback-authored 15-minute plan and approve independently.
- `/study-partners`: mutual approval creates a real connection and saves three practice rounds.
- `lib/ai-twins/demo.mjs`: simple inspectable reciprocal heuristic (35+35+up to15+15 score). This score is not validated, should be frozen/renamed for experiments, and should not be treated as truth.
- `/ai-twins/guides`: 12 openly fictional teachers during the cold-start phase; entirely OUTSIDE the prospective human-pair study.

**Not present yet, do not claim implemented:** randomized assignment; study consent separate from product discovery; eligibility by age; validated independent skill assessments; trial registration; experiment event logs with condition version; counterfactual matching comparisons; blinded Korean-language grading; delayed test scheduling; recruitment plan and statistical power determination; trained independent annotation of misleading agent statements.

### 7. Match eligibility and baseline algorithms

Candidate pool = distinct consenting adults who permit human partner discovery; within a practical proficiency gap and with overlapping availability; remove self, blocked pair, and active conflicting pairing. If there is no eligible candidate, log "no match" (do not silently choose someone ineligible). Treat users as *participants*, not the fixed "12 founders" roster.

`C(i,j)=1` when j's *independently assessed or explicitly self-reported* strength supports i's learning need; otherwise 0. A simple reciprocal relevance indicator:

`R(i,j)=[C(i,j)+C(j,i)]/2`

Use feasibility constraints separately rather than hiding them in an invented "96% match" number. If skill self-report disagrees with tested skill, log that as an agent-representation error rather than reinterpreting the record.

**Primary offline/controlled baselines:**
- B0: random **eligible** partner (not arbitrary unsafe random person).
- B1: profile similarity (proficiency proximity, interests and overlap).
- B2: frozen transparent reciprocal complementarity rule (current simple Hallium heuristic, corrected for exclusions).
- T: LLM agent negotiation with the **same inputs and candidate pool**, a fixed dialogue budget, and factual/permission validation.

To isolate "agent negotiation" from "pretty prose", give all conditions comparable proposal presentation. For a larger study, independently randomize plan type: standardized matched lesson versus generated reciprocal-role lesson (2×2 factorial, if sample/power allow). Otherwise describe plan quality as a possible confound.

### 8. Experimental stages and population

**Stage 0 — technical verification (two accounts, you + sister):** verify two distinct authenticated people, chat provider, RLS, pair approval, room handoff, history deletion, and opt-out. No efficacy, significance, or generalization claims.

**Stage 1 — offline method development:** construct a small suite of **clearly simulated** learner profiles with varying levels, schedule conflicts, strengths, needs, inaccurate/underspecified profiles and blocked pairs. Freeze scenarios before tuning. Log match eligibility, failure to decline, reciprocal coverage, unsupported profile claims, constraint violations, token cost and wall-clock latency. Synthetic cases establish engineering correctness, NOT human learning gains or "simulation validated on users".

**Stage 2 — consenting real-user usability pilot:** the first 12 real opt-in profiles may provide a small descriptive **feasibility** sample, if they separately consent to research and are eligible adults. Pretest the survey and lesson, count drop-off and provider failures. Pilot and family data must not be marketed as evidence of effectiveness. Being among the first 12 does not automatically enroll anyone in a study.

**Stage 3 — human comparative study, subject to appropriate ethics review:** recruit an independently justified sample (a sample-size/power calculation is required; DO NOT choose "12" because the website threshold is 12). Match or randomize at a dyad/network level to avoid one participant simultaneously receiving incompatible experimental recommendations. Record non-compliance and attrition. Distinguish recommendation exposure, bilateral acceptance, attendance, and final exercise submission. Do not make unsupported causal claims from voluntary convenience use.

Suggested sequence: baseline grammar/vocabulary test → assignment and recommendation → each human rates recommendation privately → two approvals or decline → structured 15-min practice → immediate parallel-form test → 7-day delayed parallel-form test → privacy/comfort survey. Same target vocabulary and difficulty across conditions; an independent Korean-competent rater reviews generated content.

### 9. Outcomes and analysis contract

**Primary endpoint (if approved/preregistered):** proportion of *assigned eligible dyads* whose **both members approve AND actually complete** the practice within seven days. Numerator/denominator both public in aggregated, non-identifying study results. Also report per-user outcome; count not merely two clicks or agent-to-agent messages as "a successful partnership".

**Secondary outcomes:** bilateral acceptance, attendance, absolute grammar accuracy, vocabulary recall, 7-day delayed retention, role balance, session duration, repeated sessions, learner-rated usefulness (both sides), perceived manipulation/discomfort, transcript fidelity, consent incidents, refusal quality, cost and latency. Report exposure/usage separately from learning.

**Analysis:** specify primary contrast T versus B2 first and correct/label other comparisons; estimate risk difference and uncertainty (confidence intervals), use clustered/dyad-aware analysis, perform intention-to-treat on assigned eligible dyads, report missing delayed scores and attrition by arm. Retention tests should be graded independently of the agent that generated the activities. No cherry-picking TOPIK items after looking at results. Exploratory analyses clearly marked.

**Failure criteria worth publishing:** reciprocal matches lead to fewer completed partnerships; AI overclaims competence; "best-looking" dialogue wins approval but no more learning; privacy leakage; low response diversity; high cost/latency; uneven benefit by level; unusable generated Korean exercises.

### 10. Consent, ethics, and data boundaries

- Adult participants only for any proposed research until a supervised protocol explicitly addresses minors. A consumer app account/feature opt-in does not imply research participation or permission to quote private messages.
- Separate toggles for product discovery, sharing selected learner attributes with LLM, study enrollment, and publication of anonymized excerpts. Show what fields will leave the platform; no raw notes, full learning audit, third-party contact details or private files.
- Partner matching never means consenting to be contacted by AI outside the Hallium session. Both humans approve one particular proposal; revocation blocks future offers. Add procedures to delete/export data, handle withdrawal and determine transcript retention before recruiting.
- Do not use fictional teacher interactions as fake human participant data. Never manufacture tests, p-values, statistics, quotations, reviewers, or "successful matches".
- Consult a faculty supervisor/ethics office before a prospective human-participants study. This file is a research proposal, not an ethics approval.

### 11. Concrete next research-engineering tickets (not yet completed)

**P0: product test:** complete two-account authenticated functional smoke test and Groq logs; document bugs and fixes. The current shipped Vercel page, a successful CI build, and the first-12 threshold are not proof of successful LLM matchmaking.

**P1: research telemetry:** opt-in research study IDs independent of public user IDs; structured condition assignment, candidate pool snapshot (de-identified), provider/model version, constraint gate result, offer, two approvals, session completion, dropout, per-turn latency/tokens/cost, explicit separate study-consent record.

**P2: offline benchmark:** versioned JSONL simulated scenarios, reproducible seeded eligibility baselines B0/B1/B2, negotiator T with fixed model and prompt, run manifest, constraints checker, Korean-content spot-checking.

**P3: content instrument:** two equivalent beginner Korean grammar/vocabulary test forms, item blueprint, blind grading key, standardized 15-minute lesson, pre/post/delayed timing.

**P4: draft preregistration:** finalized primary contrast, eligibility criteria, withdrawal policy, exclusion criteria, missing data handling, statistical plan and prospective target sample/power; external research supervisor to review.

### 12. References verified during concept drafting

[1] Chi, M. T. H., & Wylie, R. (2014). The ICAP Framework: Linking Cognitive Engagement to Active Learning Outcomes. *Educational Psychologist*, 49(4), 219–243. https://doi.org/10.1080/00461520.2014.965823

[2] Mafarja, N. et al. (2023). Using of reciprocal teaching to enhance academic achievement: A systematic literature review. *Heliyon*, 9(7), e18269. https://doi.org/10.1016/j.heliyon.2023.e18269

[3] Scripted interventions versus reciprocal teaching in collaborative learning: A comparison of pedagogical and teachable agents using a cognitive architecture. (2025). *Learning and Instruction*, 96, 102057. https://doi.org/10.1016/j.learninstruc.2024.102057

[4] Artificial intelligence agents in computer-supported collaborative learning: A systematic literature review. (2026). *Computers and Education: Artificial Intelligence*, 10, 100579. https://doi.org/10.1016/j.caeai.2026.100579

[5] Park, J. S., et al. Generative Agent Simulations of 1,000 People (2025); Stanford HAI policy brief on limitations, representative interviews and consent. https://hai.stanford.edu/policy/simulating-human-behavior-with-ai-agents

[6] Flemings, J., et al. (2026). Personalizing Agent Privacy Decisions via Logical Entailment. *Proceedings on Privacy Enhancing Technologies*, 2026(3), 378–407. https://doi.org/10.56553/popets-2026-0087

[7] Liang, K. et al. (2026). Learning Personalized Agents from Human Feedback. Meta AI Research; relevant to dynamic feedback but does not validate this matching scenario. https://ai.meta.com/research/publications/learning-personalized-agents-from-human-feedback/

[8] Ngo, T. (2024). Who Collaborates with Whom and So What? The Role of Expertise Complementarity/Similarity. *Academy of Management Proceedings*. https://doi.org/10.5465/AMPROC.2024.17866abstract

**Literature limitation:** These are adjacent foundations, not proof of novelty or an exhaustive systematic search for agent-mediated Korean-language peer matchmaking. Before submitting, search ACM DL, ACL Anthology, IEEE Xplore, ERIC, Google Scholar and KCI with a dated query log, check newest 2026–2027 work, correct complete bibliographic metadata, and specify exactly which existing baseline the paper extends.
