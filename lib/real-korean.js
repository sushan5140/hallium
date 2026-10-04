const REAL_KOREAN_SCENES = Object.freeze([
  {
    id: "friends",
    label: "Friends",
    description: "Short casual check-ins, plans, reactions, and everyday teasing.",
    phrases: [
      {
        id: "friends-eat",
        intents: ["did you eat", "have you eaten", "eat yet"],
        korean: "밥 먹었어?",
        romanization: "bap meogeosseo?",
        meaning: "Did you eat? / Have you eaten?",
        register: "casual",
        note: "A natural Korean check-in between people who are already comfortable with each other.",
        variants: { softer: "밥은 먹었어?", bolder: "밥 먹었어? 안 먹었으면 같이 먹자.", funnier: "밥 먹었어? 안 먹었으면 혼난다 ㅋㅋ" },
      },
      {
        id: "friends-busy",
        intents: ["are you busy", "busy right now"],
        korean: "지금 바빠?",
        romanization: "jigeum bappa?",
        meaning: "Are you busy right now?",
        register: "casual",
        note: "The subject is normally omitted in a natural Korean text.",
        variants: { softer: "지금 혹시 바빠?", bolder: "지금 안 바쁘면 나랑 얘기해.", funnier: "지금 바빠? 안 바쁘다고 해 줘 ㅋㅋ" },
      },
      {
        id: "friends-call",
        intents: ["call later", "shall we call", "talk later"],
        korean: "이따 통화할까?",
        romanization: "itta tonghwahalkka?",
        meaning: "Shall we call later?",
        register: "casual",
        note: "통화하다 is the natural verb for having a phone call.",
        variants: { softer: "이따 시간 되면 통화할래?", bolder: "이따 나랑 꼭 통화하자.", funnier: "이따 통화 콜? ㅋㅋ" },
      },
    ],
  },
  {
    id: "caring",
    label: "Caring",
    description: "Natural check-ins that show concern through concrete actions.",
    phrases: [
      {
        id: "caring-home",
        intents: ["get home", "got home", "arrive home", "reached home"],
        korean: "집에 도착했어?",
        romanization: "jibe dochakhaesseo?",
        meaning: "Did you get home?",
        register: "casual",
        note: "A common Korean check-in after someone heads home.",
        variants: { softer: "집에 잘 도착했어?", bolder: "도착했으면 바로 연락해.", funnier: "집 도착했어? 생존 신고 해 줘 ㅋㅋ" },
      },
      {
        id: "caring-careful",
        intents: ["take care", "text me when you arrive", "message me when you arrive"],
        korean: "조심히 가. 도착하면 연락해.",
        romanization: "josimhi ga. dochakhamyeon yeollakhae.",
        meaning: "Take care. Message me when you arrive.",
        register: "casual",
        note: "Korean often expresses care through a practical action rather than an abstract phrase.",
        variants: { softer: "조심히 가고, 도착하면 알려 줘.", bolder: "조심히 가. 도착하면 꼭 연락해.", funnier: "조심히 가. 도착하면 생존 신고 필수 ㅋㅋ" },
      },
      {
        id: "caring-sleep",
        intents: ["sleep well", "good night"],
        korean: "잘 자.",
        romanization: "jal ja.",
        meaning: "Sleep well / Good night.",
        register: "casual",
        note: "Short Korean is usually more natural than translating a full English good-night sentence.",
        variants: { softer: "푹 자.", bolder: "잘 자. 내일도 연락해.", funnier: "잘 자고 꿈에서 만나 ㅋㅋ" },
      },
    ],
  },
  {
    id: "feelings",
    label: "Feelings",
    description: "Warm but non-explicit ways to show closeness or interest.",
    phrases: [
      {
        id: "feelings-miss",
        intents: ["i miss you", "miss you"],
        korean: "보고 싶어.",
        romanization: "bogo sipeo.",
        meaning: "I miss you.",
        register: "casual",
        note: "Korean naturally frames this as wanting to see the other person.",
        variants: { softer: "요즘 좀 보고 싶네.", bolder: "진짜 많이 보고 싶어.", funnier: "보고 싶어서 큰일이네 ㅋㅋ" },
      },
      {
        id: "feelings-like",
        intents: ["i like talking to you", "like talking to you"],
        korean: "너랑 얘기하는 거 좋아.",
        romanization: "neorang yaegihaneun geo joa.",
        meaning: "I like talking with you.",
        register: "casual",
        note: "This sounds more message-like than a literal translation of every English word.",
        variants: { softer: "너랑 얘기하면 편해.", bolder: "나 너랑 얘기하는 거 진짜 좋아해.", funnier: "너랑 얘기하다 보면 시간 순삭이야 ㅋㅋ" },
      },
    ],
  },
  {
    id: "repair",
    label: "Making up",
    description: "Apologies, clarification, and low-drama repair after a misunderstanding.",
    phrases: [
      {
        id: "repair-meaning",
        intents: ["didn't mean it", "did not mean it", "i'm sorry", "im sorry"],
        korean: "미안해. 그런 뜻은 아니었어.",
        romanization: "mianhae. geureon tteuseun anieosseo.",
        meaning: "I'm sorry. I didn't mean it that way.",
        register: "casual",
        note: "A useful repair phrase when the problem is how something sounded.",
        variants: { softer: "미안해. 오해하게 하려던 건 아니었어.", bolder: "진짜 미안해. 내가 잘못했어.", funnier: "미안해… 내 입이 또 사고 쳤다 😭" },
      },
      {
        id: "repair-clear",
        intents: ["let me explain", "can i explain", "hear me out"],
        korean: "내가 설명해도 돼?",
        romanization: "naega seolmyeonghaedo dwae?",
        meaning: "Can I explain?",
        register: "casual",
        note: "Asking permission first can make a repair message feel less confrontational.",
        variants: { softer: "괜찮으면 내가 설명해도 될까?", bolder: "잠깐만, 내가 설명할게.", funnier: "딱 30초만 변명권 주세요 ㅋㅋ" },
      },
    ],
  },
  {
    id: "cafe",
    label: "Café & food",
    description: "Ordering, small requests, and common service interactions.",
    phrases: [
      {
        id: "cafe-order",
        intents: ["one iced americano please", "iced americano please", "order coffee"],
        korean: "아이스 아메리카노 한 잔 주세요.",
        romanization: "aiseu amerikano han jan juseyo.",
        meaning: "One iced Americano, please.",
        register: "polite",
        note: "N + counter + 주세요 is the natural compact ordering pattern.",
        variants: { softer: "아이스 아메리카노 한 잔 부탁드릴게요.", bolder: "아이스 아메리카노 한 잔 주세요.", funnier: "아이스 아메리카노 한 잔이요. 오늘은 카페인의 힘을 빌릴게요 ㅎㅎ" },
      },
      {
        id: "cafe-takeout",
        intents: ["to go please", "takeout please", "take away please"],
        korean: "포장해 주세요.",
        romanization: "pojanghae juseyo.",
        meaning: "Please make it to go.",
        register: "polite",
        note: "포장 is the everyday Korean word used for takeaway packaging.",
        variants: { softer: "포장 부탁드릴게요.", bolder: "이거 포장해 주세요.", funnier: "포장이요. 들고 바로 탈출할게요 ㅎㅎ" },
      },
    ],
  },
  {
    id: "travel",
    label: "Travel & directions",
    description: "Transport, navigation, and getting help while moving around.",
    phrases: [
      {
        id: "travel-where",
        intents: ["where is the station", "subway station", "where is subway"],
        korean: "지하철역이 어디예요?",
        romanization: "jihacheolyeogi eodiyeyo?",
        meaning: "Where is the subway station?",
        register: "polite",
        note: "A compact polite location question that works naturally with strangers.",
        variants: { softer: "실례하지만 지하철역이 어디예요?", bolder: "지하철역 어디예요?", funnier: "지하철역이 어디예요? 제가 길을 완전히 잃었어요 ㅎㅎ" },
      },
      {
        id: "travel-repeat",
        intents: ["say it again", "repeat please", "can you repeat"],
        korean: "다시 말해 주세요.",
        romanization: "dasi malhae juseyo.",
        meaning: "Please say it again.",
        register: "polite",
        note: "A high-value conversation-repair phrase for real travel situations.",
        variants: { softer: "죄송하지만 다시 말해 주세요.", bolder: "한 번만 다시 말해 주세요.", funnier: "죄송해요, 제 귀가 아직 한국어 초보예요 ㅎㅎ 다시 말해 주세요." },
      },
    ],
  },
  {
    id: "school_work",
    label: "School & work",
    description: "Natural polite phrases for classmates, teachers, seniors, and colleagues.",
    phrases: [
      {
        id: "school-help",
        intents: ["can you help me", "help me with this", "could you help me"],
        korean: "이거 좀 도와줄 수 있어요?",
        romanization: "igeo jom dowajul su isseoyo?",
        meaning: "Could you help me with this?",
        register: "polite",
        note: "좀 softens the request and is common in everyday Korean.",
        variants: { softer: "혹시 이거 좀 도와주실 수 있을까요?", bolder: "이거 좀 도와주세요.", funnier: "이거 좀 도와줄 수 있어요? 혼자서는 뇌가 멈췄어요 ㅎㅎ" },
      },
      {
        id: "school-late",
        intents: ["i'll be late", "running late", "i am late"],
        korean: "조금 늦을 것 같아요.",
        romanization: "jogeum neujeul geot gatayo.",
        meaning: "I think I'll be a little late.",
        register: "polite",
        note: "-(으)ㄹ 것 같아요 makes the message appropriately soft instead of sounding abrupt.",
        variants: { softer: "죄송하지만 조금 늦을 것 같아요.", bolder: "조금 늦어요. 먼저 시작하세요.", funnier: "조금 늦을 것 같아요. 제 시간이 오늘 저를 배신했어요 ㅎㅎ" },
      },
    ],
  },
]);

const RELATIONSHIP_REGISTER = Object.freeze({
  senior: "polite",
  unsure: "polite",
});

function normalizeMessage(value = "") {
  return String(value).trim().toLowerCase().replace(/[.!?。！？,，‘’“”"']/g, "").replace(/\s+/g, " ");
}

const MATCH_STOPWORDS = new Set([
  "a","an","the","i","im","i'm","you","your","me","my","we","our",
  "can","could","would","will","do","did","have","please","this","that",
  "to","for","with","it","is","are","am",
]);

function scoreIntent(message, intent) {
  if (!message || !intent) return 0;
  if (message === intent) return 100;
  if (message.includes(intent)) return 80 + Math.min(intent.length, 20);

  const messageWords = new Set(
    message.split(" ").filter((word) => word && !MATCH_STOPWORDS.has(word))
  );
  const intentWords = intent.split(" ").filter((word) => word && !MATCH_STOPWORDS.has(word));
  if (!intentWords.length) return 0;

  const hits = intentWords.filter((word) => messageWords.has(word)).length;
  if (!hits) return 0;

  const coverage = hits / intentWords.length;
  if (intentWords.length === 1) return coverage === 1 ? 42 : 0;
  if (coverage < 0.5) return 0;
  return coverage * 55;
}

export function realKoreanScenes() {
  return REAL_KOREAN_SCENES;
}

export function allRealKoreanPhrases() {
  return REAL_KOREAN_SCENES.flatMap((scene) =>
    scene.phrases.map((phrase) => ({ ...phrase, sceneId: scene.id, sceneLabel: scene.label }))
  );
}

export function findRealKoreanPreset(message, options = {}) {
  const normalized = normalizeMessage(message);
  if (!normalized) return null;

  const forcePolite = RELATIONSHIP_REGISTER[options.relationship] === "polite";
  const ranked = allRealKoreanPhrases()
    .filter((phrase) => !forcePolite || phrase.register === "polite")
    .map((phrase) => ({
      phrase,
      score: Math.max(...phrase.intents.map((intent) => scoreIntent(normalized, intent))),
    }))
    .filter((item) => item.score >= 24)
    .sort((a, b) => b.score - a.score || a.phrase.id.localeCompare(b.phrase.id));

  const best = ranked[0]?.phrase;
  if (!best) return null;

  const isPolite = best.register === "polite";

  return {
    id: best.id,
    sceneId: best.sceneId,
    sceneLabel: best.sceneLabel,
    bestMatch: best.korean,
    romanization: best.romanization,
    naturalMeaning: best.meaning,
    why:
      best.note +
      (isPolite
        ? " Hallium keeps this wording on the polite side for the selected relationship/context."
        : " Guest Mode uses the built-in Hallium Real Korean phrase bank rather than calling the paid AI provider."),
    softer: best.variants.softer,
    bolder: best.variants.bolder,
    funnier: best.variants.funnier,
    register: isPolite ? "polite" : best.register,
    source: "hallium_real_korean",
  };
}

export function realKoreanGrounding(message, options = {}) {
  const match = findRealKoreanPreset(message, options);
  if (!match) return null;
  return {
    scene: match.sceneLabel,
    canonicalKorean: match.bestMatch,
    naturalMeaning: match.naturalMeaning,
    register: match.register,
    note: match.why,
  };
}


const REAL_KOREAN_DIALOGUES = Object.freeze([
  {
    id: "friends-late-night",
    sceneId: "friends",
    title: "Late-night check-in",
    situation: "Two close friends checking whether the other is still awake.",
    register: "casual",
    lines: [
      { speaker:"A", korean:"아직 안 자?", romanization:"ajik an ja?", meaning:"You're not asleep yet?" },
      { speaker:"B", korean:"응. 너도 아직 안 자?", romanization:"eung. neodo ajik an ja?", meaning:"Yeah. You're still awake too?" },
      { speaker:"A", korean:"응, 잠깐 얘기할래?", romanization:"eung, jamkkan yaegihallae?", meaning:"Yeah, want to talk for a bit?" },
    ],
    note: "Short omitted-subject lines are normal between close friends.",
  },
  {
    id: "caring-rain",
    sceneId: "caring",
    title: "Get home safely",
    situation: "Someone is heading home in bad weather.",
    register: "casual",
    lines: [
      { speaker:"A", korean:"밖에 비 많이 와.", romanization:"bakke bi mani wa.", meaning:"It's raining a lot outside." },
      { speaker:"B", korean:"응, 지금 집에 가는 중이야.", romanization:"eung, jigeum jibe ganeun jungiya.", meaning:"Yeah, I'm on my way home now." },
      { speaker:"A", korean:"조심히 가. 도착하면 연락해.", romanization:"josimhi ga. dochakhamyeon yeollakhae.", meaning:"Take care. Message me when you arrive." },
    ],
    note: "Care is often expressed through concrete requests such as 연락해.",
  },
  {
    id: "feelings-honest",
    sceneId: "feelings",
    title: "A little more honest",
    situation: "A warm exchange where one person shows clear but non-explicit interest.",
    register: "casual",
    lines: [
      { speaker:"A", korean:"요즘 너랑 얘기하는 거 좋아.", romanization:"yojeum neorang yaegihaneun geo joa.", meaning:"Lately I like talking with you." },
      { speaker:"B", korean:"갑자기 왜 그래?", romanization:"gapjagi wae geurae?", meaning:"Why are you saying that all of a sudden?" },
      { speaker:"A", korean:"그냥. 보고 싶기도 하고.", romanization:"geunyang. bogo sipgido hago.", meaning:"Just because. I kind of miss you too." },
    ],
    note: "-기도 하고 softens the feeling by presenting it as one part of what you mean.",
  },
  {
    id: "repair-misunderstanding",
    sceneId: "repair",
    title: "Clear up a misunderstanding",
    situation: "A low-drama apology after a message came across badly.",
    register: "casual",
    lines: [
      { speaker:"A", korean:"아까 말한 거 좀 기분 나빴어.", romanization:"akka malhan geo jom gibun napasseo.", meaning:"What you said earlier kind of upset me." },
      { speaker:"B", korean:"미안해. 그런 뜻은 아니었어.", romanization:"mianhae. geureon tteuseun anieosseo.", meaning:"I'm sorry. I didn't mean it that way." },
      { speaker:"B", korean:"내가 설명해도 돼?", romanization:"naega seolmyeonghaedo dwae?", meaning:"Can I explain?" },
    ],
    note: "The sequence apology → clarification → permission to explain keeps the repair less confrontational.",
  },
  {
    id: "cafe-order",
    sceneId: "cafe",
    title: "Order and takeout",
    situation: "A simple café order with a takeaway request.",
    register: "polite",
    lines: [
      { speaker:"Staff", korean:"주문 도와드릴까요?", romanization:"jumun dowadeurilkkayo?", meaning:"May I take your order?" },
      { speaker:"Customer", korean:"아이스 아메리카노 한 잔 주세요.", romanization:"aiseu amerikano han jan juseyo.", meaning:"One iced Americano, please." },
      { speaker:"Staff", korean:"매장에서 드세요?", romanization:"maejangeseo deuseyo?", meaning:"Will you have it here?" },
      { speaker:"Customer", korean:"아니요, 포장해 주세요.", romanization:"aniyo, pojanghae juseyo.", meaning:"No, to go please." },
    ],
    note: "Service interactions normally stay in polite speech even when the Korean is short.",
  },
  {
    id: "travel-lost",
    sceneId: "travel",
    title: "Lost near the station",
    situation: "Asking a stranger for the subway station and repairing when you miss part of the answer.",
    register: "polite",
    lines: [
      { speaker:"A", korean:"실례하지만 지하철역이 어디예요?", romanization:"sillyehajiman jihacheolyeogi eodiyeyo?", meaning:"Excuse me, where is the subway station?" },
      { speaker:"B", korean:"저기 사거리에서 오른쪽으로 가세요.", romanization:"jeogi sageorieseo oreunjjogeuro gaseyo.", meaning:"Go right at that intersection over there." },
      { speaker:"A", korean:"죄송하지만 다시 말해 주세요.", romanization:"joesonghajiman dasi malhae juseyo.", meaning:"Sorry, please say that again." },
    ],
    note: "실례하지만 and 죄송하지만 soften requests to strangers.",
  },
  {
    id: "school-work-late",
    sceneId: "school_work",
    title: "Running late",
    situation: "Letting a teacher, senior, or colleague know you may arrive late.",
    register: "polite",
    lines: [
      { speaker:"A", korean:"죄송하지만 조금 늦을 것 같아요.", romanization:"joesonghajiman jogeum neujeul geot gatayo.", meaning:"I'm sorry, I think I'll be a little late." },
      { speaker:"B", korean:"괜찮아요. 조심해서 오세요.", romanization:"gwaenchanayo. josimhaeseo oseyo.", meaning:"That's okay. Come safely." },
      { speaker:"A", korean:"네, 도착하면 바로 말씀드릴게요.", romanization:"ne, dochakhamyeon baro malsseumdeurilgeyo.", meaning:"Yes, I'll let you know as soon as I arrive." },
    ],
    note: "말씀드리다 is respectful and suits a senior-facing context.",
  },
]);

export function realKoreanDialogues(sceneId = null) {
  if (!sceneId) return REAL_KOREAN_DIALOGUES;
  return REAL_KOREAN_DIALOGUES.filter((dialogue) => dialogue.sceneId === sceneId);
}


const REAL_KOREAN_REGISTER_GUIDES = Object.freeze([
  {
    id: "close",
    label: "Close friend",
    speechLevel: "반말",
    tone: "Warm, compressed, subject-dropping",
    useWith: ["close friends", "same-age people after mutual comfort", "siblings / established intimate relationships"],
    avoidWith: ["teachers", "strangers", "service staff you do not know", "seniors unless they explicitly invite casual speech"],
    markers: ["-아/-어", "-지?", "-ㄹ까?", "subject omission", "shorter replies"],
    example: { korean:"지금 바빠?", meaning:"Are you busy right now?", shift:"지금 바빠요?" },
    why: "Casual Korean sounds natural because social distance is already low. The sentence can be short without sounding cold.",
  },
  {
    id: "neutral_polite",
    label: "Acquaintance / stranger",
    speechLevel: "해요체",
    tone: "Polite, neutral, everyday",
    useWith: ["people you just met", "casual public interactions", "someone whose preferred speech level is unclear"],
    avoidWith: ["situations requiring formal announcements or ceremonial language"],
    markers: ["-아요/-어요", "-세요", "softeners such as 좀 / 혹시"],
    example: { korean:"지금 바빠요?", meaning:"Are you busy right now?", shift:"지금 혹시 바쁘세요?" },
    why: "해요체 is the safest everyday default when closeness has not been established.",
  },
  {
    id: "senior",
    label: "Senior / teacher",
    speechLevel: "해요체 + honorific choices",
    tone: "Respectful, softened, hierarchy-aware",
    useWith: ["teachers", "professors", "older seniors", "workplace seniors"],
    avoidWith: ["copying intimate 반말 patterns word-for-word"],
    markers: ["-(으)세요", "-실까요", "말씀드리다", "부탁드리다", "죄송하지만 / 혹시"],
    example: { korean:"혹시 이거 좀 도와주실 수 있을까요?", meaning:"Would you possibly be able to help me with this?", shift:"이거 좀 도와줄 수 있어요?" },
    why: "Respect is carried not only by sentence endings but also by honorific verbs and request softeners.",
  },
  {
    id: "service",
    label: "Service interaction",
    speechLevel: "해요체",
    tone: "Short, polite, efficient",
    useWith: ["cafés", "restaurants", "shops", "ticket counters", "asking staff for help"],
    avoidWith: ["overly intimate 반말", "overly elaborate textbook sentences for simple requests"],
    markers: ["주세요", "-아/어 주세요", "-이요/-요", "counters"],
    example: { korean:"아이스 아메리카노 한 잔 주세요.", meaning:"One iced Americano, please.", shift:"아이스 아메리카노 한 잔이요." },
    why: "Real service Korean is often compact. Politeness comes from the ending and context rather than extra words.",
  },
]);

export function realKoreanRegisterGuides() {
  return REAL_KOREAN_REGISTER_GUIDES;
}

export function registerGuideForRelationship(relationship = "") {
  const map = {
    friend: "neutral_polite",
    close_friend: "close",
    friend_pulling: "close",
    crush: "neutral_polite",
    talking_stage: "close",
    partner: "close",
    senior: "senior",
    unsure: "neutral_polite",
  };
  const id = map[String(relationship)] || "neutral_polite";
  return REAL_KOREAN_REGISTER_GUIDES.find((guide) => guide.id === id) || REAL_KOREAN_REGISTER_GUIDES[1];
}

export function compareRegisterLine(message, relationship = "") {
  const guide = registerGuideForRelationship(relationship);
  const preset = findRealKoreanPreset(message, { relationship });
  return {
    guide,
    preset,
    caution: preset
      ? null
      : "Hallium does not have a register-safe deterministic line for this message yet, so it will not invent one locally.",
  };
}
