function objectiveSections(paper) {
  return (paper?.sections || []).filter((section) => section.id !== "writing");
}

export function topikQuestionId(sectionId, localIndex) {
  const prefix = sectionId === "listening" ? "L" : sectionId === "reading" ? "R" : "W";
  return prefix + String(localIndex);
}

export function displayQuestionNumber(paper, sectionId, localIndex) {
  if (paper?.level === "I" && sectionId === "reading") return localIndex + 30;
  if (paper?.level === "II" && sectionId === "writing") return localIndex + 50;
  return localIndex;
}

export function buildQuestionManifest(paper) {
  return (paper?.sections || []).flatMap((section) =>
    Array.from({ length: Number(section.count || 0) }, (_, offset) => {
      const localIndex = offset + 1;
      return {
        id: topikQuestionId(section.id, localIndex),
        section: section.id,
        localIndex,
        displayNumber: displayQuestionNumber(paper, section.id, localIndex),
        responseType: section.id === "writing" ? "writing" : "choice",
      };
    })
  );
}

export function validateScoringBundle(paper, bundle) {
  const issues = [];
  if (!bundle || typeof bundle !== "object") return { valid: false, issues: ["Missing scoring bundle"] };
  if (bundle.paperId !== paper?.id) issues.push("Scoring bundle paper id does not match");
  if (!bundle.version || typeof bundle.version !== "string") issues.push("Scoring bundle version is required");
  if (!bundle.verifiedAt || Number.isNaN(new Date(bundle.verifiedAt).getTime())) issues.push("Verified timestamp is required");
  if (!bundle.source || !String(bundle.source).startsWith("https://")) issues.push("Verified key source URL is required");

  const manifest = buildQuestionManifest(paper).filter((item) => item.responseType === "choice");
  const expected = new Set(manifest.map((item) => item.id));
  const keys = bundle.answers && typeof bundle.answers === "object" ? bundle.answers : {};
  const points = bundle.points && typeof bundle.points === "object" ? bundle.points : {};

  for (const item of manifest) {
    const answer = Number(keys[item.id]);
    const point = Number(points[item.id]);
    if (![1, 2, 3, 4].includes(answer)) issues.push(`${item.id}: verified answer must be 1-4`);
    if (!Number.isFinite(point) || point <= 0) issues.push(`${item.id}: positive point value required`);
  }

  for (const key of Object.keys(keys)) {
    if (!expected.has(key)) issues.push(`Unexpected answer key entry: ${key}`);
  }
  for (const key of Object.keys(points)) {
    if (!expected.has(key)) issues.push(`Unexpected point entry: ${key}`);
  }

  const sectionTotals = objectiveSections(paper).map((section) => {
    const ids = manifest.filter((item) => item.section === section.id).map((item) => item.id);
    return {
      section: section.id,
      total: ids.reduce((sum, id) => sum + Number(points[id] || 0), 0),
    };
  });
  if (sectionTotals.some((row) => row.total <= 0)) issues.push("Every objective section needs a positive score total");
  for (const row of sectionTotals) {
    if ((row.section === "listening" || row.section === "reading") && row.total !== 100) {
      issues.push(`${row.section}: verified TOPIK objective section must total 100 points`);
    }
  }

  return { valid: issues.length === 0, issues, sectionTotals };
}

export function scoreObjectiveAttempt(paper, answers, bundle = paper?.scoringBundle) {
  if (!paper?.provenanceAudit?.scoringAllowed) {
    return {
      status: "locked",
      reason: paper?.provenanceAudit?.quarantineReason || "Automatic scoring is not verified for this paper.",
    };
  }

  const validation = validateScoringBundle(paper, bundle);
  if (!validation.valid) return { status: "invalid", issues: validation.issues };

  const manifest = buildQuestionManifest(paper).filter((item) => item.responseType === "choice");
  const sectionMap = new Map();
  let earned = 0;
  let possible = 0;
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  for (const item of manifest) {
    const point = Number(bundle.points[item.id]);
    const expected = String(bundle.answers[item.id]);
    const actual = String(answers?.[item.id] || "");
    possible += point;
    const section = sectionMap.get(item.section) || {
      section: item.section,
      earned: 0,
      possible: 0,
      correct: 0,
      incorrect: 0,
      unanswered: 0,
    };
    section.possible += point;
    if (!actual) {
      unanswered += 1;
      section.unanswered += 1;
    } else if (actual === expected) {
      earned += point;
      correct += 1;
      section.earned += point;
      section.correct += 1;
    } else {
      incorrect += 1;
      section.incorrect += 1;
    }
    sectionMap.set(item.section, section);
  }

  return {
    status: "scored",
    earned,
    possible,
    percent: possible ? Math.round((earned / possible) * 1000) / 10 : 0,
    correct,
    incorrect,
    unanswered,
    sections: [...sectionMap.values()],
    bundleVersion: bundle.version,
    verifiedAt: bundle.verifiedAt,
    source: bundle.source,
  };
}

export function validateAudioBundle(paper, bundle) {
  const issues = [];
  if (!bundle || typeof bundle !== "object") return { valid: false, issues: ["Missing audio bundle"] };
  if (bundle.paperId !== paper?.id) issues.push("Audio bundle paper id does not match");
  if (!bundle.version || typeof bundle.version !== "string") issues.push("Audio bundle version is required");
  if (!bundle.verifiedAt || Number.isNaN(new Date(bundle.verifiedAt).getTime())) issues.push("Audio verification timestamp is required");
  if (!bundle.source || !String(bundle.source).startsWith("https://")) issues.push("Verified audio source URL is required");

  const listeningIds = new Set(
    buildQuestionManifest(paper)
      .filter((item) => item.section === "listening")
      .map((item) => item.id)
  );
  const cues = bundle.cues && typeof bundle.cues === "object" ? bundle.cues : {};
  for (const [id, cue] of Object.entries(cues)) {
    if (!listeningIds.has(id)) issues.push(`Unexpected audio cue: ${id}`);
    if (!cue || typeof cue !== "object") {
      issues.push(`${id}: audio cue must be an object`);
      continue;
    }
    if (!String(cue.src || "").startsWith("https://")) issues.push(`${id}: HTTPS audio source required`);
    if (cue.start != null && (!Number.isFinite(Number(cue.start)) || Number(cue.start) < 0)) issues.push(`${id}: invalid start time`);
    if (cue.end != null && (!Number.isFinite(Number(cue.end)) || Number(cue.end) <= Number(cue.start || 0))) issues.push(`${id}: invalid end time`);
  }
  return { valid: issues.length === 0, issues };
}

export function questionAudioCue(paper, questionId, bundle = paper?.audioBundle) {
  if (!paper?.provenanceAudit?.embeddedAudioAllowed) return null;
  const validation = validateAudioBundle(paper, bundle);
  if (!validation.valid) return null;
  return bundle.cues?.[questionId] || null;
}

export function examActivationSummary(paper) {
  const scoring = validateScoringBundle(paper, paper?.scoringBundle);
  const audio = validateAudioBundle(paper, paper?.audioBundle);
  return {
    questionCount: buildQuestionManifest(paper).length,
    scoring: paper?.provenanceAudit?.scoringAllowed && scoring.valid ? "ready" : "locked",
    scoringIssues: scoring.valid ? [] : scoring.issues,
    audio: paper?.provenanceAudit?.embeddedAudioAllowed && audio.valid ? "ready" : "locked",
    audioIssues: audio.valid ? [] : audio.issues,
  };
}
