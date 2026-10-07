import { buildQuestionManifest } from "./exam-engine.js";

const pct = (n, d) => d ? Math.round((n / d) * 1000) / 10 : 0;

export function buildTopikAttemptEvidence(paper, entry = {}, scoreResult = null) {
  const manifest = buildQuestionManifest(paper);
  const objective = manifest.filter((item) => item.responseType === "choice");
  const writing = manifest.filter((item) => item.responseType === "writing");

  const bySection = new Map();
  for (const item of manifest) {
    if (!bySection.has(item.section)) {
      bySection.set(item.section, {
        section: item.section,
        total: 0,
        answered: 0,
        correct: null,
        incorrect: null,
        unanswered: 0,
        accuracy: null,
      });
    }
    const row = bySection.get(item.section);
    row.total += 1;

    if (item.responseType === "writing") {
      const response = String(entry?.writing?.[item.id] || "").trim();
      if (response) row.answered += 1;
      else row.unanswered += 1;
    } else {
      const response = String(entry?.answers?.[item.id] || "");
      if (response) row.answered += 1;
      else row.unanswered += 1;
    }
  }

  if (scoreResult?.status === "scored") {
    for (const section of scoreResult.sections || []) {
      const row = bySection.get(section.section);
      if (!row) continue;
      row.correct = Number(section.correct || 0);
      row.incorrect = Number(section.incorrect || 0);
      row.unanswered = Number(section.unanswered || 0);
      row.accuracy = pct(row.correct, row.correct + row.incorrect);
    }
  }

  const sections = [...bySection.values()];
  const answered = sections.reduce((sum, row) => sum + row.answered, 0);
  const total = sections.reduce((sum, row) => sum + row.total, 0);
  const completedAt = entry?.finishedAt || null;
  const startedAt = entry?.startedAt || null;

  let durationSeconds = null;
  if (startedAt && completedAt) {
    const start = Date.parse(startedAt);
    const finish = Date.parse(completedAt);
    if (Number.isFinite(start) && Number.isFinite(finish) && finish >= start) {
      durationSeconds = Math.round((finish - start) / 1000);
    }
  }

  return {
    id: ["topik", paper?.id || "unknown", completedAt || startedAt || "draft"].join(":"),
    paperId: paper?.id || "",
    round: Number(paper?.round || 0),
    level: paper?.level || "",
    startedAt,
    completedAt,
    submitted: !!entry?.submitted,
    durationSeconds,
    totalResponses: total,
    answeredResponses: answered,
    completionPercent: pct(answered, total),
    objectiveQuestionCount: objective.length,
    writingQuestionCount: writing.length,
    scored: scoreResult?.status === "scored",
    verifiedPercent: scoreResult?.status === "scored" ? Number(scoreResult.percent || 0) : null,
    verifiedEarned: scoreResult?.status === "scored" ? Number(scoreResult.earned || 0) : null,
    verifiedPossible: scoreResult?.status === "scored" ? Number(scoreResult.possible || 0) : null,
    sections,
  };
}

export function summarizeTopikEvidence(attempts = []) {
  const rows = (attempts || []).filter((row) => row && row.paperId);
  const submitted = rows.filter((row) => row.submitted);
  const scored = submitted.filter((row) => row.scored && Number.isFinite(row.verifiedPercent));

  const sectionMap = new Map();
  for (const attempt of submitted) {
    for (const section of attempt.sections || []) {
      const current = sectionMap.get(section.section) || {
        section: section.section,
        attempts: 0,
        answered: 0,
        total: 0,
        scoredAttempts: 0,
        accuracySum: 0,
      };
      current.attempts += 1;
      current.answered += Number(section.answered || 0);
      current.total += Number(section.total || 0);
      if (Number.isFinite(section.accuracy)) {
        current.scoredAttempts += 1;
        current.accuracySum += Number(section.accuracy);
      }
      sectionMap.set(section.section, current);
    }
  }

  const sections = [...sectionMap.values()].map((row) => ({
    section: row.section,
    attempts: row.attempts,
    completionPercent: pct(row.answered, row.total),
    accuracy: row.scoredAttempts ? Math.round((row.accuracySum / row.scoredAttempts) * 10) / 10 : null,
  }));

  const weakest = sections
    .filter((row) => Number.isFinite(row.accuracy))
    .sort((a, b) => a.accuracy - b.accuracy || a.section.localeCompare(b.section))[0] || null;

  return {
    attempts: rows.length,
    submitted: submitted.length,
    scored: scored.length,
    averageVerifiedPercent: scored.length
      ? Math.round((scored.reduce((sum, row) => sum + row.verifiedPercent, 0) / scored.length) * 10) / 10
      : null,
    sections,
    weakestSection: weakest,
  };
}
