// Owner's original TOPIK foundation course, transcribed from the two uploaded
// "TOPIK 1 to 3 Course" batches (Lessons 01–10, pp. 2–8).
// Keep this module SERVER-ONLY: no public JSON, PDF or static asset route.
// A 10-lesson TOPIK I foundation, NOT a complete TOPIK Level 3 course.
const vocab = (items) => items.map((entry, i) => {
  const cut = entry.indexOf("|");
  if (cut < 1) throw new Error("Invalid vocabulary entry " + i);
  return { id: "v" + (i + 1), ko: entry.slice(0, cut), meaning: entry.slice(cut + 1) };
});
const grammar = (name, meaning, explanation, examples) => ({
  id: name, name, meaning, explanation,
  examples: examples.map((line) => {
    const p = line.indexOf(" = ");
    return p === -1 ? { ko: line, en: "" } :
      { ko: line.slice(0,p), en: line.slice(p + 3) };
  }),
});
const check = (question, answer) => ({ question, answer });

export const ownerCourse = [
  {
    id: 1, title: "Daily routine", aim: "Describe a simple daily routine using the topic marker and polite present.",
    vocabulary: vocab([
      "생활|life / daily life","일상|daily life","일어나다|to get up",
      "깨다|to wake up","씻다|to wash","세수하다|to wash one's face",
      "샤워하다|to shower","이를 닦다|to brush teeth","옷을 입다|to get dressed",
      "신발을 신다|to put on shoes","밥을 먹다|to eat a meal",
      "학교에 가다|to go to school","회사에 가다|to go to work",
      "집에 오다|to come home","청소하다|to clean"
    ]),
    grammar: [
      grammar("은/는","topic","Use 은 after a consonant and 는 after a vowel. It marks what you are talking about; do not treat it as interchangeable with every 이/가.",[
        "저는 아침에 일어나요. = As for me, I get up in the morning.",
        "오늘은 청소해요. = Today I clean."
      ]),
      grammar("V/A-아요/어요","polite present","For a basic present-tense statement: ㅏ/ㅗ generally take -아요; other stem vowels take -어요; 하다 becomes 해요. Irregular verbs are taught later.",[
        "가다 → 가요 / 먹다 → 먹어요",
        "샤워하다 → 샤워해요 / 일어나다 → 일어나요"
      ]),
    ],
    reading: "저는 아침에 일어나요. 세수해요. 이를 닦아요. 밥을 먹어요. 학교에 가요. 저녁에 집에 와요.",
    readingQuestions: [["아침에 먼저 뭐 해요?","일어나요."],["저녁에 어디에 와요?","집에 와요."]],
    listening: "가: 아침에 뭐 해요?\n나: 샤워해요. 그리고 밥을 먹어요.\n가: 학교에 가요?\n나: 네, 학교에 가요.",
    listeningQuestions: [["샤워와 밥 먹기 중 무엇을 먼저 해요?","샤워해요."],["어디에 가요?","학교에 가요."]],
    writing: "Write two short sentences about your morning. Use 은/는 at least once and -아요/어요.",
    checks: [check("Choose the topic particle: 저__ 아침에 샤워해요.","는"),check("Conjugate 일어나다 in polite present.","일어나요"),check("Conjugate 청소하다 in polite present.","청소해요")],
    note: "Wake up (깨다) and get up (일어나다) are related, but not identical. 그리고 in the listening is a recognition word, not a new grammar target."
  },
  {
    id: 2, title: "Time and weekly plans", aim: "Talk about when activities happened and indicate a time range.",
    vocabulary: vocab([
      "오늘|today","어제|yesterday","내일|tomorrow","지금|now","아침|morning",
      "오전|a.m. / morning","점심|lunch / noon","오후|p.m. / afternoon",
      "저녁|evening / dinner","밤|night","매일|every day","월요일|Monday",
      "화요일|Tuesday","주말|weekend","시간|time / hour"
    ]),
    grammar: [
      grammar("V/A-았/었어요","past","Add -았/었- to the stem before -어요. Stems with ㅏ/ㅗ commonly take -았-; others -었-; 하다 → 했어요.",[
        "가다 → 갔어요 / 먹다 → 먹었어요",
        "공부하다 → 공부했어요 / 쉬다 → 쉬었어요"
      ]),
      grammar("N부터 N까지","from ... to ...","Use 부터 for a starting point in time and 까지 for an endpoint. This lesson focuses on time spans.",[
        "아침부터 저녁까지 공부해요. = I study from morning to evening.",
        "월요일부터 화요일까지 쉬어요. = I rest from Monday to Tuesday."
      ]),
    ],
    reading: "어제는 월요일이었어요. 저는 오전에 공부했어요. 오후에는 쉬었어요. 오늘은 화요일이에요. 저는 아침부터 저녁까지 공부해요.",
    readingQuestions: [["어제 오후에 뭐 했어요?","쉬었어요."],["오늘 언제부터 언제까지 공부해요?","아침부터 저녁까지 공부해요."]],
    listening: "가: 어제 뭐 했어요?\n나: 오전에 공부했어요. 오후에는 쉬었어요.\n가: 오늘도 공부해요?\n나: 네, 아침부터 저녁까지 공부해요.",
    listeningQuestions: [["어제 오전에 뭐 했어요?","공부했어요."],["오늘 저녁까지 무엇을 해요?","공부해요."]],
    writing: "Write one sentence about yesterday and one sentence about today's study time.",
    checks: [check("Change 공부해요 into past tense.","공부했어요"),check("Fill the range: 아침__ 저녁__ 공부해요. (give both particles separated by /)","부터 / 까지"),check("Which means yesterday: 오늘 / 어제 / 내일?","어제")],
    note: "오늘/어제/내일 normally stand without 에; a clock time typically uses 에. 이에요/이었어요 in the reading is review."
  },
  {
    id: 3, title: "Places and locations", aim: "Distinguish destination, place of action and where someone is.",
    vocabulary: vocab([
      "식당|restaurant","카페|café","병원|hospital","약국|pharmacy","은행|bank",
      "우체국|post office","도서관|library","공원|park","영화관|cinema",
      "화장실|restroom","지하철역|subway station","버스 정류장|bus stop",
      "공항|airport","교실|classroom","사무실|office"
    ]),
    grammar: [
      grammar("에 vs 에서","place markers","에 marks a destination or where someone/something exists; 에서 marks the location of an activity.",[
        "도서관에 가요. = I go to the library.",
        "도서관에서 공부해요. = I study at the library."
      ]),
      grammar("N이/가 있어요/없어요","existence","Use 있다/없다 for presence/absence or have/do not have. Choose 이 after a consonant and 가 after a vowel.",[
        "친구가 카페에 있어요. = A friend is at the café.",
        "교실에 학생이 없어요. = There is no student in the classroom."
      ]),
    ],
    reading: "오늘 저는 도서관에 가요. 도서관에서 공부해요. 오후에는 카페에 가요. 친구가 카페에 있어요.",
    readingQuestions: [["어디에서 공부해요?","도서관에서 공부해요."],["오후에 어디에 가요?","카페에 가요."]],
    listening: "가: 지금 어디에 있어요?\n나: 도서관에 있어요.\n가: 거기에서 뭐 해요?\n나: 공부해요.",
    listeningQuestions: [["지금 어디에 있어요?","도서관에 있어요."],["도서관에서 무엇을 해요?","공부해요."]],
    writing: "Write one destination sentence and one action-location sentence, using different places.",
    checks: [check("Choose: 도서관__ 가요. (destination)","에"),check("Choose: 도서관__ 공부해요. (action location)","에서"),check("There is no friend at the café: 카페에 친구가 ____.","없어요")],
    note: "에 and 에서 may both translate loosely as at/in; use the Korean verb and intended meaning to choose."
  },
  {
    id: 4, title: "School and studying", aim: "Identify direct objects and connect two simple actions.",
    vocabulary: vocab([
      "수업|class / lesson","시험|test / exam","숙제|homework",
      "문제|question / problem","답|answer","정답|correct answer",
      "단어|word / vocabulary","문장|sentence","문법|grammar",
      "연습|practice","공부하다|to study","배우다|to learn",
      "외우다|to memorize","읽다|to read","듣다|to listen"
    ]),
    grammar: [
      grammar("을/를","object marker","Attach 을 after a consonant-final noun and 를 after a vowel-final noun. It marks what the verb acts on.",[
        "단어를 외워요. = I memorize words.",
        "문법을 배워요. = I learn grammar."
      ]),
      grammar("V/A-고","and / then","Attach -고 to a verb or adjective stem to link actions or descriptions. In simple sequences, tense is usually shown on the final verb.",[
        "책을 읽고 단어를 외워요. = I read a book and memorize words.",
        "공부하고 숙제를 해요. = I study and do homework."
      ]),
    ],
    reading: "저는 학교에서 한국어를 공부해요. 오늘 수업이 있어요. 수업에서 단어와 문법을 배워요. 집에서 숙제를 해요. 문제를 읽어요.",
    readingQuestions: [["수업에서 무엇을 배워요?","단어와 문법을 배워요."],["집에서 무엇을 해요?","숙제를 해요."]],
    listening: "가: 오늘 시험이 있어요?\n나: 아니요, 시험이 없어요. 수업이 있어요.\n가: 숙제도 있어요?\n나: 네, 숙제가 있어요.",
    listeningQuestions: [["오늘 시험이 있어요?","아니요, 없어요."],["숙제가 있어요?","네, 있어요."]],
    writing: "Write two actions in one sentence using -고 and mark one direct object.",
    checks: [check("Choose: 단어__ 외워요.","를"),check("Choose: 문법__ 배워요.","을"),check("Link with -고: 공부해요 + 숙제를 해요.","공부하고 숙제를 해요.")],
    note: "오늘, 집, 한국어 and 학교 are recycled beginner words. 시험이 있어요 reviews Lesson 03 existence grammar."
  },
  {
    id: 5, title: "Food and ordering", aim: "Order food politely and recognize quantities with counters.",
    vocabulary: vocab([
      "음식|food","밥|rice / meal","물|water","커피|coffee","차|tea",
      "우유|milk","주스|juice","빵|bread","과일|fruit","사과|apple",
      "바나나|banana","김치|kimchi","라면|ramyeon","김밥|gimbap","비빔밥|bibimbap"
    ]),
    grammar: [
      grammar("N 주세요","please give me ...","Place an item or noun phrase before 주세요. A request to perform an action (-아/어 주세요) is a later target.",[
        "커피 주세요. = Coffee, please.",
        "김밥 하나 주세요. = One gimbap, please."
      ]),
      grammar("Native numbers + counters","quantities","Before counters, 하나/둘/셋/넷 become 한/두/세/네. 잔 counts cups or glasses, 개 counts general items; the counter follows the number.",[
        "커피 한 잔 주세요. = One cup of coffee, please.",
        "사과 두 개 주세요. = Two apples, please."
      ]),
    ],
    reading: "저는 식당에서 김밥을 먹어요. 친구는 비빔밥을 먹어요. 저는 물 한 잔을 마셔요. 친구는 차 한 잔을 마셔요.",
    readingQuestions: [["저는 무엇을 먹어요?","김밥을 먹어요."],["친구는 무엇을 마셔요?","차 한 잔을 마셔요."]],
    listening: "가: 뭐 드릴까요?\n나: 김밥 하나하고 물 한 잔 주세요.\n가: 김밥 하나하고 물 한 잔이요?\n나: 네, 맞아요.",
    listeningQuestions: [["어떤 음식을 주문해요?","김밥 하나."],["물을 몇 잔 주문해요?","한 잔."]],
    writing: "Write a two-item order: one drink with 잔 and one item with 개 (for example, 사과).",
    checks: [check("Ask for two cups of coffee politely.","커피 두 잔 주세요."),check("Fill the counter: 사과 두 __ 주세요.","개"),check("Translate: One glass of water, please.","물 한 잔 주세요.")],
    note: "뭐 드릴까요? and 하고 occur for listening recognition; neither is a new grammar target in this batch."
  },
  {
    id: 6, title: "Family and people", aim: "Introduce family members and distinguish is from is not with nouns.",
    vocabulary: vocab([
      "가족|family","부모님|parents (respectful)","아버지|father",
      "어머니|mother","형|older brother (male speaker)",
      "오빠|older brother / older male (female speaker)",
      "누나|older sister (male speaker)",
      "언니|older sister / older female (female speaker)",
      "남동생|younger brother","여동생|younger sister",
      "할아버지|grandfather","할머니|grandmother",
      "친구|friend","학생|student","선생님|teacher"
    ]),
    grammar: [
      grammar("N이에요/예요","polite is / am / are","Add 이에요 after a consonant-final noun and 예요 after a vowel-final noun. Use for identification, not for describing an adjective.",[
        "학생이에요. = (Someone) is a student.",
        "친구예요. = (Someone) is a friend."
      ]),
      grammar("N이/가 아니에요","is not","Use 이 after a consonant-final noun and 가 after a vowel-final noun, followed by 아니에요. Do not attach 안 directly to a noun.",[
        "학생이 아니에요. = (Someone) is not a student.",
        "친구가 아니에요. = (Someone) is not a friend."
      ]),
    ],
    reading: "저는 학생이에요. 어머니는 선생님이에요. 아버지는 선생님이 아니에요. 남동생은 학생이에요.",
    readingQuestions: [["어머니는 무엇을 해요? (직업)","선생님이에요."],["아버지는 선생님이에요?","아니요, 선생님이 아니에요."]],
    listening: "가: 이 사람은 누구예요?\n나: 제 어머니예요. 선생님이에요.\n가: 이 사람도 선생님이에요?\n나: 아니요. 제 아버지예요. 선생님이 아니에요.",
    listeningQuestions: [["첫 번째 사람은 누구예요?","어머니예요."],["아버지도 선생님이에요?","아니요, 선생님이 아니에요."]],
    writing: "Introduce two family members: one is sentence and one is not sentence.",
    checks: [check("Complete: 학생___ . (is a student)","이에요"),check("Complete: 친구___ . (is a friend)","예요"),check("Complete: 학생___ 아니에요.","이")],
    note: "형/누나 are used by male speakers; 오빠/언니 by female speakers. 제 and 이 사람 appear for recognition only."
  },
  {
    id: 7, title: "Clothes and shopping", aim: "Recognize clothing and shop words; make and respond to polite requests.",
    vocabulary: vocab([
      "옷|clothes","바지|pants","청바지|jeans","치마|skirt","셔츠|shirt",
      "티셔츠|T-shirt","운동화|sneakers","색|color","빨간색|red","파란색|blue",
      "사이즈|size","가격|price","할인|discount","영수증|receipt","현금|cash"
    ]),
    grammar: [
      grammar("V-(으)세요","polite instruction / request","For regular verb stems, add 세요 after a vowel or 으세요 after a consonant. ㄹ-final stems have a special rule taught later; this form can also convey respect.",[
        "가다 → 가세요. = Please go.",
        "입다 → 입으세요. = Please put on / wear."
      ]),
      grammar("V-아/어 주세요","please do (for someone)","Use a verb's 아/어 form before 주세요 to request an action. Compare Lesson 05 N 주세요 for requesting an item.",[
        "찾다 → 찾아 주세요. = Please find (it).",
        "이 티셔츠를 보여 주세요. = Please show me this T-shirt."
      ]),
    ],
    reading: "저는 오늘 옷을 사요. 파란색 티셔츠의 가격은 팔천 원이에요. 빨간색 티셔츠는 만 원이에요. 저는 파란색 티셔츠를 사요. “영수증을 주세요.”",
    readingQuestions: [["파란색 티셔츠는 얼마예요?","팔천 원이에요."],["어떤 색 티셔츠를 사요?","파란색 티셔츠를 사요."]],
    listening: "점원: 어서 오세요. 어떤 옷을 찾으세요?\n손님: 파란색 티셔츠를 보여 주세요.\n점원: 네. 이 티셔츠를 입어 보세요.\n손님: 고맙습니다. 영수증도 주세요.",
    listeningQuestions: [["손님은 무엇을 보고 싶어요?","파란색 티셔츠요."],["손님이 마지막에 달라고 하는 것은?","영수증이요."]],
    writing: "Write a three-line shop exchange using a clothing noun, V-아/어 주세요, and V-(으)세요.",
    checks: [check("Turn 가다 into a polite instruction.","가세요."),check("Complete: 이 티셔츠를 보여 ____.","주세요"),check("Complete: 이 옷을 입___ . (polite instruction)","으세요")],
    note: "입어 보다 and 보여 주다 appear for recognition. 원 is in the source bank, not among this lesson's 15 new words."
  },
  {
    id: 8, title: "Transport and directions", aim: "Explain how to travel and why someone goes to a destination.",
    vocabulary: vocab([
      "교통|transportation","버스|bus","지하철|subway","택시|taxi","기차|train",
      "비행기|airplane","자전거|bicycle","길|road / way","왼쪽|left",
      "오른쪽|right","곧장|straight ahead","타다|to take / ride",
      "내리다|to get off","갈아타다|to transfer","걷다|to walk"
    ]),
    grammar: [
      grammar("N(으)로","by / toward / direction","Add 로 after a vowel or final ㄹ; otherwise add 으로. Use for transport means or direction. 걸어서 is introduced for recognition only.",[
        "버스로 가요. = I go by bus.",
        "오른쪽으로 가세요. = Please go right."
      ]),
      grammar("V-(으)러 가다/오다","go / come in order to do","Attach 러 after a vowel-final stem, 으러 after most consonant-final stems, 러 after ㄹ-final stems; the main verb is a movement verb.",[
        "친구를 만나러 카페에 가요. = I go to the café to meet a friend.",
        "한국어를 배우러 학교에 와요. = I come to school to learn Korean."
      ]),
    ],
    reading: "저는 오늘 친구를 만나러 카페에 가요. 집에서 버스를 타요. 버스 정류장에서 내려요. 거기에서 카페까지 걸어요.",
    readingQuestions: [["왜 카페에 가요?","친구를 만나러 가요."],["버스에서 내린 후에 어떻게 가요?","걸어요."]],
    listening: "가: 어디에 가요?\n나: 친구를 만나러 카페에 가요.\n가: 어떻게 가요?\n나: 지하철로 가요. 그리고 조금 걸어요.",
    listeningQuestions: [["카페에 왜 가요?","친구를 만나러 가요."],["어떤 교통수단을 이용해요?","지하철이요."]],
    writing: "Write how you go to a place and why; use N(으)로 and V-(으)러 가요.",
    checks: [check("Choose: 버스___ 가요. (by bus)","로"),check("Complete: 오른쪽___ 가세요. (toward right)","으로"),check("Complete: 친구를 만나___ 카페에 가요.","러")],
    note: "Do not confuse Lesson 03 destination 에 with means/direction (으)로. 걸어요 is from ㄷ-irregular 걷다; learn the full irregular rule later."
  },
  {
    id: 9, title: "Weather and plans", aim: "Understand weather reports, future statements and reasons.",
    vocabulary: vocab([
      "날씨|weather","비|rain","눈|snow","바람|wind","구름|cloud","해|sun",
      "하늘|sky","비가 오다|to rain","눈이 오다|to snow",
      "바람이 불다|wind blows","맑다|to be clear / sunny","흐리다|to be cloudy",
      "덥다|to be hot","춥다|to be cold","따뜻하다|to be warm"
    ]),
    grammar: [
      grammar("V/A-(으)ㄹ 거예요","future / expectation","With regular stems add ㄹ 거예요 after a vowel and 을 거예요 after a consonant; ㄹ-final stems retain one ㄹ. Write 거예요, not 꺼예요.",[
        "내일 비가 올 거예요. = It will rain tomorrow.",
        "내일 학교에 갈 거예요. = I will go to school tomorrow."
      ]),
      grammar("V/A-아/어서","because / so","Link a cause to a result without repeating the tense marker in the first clause. Use 아서 after ㅏ/ㅗ, otherwise 어서; 하다 → 해서.",[
        "비가 와서 집에 있어요. = I stay home because it rains.",
        "날씨가 맑아서 공원에 가요. = I go to the park because the weather is clear."
      ]),
    ],
    reading: "오늘은 날씨가 맑아요. 저는 공원에 가요. 내일은 비가 올 거예요. 비가 와서 내일은 집에서 공부할 거예요.",
    readingQuestions: [["오늘 날씨는 어때요?","맑아요."],["내일은 왜 집에서 공부할 거예요?","비가 올 거예요 / 비가 와서요."]],
    listening: "가: 내일 날씨가 어때요?\n나: 내일 비가 올 거예요.\n가: 그럼 공원에 가요?\n나: 아니요. 비가 와서 집에 있을 거예요.",
    listeningQuestions: [["내일 날씨는 어때요?","비가 올 거예요."],["내일 어디에 있을 거예요?","집에 있을 거예요."]],
    writing: "Write one weather sentence about today and one forecast/reason sentence about tomorrow.",
    checks: [check("Change 가다 into future: 내일 학교에 ____.","갈 거예요"),check("Complete the reason: 비가 와___ 집에 있어요.","서"),check("Complete: 내일 눈이 ____ . (will snow)","올 거예요")],
    note: "덥다 → 더워요 and 춥다 → 추워요 are ㅂ-irregular recognition forms here. 눈 can mean snow, or eye in a different context."
  },
  {
    id: 10, title: "Hobbies and free time", aim: "Say what you want to do, and what you can or cannot do.",
    vocabulary: vocab([
      "취미|hobby","축구|soccer","농구|basketball","수영|swimming",
      "등산|hiking","산책|walk / stroll","요가|yoga","영화|movie",
      "드라마|drama","노래|song","게임|game","요리|cooking",
      "독서|reading","노래하다|to sing","춤추다|to dance"
    ]),
    grammar: [
      grammar("V-고 싶어요","want to do","Attach 고 싶어요 to a verb stem to express desire. It does not attach directly to a noun: say 영화를 보고 싶어요, not 영화고 싶어요.",[
        "산책하고 싶어요. = I want to take a walk.",
        "영화를 보고 싶어요. = I want to watch a movie."
      ]),
      grammar("V-(으)ㄹ 수 있어요/없어요","can / cannot","Use ㄹ 수 있어요 after a vowel stem, 을 수 있어요 after most consonant stems; ㄹ-final stems keep one ㄹ. Distinguish wanting from ability.",[
        "저는 수영할 수 있어요. = I can swim.",
        "저는 춤출 수 없어요. = I cannot dance."
      ]),
    ],
    reading: "제 취미는 독서예요. 주말에는 영화를 보고 싶어요. 친구는 수영을 좋아해요. 저는 수영할 수 없어요. 그래서 친구와 산책해요.",
    readingQuestions: [["글쓴이의 취미는 뭐예요?","독서예요."],["글쓴이는 수영할 수 있어요?","아니요, 수영할 수 없어요."]],
    listening: "가: 주말에 뭐 하고 싶어요?\n나: 영화를 보고 싶어요.\n가: 수영할 수 있어요?\n나: 아니요, 아직 수영할 수 없어요.",
    listeningQuestions: [["주말에 뭘 하고 싶어요?","영화를 보고 싶어요."],["수영할 수 있어요?","아니요, 수영할 수 없어요."]],
    writing: "Write two sentences: one hobby you want to try, and one activity you can or cannot do.",
    checks: [check("Complete: 영화를 보___ 싶어요.","고"),check("Complete: 수영할 수 ____. (can)","있어요"),check("Write I cannot dance using 수 없다.","춤출 수 없어요.")],
    note: "그래서 is a reading-recognition connector. 제 취미는 독서예요 reviews Lesson 06; 주말 reviews Lesson 02."
  },
];

for (const l of ownerCourse) {
  if (l.vocabulary.length !== 15 || l.grammar.length !== 2 || l.checks.length !== 3
      || l.readingQuestions.length !== 2 || l.listeningQuestions.length !== 2) {
    throw new Error("Owner Korean lesson " + l.id + " has an incomplete source transcript");
  }
}
