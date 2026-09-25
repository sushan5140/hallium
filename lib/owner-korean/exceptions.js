// Owner-only exception and usage notes for the 20-lesson Korean course.
// Grammar forms are paired by existing lesson order (two per lesson).
// Vocabulary notes are keyed by the actual Korean target, not its list index.
// Distinguish real irregulars, common spelling pitfalls and meaning contrasts:
// ordinary regular forms should never be mislabeled as "exceptions".
// Grammar-guide references: TOPIK I Level 1–2 Essential Grammar Guide §§2,6–16,18.
// Vocabulary context notes extend the original two PDF banks and new batches;
// they are optional revision details, not extra counted target vocabulary.
const note = (tag,text,example) => ({tag,text,example});
export const ownerExceptionNotes = {
  1:{
    grammar:[
      note("Topic vs subject","은/는 does not simply replace 이/가. 은/는 frames or contrasts the topic; 이/가 often identifies or newly focuses the subject. After a consonant choose 은; after a vowel choose 는.","저는 학생이에요. / 제가 학생이에요. = As for me, I’m a student. / I am the student."),
      note("Irregular & contracted stems","The ㅏ/ㅗ → -아요 and other vowels → -어요 rule is only a starting point: 하다 → 해요, 오다 → 와요, 주다 → 줘요; ㄷ 듣다 → 들어요, ㅂ 춥다 → 추워요, 르 빠르다 → 빨라요.","샤워하다 → 샤워해요; 듣다 → 들어요; 춥다 → 추워요.")
    ],
    vocab:{
      "깨다":note("Meaning contrast","깨다 is to wake up; 일어나다 is to get out of bed / rise. You can wake up without getting up.","일곱 시에 깨지만 여덟 시에 일어나요."),
      "일어나다":note("Meaning contrast","Do not automatically translate 일어나다 as ‘wake up’: it commonly means get up, stand up or rise.","아침에 일어나요."),
      "밥을 먹다":note("Meaning range","밥 can mean cooked rice or a meal; 밥을 먹다 commonly means to have a meal.","점심에 밥을 먹어요."),
      "이를 닦다":note("Fixed expression","이 is ‘tooth/teeth’ here; 이를 닦다 is the natural collocation for brushing your teeth.","아침에 이를 닦아요.")
    }
  },
  2:{
    grammar:[
      note("Contraction & irregularity","Polite past has contractions and some irregular stems: 보다 → 봤어요, 오다 → 왔어요, 하다 → 했어요, 듣다 → 들었어요. Avoid mechanically joining every dictionary stem with 았어요.","오다 → 왔어요 / 듣다 → 들었어요."),
      note("Time vs place","부터…까지 marks time or an ordered range; with a physical starting place, 에서…까지 is commonly used. The two phrases are not interchangeable in every travel sentence.","월요일부터 금요일까지; 서울에서 부산까지.")
    ],
    vocab:{
      "점심":note("Meaning range","점심 can refer to lunchtime or lunch, depending on whether the speaker is identifying time or food.","점심에 만나요. / 점심을 먹어요."),
      "밤":note("Time contrast","밤 is night; 저녁 is evening or dinner. Use 밤 when you mean late night rather than early evening.","저녁에 밥을 먹고 밤에 자요."),
      "오전":note("Number system","오전 means a.m.; native Korean numbers normally express the hour, while Sino-Korean numbers express minutes.","오전 세 시 십오 분.")
    }
  },
  3:{
    grammar:[
      note("Movement vs action","에 marks a destination or where someone exists, but 에서 locates an activity and can indicate a place of departure. Match the particle to the actual verb.","학교에 있어요. / 학교에서 공부해요. / 학교에서 출발해요."),
      note("Honorific alternative","Use 계세요/안 계세요 instead of 있어요/없어요 when respectfully stating that a person is present/absent; do not apply 계세요 to ordinary objects.","할머니가 집에 계세요. / 책이 책상에 있어요.")
    ],
    vocab:{
      "화장실":note("Meaning range","화장실 means toilet/restroom in ordinary Korean; it is not restricted to a room for putting on makeup.","화장실이 어디에 있어요?"),
      "지하철역":note("Place contrast","지하철역 is a subway station; 버스 정류장 is a bus stop. These are different destinations.","지하철역에 가요. / 버스 정류장에 있어요."),
      "공항":note("Listening","Airport is 공항, not 공원 (park). The final syllables are different even when you hear both in travel dialogues.","공항 ≠ 공원.")
    }
  },
  4:{
    grammar:[
      note("Colloquial omission","을/를 is often omitted in natural conversation when the object is clear, but keep it in beginner writing where the object relation matters. The ending rule itself remains 을 after a consonant, 를 after a vowel.","책을 읽어요. / 책 읽어요."),
      note("Sequence vs completion","-고 links two clauses but does not always guarantee the first action is finished before the next. Later -고 나서 explicitly says ‘after finishing’. Past tense can appear on the final verb for a simple sequence.","밥을 먹고 공부해요. / 밥을 먹고 나서 공부해요.")
    ],
    vocab:{
      "듣다":note("ㄷ irregular","듣다 → 들어요 / 들었어요 before vowel-initial endings; not 듣어요. This is a ㄷ-changing verb.","노래를 들어요."),
      "읽다":note("Pronunciation","읽다 is pronounced approximately [익따] in isolation, but 읽어요 links the coda: [일거요]. Spelling stays 읽-.","책을 읽어요."),
      "배우다":note("Meaning contrast","배우다 means learn from instruction or experience; 외우다 means memorize (for example a list of words).","문법을 배우고 단어를 외워요."),
      "문제":note("Meaning range","문제 can mean a test question, an exercise or a problem; context determines which sense is intended.","문제를 풀어요.")
    }
  },
  5:{
    grammar:[
      note("Item vs requested action","N 주세요 requests an item; V-아/어 주세요 asks someone to perform an action. Do not attach the noun-request pattern directly to a verb stem.","물 주세요. / 문을 열어 주세요."),
      note("Counter forms & number systems","Before counters: 하나→한, 둘→두, 셋→세, 넷→네 and 스물→스무. Hours use native numbers but minutes and prices usually use Sino-Korean numbers.","한 잔, 두 개, 세 시 십오 분, 스무 살.")
    ],
    vocab:{
      "차":note("Homonym","차 means tea here; 차 can also mean a car/vehicle in transport contexts.","차 한 잔 주세요. / 차로 가요."),
      "밥":note("Meaning range","밥 means cooked rice and can mean a meal; it is broader than only an unprepared grain.","밥 한 그릇 / 밥을 먹어요."),
      "라면":note("Meaning contrast","라면 is Korean-style instant/noodle soup; don't confuse it with 김밥 or 비빔밥 simply because all are quick meals.","라면을 먹어요."),
      "커피":note("Counter","A cup of coffee is 커피 한 잔. Use 잔 for cups/glasses, not 개 in this practice order.","커피 두 잔 주세요.")
    }
  },
  6:{
    grammar:[
      note("Spelling trap","After a consonant: 이에요; after a vowel: 예요. The negative copula is 아니에요—not 아니예요. Avoid adding 이에요 directly to adjective stems.","학생이에요 / 친구예요 / 학생이 아니에요."),
      note("Noun negation, not verb negation","N이/가 아니에요 negates identity. 안 + V/A from Lesson 11 negates a verb/adjective. Do not say 안 학생이에요 to mean ‘not a student’.","학생이 아니에요. / 공부 안 해요.")
    ],
    vocab:{
      "형":note("Speaker-dependent word","형 is an older brother or older male addressed by a male speaker; a female speaker generally uses 오빠 in the corresponding relationship.","형 / 오빠."),
      "누나":note("Speaker-dependent word","누나 refers to an older sister/older female from a male speaker's viewpoint; a female speaker generally says 언니.","누나 / 언니."),
      "오빠":note("Speaker-dependent word","오빠 is used by female speakers for an older brother or older close male; it isn't a universal word for ‘brother’.","오빠 / 형."),
      "언니":note("Speaker-dependent word","언니 is used by female speakers for an older sister/older female; male speakers use 누나.","언니 / 누나."),
      "부모님":note("Honorific word","부모님 is the polite collective for parents; -님 carries respect. It doesn't normally refer to just one parent.","부모님이 오세요.")
    }
  },
  7:{
    grammar:[
      note("ㄹ stems and honorifics","A final ㄹ usually drops before -(으)세요: 살다→사세요, 만들다→만드세요. -세요 can be a request or a respectful statement about someone; context matters.","문을 여세요. / 할머니가 오세요."),
      note("Conjugation vs noun request","돕다→도와 주세요 (ㅂ irregular); 하다→해 주세요. ‘커피 주세요’ asks for an item; ‘커피를 만들어 주세요’ asks for an action.","이것을 도와 주세요. / 커피를 만들어 주세요.")
    ],
    vocab:{
      "옷":note("Sound change","옷 has a neutralized final consonant [옫] in isolation; with 을, 옷을 sounds [오슬]. Keep the written spelling 옷.","옷 / 옷을 입어요."),
      "운동화":note("Meaning nuance","운동화 means trainers/sneakers, not every type of shoe; 신발 is a broader category from Lesson 01.","운동화를 신어요."),
      "색":note("Noun vs color names","색 is ‘color’; 빨간색/파란색 are specific color nouns. 빨갛다/파랗다 are adjective dictionary forms.","파란색 티셔츠.")
    }
  },
  8:{
    grammar:[
      note("Final ㄹ exception","After a vowel or final ㄹ, use 로—not 으로: 버스로, 지하철로, 길로. After other consonants, choose 으로: 오른쪽으로.","버스로 가요 / 오른쪽으로 가요 / 길로 가요."),
      note("Movement verb and irregular stem","-(으)러 normally requires 가다/오다 or another movement verb. ㄹ-final stems take 러: 만들다→만들러; some ㄷ verbs change before 으: 듣다→들으러.","친구를 만나러 가요 / 음악을 들으러 가요.")
    ],
    vocab:{
      "걷다":note("ㄷ irregular","걷다 ‘walk’ conjugates 걸어요 / 걸어서, not 걷어요. Some other ㄷ verbs remain regular; learn each verb.","카페까지 걸어요."),
      "내리다":note("Meaning range","내리다 can mean getting off a vehicle or descending; 눈/비가 내리다 can mean snow/rain falls.","버스에서 내려요. / 눈이 내려요."),
      "길":note("Meaning range","길 can be a physical road, path or the way/directions to somewhere—not only a street.","길을 물어봐요.")
    }
  },
  9:{
    grammar:[
      note("ㄹ stem & irregular forms","For -(으)ㄹ 거예요, a verb already ending in ㄹ keeps one ㄹ: 살다→살 거예요. ㄷ/ㅂ stems may change: 듣다→들을 거예요, 춥다→추울 거예요. Write 거예요, not 꺼예요.","내일 비가 올 거예요. / 내일 추울 거예요."),
      note("Reason vs request & contractions","-아/어서 works for reasons and some sequences. To give a reason before a command/suggestion, -(으)니까 is usually the beginner-safe connector. 오다→와서, 하다→해서 are contractions.","비가 와서 집에 있어요. / 비가 오니까 우산을 쓰세요.")
    ],
    vocab:{
      "눈":note("Homonym","눈 means snow in 날씨 contexts but also an eye in body/health contexts. Check the surrounding verb.","눈이 와요. / 눈이 아파요."),
      "해":note("Homonym","해 is the sun here; 해 can also mean a year or be the conjugated form of 하다 in other contexts.","해가 떠요. / 공부해요."),
      "춥다":note("ㅂ irregular","춥다→추워요 / 추울 거예요 / 추우면. Do not form 춥어요.","오늘은 추워요."),
      "덥다":note("ㅂ irregular","덥다→더워요 / 더울 거예요, not 덥어요.","여름에는 더워요.")
    }
  },
  10:{
    grammar:[
      note("Whose wish?","-고 싶어요 commonly expresses the speaker's wish or asks the listener's wish; for a third person's desire, -고 싶어해요 is useful. Attach it to a verb stem, not a bare noun.","저는 가고 싶어요. / 동생은 가고 싶어해요."),
      note("Ability vs permission","-(으)ㄹ 수 있어요 means can / is possible; -아/어도 돼요 means permitted. ㄹ-final verbs retain one ㄹ: 살 수 있어요, not 살을 수 있어요.","한국어를 읽을 수 있어요. / 여기 앉아도 돼요.")
    ],
    vocab:{
      "수영":note("Noun vs verb","수영 is the activity noun; 수영하다 means ‘to swim’. A noun cannot simply take -고 싶어요 by itself.","수영하고 싶어요."),
      "영화":note("Place contrast","영화 is a film; 영화관 from Lesson 03 is a cinema/building.","영화를 봐요. / 영화관에 가요."),
      "독서":note("Noun vs action","독서 means reading as an activity noun; 책을 읽다 is the verb phrase.","제 취미는 독서예요.")
    }
  },
  11:{
    grammar:[
      note("하다 placement & copula","For many noun+하다 verbs, place 안 between the noun and 해요: 공부 안 해요, not the standard beginner form 안 공부해요. To negate a noun identity, use N이/가 아니에요.","공부 안 해요. / 학생이 아니에요."),
      note("Inability vs not doing","못 before an action verb expresses inability or circumstances, not merely choice; in some contexts ‘노래를 못 해요’ can mean poor ability. Do not use 못 as a general negative for adjectives.","몸이 아파서 못 가요. / 오늘은 안 가요.")
    ],
    vocab:{
      "목":note("Homonym","목 means neck or throat in this health lesson, but can refer to other things in other compounds. 목이 아파요 may mean a sore throat or neck pain; context clarifies.","목이 아파요."),
      "배":note("Homonym","배 means belly/stomach here, but it can also mean boat or pear; the situation determines the meaning.","배가 아파요. / 배를 타요."),
      "머리":note("Meaning range","머리 can mean head or hair depending on the sentence; 머리가 아파요 usually means a headache.","머리가 아파요."),
      "약":note("Meaning range","약 means medicine as a noun; before numbers it can also mean approximately, as in 약 한 시간.","약을 먹어요. / 약 한 시간.")
    }
  },
  12:{
    grammar:[
      note("Ongoing vs resulting state","V-고 있어요 often describes an ongoing activity; some verbs describe a resulting state: 옷을 입고 있어요 = wearing clothes. Do not automatically translate every -고 있어요 as an English progressive.","방을 정리하고 있어요. / 옷을 입고 있어요."),
      note("Change vs simple description","A-아/어지다 expresses becoming different, not simply being that way. Some stems contract or change: 깨끗하다→깨끗해졌어요; 덥다→더워졌어요.","방이 깨끗해요. / 방이 깨끗해졌어요.")
    ],
    vocab:{
      "불":note("Homonym","불 means a light here (불을 켜다/끄다), but also fire. Context matters.","불을 켜요. / 불이 났어요."),
      "빨래":note("Noun vs task","빨래 means laundry; 빨래하다 or 빨래를 하다 means do laundry. 세탁기 is the washing machine.","빨래를 해요."),
      "깨끗하다":note("하다 adjective","깨끗하다 is an adjective, even though it ends in 하다: 깨끗해요 / 깨끗해졌어요. It doesn't always behave semantically like an action verb.","방이 깨끗해요.")
    }
  },
  13:{
    grammar:[
      note("Honorific recipient","Use 께 instead of 에게/한테 for a respected recipient. For a source ‘from a person’, 에게서/한테서 is possible. Buildings usually use 에, not 에게.","할머니께 꽃을 드려요. / 친구에게 편지를 보내요."),
      note("Honorific subject & special words","Honor the subject, not yourself. -시- is not always a mechanical ending: 있다→계시다, 먹다/마시다→드시다, 자다→주무시다; ㄹ often drops before -시-.","할머니가 계세요. / 할아버지가 드세요. / 저는 먹어요.")
    ],
    vocab:{
      "꽃":note("Sound change","꽃 has neutralized final [꼳] alone; 꽃을 links the final consonant and sounds [꼬츨]. Keep the written ㅊ.","꽃 / 꽃을 드려요."),
      "주다":note("Contraction & respect","주다→줘요; to give to a respected person, use humble 드리다 (from the grammar guide).","친구에게 줘요. / 선생님께 드려요."),
      "받다":note("Regular ㄷ","Not every ㄷ-final verb is ㄷ-irregular: 받다→받아요, not 발아요. Contrast Lesson 04 듣다→들어요.","선물을 받아요."),
      "카드":note("Context","카드 can mean a greeting card or a payment card. 생일 카드 is a birthday card.","생일 카드를 써요.")
    }
  },
  14:{
    grammar:[
      note("ㄹ-final stem & intention","ㄹ-final verbs don't add another ㄹ: 살다→살까요? This can mean ‘shall we/I?’ or a wondering question depending on context. It does not assert a completed plan.","토요일에 만날까요? / 여기에서 살까요?"),
      note("ㄹ deletion & register","With -(으)ㅂ시다, ㄹ-final stems lose ㄹ: 만들다→만듭시다. This formal proposal is not a universal replacement for friendly -아요/어요; avoid imposing it as a command to a respected superior.","같이 갑시다. / 같이 만듭시다.")
    ],
    vocab:{
      "약속":note("Meaning range","약속 is an appointment, arrangement or promise. It need not be an office booking.","친구와 약속이 있어요."),
      "일정":note("Meaning contrast","일정 is a schedule/itinerary, while 약속 is a specific appointment or promise and 계획 is a plan.","일정을 확인해요."),
      "잠깐":note("Time nuance","잠깐 is for a short moment, not a precise measured period; use 잠깐만요 to ask someone to wait briefly.","잠깐 기다리세요.")
    }
  },
  15:{
    grammar:[
      note("Past experience modifier","Use a past noun-modifying stem before 적: 가다→간 적, 먹다→먹은 적; ㄹ-final verbs lose ㄹ: 살다→산 적. Do not mechanically attach 적 to the polite past ending.","그 음식을 먹은 적이 있어요."),
      note("Try vs have experienced","-아/어 보다 can mean ‘try doing’; with past tense -아/어 봤어요 it often reports experience. Verb irregularity still applies: 듣다→들어 봐요, 오다→와 봐요.","한번 먹어 봐요. / 박물관에 가 봤어요.")
    ],
    vocab:{
      "시장":note("Homonym","시장 here is a market; 시장 can also mean a mayor in political/administrative contexts (distinct Sino-Korean roots).","시장에서 과일을 사요."),
      "숙소":note("Category vs type","숙소 is accommodation in general; 호텔 is one kind of 숙소. They are not exact synonyms.","숙소를 예약해요."),
      "찍다":note("Meaning range","찍다 can mean take a photo, stamp, mark or select. 사진을 찍다 is a fixed high-frequency collocation.","사진을 찍어요."),
      "방문하다":note("Register","방문하다 is a relatively formal verb for ‘visit’; everyday 가다 may be more natural in a simple destination sentence.","박물관을 방문해요.")
    }
  },
  16:{
    grammar:[
      note("되다 contraction","The correct polite form is 돼요 (from 되어요), not 되요. Permission -아/어도 돼요 is not the same as ability -(으)ㄹ 수 있어요.","문을 열어도 돼요? / 문을 열 수 있어요?"),
      note("Prohibition spelling","Keep 안 돼요 as separate words; 않돼요 is not the target form. Irregular stems still apply: 듣다→들으면 안 돼요; an ㄹ-final stem takes -면.","여기에서 사진을 찍으면 안 돼요.")
    ],
    vocab:{
      "출입":note("Meaning range","출입 means going in and out / access; 입장 focuses on entering or admission to a venue/event.","출입 금지. / 입장 시간."),
      "불":note("Cross-lesson recall","불 (Lesson 12) can mean light or fire; here 켜다/끄다 describes switching a light/device on and off.","불을 켜요. / 불을 꺼요."),
      "켜다":note("Opposite & spelling","켜다→켜요; its opposite 끄다→꺼요 (ㅡ deletion), not 끄어요.","불을 켜요. / 불을 꺼요."),
      "끄다":note("ㅡ deletion","끄다→꺼요 before -어요, not 끄어요. Compare 쓰다→써요 in the irregular verb guide.","휴대전화를 꺼요.")
    }
  },
  17:{
    grammar:[
      note("Contraction & scope","하다→해야 해요 (not 하야 해요). This is obligation, not a prediction and not mere permission. -아/어야 돼요 is another common variant.","서류를 제출해야 해요."),
      note("Optional ≠ forbidden","-지 않아도 돼요 means ‘need not’; -(으)면 안 돼요 means ‘must not’. 안 해도 돼요 is often a shorter equivalent of 하지 않아도 돼요.","오늘은 오지 않아도 돼요. / 오늘은 오면 안 돼요.")
    ],
    vocab:{
      "신분증":note("Category distinction","신분증 means identity document/card in general; 여권 is a passport. A particular process decides which documents it accepts.","신분증을 확인해요."),
      "신청하다":note("Process nuance","신청하다 means apply/request; 등록하다 means register/enroll. They may be different steps of a process.","수업을 신청하고 등록해요."),
      "필수":note("Part of speech","필수 is a noun meaning ‘essential/mandatory’; 필요하다 is descriptive ‘to be necessary/needed’.","필수 서류 / 서류가 필요해요."),
      "마감":note("Meaning range","마감 is closing/cut-off/deadline, not an actual date by itself. Treat dates and requirements as placeholders in this language lesson.","신청 마감.")
    }
  },
  18:{
    grammar:[
      note("ㄹ stems & irregulars","ㄹ-final stems attach -면 without 으: 살다→살면. ㄷ 듣다→들으면; ㅂ 춥다→추우면. Don't treat -(으)면 as the same as -(으)니까.","바쁘면 나중에 전화하세요."),
      note("ㄹ deletion & reason clauses","ㄹ-final stems lose ㄹ before ㄴ: 살다→사니까, 만들다→만드니까. ㄷ 듣다→들으니까, ㅂ 춥다→추우니까. Unlike -아/어서, -(으)니까 often precedes commands or proposals.","길이 복잡하니까 지하철로 가세요.")
    ],
    vocab:{
      "늦다":note("State vs adverb","늦다 means ‘be late’; 늦게 from Lesson 19 is the adverb ‘late/at a late time’.","늦었어요. / 늦게 왔어요."),
      "바쁘다":note("ㅡ deletion","바쁘다→바빠요 / 바쁘면, not 바쁘어요; the present stem loses ㅡ but -면 attaches to 바쁘-.","오늘은 바빠요."),
      "미끄럽다":note("ㅂ irregular","미끄럽다→미끄러워요 / 미끄러우면. Do not write 미끄럽어요.","길이 미끄러우면 조심하세요."),
      "피곤하다":note("Meaning contrast","피곤하다 means tired/fatigued, 졸리다 means sleepy. You can be tired without being sleepy.","피곤해요. / 졸려요.")
    }
  },
  19:{
    grammar:[
      note("Verb vs noun; no polite past stem","Use V-기 전에 (자기 전에, 먹기 전에) but N 전에 (수업 전에). Don't attach -기 전에 to the polite conjugation 먹어요/먹었어요.","자기 전에 이를 닦아요. / 수업 전에 만나요."),
      note("Completion matters","-고 나서 emphasizes that one task is finished before the next. Bare -고 merely connects actions. V-(으)ㄴ 후에 is a related after-action form to recognize.","운동하고 나서 샤워해요.")
    ],
    vocab:{
      "끝나다":note("Intransitive vs transitive","끝나다 means something ends; 끝내다 means someone finishes something. They do not take objects in the same way.","수업이 끝나요. / 숙제를 끝내요."),
      "끝내다":note("Object difference","끝내다 takes an object (finish homework); 끝나다 is what the event itself does (class ends).","숙제를 끝내요. / 수업이 끝나요."),
      "잠들다":note("Stage of sleep","잠들다 means fall asleep; 자다 is sleep, and 잠 is the noun sleep.","일찍 잠들어요. / 밤에 자요."),
      "미리":note("Meaning contrast","미리 means in advance (before it is needed); 먼저 means first/in order, not necessarily in advance.","미리 준비해요. / 먼저 먹어요.")
    }
  },
  20:{
    grammar:[
      note("Stem, not polite ending","Attach -지만 to the dictionary stem: 비싸다→비싸지만, 하다→하지만. The separate sentence 하지만 means ‘but’; don't add -지만 to a fully conjugated 해요.","택시는 편리하지만 비싸요."),
      note("Verbs vs nouns","-거나 links alternative actions: 먹거나 마셔요. For bare noun alternatives use (이)나: 차나 커피. Don't confuse ‘or’ with contrast -지만.","주말에 쉬거나 영화를 봐요.")
    ],
    vocab:{
      "쉽다":note("ㅂ irregular","쉽다→쉬워요; not 쉽어요. 어렵다→어려워요 is another ㅂ-changing adjective.","문제가 쉬워요."),
      "어렵다":note("ㅂ irregular","어렵다→어려워요 / 어려우면. Memorize the vowel change instead of applying a regular 어요 ending.","문법이 어려워요."),
      "가볍다":note("ㅂ irregular","가볍다→가벼워요 / 가벼우면. Many ㅂ adjectives change but not all ㅂ-final verbs do.","가방이 가벼워요."),
      "빠르다":note("르 irregular","빠르다→빨라요; the 르 pattern adds ㄹ to the previous syllable before the 아/어 ending.","지하철이 빨라요."),
      "싸다":note("Homonym & conjugation","싸다 means ‘cheap’ in this lesson; 싸다 can also mean wrap. Both have 싸요 in polite present, so context carries the meaning.","가격이 싸요."),
      "비싸다":note("Comparison nuance","비싸다 is expensive, not necessarily better quality; price comparison often uses N보다 in later grammar.","택시는 비싸요.")
    }
  }
};
