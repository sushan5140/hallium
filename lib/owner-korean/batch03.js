// Batch 03, Lessons 11–15. NEW continuation authored from the study
// sequence agreed in "TOPIK Level 2 Guidance", the source ledger for 01–10,
// and the owner's TOPIK I Level 1–2 Essential Grammar Guide.
// NOT represented as a previously generated Batch 03 PDF, nor official PYQs.
// Keep server-side alongside course.js; the lesson payload is never public.
const vocab = (entries) => entries.map((entry, i) => {
  const pos = entry.indexOf("|");
  if (pos < 1) throw new Error("Invalid Batch 03 vocabulary");
  return {id:"v" + (i+1), ko:entry.slice(0,pos), meaning:entry.slice(pos+1)};
});
const grammar = (name,meaning,explanation,examples) => ({
  id:name,name,meaning,explanation,examples:examples.map(line=>{
    const i=line.indexOf(" = ");
    return i === -1 ? {ko:line,en:""} : {ko:line.slice(0,i),en:line.slice(i+3)};
  })
});
const check=(question,answer)=>({question,answer});

export const ownerBatch03 = [
  {
    id:11,title:"Health and symptoms",
    aim:"Describe body parts and distinguish not doing something from being unable to do it.",
    vocabulary:vocab([
      "몸|body","머리|head","얼굴|face","코|nose","입|mouth",
      "귀|ear","목|neck / throat","배|stomach / belly","손|hand",
      "발|foot","다리|leg","어깨|shoulder",
      "아프다|to hurt / be sick","감기|a cold","약|medicine"
    ]),
    grammar:[
      grammar("안 + V/A","do not / not","Place 안 before a verb or adjective to negate an action or state. With many 하다 verbs, place 안 before 해요: 공부 안 해요. Contrast Lesson 06 N이/가 아니에요, which negates a noun identity.",[
        "오늘은 안 아파요. = I am not sick today.",
        "저는 커피를 안 마셔요. = I do not drink coffee."
      ]),
      grammar("못 + V","cannot (ability or circumstances)","Place 못 before an action verb when the action is impossible because of circumstances or ability. 안 means not doing / not being; 못 says cannot. For 하다 actions, say 공부 못 해요.",[
        "몸이 아파서 학교에 못 가요. = I cannot go to school because I am sick.",
        "감기 때문에 노래를 못 해요. = I cannot sing because of a cold."
      ])
    ],
    reading:"오늘은 몸이 아파요. 머리도 아파요. 그래서 학교에 못 가요. 집에서 쉬어요. 커피는 안 마시고 물을 마셔요.",
    readingQuestions:[
      ["왜 학교에 못 가요?","몸이 아파서요."],
      ["커피를 마셔요?","아니요, 안 마셔요."]
    ],
    listening:"가: 오늘 학교에 가요?\n나: 아니요. 감기에 걸려서 못 가요.\n가: 어디가 아파요?\n나: 목이 아파요. 약을 먹고 쉬어요.",
    listeningQuestions:[
      ["오늘 학교에 가요?","아니요, 못 가요."],
      ["어디가 아파요?","목이 아파요."]
    ],
    writing:"Write two short sentences: one thing you do not do (안) and one thing you cannot do because of circumstances (못).",
    checks:[
      check("Complete: 저는 커피를 ___ 마셔요. (I do not drink coffee)","안"),
      check("Complete: 몸이 아파서 학교에 ___ 가요. (cannot go)","못"),
      check("Write: My throat hurts. (Use 목)","목이 아파요.")
    ],
    note:"Review Lesson 06 아니다 vs 안: 학생이 아니에요 means not a student; 공부 안 해요 means do not study. 감기에 걸리다 is a useful fixed expression for catching a cold, but not an extra new word today."
  },
  {
    id:12,title:"Around the house",
    aim:"Talk about activities happening now and describe how a room's condition changed.",
    vocabulary:vocab([
      "방|room","부엌|kitchen","거실|living room",
      "침대|bed","책상|desk","의자|chair","창문|window","문|door",
      "불|light","냉장고|refrigerator","세탁기|washing machine",
      "빨래|laundry","설거지|washing dishes","정리하다|to tidy up",
      "깨끗하다|to be clean"
    ]),
    grammar:[
      grammar("V-고 있어요","action in progress","Attach -고 있어요 to a verb stem to say someone is currently doing something. Do not treat it as identical to the habitual polite present -아요/어요 from Lesson 01.",[
        "저는 지금 빨래를 하고 있어요. = I am doing laundry now.",
        "어머니가 부엌에서 설거지하고 있어요. = Mother is washing dishes in the kitchen."
      ]),
      grammar("A-아/어지다","become / get (state change)","Attach -아/어지다 to an adjective stem; conjugate the result for tense. 깨끗하다 becomes 깨끗해지다, and its past form is 깨끗해졌어요. This describes a change, not simply a current state.",[
        "방이 깨끗해졌어요. = The room became clean.",
        "날씨가 따뜻해졌어요. = The weather got warmer."
      ])
    ],
    reading:"저는 지금 방을 정리하고 있어요. 책상과 침대를 정리해요. 어머니는 부엌에서 설거지하고 있어요. 이제 방이 깨끗해졌어요.",
    readingQuestions:[
      ["저는 지금 무엇을 하고 있어요?","방을 정리하고 있어요."],
      ["방이 어떻게 됐어요?","깨끗해졌어요."]
    ],
    listening:"가: 지금 뭐 하고 있어요?\n나: 방을 정리하고 있어요.\n가: 부엌에서는 누가 설거지하고 있어요?\n나: 어머니가 하고 있어요. 방도 깨끗해졌어요.",
    listeningQuestions:[
      ["지금 무엇을 정리하고 있어요?","방을 정리하고 있어요."],
      ["누가 설거지하고 있어요?","어머니가 하고 있어요."]
    ],
    writing:"Write one sentence about what you are doing now with -고 있어요, and one sentence about a changed condition with -아/어졌어요.",
    checks:[
      check("Complete: 지금 빨래를 하고 ____. (in progress)","있어요"),
      check("Complete: 방이 깨끗해____. (became clean)","졌어요"),
      check("Write: I am tidying the room.","방을 정리하고 있어요.")
    ],
    note:"Past -아/어졌어요 expresses a completed change of state; -고 있어요 expresses an ongoing action. Review Lesson 02 past and Lesson 09 weather as needed."
  },
  {
    id:13,title:"Birthdays and gifts",
    aim:"Say who receives something and recognize respectful language about another person's actions.",
    vocabulary:vocab([
      "생일|birthday","선물|gift","카드|card","편지|letter",
      "꽃|flower","케이크|cake","파티|party",
      "축하하다|to congratulate","초대하다|to invite","감사하다|to thank",
      "받다|to receive","주다|to give","보내다|to send",
      "만나다|to meet","전화하다|to call by phone"
    ]),
    grammar:[
      grammar("N에게 / N한테","to a person / recipient","Put 에게 or conversational 한테 after a person who receives an object, message or call. For destinations such as school, keep using Lesson 03 에; do not use 에게 for a building.",[
        "친구에게 선물을 줘요. = I give a gift to a friend.",
        "동생한테 전화해요. = I call my younger sibling."
      ]),
      grammar("V-(으)시-","respectful subject action","Insert -(으)시- after a verb stem to honor the person doing the action. Vowel-final stems generally take -시-; most consonant-final stems take -으시-. With polite -어요, the forms commonly appear as -세요 or -으세요. Here it describes a respected person's action rather than instructing the listener as in Lesson 07.",[
        "할머니가 오세요. = Grandmother is coming (respectfully).",
        "선생님이 책을 읽으세요. = The teacher is reading a book (respectfully)."
      ])
    ],
    reading:"오늘은 할머니 생신이에요. 저는 할머니에게 꽃과 카드를 드려요. 친구한테는 편지를 보내요. 할머니가 집에 오세요. 우리는 함께 축하해요.",
    readingQuestions:[
      ["할머니에게 무엇을 드려요?","꽃과 카드를 드려요."],
      ["누가 집에 오세요?","할머니가 오세요."]
    ],
    listening:"가: 오늘 누구 생일이에요?\n나: 할머니 생신이에요.\n가: 누구에게 선물을 줘요?\n나: 할머니에게 선물을 드려요. 친구한테는 카드를 보내요.",
    listeningQuestions:[
      ["누구 생신이에요?","할머니 생신이에요."],
      ["친구한테 무엇을 보내요?","카드를 보내요."]
    ],
    writing:"Write two sentences about a celebration: use 에게 or 한테 for the recipient and -(으)시- when describing a respected person's action.",
    checks:[
      check("Complete: 친구___ 선물을 줘요. (to a friend; formal particle)","에게"),
      check("Complete: 동생___ 전화해요. (conversational particle)","한테"),
      check("Conjugate 오다 respectfully in polite present.","오세요")
    ],
    note:"생신 and 드리다 are recognition-only honorific alternatives to 생일 and 주다; they are not counted among today's 15 new targets. Lesson 07's -세요 can be a request or an honorific statement depending on context."
  },
  {
    id:14,title:"Invitations and appointments",
    aim:"Suggest an activity together and make a polite group proposal.",
    vocabulary:vocab([
      "약속|appointment / promise","일정|schedule","계획|plan",
      "날짜|date","장소|place / venue","모임|gathering",
      "행사|event","주중|weekdays","금요일|Friday",
      "토요일|Saturday","일요일|Sunday","잠깐|for a moment",
      "함께|together","기다리다|to wait","시작하다|to begin"
    ]),
    grammar:[
      grammar("V-(으)ㄹ까요?","shall we? / shall I?","Use -ㄹ까요 after a vowel-final stem, -을까요 after most consonant-final stems. ㄹ-final stems keep one ㄹ. It is used to suggest or ask about a possible shared action, or the speaker's action.",[
        "토요일에 만날까요? = Shall we meet on Saturday?",
        "점심을 먹을까요? = Shall we have lunch?"
      ]),
      grammar("V-(으)ㅂ시다","let's (formal proposal)","Use -ㅂ시다 after a vowel-final stem, -읍시다 after a consonant-final stem. This is a relatively formal 'let's' proposal, not a command to another person. Prefer -아요/어요 for casual everyday joint plans.",[
        "금요일에 만납시다. = Let's meet on Friday.",
        "같이 점심을 먹읍시다. = Let's have lunch together."
      ])
    ],
    reading:"토요일에 모임이 있어요. 친구와 카페에서 만날까요? 오후 세 시에 시작해요. 친구가 늦으면 잠깐 기다립시다.",
    readingQuestions:[
      ["언제 모임이 있어요?","토요일에 있어요."],
      ["모임은 몇 시에 시작해요?","오후 세 시에 시작해요."]
    ],
    listening:"가: 이번 금요일에 약속이 있어요?\n나: 아니요, 없어요.\n가: 그럼 같이 카페에 갈까요?\n나: 좋아요. 오후에 만납시다.",
    listeningQuestions:[
      ["무슨 요일에 카페에 갈까요?","금요일에요."],
      ["언제 만납시다라고 해요?","오후에요."]
    ],
    writing:"Invite a friend to one activity with -(으)ㄹ까요? and write a polite proposal with -(으)ㅂ시다.",
    checks:[
      check("Complete: 토요일에 만나___? (Shall we meet?)","ㄹ까요"),
      check("Complete: 같이 점심을 먹____. (Let's eat; formal)","읍시다"),
      check("Write: Let's meet on Friday. (formal proposal)","금요일에 만납시다.")
    ],
    note:"Meeting time 세 시 uses native-number hours (세), and dates use other number patterns. The conditional -(으)면 in the reading is recognition-only, not a new target here."
  },
  {
    id:15,title:"Trips and experiences",
    aim:"Explain whether you have done something before and suggest trying something new.",
    vocabulary:vocab([
      "여행|travel / trip","관광|sightseeing","사진|photograph",
      "바다|sea","산|mountain","강|river","섬|island",
      "숙소|accommodation","호텔|hotel","박물관|museum",
      "시장|market","풍경|scenery","방문하다|to visit",
      "찍다|to take a photo","구경하다|to look around / sightsee"
    ]),
    grammar:[
      grammar("V-(으)ㄴ 적이 있어요/없어요","have / have never done","Attach -ㄴ 적이 after a vowel-final verb stem, -은 적이 after most consonant-final stems. ㄹ-final stems lose ㄹ before ㄴ. Follow with 있어요 or 없어요 to say if the experience has happened. The main verb is in its modifier form, not polite past tense.",[
        "바다에 간 적이 있어요. = I have been to the sea before.",
        "그 음식을 먹은 적이 없어요. = I have never eaten that food."
      ]),
      grammar("V-아/어 보다","try doing / experience doing","Attach -아/어 보다 after a verb's -아/어 form. 먹어 봐요 = try eating; 가 봤어요 = have tried going / have been. It can express trying something, not just ordinary seeing. Compare 적이 있다 for reporting whether an experience has happened.",[
        "이 음식을 먹어 봐요. = Try this food.",
        "그 박물관에 가 봤어요. = I have been to that museum."
      ])
    ],
    reading:"저는 바다에 간 적이 있어요. 하지만 섬에 간 적은 없어요. 이번에는 친구와 여행할 거예요. 박물관에 가 보고 사진도 찍을 거예요.",
    readingQuestions:[
      ["어디에 간 적이 있어요?","바다에 간 적이 있어요."],
      ["섬에 간 적이 있어요?","아니요, 없어요."]
    ],
    listening:"가: 한국에 간 적이 있어요?\n나: 아니요, 아직 없어요.\n가: 그럼 여행할 때 무엇을 해 보고 싶어요?\n나: 시장을 구경하고 사진을 찍고 싶어요.",
    listeningQuestions:[
      ["한국에 간 적이 있어요?","아니요, 없어요."],
      ["여행할 때 무엇을 하고 싶어요?","시장을 구경하고 사진을 찍고 싶어요."]
    ],
    writing:"Write one sentence about a place you've visited (or never visited) using 적이 있어요/없어요; add something new you want to try with -아/어 보다.",
    checks:[
      check("Complete: 바다에 간 적이 ____. (I have been there)","있어요"),
      check("Complete: 그 음식을 먹___ 봐요. (Try eating it)","어"),
      check("Write: I have been to a museum before.","박물관에 간 적이 있어요.")
    ],
    note:"Cumulative mini-checkpoint: revisit all 225 target vocabulary items and all 30 primary grammar targets from Lessons 01–15, re-answer the reading/listening questions and produce a short paragraph. These are original lessons, not official TOPIK examination questions."
  }
];

for (const l of ownerBatch03) {
  if (l.vocabulary.length!==15 || l.grammar.length!==2 || l.checks.length!==3 ||
      l.readingQuestions.length!==2 || l.listeningQuestions.length!==2) {
    throw new Error("Incomplete Batch 03 lesson "+l.id);
  }
}
