const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const HANGUL_STAGES = Object.freeze({
  letters: "letters",
  syllables: "syllables",
  words: "words",
  beginnerReady: "beginner_ready",
});

function quizAverage(history = []) {
  const rows = (history || [])
    .map((row) => Number(row?.score))
    .filter(Number.isFinite)
    .slice(-5);
  if (!rows.length) return 0;
  return rows.reduce((sum, score) => sum + score, 0) / rows.length;
}

export function normalizeHangulEvidence(value = {}) {
  const explored = [...new Set(Array.isArray(value?.explored) ? value.explored.map(String) : [])];
  const known = [...new Set(Array.isArray(value?.known) ? value.known.map(String) : [])];
  const written = [...new Set(Array.isArray(value?.written) ? value.written.map(String) : [])];
  const quizHistory = Array.isArray(value?.quizHistory) ? value.quizHistory.slice(-12) : [];
  const syllableBuilds = Math.max(0, Math.round(Number(value?.syllableBuilds || 0)));
  const wordReads = Math.max(0, Math.round(Number(value?.wordReads || 0)));

  return {
    explored,
    known,
    written,
    quizHistory,
    syllableBuilds,
    wordReads,
  };
}

export function evaluateHangulProgress(value = {}) {
  const evidence = normalizeHangulEvidence(value);
  const exploredPct = clamp(Math.round((evidence.explored.length / 40) * 100), 0, 100);
  const recognizedPct = clamp(Math.round((evidence.known.length / 40) * 100), 0, 100);
  const writtenPct = clamp(Math.round((evidence.written.length / 40) * 100), 0, 100);
  const recentQuizAverage = quizAverage(evidence.quizHistory);
  const quizPct = clamp(Math.round((recentQuizAverage / 10) * 100), 0, 100);
  const syllablePct = clamp(Math.round((evidence.syllableBuilds / 12) * 100), 0, 100);
  const wordPct = clamp(Math.round((evidence.wordReads / 8) * 100), 0, 100);

  const readiness = clamp(Math.round(
    recognizedPct * 0.38 +
    quizPct * 0.24 +
    syllablePct * 0.18 +
    wordPct * 0.12 +
    writtenPct * 0.08
  ), 0, 100);

  let stage = HANGUL_STAGES.letters;
  if (evidence.known.length >= 20 && recentQuizAverage >= 6) stage = HANGUL_STAGES.syllables;
  if (evidence.known.length >= 30 && recentQuizAverage >= 7 && evidence.syllableBuilds >= 8) stage = HANGUL_STAGES.words;
  if (
    evidence.known.length >= 34 &&
    recentQuizAverage >= 8 &&
    evidence.syllableBuilds >= 12 &&
    evidence.wordReads >= 6
  ) stage = HANGUL_STAGES.beginnerReady;

  const gaps = [];
  if (evidence.known.length < 34) gaps.push("recognize at least 34 of 40 letters");
  if (recentQuizAverage < 8) gaps.push("average at least 8/10 in recent sound practice");
  if (evidence.syllableBuilds < 12) gaps.push("build at least 12 syllable blocks");
  if (evidence.wordReads < 6) gaps.push("read at least 6 beginner words without romanization");

  const nextAction = stage === HANGUL_STAGES.letters
    ? { kind:"hangul_letters", label:"Keep learning letters", target:"learn" }
    : stage === HANGUL_STAGES.syllables
      ? { kind:"hangul_syllables", label:"Build syllable blocks", target:"build" }
      : stage === HANGUL_STAGES.words
        ? { kind:"hangul_words", label:"Read your first words", target:"practice" }
        : { kind:"beginner_lesson", label:"Start Beginner Lesson 1", target:"/?view=companion" };

  return {
    stage,
    readiness,
    exploredPct,
    recognizedPct,
    writtenPct,
    quizPct,
    syllablePct,
    wordPct,
    recentQuizAverage: Number(recentQuizAverage.toFixed(1)),
    counts: {
      explored: evidence.explored.length,
      recognized: evidence.known.length,
      written: evidence.written.length,
      syllableBuilds: evidence.syllableBuilds,
      wordReads: evidence.wordReads,
    },
    gaps,
    nextAction,
  };
}
