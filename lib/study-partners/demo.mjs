/** Pure, testable mechanics for the isolated Study Partners preview. */
const CATEGORIES = ["vocabulary", "grammar", "listening"];
const toId = () => typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
const time = () => new Date().toISOString();
export const pairKey = (a,b) => [a,b].sort().join("::");
export function calculateMatch(me, other) {
  if (!me || !other || !other.ready || !me.ready) return null;
  const helpThem = CATEGORIES.map(skill => ({ skill, gap: Math.max(0, me.skills[skill] - other.skills[skill]) })).sort((a, b) => b.gap - a.gap)[0];
  const helpMe = CATEGORIES.map(skill => ({ skill, gap: Math.max(0, other.skills[skill] - me.skills[skill]) })).sort((a, b) => b.gap - a.gap)[0];
  const complementary = Math.min(helpThem.gap, helpMe.gap);
  const levelPenalty = me.level === other.level ? 0 : 14;
  const overlap = me.availability.split(" · ")[0] === other.availability.split(" · ")[0];
  return {
    helpThem, helpMe, overlap, complementary,
    score: Math.max(0, Math.min(100, Math.round(complementary * 2 + (overlap ? 12 : 0) - levelPenalty))),
    strong: helpThem.gap >= 15 && helpMe.gap >= 15,
  };
}
export function buildPractice(vocabulary, grammar, pair) {
  const words = vocabulary.slice(0, 4);
  const patterns = grammar.slice(0, 3);
  if (!words.length || !patterns.length) throw new Error('Explicitly shared vocabulary and grammar notes are required.');
  const v = words[0], g = patterns[0];
  return {
    id: toId(), pair, createdAt: time(), status: "active", provider: "guided-demo",
    wordIds: words.map(n => n.id), grammarIds: patterns.map(n => n.id),
    rounds: [
      { kind: "vocabulary", kicker: "01 · WORD RECALL", title: "Explain a word to your partner", prompt: "Without looking up a translation, explain “" + v.title + "” and use it in a short Korean phrase.", hint: v.meaning, source: [v.title, v.example].filter(Boolean).join(" · ") },
      { kind: "grammar", kicker: "02 · PATTERN PRACTICE", title: "Show how the grammar works", prompt: "Explain how “" + g.title + "” works, then identify it in the shared example.", hint: g.meaning, source: [g.title, g.example].filter(Boolean).join(" · ") },
      { kind: "together", kicker: "03 · BUILD TOGETHER", title: "One conversation, two strengths", prompt: "Together write two connected Korean lines using “" + v.title + "” and “" + g.title + "”. Discuss and correct each other. A perfect sentence is not required.", hint: "Use the notes below. Your partner can help review — the preview does not automatically certify correctness.", source: [v.example, g.example].filter(Boolean).join(" · ") },
    ],
    responses: {}, completedBy: [],
  };
}

