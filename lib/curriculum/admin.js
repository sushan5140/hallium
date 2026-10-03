export const ADMIN_EXPECTED_LESSON_KINDS = Object.freeze([
  "word",
  "explain",
  "choice",
  "listening",
  "shadowing",
  "build",
  "finish",
]);

export function lessonCoverage(lesson) {
  const steps = Array.isArray(lesson?.steps) ? lesson.steps : [];
  const counts = steps.reduce((map, step) => {
    const kind = String(step?.kind || "unknown");
    map[kind] = (map[kind] || 0) + 1;
    return map;
  }, {});

  const expected =
    lesson?.type === "checkpoint"
      ? ["choice", "dictation", "reading", "finish"]
      : ADMIN_EXPECTED_LESSON_KINDS;

  const exemptions =
    lesson?.coverageExemptions && typeof lesson.coverageExemptions === "object"
      ? lesson.coverageExemptions
      : {};
  const intentionalOmissions = expected
    .filter((kind) => !counts[kind] && exemptions[kind])
    .map((kind) => ({ kind, reason: String(exemptions[kind]) }));
  const missing = expected.filter((kind) => !counts[kind] && !exemptions[kind]);
  const vocabulary = steps
    .filter((step) => step?.kind === "word")
    .map((step) => ({ korean: step.korean, meaning: step.meaning, note: step.note || "" }));
  const grammar = steps
    .filter((step) => step?.kind === "explain")
    .map((step) => ({
      title: step.title,
      body: step.body,
      korean: step.korean,
      breakdown: step.breakdown || [],
    }));
  const assessments = steps.filter((step) =>
    ["choice", "listening", "dictation", "reading", "build"].includes(step?.kind)
  );

  return {
    id: lesson?.id || "",
    type: lesson?.type || "lesson",
    stepCount: steps.length,
    counts,
    missing,
    intentionalOmissions,
    vocabulary,
    grammar,
    assessments: assessments.length,
    listening: Boolean(counts.listening),
    dictation: Boolean(counts.dictation),
    shadowing: Boolean(counts.shadowing),
    production: Boolean(counts.build),
    complete: missing.length === 0,
  };
}

export function curriculumAudit(units) {
  const rows = (units || []).flatMap((unit) =>
    (unit.lessons || []).map((lesson) => ({
      unitId: unit.id,
      unitNumber: unit.number,
      unitTitle: unit.title,
      levelId: unit.levelId,
      levelLabel: unit.levelLabel,
      lesson,
      coverage: lessonCoverage(lesson),
    }))
  );

  const kinds = ["listening", "dictation", "shadowing", "production"];
  const summary = {
    units: (units || []).length,
    lessons: rows.length,
    checkpoints: rows.filter((row) => row.lesson?.type === "checkpoint").length,
    complete: rows.filter((row) => row.coverage.complete).length,
    withGaps: rows.filter((row) => !row.coverage.complete).length,
  };

  for (const kind of kinds) {
    summary[kind] = rows.filter((row) => row.coverage[kind]).length;
  }

  return { rows, summary };
}

export function teachingItemFromStep({ unit, lesson, step, stepIndex }) {
  const safeStep = step && typeof step === "object" ? step : {};
  const id = [
    lesson?.id || "lesson",
    safeStep.kind || "step",
    Number(stepIndex || 0),
    Date.now(),
  ].join(":");

  const title =
    safeStep.kind === "word"
      ? safeStep.korean
      : safeStep.kind === "explain"
        ? safeStep.title
        : safeStep.prompt || safeStep.instruction || lesson?.title || "Teaching item";

  return {
    id,
    unitId: unit?.id || "",
    unitTitle: unit?.title || "",
    lessonId: lesson?.id || "",
    lessonTitle: lesson?.title || "",
    kind: safeStep.kind || "unknown",
    title: String(title || "Teaching item"),
    payload: safeStep,
    savedAt: new Date().toISOString(),
  };
}
