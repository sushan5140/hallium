// Hallium-authored examples and checks; only short linguistic vocabulary/grammar labels are derived from exam themes.
// Source audit: seven TOPIK I and seven TOPIK II original-paper rounds in owner's PDFs, plus sampled 83/91/96/102 TOPIK I reading pages.
// No original exam question or audio is embedded, reproduced, or represented as Hallium scoring material.
const raw=[
 [
  "I",
  "i01",
  "Identity & people",
  "Who is this about?",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60,
   91
  ],
  "이름:name|직업:occupation|학생:student|가족:family|친구:friend",
  [
   [
    "N + 이에요/예요",
    "to be / is",
    "Consonant-final noun + 이에요; vowel-final noun + 예요.",
    "제 동생은 대학생이에요.",
    "My younger sibling is a university student."
   ],
   [
    "N + 은/는",
    "topic marker",
    "Introduce the topic and contrast known information.",
    "저는 주말에 한국어를 배워요.",
    "I learn Korean on weekends."
   ]
  ]
 ],
 [
  "I",
  "i02",
  "Dates & schedules",
  "Catch the date, not a distractor.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60,
   83
  ],
  "요일:day of the week|오후:afternoon|예약:reservation|시간:time|일정:schedule",
  [
   [
    "Time + 에",
    "at a time",
    "Use 에 to locate a time or scheduled action.",
    "수요일에 시험이 있어요.",
    "There is a test on Wednesday."
   ],
   [
    "N + 부터/까지",
    "from / until",
    "Track the boundaries of an event or time window.",
    "수업은 아홉 시부터 열한 시까지예요.",
    "Class is from nine to eleven."
   ]
  ]
 ],
 [
  "I",
  "i03",
  "Places & location",
  "Don't confuse destination with action.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60,
   83
  ],
  "도서관:library|약국:pharmacy|근처:nearby|건너편:opposite side|길:street / way",
  [
   [
    "Place + 에 가다",
    "go to a place",
    "Use 에 for the destination of movement.",
    "버스로 병원에 가요.",
    "I go to the hospital by bus."
   ],
   [
    "Place + 에서",
    "at / in (action site)",
    "Use 에서 for the place where an action happens.",
    "도서관에서 자료를 찾아요.",
    "I look for materials at the library."
   ]
  ]
 ],
 [
  "I",
  "i04",
  "Food & ordering",
  "Find the request and the item.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60,
   96,
   102
  ],
  "식당:restaurant|메뉴:menu|주문:order|떡볶이:tteokbokki|음료:drink",
  [
   [
    "N + 을/를 주세요",
    "please give me",
    "Mark the object and request it politely.",
    "따뜻한 차를 한 잔 주세요.",
    "Please give me one cup of warm tea."
   ],
   [
    "V + 고 싶다",
    "want to do",
    "Express a desired action, not an action already completed.",
    "오늘은 집에서 밥을 먹고 싶어요.",
    "I want to eat at home today."
   ]
  ]
 ],
 [
  "I",
  "i05",
  "Shopping & quantity",
  "Locate price, object and count.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60,
   83
  ],
  "가격:price|할인:discount|가방:bag|개:item counter|영수증:receipt",
  [
   [
    "N + 이/가 있다/없다",
    "there is / is not",
    "Check whether a shop has something.",
    "작은 가방도 있어요?",
    "Do you also have a small bag?"
   ],
   [
    "Number + 개/명/잔",
    "item / person / cup counters",
    "Listen to the counter, not only the number.",
    "물 두 잔을 부탁해요.",
    "Two glasses of water, please."
   ]
  ]
 ],
 [
  "I",
  "i06",
  "Routine & frequency",
  "Identify who does what and when.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60,
   91
  ],
  "출근:go to work|퇴근:leave work|매일:every day|자주:often|운동:exercise",
  [
   [
    "V + 아요/어요",
    "polite present",
    "Recognize habitual actions and current situations.",
    "퇴근하고 가끔 산책해요.",
    "I sometimes walk after work."
   ],
   [
    "N + 도",
    "also / too",
    "Identify added information or parallel events.",
    "형도 아침에 운동해요.",
    "My older brother also exercises in the morning."
   ]
  ]
 ],
 [
  "I",
  "i07",
  "Yesterday & tomorrow",
  "Match time markers to tense.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60
  ],
  "지난주:last week|어제:yesterday|내일:tomorrow|약속:appointment|계획:plan",
  [
   [
    "V + 았/었어요",
    "past event",
    "Use the past marker for finished actions.",
    "어제 책을 빌렸어요.",
    "I borrowed a book yesterday."
   ],
   [
    "V + (으)ㄹ 거예요",
    "future plan / prediction",
    "Pay attention to whether a plan is upcoming.",
    "다음 주에 가족을 만날 거예요.",
    "I will meet my family next week."
   ]
  ]
 ],
 [
  "I",
  "i08",
  "Reasons & intentions",
  "Why did the speaker do it?",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60
  ],
  "이유:reason|늦다:be late|고장:breakdown|준비:preparation|피곤하다:be tired",
  [
   [
    "V/A + 아서/어서",
    "because / so",
    "Find the stated cause behind an action or state.",
    "버스가 늦어서 택시를 탔어요.",
    "The bus was late, so I took a taxi."
   ],
   [
    "V + (으)려고",
    "in order to",
    "Recognize purpose, not outcome.",
    "표를 사려고 역에 갔어요.",
    "I went to the station to buy a ticket."
   ]
  ]
 ],
 [
  "I",
  "i09",
  "Notices & invitations",
  "Read the conditions carefully.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60
  ],
  "모집:recruitment|신청:application|참가:participation|무료:free of charge|입장:admission",
  [
   [
    "V + (으)세요",
    "polite instruction",
    "Find what the notice asks people to do.",
    "신청서를 금요일까지 보내세요.",
    "Please send the application by Friday."
   ],
   [
    "V/A + (으)면",
    "if / when",
    "A conditional can change who is eligible or what to do.",
    "비가 오면 행사는 안에서 열려요.",
    "If it rains, the event is held indoors."
   ]
  ]
 ],
 [
  "I",
  "i10",
  "Comparison & preference",
  "Track what is more or less.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60
  ],
  "편하다:comfortable|가볍다:lightweight|빠르다:fast|비싸다:expensive|저렴하다:inexpensive",
  [
   [
    "N + 보다 더",
    "more than",
    "Compare the correct two things rather than choosing a keyword.",
    "기차가 버스보다 더 빨라요.",
    "The train is faster than the bus."
   ],
   [
    "V/A + 지만",
    "but / although",
    "Notice the clause after a contrast.",
    "멀지만 조용해서 좋아요.",
    "It is far, but I like it because it is quiet."
   ]
  ]
 ],
 [
  "I",
  "i11",
  "Messages & sequence",
  "Reconstruct what happened first.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60,
   83
  ],
  "먼저:first|그다음:after that|연락:contact|도착:arrival|출발:departure",
  [
   [
    "V + 고 나서",
    "after doing",
    "Read the action before 고 나서 first.",
    "숙제를 끝내고 나서 친구에게 전화했어요.",
    "After finishing homework, I called my friend."
   ],
   [
    "V + 기 전에",
    "before doing",
    "The following event happens before the verb action.",
    "나가기 전에 창문을 닫아요.",
    "I close the window before going out."
   ]
  ]
 ],
 [
  "I",
  "i12",
  "Connectors & main idea",
  "Track the passage, not isolated words.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60,
   102
  ],
  "내용:content|중심 생각:main idea|그래서:therefore|하지만:however|그리고:and / then",
  [
   [
    "그래서 / 하지만 / 그리고",
    "result / contrast / addition",
    "Choose by the relationship between the sentences.",
    "날씨가 나빴어요. 그래서 집에서 쉬었어요.",
    "The weather was bad. So I rested at home."
   ],
   [
    "V/A + 기 때문에",
    "because",
    "Recognize explicit causes in short explanations.",
    "길이 막히기 때문에 일찍 출발해요.",
    "I leave early because the traffic is heavy."
   ]
  ]
 ],
 [
  "II",
  "ii01",
  "Headlines & formal wording",
  "Decode compressed newspaper meaning.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60
  ],
  "급증:sharp increase|하락:decline|대책:measure / response|확대:expansion|우려:concern",
  [
   [
    "N + 에 따라",
    "according to / as changes",
    "Track how a result depends on a condition.",
    "지역에 따라 요금이 달라질 수 있어요.",
    "Fees may differ by region."
   ],
   [
    "N + 을/를 둘러싸고",
    "concerning / around an issue",
    "Identify what the disagreement or discussion concerns.",
    "새 제도를 둘러싸고 토론이 열렸어요.",
    "A discussion was held around the new system."
   ]
  ]
 ],
 [
  "II",
  "ii02",
  "Surveys & charts",
  "Separate trend from number.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60
  ],
  "비율:proportion|조사:survey|결과:result|증가:increase|감소:decrease",
  [
   [
    "N + 에 따르면",
    "according to (a source)",
    "Look for the named source and its actual claim.",
    "조사에 따르면 이용 시간이 줄었어요.",
    "According to the survey, usage time decreased."
   ],
   [
    "V + 는 경향이 있다",
    "tend to",
    "Express a tendency rather than an absolute fact.",
    "주말에는 늦게 자는 경향이 있어요.",
    "People tend to sleep later on weekends."
   ]
  ]
 ],
 [
  "II",
  "ii03",
  "Cause & consequence",
  "Distinguish reason and outcome.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60
  ],
  "원인:cause|영향:effect|결과:outcome|개선:improvement|부담:burden",
  [
   [
    "V/A + 기 때문에",
    "because",
    "Identify the reason explicitly stated in the text.",
    "자료가 부족하기 때문에 추가 조사가 필요해요.",
    "More research is needed because data are insufficient."
   ],
   [
    "V + 는 바람에",
    "due to an unwanted event",
    "Often marks an unexpectedly negative cause.",
    "길이 막히는 바람에 발표에 늦었어요.",
    "I was late for the presentation because of traffic."
   ]
  ]
 ],
 [
  "II",
  "ii04",
  "Contrast & concession",
  "Read both sides of a claim.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60
  ],
  "반면:whereas|그러나:however|장점:advantage|단점:disadvantage|한계:limitation",
  [
   [
    "V/A + (으)ㄴ/는 반면에",
    "whereas / in contrast",
    "Keep the two compared sides distinct.",
    "편리한 반면에 비용이 많이 들어요.",
    "It is convenient, whereas it costs a lot."
   ],
   [
    "V/A + 기는 하지만",
    "although it is true that",
    "Acknowledge a point before qualifying it.",
    "효과가 있기는 하지만 시간이 걸려요.",
    "It works, but it takes time."
   ]
  ]
 ],
 [
  "II",
  "ii05",
  "Reported speech & stance",
  "Who said what?",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60
  ],
  "주장:claim|발표:announcement|설명:explanation|요청:request|의견:opinion",
  [
   [
    "Statement + 다고 하다",
    "report that",
    "Identify whose words are being reported.",
    "담당자는 일정이 바뀌었다고 했어요.",
    "The manager said the schedule had changed."
   ],
   [
    "Question + 냐고 하다",
    "report a question",
    "Separate a question someone asked from an assertion.",
    "언제 마감하냐고 물었어요.",
    "They asked when it closes."
   ]
  ]
 ],
 [
  "II",
  "ii06",
  "Change & inference",
  "What conclusion follows?",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60
  ],
  "변화:change|추정:estimate|가능성:possibility|경향:tendency|예상:expectation",
  [
   [
    "V + 게 되다",
    "come to / end up",
    "Focus on a resulting state or change.",
    "새로운 분야를 공부하게 되었어요.",
    "I ended up studying a new field."
   ],
   [
    "V/A + (으)ㄴ/는 듯하다",
    "seem / appear",
    "Signals a cautious inference, not certainty.",
    "상황이 조금 나아진 듯해요.",
    "The situation seems to have improved a little."
   ]
  ]
 ],
 [
  "II",
  "ii07",
  "Health, work & society",
  "Follow an explanatory paragraph.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60
  ],
  "환경:environment|직장:workplace|건강:health|스트레스:stress|지원:support",
  [
   [
    "V + 도록",
    "so that / to ensure",
    "Purpose or result in formal informational texts.",
    "안전하게 걸을 수 있도록 길을 고쳤어요.",
    "The road was repaired so people can walk safely."
   ],
   [
    "N + 뿐만 아니라",
    "not only / as well as",
    "Watch for a second additional factor.",
    "운동은 체력뿐만 아니라 기분에도 좋아요.",
    "Exercise benefits mood as well as fitness."
   ]
  ]
 ],
 [
  "II",
  "ii08",
  "Reading flow & insertion",
  "Connect sentences logically.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60
  ],
  "문맥:context|순서:sequence|근거:basis|요약:summary|주제:topic",
  [
   [
    "V + 는 데다가",
    "on top of / moreover",
    "Adds another supporting cause or characteristic.",
    "가격이 싼 데다가 품질도 좋아요.",
    "It is inexpensive and, on top of that, good quality."
   ],
   [
    "V + 는 대신에",
    "instead of / in exchange for",
    "Recognize replacement or a trade-off.",
    "자동차를 타는 대신에 지하철을 이용해요.",
    "I use the subway instead of driving."
   ]
  ]
 ],
 [
  "II",
  "ii09",
  "Writing 51–52: complete the logic",
  "Short-answer cohesion practice.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60
  ],
  "원고:draft|조건:condition|목적:purpose|연결:connection|문장:sentence",
  [
   [
    "V + (으)려고 하다",
    "intend to",
    "Use this to state a plan or intent succinctly.",
    "동아리에 가입하려고 합니다.",
    "I intend to join a club."
   ],
   [
    "V + (으)므로",
    "because / since (formal)",
    "Connect a formal reason to the next sentence.",
    "이용자가 많으므로 미리 예약하세요.",
    "As demand is high, please book early."
   ]
  ]
 ],
 [
  "II",
  "ii10",
  "Writing 53–54: build an argument",
  "Original micro-writing, not copied exam text.",
  [
   35,
   36,
   37,
   41,
   47,
   52,
   60
  ],
  "서론:introduction|본론:body / argument|결론:conclusion|해결책:solution|근거:evidence",
  [
   [
    "N + 에 불과하다",
    "be merely / no more than",
    "Avoid exaggerating a statistic or an example.",
    "이는 전체의 일부에 불과해요.",
    "This is only a part of the whole."
   ],
   [
    "V + 고자 하다",
    "intend to (formal)",
    "Use it to state a formal objective.",
    "이 글에서는 두 방법을 비교하고자 합니다.",
    "In this piece, I intend to compare the two methods."
   ]
  ]
 ]
];
export const topikUnits=raw.map(([level,id,title,focus,rounds,words,grammar])=>({
 level,id,title,focus,rounds,
 words:words.split("|").map(item=>{const at=item.indexOf(":");return {ko:item.slice(0,at),en:item.slice(at+1)}}),
 grammar:grammar.map(([form,meaning,rule,example,translation])=>({form,meaning,rule,example,translation}))
}));
export const sourceNote="Exam-derived topic and grammar selection, Hallium-original teaching sentences. Not an official NIIED syllabus or a frequency-ranked exam word list.";
