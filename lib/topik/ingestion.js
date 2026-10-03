import {
  TOPIK_ASSET_STATE,
  TOPIK_RELEASE_STATE,
  TOPIK_RIGHTS_STATE,
  expectedTopikStructure,
  validatePaperStructure,
  topikActivationAllowed,
} from "./provenance";

const ALLOWED_LEVELS = new Set(["I", "II"]);
const ALLOWED_FORMATS = new Set(["PBT"]);

export function createTopikIngestionRecord(candidate) {
  if (!candidate || typeof candidate !== "object") {
    throw new Error("TOPIK ingestion candidate must be an object");
  }

  const round = Number(candidate.round);
  const level = String(candidate.level || "").toUpperCase();
  const format = String(candidate.format || "PBT").toUpperCase();
  const releaseState = candidate.releaseState || TOPIK_RELEASE_STATE.NO_RELEASE_EVIDENCE;
  const canonicalSource = String(candidate.canonicalSource || "").trim();

  if (!Number.isInteger(round) || round <= 0) throw new Error("TOPIK round must be a positive integer");
  if (!ALLOWED_LEVELS.has(level)) throw new Error("TOPIK level must be I or II");
  if (!ALLOWED_FORMATS.has(format)) throw new Error("Only TOPIK PBT enters the past-paper catalog");
  if (!canonicalSource.startsWith("https://")) throw new Error("A canonical HTTPS source URL is required");

  const expected = expectedTopikStructure(level);
  const sections = candidate.sections || [
    { id: "listening", name: "Listening", ko: "듣기", count: expected.listening, minutes: level === "I" ? 40 : 60 },
    ...(level === "II" ? [{ id: "writing", name: "Writing", ko: "쓰기", count: 4, minutes: 50 }] : []),
    { id: "reading", name: "Reading", ko: "읽기", count: expected.reading, minutes: level === "I" ? 60 : 70 },
  ];

  const id = candidate.id || `${round}-${level}`;
  const record = {
    id,
    round,
    year: candidate.year ? Number(candidate.year) : undefined,
    level,
    format,
    title: candidate.title || `${round}회 TOPIK ${level}`,
    paper: candidate.listeningPaper || candidate.paper || null,
    readingPaper: candidate.readingPaper || null,
    resource: canonicalSource,
    audio: candidate.audio || null,
    transcript: candidate.transcript || null,
    answerKeys: candidate.answerKeys || null,
    sections,
    minutes: sections.reduce((sum, section) => sum + Number(section.minutes || 0), 0),
    ingestion: {
      receivedAt: candidate.receivedAt || new Date().toISOString(),
      provider: candidate.provider || "unknown",
      releaseState,
      canonicalSource,
      sourcePublicationDate: candidate.sourcePublicationDate || null,
      examinationDate: candidate.examinationDate || null,
      form: candidate.form || null,
      notes: Array.isArray(candidate.notes) ? candidate.notes : [],
    },
    proposedGates: {
      booklet: candidate.bookletState || TOPIK_ASSET_STATE.PENDING,
      answerKey: candidate.answerKeyState || TOPIK_ASSET_STATE.PENDING,
      transcript: candidate.transcriptState || TOPIK_ASSET_STATE.PENDING,
      audio: candidate.audioState || TOPIK_ASSET_STATE.PENDING,
      rights: candidate.rightsState || TOPIK_RIGHTS_STATE.PENDING,
      scoringAllowed: false,
      embeddedAudioAllowed: false,
      inAppQuestionContentAllowed: false,
    },
  };

  const structureIssues = validatePaperStructure(record);
  const sourceEligible =
    releaseState === TOPIK_RELEASE_STATE.OFFICIAL_RELEASED ||
    releaseState === TOPIK_RELEASE_STATE.LEGACY_ARCHIVE;

  return {
    ...record,
    ingestion: {
      ...record.ingestion,
      structureIssues,
      catalogEligible: sourceEligible && structureIssues.length === 0,
      activationEligible: false,
      decision: structureIssues.length
        ? "QUARANTINE_STRUCTURE"
        : sourceEligible
          ? "RECORD_LINK_ONLY"
          : "QUARANTINE_RELEASE_EVIDENCE",
    },
  };
}

export function canPromoteTopikAsset(candidate) {
  return topikActivationAllowed(candidate);
}
