// Batch 04, Lessons 16–20. NEW continuation built from the prior
// "TOPIK Level 2 Guidance" 5-lesson / 15-word / 2-grammar format and
// TOPIK I Level 1–2 Essential Grammar Guide. Not an existing Batch 04 PDF,
// not official TOPIK past questions. Server-only private owner course.
const vocab = (entries) => entries.map((entry, i) => {
  const pos=entry.indexOf("|");
  if(pos<1)throw new Error("Invalid Batch 04 vocabulary");
  return {id:"v"+(i+1),ko:entry.slice(0,pos),meaning:entry.slice(pos+1)};
});
const grammar=(name,meaning,explanation,examples)=>({
  id:name,name,meaning,explanation,
  examples:examples.map(line=>{
    const i=line.indexOf(" = ");
    return i===-1?{ko:line,en:""}:{ko:line.slice(0,i),en:line.slice(i+3)};
  })
});
const check=(question,answer)=>({question,answer});

export const ownerBatch04=[
  {
    id:16,title:"Rules and permission",
    aim:"Understand simple notices and ask what you may or must not do in shared spaces.",
    vocabulary:vocab([
      "규칙|rule","안내|information / guidance","표지|sign / notice",
      "출입|entry / entering","입장|admission / entering",
      "금지|prohibition","허락|permission","사용하다|to use",
      "열다|to open","닫다|to close","켜다|to switch on",
      "끄다|to switch off","조용하다|to be quiet",
      "시끄럽다|to be noisy","휴대전화|mobile phone"
    ]),
    grammar:[
      grammar("V-아/어도 돼요","may / it is okay to do",
        "Add -아도 to stems with ㅏ/ㅗ and -어도 to others before 돼요; 하다 becomes 해도 돼요. Use it to grant or ask permission. Compare V-(으)ㄹ 수 있어요 from Lesson 10, which expresses ability or possibility, not permission.",[
        "여기에서 사진을 찍어도 돼요? = May I take photographs here?",
        "문을 열어도 돼요. = You may open the door."
      ]),
      grammar("V-(으)면 안 돼요","must not / not allowed",
        "Add -면 to vowel-final and ㄹ-final verb stems, -으면 to most other consonant-final stems; follow with 안 돼요. This prohibits an action. It is stronger than the simple factual negative 안 + V from Lesson 11.",[
        "여기에서 휴대전화를 사용하면 안 돼요. = You must not use a mobile phone here.",
        "사진을 찍으면 안 돼요. = You must not take photographs."
      ])
    ],
    reading:"도서관에 안내 표지가 있어요. '조용히 하세요. 휴대전화를 사용하면 안 돼요.' 물은 마셔도 돼요. 문을 열어도 돼요. 모두 규칙을 읽어요.",
    readingQuestions:[
      ["도서관에서 휴대전화를 사용해도 돼요?","아니요, 사용하면 안 돼요."],
      ["도서관에서 물을 마셔도 돼요?","네, 마셔도 돼요."]
    ],
    listening:"가: 여기에서 사진을 찍어도 돼요?\n나: 아니요, 사진을 찍으면 안 돼요.\n가: 그럼 휴대전화를 사용해도 돼요?\n나: 네, 여기에서는 사용해도 돼요.",
    listeningQuestions:[
      ["사진을 찍어도 돼요?","아니요, 찍으면 안 돼요."],
      ["휴대전화를 사용해도 돼요?","네, 사용해도 돼요."]
    ],
    writing:"Write one request for permission and one prohibition for a shared place. Contrast -아/어도 돼요 with -(으)면 안 돼요.",
    checks:[
      check("Complete: 문을 열어___ 돼요. (You may open it)","도"),
      check("Complete: 사진을 찍___ 안 돼요. (You must not)","으면"),
      check("Write: May I open the door?","문을 열어도 돼요?")
    ],
    note:"TOPIK I Level 2 grammar extension: permission and prohibition are not the same as can/cannot. A place's actual regulations vary; these example notices are language practice, not real venue rules."
  },
  {
    id:17,title:"Forms and responsibilities",
    aim:"Explain what needs to be done and what is optional while preparing an application or appointment.",
    vocabulary:vocab([
      "준비하다|to prepare","제출하다|to submit","확인하다|to check / confirm",
      "예약하다|to reserve / book","취소하다|to cancel",
      "신청하다|to apply / sign up","등록하다|to register",
      "필요하다|to be needed","필수|mandatory / essential",
      "마감|deadline","준비물|items to bring / prepare",
      "신분증|identity document","여권|passport",
      "서류|document / paperwork","양식|form / template"
    ]),
    grammar:[
      grammar("V-아/어야 해요","must / have to",
        "Add -아/어야 해요 to an action verb: ㅏ/ㅗ generally take -아야, others -어야, 하다 becomes 해야 해요. This expresses necessity; it is different from -아/어도 돼요 (permission). -아/어야 돼요 is also common.",[
        "오늘 서류를 제출해야 해요. = I must submit the documents today.",
        "예약을 확인해야 해요. = I have to confirm the booking."
      ]),
      grammar("V-지 않아도 돼요","do not have to / optional",
        "Attach -지 않아도 돼요 to a verb stem. It means an action is not required, not that it is prohibited. Compare -아/어야 해요 and Lesson 16 -(으)면 안 돼요 carefully.",[
        "사진은 제출하지 않아도 돼요. = You do not have to submit a photo.",
        "내일은 오지 않아도 돼요. = You do not have to come tomorrow."
      ])
    ],
    reading:"오늘은 신청 마감이에요. 서류를 확인하고 양식을 제출해야 해요. 여권은 필요해요. 사진은 제출하지 않아도 돼요. 예약을 취소할 때는 먼저 확인해요.",
    readingQuestions:[
      ["오늘 무엇을 제출해야 해요?","양식을 제출해야 해요."],
      ["사진도 꼭 제출해야 해요?","아니요, 제출하지 않아도 돼요."]
    ],
    listening:"가: 오늘 신청하려고 해요. 무엇을 준비해야 해요?\n나: 여권과 서류를 준비해야 해요.\n가: 사진도 제출해야 해요?\n나: 아니요, 사진은 제출하지 않아도 돼요.",
    listeningQuestions:[
      ["무엇을 준비해야 해요?","여권과 서류를 준비해야 해요."],
      ["사진도 제출해야 해요?","아니요, 제출하지 않아도 돼요."]
    ],
    writing:"Write two lines for a fictional checklist: one required action with -아/어야 해요 and one optional action with -지 않아도 돼요.",
    checks:[
      check("Complete: 오늘 서류를 제출___ 해요. (must submit)","해야"),
      check("Complete: 내일은 오지 ___ 돼요. (do not have to come)","않아도"),
      check("Write: You do not have to submit a photo.","사진은 제출하지 않아도 돼요.")
    ],
    note:"Application instructions here are invented Korean practice scenarios, not scholarship or travel requirements. -(으)려고 해요 in the listening is recognition-only; it becomes a later primary grammar target."
  },
  {
    id:18,title:"Delays and decisions",
    aim:"Understand if/when conditions and give a reason before suggesting an action.",
    vocabulary:vocab([
      "기분|mood / feeling","피곤하다|to be tired",
      "졸리다|to be sleepy","바쁘다|to be busy",
      "늦다|to be late","서두르다|to hurry",
      "조심하다|to be careful","도착하다|to arrive",
      "출발하다|to depart","비상|emergency",
      "안전|safety","위험하다|to be dangerous",
      "미끄럽다|to be slippery","복잡하다|to be crowded / complex",
      "한가하다|to be free / not busy"
    ]),
    grammar:[
      grammar("V/A-(으)면","if / when",
        "Attach -면 to a vowel-final or ㄹ-final stem and -으면 to most other consonant-final stems. With adjectives this can express a condition too. Review Lesson 16 -(으)면 안 돼요, where the same conditional form combines with prohibition.",[
        "시간이 있으면 만나요. = If you have time, let's meet.",
        "바쁘면 나중에 전화하세요. = If you are busy, please call later."
      ]),
      grammar("V/A-(으)니까","because / since (reason)",
        "Use -니까 after vowel-final or ㄹ-final stems, -으니까 after most consonant-final stems. It gives a reason, often naturally followed by a request, command or suggestion. Contrast Lesson 09 -아/어서; do not assume they are always interchangeable.",[
        "늦었으니까 택시를 타세요. = Since it is late, take a taxi.",
        "길이 복잡하니까 지하철로 가세요. = Since the roads are crowded, go by subway."
      ])
    ],
    reading:"오늘은 길이 복잡해요. 늦었으니까 지하철로 가세요. 시간이 있으면 조금 걸어도 돼요. 길이 미끄러우면 조심하세요. 안전이 중요해요.",
    readingQuestions:[
      ["왜 지하철로 가라고 해요?","늦었으니까요."],
      ["길이 미끄러우면 어떻게 해야 해요?","조심해야 해요."]
    ],
    listening:"가: 오늘 길이 복잡해요?\n나: 네, 복잡해요. 늦었으니까 지하철로 가세요.\n가: 시간이 있으면 걸어도 돼요?\n나: 네. 하지만 길이 미끄러우면 조심하세요.",
    listeningQuestions:[
      ["왜 지하철로 가라고 해요?","늦었으니까요."],
      ["길이 미끄러우면 무엇을 해야 해요?","조심해야 해요."]
    ],
    writing:"Write one if/when condition with -(으)면, then give a reason leading into advice with -(으)니까.",
    checks:[
      check("Complete: 시간이 있___ 만나요. (if there is time)","으면"),
      check("Complete: 늦었___ 택시를 타세요. (since it is late)","으니까"),
      check("Write: If you are busy, call later.","바쁘면 나중에 전화하세요.")
    ],
    note:"Compare -아/어서 and -(으)니까: the latter is commonly used before instructions. 미끄럽다 → 미끄러우면 is a ㅂ-irregular adjective; recognize the change without counting it as another new grammar point."
  },
  {
    id:19,title:"Before and after",
    aim:"Sequence everyday actions: what happens before an event and what happens after a task is finished.",
    vocabulary:vocab([
      "순서|order / sequence","먼저|first",
      "나중에|later","미리|in advance",
      "일찍|early","늦게|late / at a late time",
      "알람|alarm","잠|sleep",
      "자다|to sleep","잠들다|to fall asleep",
      "끝나다|to end (intransitive)","끝내다|to finish something",
      "외출하다|to go out","돌아오다|to come back",
      "운동하다|to exercise"
    ]),
    grammar:[
      grammar("V-기 전에","before doing",
        "Attach -기 전에 directly to the dictionary verb stem: 자다 → 자기 전에, 먹다 → 먹기 전에. The first action is the event that has not happened yet. N 전에 (before a noun) is related but structurally different.",[
        "자기 전에 이를 닦아요. = I brush my teeth before sleeping.",
        "학교에 가기 전에 운동해요. = I exercise before going to school."
      ]),
      grammar("V-고 나서","after finishing (an action)",
        "Attach -고 나서 to the verb stem to say that one action is finished before the next starts. Distinguish it from V-고 from Lesson 04, which simply links actions and does not always stress completion.",[
        "밥을 먹고 나서 공부해요. = After eating, I study.",
        "운동하고 나서 샤워해요. = After exercising, I shower."
      ])
    ],
    reading:"아침에 일찍 일어나요. 학교에 가기 전에 운동해요. 수업이 끝나고 나서 집에 돌아와요. 밤에는 자기 전에 알람을 확인해요.",
    readingQuestions:[
      ["학교에 가기 전에 무엇을 해요?","운동해요."],
      ["수업이 끝나고 나서 어디에 가요?","집에 돌아와요."]
    ],
    listening:"가: 아침에 먼저 뭐 해요?\n나: 아침을 먹기 전에 운동해요.\n가: 운동하고 나서 뭐 해요?\n나: 샤워하고 학교에 가요.",
    listeningQuestions:[
      ["아침을 먹기 전에 무엇을 해요?","운동해요."],
      ["운동하고 나서 무엇을 해요?","샤워해요."]
    ],
    writing:"Write two lines about your real morning: one before-action (-기 전에) and one after-completion (-고 나서).",
    checks:[
      check("Complete: 자기 ___ 이를 닦아요. (before sleeping)","전에"),
      check("Complete: 운동하고 ___ 샤워해요. (after exercising)","나서"),
      check("Write: After eating, I study.","밥을 먹고 나서 공부해요.")
    ],
    note:"The comparison V-(으)ㄴ 후에 is useful recognition, but is not a third new primary grammar target here. 끝나다 describes something ending; 끝내다 means finishing something."
  },
  {
    id:20,title:"Comparing everyday choices",
    aim:"Read contrasting opinions and describe alternative activities with the appropriate clause connector.",
    vocabulary:vocab([
      "선택|choice / selection","비교|comparison",
      "장점|advantage","단점|disadvantage",
      "편리하다|to be convenient","불편하다|to be inconvenient",
      "쉽다|to be easy","어렵다|to be difficult",
      "빠르다|to be fast","느리다|to be slow",
      "싸다|to be inexpensive","비싸다|to be expensive",
      "재미있다|to be interesting / fun",
      "지루하다|to be boring","가볍다|to be light in weight"
    ]),
    grammar:[
      grammar("V/A-지만","but / although",
        "Attach -지만 to a verb or adjective stem. It joins contrasting statements, while the final predicate shows the main tense. Compare Lesson 09 -아/어서, which connects reason and result rather than contrast.",[
        "택시는 편리하지만 비싸요. = A taxi is convenient but expensive.",
        "버스는 싸지만 느려요. = A bus is cheap but slow."
      ]),
      grammar("V-거나","or (between actions)",
        "Attach -거나 to a verb stem to describe alternative actions. For a choice between nouns, use a noun-linking construction instead; do not attach -거나 directly to a bare noun.",[
        "주말에 쉬거나 영화를 봐요. = On weekends I rest or watch a movie.",
        "지하철을 타거나 걸어요. = I take the subway or walk."
      ])
    ],
    reading:"택시는 편리하지만 비싸요. 버스는 싸지만 느려요. 저는 시간이 있으면 버스를 타거나 걸어요. 오늘은 지하철을 타요. 어떤 방법이 더 좋아요?",
    readingQuestions:[
      ["택시의 단점은 무엇이에요?","비싸요."],
      ["시간이 있으면 무엇을 해요?","버스를 타거나 걸어요."]
    ],
    listening:"가: 버스가 좋아요, 택시가 좋아요?\n나: 택시는 편리하지만 비싸요.\n가: 그럼 보통 어떻게 가요?\n나: 버스를 타거나 지하철을 타요.",
    listeningQuestions:[
      ["택시는 어떤 단점이 있어요?","비싸요."],
      ["어떤 교통수단을 이용해요?","버스나 지하철이요."]
    ],
    writing:"Compare two transport options with -지만, then describe two possible activities with -거나.",
    checks:[
      check("Complete: 택시는 편리하___ 비싸요. (but)","지만"),
      check("Complete: 주말에 쉬___ 영화를 봐요. (or)","거나"),
      check("Write: A taxi is convenient but expensive.","택시는 편리하지만 비싸요.")
    ],
    note:"Cumulative review: Lessons 01–20 contain 300 new-target vocabulary entries and 40 new primary grammar entries. Revisit permission vs ability, obligation vs prohibition, reasons vs conditions, before vs after, and contrast vs alternatives. TOPIK I Level 2 practice here is not an official past-question set."
  }
];
for (const l of ownerBatch04) {
 if(l.vocabulary.length!==15||l.grammar.length!==2||l.checks.length!==3||
    l.readingQuestions.length!==2||l.listeningQuestions.length!==2){
   throw new Error("Incomplete Batch 04 lesson "+l.id);
 }
}
