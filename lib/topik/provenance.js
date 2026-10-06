export const TOPIK_RELEASE_STATE = Object.freeze({
  OFFICIAL_RELEASED: "OFFICIAL_RELEASED",
  LEGACY_ARCHIVE: "LEGACY_ARCHIVE",
  RECONSTRUCTED: "RECONSTRUCTED",
  PRACTICE: "PRACTICE",
  NO_RELEASE_EVIDENCE: "NO_RELEASE_EVIDENCE",
});

export const TOPIK_ASSET_STATE = Object.freeze({
  VERIFIED: "VERIFIED",
  STRUCTURE_VERIFIED: "STRUCTURE_VERIFIED",
  LINKED_UNVERIFIED: "LINKED_UNVERIFIED",
  PENDING: "PENDING",
  BLOCKED: "BLOCKED",
  MISSING: "MISSING",
});

export const TOPIK_RIGHTS_STATE = Object.freeze({
  PERMISSION_GRANTED: "PERMISSION_GRANTED",
  LINK_ONLY: "LINK_ONLY",
  PENDING: "PENDING",
});

const VERIFIED_AUDITS = {
  "83-I": {
    auditDate: "2026-09-24",
    releaseState: TOPIK_RELEASE_STATE.OFFICIAL_RELEASED,
    sourceBasis: "Original TOPIK I PBT booklet and section keys inspected through published archive links.",
    authorityNotes: [
      "Cross-checked against released-paper indexes.",
      "Question booklet structure matches TOPIK I PBT: 30 listening + 40 reading.",
      "Reading Q31 was spot-checked against the published key during the recovery audit.",
    ],
    booklet: TOPIK_ASSET_STATE.STRUCTURE_VERIFIED,
    answerKey: TOPIK_ASSET_STATE.PENDING,
    transcript: TOPIK_ASSET_STATE.LINKED_UNVERIFIED,
    audio: TOPIK_ASSET_STATE.PENDING,
    rights: TOPIK_RIGHTS_STATE.PENDING,
    scoringAllowed: false,
    embeddedAudioAllowed: false,
    inAppQuestionContentAllowed: false,
    quarantineReason: "Full key audit, acoustic audio matching, and reuse permission remain pending.",
  },
  "91-I": {
    auditDate: "2026-09-24",
    releaseState: TOPIK_RELEASE_STATE.OFFICIAL_RELEASED,
    sourceBasis: "Original TOPIK I PBT booklet/key/transcript links found and corroborated by a Korean university posting.",
    authorityNotes: [
      "Question booklet structure matches TOPIK I PBT: 30 listening + 40 reading.",
      "Published 91st files were corroborated independently.",
    ],
    booklet: TOPIK_ASSET_STATE.STRUCTURE_VERIFIED,
    answerKey: TOPIK_ASSET_STATE.PENDING,
    transcript: TOPIK_ASSET_STATE.LINKED_UNVERIFIED,
    audio: TOPIK_ASSET_STATE.PENDING,
    rights: TOPIK_RIGHTS_STATE.PENDING,
    scoringAllowed: false,
    embeddedAudioAllowed: false,
    inAppQuestionContentAllowed: false,
    quarantineReason: "Full B-form key audit, acoustic audio matching, and reuse permission remain pending.",
  },
  "96-I": {
    auditDate: "2026-09-24",
    releaseState: TOPIK_RELEASE_STATE.OFFICIAL_RELEASED,
    sourceBasis: "Original TOPIK I reading/listening booklets and combined answer sheet were opened during provenance review.",
    authorityNotes: [
      "Question booklet structure matches TOPIK I PBT: 30 listening + 40 reading.",
      "Transcript link was inspected; audio is an external linked asset and has not been acoustically matched.",
    ],
    booklet: TOPIK_ASSET_STATE.STRUCTURE_VERIFIED,
    answerKey: TOPIK_ASSET_STATE.PENDING,
    transcript: TOPIK_ASSET_STATE.LINKED_UNVERIFIED,
    audio: TOPIK_ASSET_STATE.PENDING,
    rights: TOPIK_RIGHTS_STATE.PENDING,
    scoringAllowed: false,
    embeddedAudioAllowed: false,
    inAppQuestionContentAllowed: false,
    quarantineReason: "Full key audit, acoustic audio matching, and reuse permission remain pending.",
  },
  "102-I": {
    auditDate: "2026-09-24",
    releaseState: TOPIK_RELEASE_STATE.OFFICIAL_RELEASED,
    sourceBasis: "Original TOPIK I listening/reading booklets and section answer sheets were opened and identified by round/level.",
    authorityNotes: [
      "Question booklet structure matches TOPIK I PBT: 30 listening + 40 reading.",
      "A published mismatch report concerning the audio/transcript remains unresolved.",
    ],
    booklet: TOPIK_ASSET_STATE.STRUCTURE_VERIFIED,
    answerKey: TOPIK_ASSET_STATE.PENDING,
    transcript: TOPIK_ASSET_STATE.LINKED_UNVERIFIED,
    audio: TOPIK_ASSET_STATE.BLOCKED,
    rights: TOPIK_RIGHTS_STATE.PENDING,
    scoringAllowed: false,
    embeddedAudioAllowed: false,
    inAppQuestionContentAllowed: false,
    quarantineReason: "Reported audio/transcript mismatch must be resolved; full key audit and reuse permission are also pending.",
  },
  "102-II": {
    auditDate: "2026-10-06",
    releaseState: TOPIK_RELEASE_STATE.OFFICIAL_RELEASED,
    sourceBasis: "Released TOPIK II reading, listening and writing assets are listed together in the published past-paper archive.",
    authorityNotes: [
      "Catalog structure matches TOPIK II PBT: 50 listening + 4 writing + 50 reading.",
      "Separate reading, listening, writing, keys, audio and transcript links are published for round 102.",
      "A public mismatch report on the archive page remains unresolved, so listening media stays blocked.",
    ],
    booklet: TOPIK_ASSET_STATE.STRUCTURE_VERIFIED,
    answerKey: TOPIK_ASSET_STATE.PENDING,
    transcript: TOPIK_ASSET_STATE.LINKED_UNVERIFIED,
    audio: TOPIK_ASSET_STATE.BLOCKED,
    rights: TOPIK_RIGHTS_STATE.PENDING,
    scoringAllowed: false,
    embeddedAudioAllowed: false,
    inAppQuestionContentAllowed: false,
    quarantineReason: "Full key audit, acoustic audio/transcript matching, and reuse permission remain pending.",
  },
  "96-II": {
    auditDate: "2026-10-06",
    releaseState: TOPIK_RELEASE_STATE.OFFICIAL_RELEASED,
    sourceBasis: "Round 96 TOPIK II reading/listening/writing booklets and combined answer key are linked from the published archive.",
    authorityNotes: [
      "Reading booklet identifies the 96th TOPIK II and contains 50 reading items.",
      "Archive lists the first-session listening and writing papers plus the second-session reading paper.",
      "Archive comments report that the linked TOPIK II audio is mismatched, so audio is explicitly blocked.",
    ],
    booklet: TOPIK_ASSET_STATE.STRUCTURE_VERIFIED,
    answerKey: TOPIK_ASSET_STATE.PENDING,
    transcript: TOPIK_ASSET_STATE.LINKED_UNVERIFIED,
    audio: TOPIK_ASSET_STATE.BLOCKED,
    rights: TOPIK_RIGHTS_STATE.PENDING,
    scoringAllowed: false,
    embeddedAudioAllowed: false,
    inAppQuestionContentAllowed: false,
    quarantineReason: "Reported audio mismatch plus incomplete key and rights audit keep interactive activation disabled.",
  },
  "91-II": {
    auditDate: "2026-10-06",
    releaseState: TOPIK_RELEASE_STATE.OFFICIAL_RELEASED,
    sourceBasis: "Round 91 TOPIK II reading/listening/writing booklets and section answer keys are linked from the published archive.",
    authorityNotes: [
      "Catalog structure matches TOPIK II PBT: 50 listening + 4 writing + 50 reading.",
      "Published archive currently returns 404 for the TOPIK II transcript link and contains an earlier mismatch report.",
    ],
    booklet: TOPIK_ASSET_STATE.STRUCTURE_VERIFIED,
    answerKey: TOPIK_ASSET_STATE.PENDING,
    transcript: TOPIK_ASSET_STATE.BLOCKED,
    audio: TOPIK_ASSET_STATE.PENDING,
    rights: TOPIK_RIGHTS_STATE.PENDING,
    scoringAllowed: false,
    embeddedAudioAllowed: false,
    inAppQuestionContentAllowed: false,
    quarantineReason: "Transcript source is broken; full answer-key audit, acoustic audio verification, and reuse permission remain pending.",
  },
  "83-II": {
    auditDate: "2026-10-06",
    releaseState: TOPIK_RELEASE_STATE.OFFICIAL_RELEASED,
    sourceBasis: "Round 83 TOPIK II reading/listening/writing booklets, section keys, audio and transcript are linked from the published archive.",
    authorityNotes: [
      "Catalog structure matches TOPIK II PBT: 50 listening + 4 writing + 50 reading.",
      "Reading and listening key PDFs expose 50 answers each, but Hallium has not completed a question-by-question key audit.",
    ],
    booklet: TOPIK_ASSET_STATE.STRUCTURE_VERIFIED,
    answerKey: TOPIK_ASSET_STATE.PENDING,
    transcript: TOPIK_ASSET_STATE.LINKED_UNVERIFIED,
    audio: TOPIK_ASSET_STATE.PENDING,
    rights: TOPIK_RIGHTS_STATE.PENDING,
    scoringAllowed: false,
    embeddedAudioAllowed: false,
    inAppQuestionContentAllowed: false,
    quarantineReason: "Full key audit, acoustic audio matching, and reuse permission remain pending.",
  },
  "64-I": {
    auditDate: "2026-09-24",
    releaseState: TOPIK_RELEASE_STATE.OFFICIAL_RELEASED,
    sourceBasis: "Historical TOPIK I original question-set links were traced to the published archive.",
    authorityNotes: [
      "Question PDF was opened from the source archive.",
      "Published comments flag possible answer issues, so no scoring is enabled.",
    ],
    booklet: TOPIK_ASSET_STATE.STRUCTURE_VERIFIED,
    answerKey: TOPIK_ASSET_STATE.PENDING,
    transcript: TOPIK_ASSET_STATE.LINKED_UNVERIFIED,
    audio: TOPIK_ASSET_STATE.PENDING,
    rights: TOPIK_RIGHTS_STATE.PENDING,
    scoringAllowed: false,
    embeddedAudioAllowed: false,
    inAppQuestionContentAllowed: false,
    quarantineReason: "Full answer-key audit, acoustic audio verification, and reuse permission remain pending.",
  },
};

export function expectedTopikStructure(level) {
  if (level === "I") {
    return {
      listening: 30,
      reading: 40,
      writing: 0,
      totalObjective: 70,
    };
  }
  if (level === "II") {
    return {
      listening: 50,
      writing: 4,
      reading: 50,
      totalObjective: 100,
    };
  }
  return null;
}

export function validatePaperStructure(paper) {
  const expected = expectedTopikStructure(paper?.level);
  if (!expected) return ["Unknown TOPIK level"];
  const sections = Object.fromEntries((paper?.sections || []).map((section) => [section.id, Number(section.count || 0)]));
  const issues = [];
  for (const [section, count] of Object.entries(expected)) {
    if (section === "totalObjective") continue;
    if (count === 0) {
      if (sections[section]) issues.push(`Unexpected ${section} section for TOPIK ${paper.level}`);
      continue;
    }
    if (sections[section] !== count) {
      issues.push(`${section} expected ${count}, found ${sections[section] || 0}`);
    }
  }
  return issues;
}

function legacyAuditFor(paper) {
  const structureIssues = validatePaperStructure(paper);
  return {
    auditDate: "",
    releaseState: TOPIK_RELEASE_STATE.LEGACY_ARCHIVE,
    sourceBasis: paper?.provenance || "Legacy source-linked practice sheet; provenance requires per-round re-audit.",
    authorityNotes: [
      "Legacy link retained to preserve existing practice responses.",
      "Do not infer audio, answer-key, or redistribution approval from the presence of a URL.",
    ],
    booklet: structureIssues.length
      ? TOPIK_ASSET_STATE.BLOCKED
      : paper?.paper
        ? TOPIK_ASSET_STATE.LINKED_UNVERIFIED
        : TOPIK_ASSET_STATE.MISSING,
    answerKey: paper?.answerKeys ? TOPIK_ASSET_STATE.LINKED_UNVERIFIED : TOPIK_ASSET_STATE.MISSING,
    transcript: paper?.transcript ? TOPIK_ASSET_STATE.LINKED_UNVERIFIED : TOPIK_ASSET_STATE.MISSING,
    audio: paper?.audio ? TOPIK_ASSET_STATE.LINKED_UNVERIFIED : TOPIK_ASSET_STATE.MISSING,
    rights: TOPIK_RIGHTS_STATE.LINK_ONLY,
    scoringAllowed: false,
    embeddedAudioAllowed: false,
    inAppQuestionContentAllowed: false,
    quarantineReason: structureIssues.length
      ? `Structure gate failed: ${structureIssues.join("; ")}`
      : "Legacy source requires per-round asset and rights audit before activation.",
  };
}

export function topikActivationAllowed({
  releaseState,
  booklet,
  answerKey,
  audio,
  rights,
  purpose,
}) {
  if (releaseState !== TOPIK_RELEASE_STATE.OFFICIAL_RELEASED) return false;
  if (booklet !== TOPIK_ASSET_STATE.VERIFIED && booklet !== TOPIK_ASSET_STATE.STRUCTURE_VERIFIED) return false;
  if (purpose === "scoring") {
    return answerKey === TOPIK_ASSET_STATE.VERIFIED && rights === TOPIK_RIGHTS_STATE.PERMISSION_GRANTED;
  }
  if (purpose === "audio") {
    return audio === TOPIK_ASSET_STATE.VERIFIED && rights === TOPIK_RIGHTS_STATE.PERMISSION_GRANTED;
  }
  if (purpose === "question_content") {
    return rights === TOPIK_RIGHTS_STATE.PERMISSION_GRANTED;
  }
  return false;
}

export function deriveTopikActivationFlags(base, structureIssues = []) {
  const blockedByStructure = structureIssues.length > 0;
  return {
    scoringAllowed: !blockedByStructure &&
      topikActivationAllowed({ ...base, purpose: "scoring" }),
    embeddedAudioAllowed: !blockedByStructure &&
      topikActivationAllowed({ ...base, purpose: "audio" }),
    inAppQuestionContentAllowed: !blockedByStructure &&
      topikActivationAllowed({ ...base, purpose: "question_content" }),
  };
}

export function provenanceForPaper(paper) {
  const base = VERIFIED_AUDITS[paper?.id] || legacyAuditFor(paper);
  const structureIssues = validatePaperStructure(paper);
  const blockedByStructure = structureIssues.length > 0;

  // Activation is derived exclusively from audited release/asset/rights states.
  // Legacy stored booleans are intentionally non-authoritative so a stale or
  // mistaken flag cannot unlock scoring, embedded audio, or question content.
  const {
    scoringAllowed,
    embeddedAudioAllowed,
    inAppQuestionContentAllowed,
  } = deriveTopikActivationFlags(base, structureIssues);

  return {
    ...base,
    structureIssues,
    scoringAllowed,
    embeddedAudioAllowed,
    inAppQuestionContentAllowed,
    activationState: blockedByStructure
      ? "QUARANTINED"
      : scoringAllowed || embeddedAudioAllowed || inAppQuestionContentAllowed
        ? "PARTIALLY_ACTIVATED"
        : "LINK_ONLY",
  };
}

export function enrichPaperProvenance(paper) {
  const provenanceAudit = provenanceForPaper(paper);
  return {
    ...paper,
    provenanceAudit,
    scoringAllowed: provenanceAudit.scoringAllowed,
    embeddedAudioAllowed: provenanceAudit.embeddedAudioAllowed,
    inAppQuestionContentAllowed: provenanceAudit.inAppQuestionContentAllowed,
  };
}

export function auditTopikCatalog(papers) {
  const seen = new Set();
  const issues = [];
  for (const paper of papers || []) {
    if (!paper?.id) {
      issues.push("Paper without immutable id");
      continue;
    }
    if (seen.has(paper.id)) issues.push(`Duplicate paper id: ${paper.id}`);
    seen.add(paper.id);
    for (const issue of validatePaperStructure(paper)) {
      issues.push(`${paper.id}: ${issue}`);
    }
    if (!paper.source_url && !paper.resource && !paper.paper) {
      issues.push(`${paper.id}: no source link`);
    }
  }
  return {
    paperCount: seen.size,
    issues,
    valid: issues.length === 0,
  };
}

export function provenanceBadge(audit) {
  if (!audit) return "UNAUDITED";
  if (audit.activationState === "QUARANTINED") return "QUARANTINED";
  if (audit.releaseState === TOPIK_RELEASE_STATE.OFFICIAL_RELEASED) return "OFFICIAL RELEASE · GATED";
  return "LEGACY · RE-AUDIT";
}
