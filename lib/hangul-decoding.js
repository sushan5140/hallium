export const HANGUL_DECODING_ITEMS = Object.freeze([
  {
    id: "final-neutralization-clothes",
    rule: "Final consonant",
    word: "옷",
    heard: "옫",
    explanation: "At the end of a syllable, ㅅ is realized as a final ㄷ-type sound.",
  },
  {
    id: "liaison-eat",
    rule: "Liaison",
    word: "먹어요",
    heard: "머거요",
    explanation: "Before a vowel that begins with silent ㅇ, the final ㄱ carries into the next syllable.",
  },
  {
    id: "nasalization-korean-language",
    rule: "Nasalization",
    word: "한국말",
    heard: "한궁말",
    explanation: "Final ㄱ before ㅁ shifts toward ㅇ, making the transition easier to pronounce.",
  },
  {
    id: "aspiration-good",
    rule: "Aspiration",
    word: "좋다",
    heard: "조타",
    explanation: "ㅎ combines with the following ㄷ and makes an aspirated ㅌ sound.",
  },
  {
    id: "tensification-school",
    rule: "Tensification",
    word: "학교",
    heard: "학꾜",
    explanation: "After the final ㄱ, the following ㄱ is commonly pronounced as tense ㄲ.",
  },
]);

export function decodingOptions(item, items = HANGUL_DECODING_ITEMS) {
  if (!item) return [];
  const distractors = items
    .filter((candidate) => candidate.id !== item.id && candidate.heard !== item.heard)
    .map((candidate) => candidate.heard);
  return [item.heard, ...distractors.slice(0, 3)];
}
