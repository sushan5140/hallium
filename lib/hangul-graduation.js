export function evaluateHangulGraduation({
  progress = {},
  decodedPatterns = [],
} = {}) {
  const decoded = [...new Set((Array.isArray(decodedPatterns) ? decodedPatterns : []).map(String))];
  const checks = [
    {
      id: "letters",
      label: "Letter recognition",
      detail: "Recognize at least 34 of 40 Hangul letters",
      passed: Number(progress?.counts?.recognized || 0) >= 34,
      value: Number(progress?.counts?.recognized || 0) + " / 40",
    },
    {
      id: "listening",
      label: "Sound recognition",
      detail: "Average at least 8/10 in recent sound practice",
      passed: Number(progress?.recentQuizAverage || 0) >= 8,
      value: Number(progress?.recentQuizAverage || 0).toFixed(1) + " / 10",
    },
    {
      id: "syllables",
      label: "Syllable building",
      detail: "Build at least 12 unique syllable blocks",
      passed: Number(progress?.counts?.syllableBuilds || 0) >= 12,
      value: Number(progress?.counts?.syllableBuilds || 0) + " / 12",
    },
    {
      id: "reading",
      label: "First-word reading",
      detail: "Read at least 6 Starter words without romanization",
      passed: Number(progress?.counts?.wordReads || 0) >= 6,
      value: Number(progress?.counts?.wordReads || 0) + " / 6",
    },
    {
      id: "decoding",
      label: "Real-word decoding",
      detail: "Decode at least 3 common pronunciation patterns",
      passed: decoded.length >= 3,
      value: decoded.length + " / 3",
    },
  ];

  const passedCount = checks.filter((check) => check.passed).length;
  const complete = passedCount === checks.length;

  return {
    complete,
    passedCount,
    total: checks.length,
    checks,
    nextAction: complete
      ? { label:"Start Beginner Lesson 1", target:"/?view=lesson&lesson=unit-1-lesson-1&from=hangul" }
      : { label:"Finish the remaining Hangul checks", target:"hangul" },
  };
}
