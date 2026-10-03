# My AI Twin Made a Study Buddy: Consent-Gated Reciprocal Agent Negotiation for Human–Human Korean Language Learning

**Manuscript scaffold v0.1 · Work in progress · Not a submitted or accepted paper**
**Author(s):** [Fill in after confirming actual contributions and supervisor]
**Repository / prototype:** Hallium, `/ai-twins`
**Companion document:** `AI_DOPPELGANGER_CONCEPT_PROTOCOL_V01.md`

> This is an honest theory-and-method manuscript scaffold. The abstract below is a **prospective research abstract**, not a report of completed results. It must be rewritten after data collection. Do not submit the paper with placeholders.

## Abstract (PROPOSED METHODS, NO RESULTS)

Finding a useful language-learning partner requires more than locating someone at a similar level: both learners need feasible schedules, complementary learning needs, a concrete activity and freedom to decline. We propose **AI Doppelgänger**, a consent-gated framework in which two large-language-model agents, constrained by the learner attributes their human owners authorize, negotiate a reciprocal Korean-language learning proposal. Distinct from AI roleplay tutors, the agents facilitate a potential relationship **between two real humans**, and neither agent can approve the meeting on a human's behalf. We describe a working Hallium prototype, theoretical links to reciprocal teaching and the ICAP framework, an offline fidelity benchmark, and a prospective controlled comparison with random eligible, similarity-based and rule-based complementary matching. The primary proposed endpoint is bilateral acceptance followed by completion of a 15-minute activity within seven days. Secondary endpoints include delayed grammar/vocabulary retention, both learners' perceived usefulness, erroneous claims, privacy-boundary violations and latency. This paper will evaluate whether agent negotiation contributes measurable value beyond transparent matching and friendly generated language; no effectiveness results are claimed at this stage.

**Keywords:** agent-mediated collaboration; Korean as a foreign language; peer matching; reciprocal teaching; LLM agents; privacy; human-in-the-loop.

## 1. Introduction

Korean-learning communities can connect people across proficiency levels, schedules, interests and strengths, but forming a pair is not equivalent to helping the pair learn. One learner may recall vocabulary while struggling with particles; another may explain particles but lack vocabulary. Such reciprocity may create opportunities for teaching-by-explaining, but a superficially complementary pair may also be unable to meet or unwilling to practise together.

Recent AI-assisted language tools often provide a machine *as* the conversational partner. Our central design is different: the AI acts temporarily **on behalf of each human learner** to assemble a mutually inspectable proposal, after which the two humans choose whether to collaborate.

The working Hallium prototype accepts opted-in summaries, prompts two sequential LLM representatives for four dialogue turns, proposes a three-part 15-minute activity, and requires two separate approval actions before opening an existing Study Partners room. Its twelve fictional AI language guides are a product cold-start intervention and are not counted as learner-participants, experimental data, or an alternative matching arm.

The present paper asks whether an agent conversation has incremental value **beyond** static reciprocal rules; mere user enjoyment of an animated twin, greater acceptance caused by persuasive language, or an appealing interface are not sufficient evidence of actual learning gains.

### Claimed contributions — replace/qualify based on evidence

1. A reproducible **consent-gated architecture** for two learner representatives to negotiate a proposed **human-to-human** study activity, with bilateral approval and narrow attribute disclosure.
2. An experimentally testable **decomposition of matching versus activity generation** that separates complementary matching, LLM negotiation and AI-written rationale.
3. An evaluation protocol reporting partnership completion, independent language learning outcomes, profile-grounding errors and privacy failures, with negative results explicitly retained.

**Not currently claimed:** first-ever approach, empirically superior matches, general AI twins, longitudinal personalization, validated TOPIK score improvements or autonomous friendship formation.

## 2. Theory and related work

### 2.1 Reciprocal engagement

ICAP distinguishes modes of cognitive engagement and links interactive exchange to hypotheses about learning processes (Chi & Wylie, 2014). Our proposed practice alternates two explanatory roles rather than relying only on mutual correction. Reciprocal teaching literature and 2025 agent-assisted reciprocal-teaching experiments make the mechanism plausible but cannot substitute for a Korean-language comparison. See companion protocol [1–4].

### 2.2 Similarity versus complementarity

A profile-similarity baseline uses level, interests and availability; a reciprocal baseline values two-way skill exchange. Complementarity is not necessarily superior: its benefits may be offset by teaching-quality gaps or awkward partner dynamics. A 2024 scholarly-collaboration finding favoring similarity in another population motivates a non-confirmatory rival explanation, not direct extrapolation to language learning. See companion protocol [8].

### 2.3 Limited digital representations

The Hallium agent is prompted with consented attributes and recent dialogue, not a full behavioral digital twin. Literature on human generative-agent simulations often grounds agents in far richer information and emphasizes validation and consent. Therefore, our fidelity measures must test actual statements against allowed learner records and the human learners' own assessments. See companion protocol [5,7].

### 2.4 Privacy as a system constraint

Model-level instructions do not constitute a complete disclosure guarantee. Constrain outbound input with a server-side whitelist, apply consent at every meeting request, verify access through Supabase RLS, and prevent agents from approving matches. Disclosing attributes to the external LLM provider must be covered separately from displaying a summary to a potential human partner. See companion protocol [6].

## 3. Method (PROPOSED)

### 3.1 Participants

A small consenting, eligible adult two-account technical pilot is for functionality only. The 12-founder product milestone is not the experiment's sample size. For a comparative study, determine recruitment, consent, power and analysis plan prospectively with an appropriate research supervisor; do not recruit under a claim of university approval if none has been obtained.

### 3.2 Treatment and baselines

All arms draw from the same eligible partner pool and must respect self-exclusion, blocks, opted-in visibility and schedule compatibility:

- Random eligible matching.
- Conventional profile similarity.
- Frozen rule-based reciprocal complementarity.
- LLM-based negotiation with fixed dialogue budget, validated output and human approval.

Equalize displayed proposal format and opportunity to practise across arms. If comparing generated versus standardized lesson plans, add independent task-generation randomization or explicitly acknowledge confounding.

### 3.3 Procedure

Consent → independent pretest → eligible dyad assignment → proposal shown to both people → two independently logged decisions → shared 15-minute Korean task → immediate parallel-form post-test → seven-day delayed test → brief private usefulness/privacy survey.

### 3.4 Outcomes and quality safeguards

Primary proposed endpoint: share of assigned eligible dyads in each condition with both approvals AND a completed activity in seven days.

Secondary: per-learner test gain, delayed recall, invitation refusal, rate of unsupported agent claims, out-of-schema disclosures, unequal speaking role allocation, cost, timeouts and perceived usefulness **from both people**. An external Korean-proficient rater should grade sampled learner responses and AI-generated practice for difficulty/content validity without knowing treatment arm when feasible.

### 3.5 Analysis plan

Choose T-versus-rule as the primary comparison before exposure. Report absolute difference, confidence intervals, denominator and missingness. Respect dyads in sampling and inference; track attrition and outcomes of people who decline instead of analyzing only successful pairs. Label mediation and subgroup tests exploratory unless pre-registered and adequately powered.

## 4. Results — NOT COLLECTED

No table, p-value, confidence interval, improvement percentage or qualitative participant quote belongs here until **real, consented data** are acquired and checked. Engineering tests and Vercel deployment logs are implementation evidence, not pedagogical outcomes.

Future results tables:
- R1: participant and dyad flow per arm (eligible, assigned, shown, both approved, completed, withdrew).
- R2: primary completion endpoint with confidence intervals.
- R3: pre/post/delayed item performance with attrition.
- R4: grounding/disclosure errors, latency, API cost and dropout.
- R5: failures and negative qualitative feedback.

## 5. Discussion — QUESTIONS FOR AFTER RESULTS

Did negotiation actually supply information absent from fixed rules? Was a supposed effect instead generated by different content or persuasive copy? Did both people benefit, or only the self-described weaker learner? Were any matched learners pressured or uncomfortable? Did privacy constraints reduce useful personalization? What generalizes beyond Hallium's self-selected early adopters and beginner vocabulary/grammar exercises?

## 6. Limitations (already evident)

A single platform, narrow initial skill categories, self-selected profiles, provider/model variability, non-independent network connections, possible interaction spillover, LLM hallucination, user drop-out, and the absence of a currently validated measure of a "good match." A two-person family pilot cannot establish educational efficacy.

## 7. Conclusion — TO WRITE AFTER ANALYSIS

Until the prospective data exist, the conclusion may describe **only the system and evaluation protocol**. Do not fill in a favorable verdict beforehand.

## References

Use the eight verified starting references and bibliographic accuracy caveat in `AI_DOPPELGANGER_CONCEPT_PROTOCOL_V01.md`; extend with a logged structured literature review before scholarly submission.
