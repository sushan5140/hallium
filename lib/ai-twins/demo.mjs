// AI Doppelgänger research sandbox: deterministic, consent-gated matching.
// No network calls, profile persistence, or access to Hallium learner records.
export const SKILLS = ["vocabulary", "grammar", "listening", "speaking"];
export const LEVELS = ["beginner", "elementary", "intermediate", "advanced"];
export const SLOTS = ["Flexible", "Morning", "Afternoon", "Evening"];

export const DEMO_TWINS = Object.freeze([
  { id: "demo-minji", name: "Minji", level: "beginner", strength: "grammar", growth: "vocabulary", slot: "Evening", consent: true, vibe: "The grammar detective", intro: "I can explain why a sentence feels natural, but I forget new words fast.", color: "lavender" },
  { id: "demo-jiho", name: "Jiho", level: "elementary", strength: "listening", growth: "speaking", slot: "Evening", consent: true, vibe: "The dialogue remixer", intro: "I catch what people say in dramas. Speaking back? Different story.", color: "peach" },
  { id: "demo-hana", name: "Hana", level: "beginner", strength: "vocabulary", growth: "grammar", slot: "Morning", consent: true, vibe: "The word collector", intro: "I remember vocabulary, but particles keep winning.", color: "mint" },
  { id: "demo-dae", name: "Dae", level: "intermediate", strength: "speaking", growth: "listening", slot: "Flexible", consent: true, vibe: "The conversation starter", intro: "I love speaking practice and need help catching fast replies.", color: "blue" }
]);

function validTwin(twin) {
  return Boolean(
    twin && twin.id && twin.name && twin.consent === true &&
    SKILLS.includes(twin.strength) && SKILLS.includes(twin.growth) &&
    twin.strength !== twin.growth && LEVELS.includes(twin.level) &&
    SLOTS.includes(twin.slot)
  );
}

export function matchTwins(me, other) {
  if (!validTwin(me) || !validTwin(other) || me.id === other.id) return null;
  const helpForMe = Number(other.strength === me.growth);
  const helpForThem = Number(me.strength === other.growth);
  const levelGap = Math.abs(LEVELS.indexOf(me.level) - LEVELS.indexOf(other.level));
  const levelPoints = Math.max(0, 15 - levelGap * 5);
  const slotMatch = me.slot === other.slot || me.slot === "Flexible" || other.slot === "Flexible";
  const score = 35 * helpForMe + 35 * helpForThem + levelPoints + (slotMatch ? 15 : 0);
  const reasons = [];
  if (helpForMe) reasons.push(other.name + " is strong in " + me.growth + ", your growth area.");
  if (helpForThem) reasons.push("You are strong in " + other.growth + ", " + other.name + "'s growth area.");
  if (slotMatch) reasons.push("Your practice time preferences overlap.");
  else reasons.push("Your listed practice times differ; agree on a time together.");
  if (levelGap > 1) reasons.push("Different proficiency levels may call for a simpler shared activity.");
  return { other, score, mutual: Boolean(helpForMe && helpForThem), reasons, helpForMe: Boolean(helpForMe), helpForThem: Boolean(helpForThem), slotMatch };
}

export function rankTwins(me, candidates) {
  if (!validTwin(me) || !Array.isArray(candidates)) return [];
  return candidates
    .map(other => matchTwins(me, other))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.other.name.localeCompare(b.other.name));
}

export function createPracticePlan(me, match) {
  if (!validTwin(me) || !match || !match.other || !validTwin(match.other)) return null;
  const partner = match.other;
  const first = match.helpForMe
    ? partner.name + " leads a 5-minute " + me.growth + " mini-lesson."
    : "Compare one tricky " + me.growth + " example together.";
  const second = match.helpForThem
    ? me.name + " leads a 5-minute " + partner.growth + " mini-lesson."
    : "Exchange one practice prompt and give each other feedback.";
  return {
    label: "The 15-minute skill swap",
    agenda: [first, second, "Finish with a 5-minute Korean dialogue using what you both practised."],
    prompts: [
      "안녕하세요! 오늘 뭐 공부할까요?",
      "저는 " + (me.growth === "grammar" ? "문법" : me.growth === "vocabulary" ? "단어" : me.growth === "listening" ? "듣기" : "말하기") + " 연습하고 싶어요."
    ],
    disclaimer: "A scripted research-demo plan, not evidence of learning improvement."
  };
}

export function scriptedMeetup(me, match) {
  if (!validTwin(me) || !match || !validTwin(match.other)) return [];
  const partner = match.other;
  return [
    { speaker: me.name + "'s twin", text: "Hey! My human wants to improve " + me.growth + ". What is your human working on?" },
    { speaker: partner.name + "'s twin", text: "They want to improve " + partner.growth + ". " + partner.intro },
    { speaker: me.name + "'s twin", text: match.mutual ? "That's a two-way skill swap. I'll propose a short Korean challenge." : "We have some overlap. I'll suggest a low-pressure practice task." },
    { speaker: partner.name + "'s twin", text: "Sounds good. Our humans decide whether to meet. No private notes are shared." }
  ];
}
