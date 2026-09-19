"use client";
import { useState } from "react";

// Retained educational phrase bank and mini-dialogues from the live Hallim app.
const partnerKoreanCategories = [
  {
    id: "check-ins",
    title: "Daily check-ins",
    description: "Short casual Korean messages for checking in during the day.",
    phrases: [
      { korean: "뭐 해?", romanization: "mwo hae?", english: "What are you doing?", note: "Casual. Use with someone close to you." },
      { korean: "어디야?", romanization: "eodiya?", english: "Where are you?", note: "Very common casual check-in." },
      { korean: "집에 도착했어?", romanization: "jibe dochakhaesseo?", english: "Did you get home?" },
      { korean: "밥 먹었어?", romanization: "bap meogeosseo?", english: "Did you eat? / Have you eaten?", note: "A very natural Korean way to check on someone." },
      { korean: "점심 먹었어?", romanization: "jeomsim meogeosseo?", english: "Did you have lunch?" },
      { korean: "저녁 먹었어?", romanization: "jeonyeok meogeosseo?", english: "Did you have dinner?" },
      { korean: "오늘 하루 어땠어?", romanization: "oneul haru eottaesseo?", english: "How was your day?" },
      { korean: "피곤해?", romanization: "pigonhae?", english: "Are you tired?" },
      { korean: "지금 바빠?", romanization: "jigeum bappa?", english: "Are you busy right now?" },
      { korean: "오늘 뭐 했어?", romanization: "oneul mwo haesseo?", english: "What did you do today?" }
    ]
  },
  {
    id: "affection",
    title: "Affection",
    description: "Warm phrases used with someone you are close to.",
    phrases: [
      { korean: "보고 싶어.", romanization: "bogo sipeo.", english: "I miss you." },
      { korean: "많이 보고 싶어.", romanization: "mani bogo sipeo.", english: "I miss you a lot." },
      { korean: "오늘 네 생각 많이 했어.", romanization: "oneul ne saenggak mani haesseo.", english: "I thought about you a lot today." },
      { korean: "좋아해.", romanization: "joahae.", english: "I like you." },
      { korean: "많이 좋아해.", romanization: "mani joahae.", english: "I like you a lot." },
      { korean: "사랑해.", romanization: "saranghae.", english: "I love you.", note: "Casual and intimate. 사랑해요 is the polite version." },
      { korean: "나도 사랑해.", romanization: "nado saranghae.", english: "I love you too." },
      { korean: "너는 나한테 정말 소중해.", romanization: "neoneun nahante jeongmal sojunghae.", english: "You are really precious to me." },
      { korean: "너랑 얘기하면 기분이 좋아.", romanization: "neorang yaegihamyeon gibuni joa.", english: "I feel good when I talk with you." },
      { korean: "네 목소리 듣고 싶어.", romanization: "ne moksori deutgo sipeo.", english: "I want to hear your voice." },
      { korean: "너 만나고 싶어.", romanization: "neo mannago sipeo.", english: "I want to see you." },
      { korean: "네 메시지 기다렸어.", romanization: "ne mesiji gidaryeosseo.", english: "I was waiting for your message." }
    ]
  },
  {
    id: "care",
    title: "Care & reassurance",
    description: "Natural ways to show concern and look after someone.",
    phrases: [
      { korean: "조심해.", romanization: "josimhae.", english: "Be careful / Take care." },
      { korean: "조심히 가.", romanization: "josimhi ga.", english: "Get there safely." },
      { korean: "도착하면 연락해.", romanization: "dochakamyeon yeollakhae.", english: "Message me when you arrive." },
      { korean: "밥 잘 챙겨 먹어.", romanization: "bap jal chaenggyeo meogeo.", english: "Make sure you eat properly." },
      { korean: "좀 쉬어.", romanization: "jom swieo.", english: "Get some rest." },
      { korean: "괜찮아?", romanization: "gwaenchana?", english: "Are you okay?" },
      { korean: "무슨 일 있으면 말해.", romanization: "museun il isseumyeon malhae.", english: "Tell me if something happens / if something is wrong." },
      { korean: "내가 있잖아.", romanization: "naega itjana.", english: "I'm here for you.", note: "Warm reassurance; literally carries the sense of 'you have me here.'" },
      { korean: "너무 걱정하지 마.", romanization: "neomu geokjeonghaji ma.", english: "Don't worry too much." },
      { korean: "잘 될 거야.", romanization: "jal doel geoya.", english: "It'll work out / It'll be okay." }
    ]
  },
  {
    id: "teasing-annoyance",
    title: "Teasing & annoyance",
    description: "Playful or annoyed phrases used between close people.",
    phrases: [
      { korean: "왜 그래?", romanization: "wae geurae?", english: "What's with you? / Why are you like that?" },
      { korean: "진짜 너무해.", romanization: "jinjja neomuhae.", english: "Seriously, that's too much." },
      { korean: "나 삐졌어.", romanization: "na ppijeosseo.", english: "I'm sulking / I'm upset with you.", note: "Often playful rather than serious." },
      { korean: "나 화났어.", romanization: "na hwanasseo.", english: "I'm angry." },
      { korean: "미워.", romanization: "miwo.", english: "I hate you / You're mean.", note: "Can sound playful between close people depending on tone; context matters." },
      { korean: "너 싫어.", romanization: "neo sireo.", english: "I don't like you / I hate you.", note: "Stronger and more direct than 미워." },
      { korean: "그만해.", romanization: "geumanhae.", english: "Stop it." },
      { korean: "장난이야.", romanization: "jangnaniya.", english: "I'm joking." },
      { korean: "화내지 마.", romanization: "hwanaeji ma.", english: "Don't be angry." },
      { korean:"나 좀 서운했어.", romanization:"na jom seounhaesseo.", english:"I felt a little hurt / disappointed.", note:"서운하다 is extremely useful for relationship disappointment that is softer than anger." },
      { korean:"내 말 좀 들어 봐.", romanization:"nae mal jom deureo bwa.", english:"Please hear me out." },
      { korean:"우리 잠깐 진정하자.", romanization:"uri jamkkan jinjeonghaja.", english:"Let's calm down for a moment." }
    ]
  },
  {
    id: "apologies",
    title: "Apologies & making up",
    description: "Useful lines after a misunderstanding or small argument.",
    phrases: [
      { korean: "미안해.", romanization: "mianhae.", english: "I'm sorry." },
      { korean: "내가 잘못했어.", romanization: "naega jalmothaesseo.", english: "I was wrong / It was my fault." },
      { korean: "기분 나빴다면 미안해.", romanization: "gibun nappattamyeon mianhae.", english: "I'm sorry if that upset you." },
      { korean: "그런 뜻은 아니었어.", romanization: "geureon tteuseun anieosseo.", english: "I didn't mean it that way." },
      { korean: "우리 차분하게 얘기하자.", romanization: "uri chabunhage yaegihaja.", english: "Let's talk calmly." },
      { korean: "이제 괜찮아?", romanization: "ije gwaenchana?", english: "Are you okay now?" },
      { korean: "우리 풀자.", romanization: "uri pulja.", english: "Let's make up / resolve this." },
      { korean:"내가 더 잘 들을게.", romanization:"naega deo jal deureulge.", english:"I'll listen better." },
      { korean:"오해하게 해서 미안해.", romanization:"ohaehage haeseo mianhae.", english:"Sorry for causing a misunderstanding." },
      { korean:"우리 다시 잘 얘기해 보자.", romanization:"uri dasi jal yaegihae boja.", english:"Let's try talking it through again." }
    ]
  },
  {
    id: "plans",
    title: "Plans together",
    description: "Make small plans and check when someone is free.",
    phrases: [
      { korean: "오늘 만날까?", romanization: "oneul mannalkka?", english: "Shall we meet today?" },
      { korean: "언제 시간 돼?", romanization: "eonje sigan dwae?", english: "When are you free?" },
      { korean: "저녁에 통화할까?", romanization: "jeonyeoge tonghwahalkka?", english: "Shall we call this evening?" },
      { korean: "주말에 뭐 할 거야?", romanization: "jumare mwo hal geoya?", english: "What are you doing this weekend?" },
      { korean: "어디 갈까?", romanization: "eodi galkka?", english: "Where should we go?" },
      { korean: "네가 정해. 난 다 좋아.", romanization: "nega jeonghae. nan da joa.", english: "You decide. I'm okay with anything." },
      { korean: "너랑 같이 있고 싶어.", romanization: "neorang gachi itgo sipeo.", english: "I want to spend time with you." }
    ]
  },
  {
    id: "texting-slang",
    title: "Texting & chat slang",
    description: "Common Korean chat shorthand, reactions, and tiny messages that textbooks rarely explain.",
    phrases: [
      { korean:"ㅋㅋ", romanization:"keukeu", english:"LOL / haha", note:"Repeated ㅋ marks laughter. More ㅋ usually means stronger laughter." },
      { korean:"ㅎㅎ", romanization:"heuheu", english:"hehe / soft laugh", note:"Often feels softer or gentler than ㅋㅋ." },
      { korean:"ㅇㅇ", romanization:"eung-eung", english:"yeah / yep", note:"Initials of 응응. Very casual texting shorthand." },
      { korean:"ㄴㄴ", romanization:"no-no", english:"no / nope", note:"Internet shorthand influenced by English 'no no.'" },
      { korean:"ㅇㅋ", romanization:"okei", english:"OK", note:"Consonant shorthand for 오케이." },
      { korean:"ㄱㄱ", romanization:"go-go", english:"Let's go / go go", note:"Used to push a plan forward quickly." },
      { korean:"ㅂㅂ", romanization:"bai-bai", english:"bye bye", note:"Chat shorthand for 바이바이." },
      { korean:"헐", romanization:"heol", english:"Whoa / no way", note:"Reaction to surprise, disbelief, or shock." },
      { korean:"대박", romanization:"daebak", english:"Awesome / jackpot / wow", note:"Very common reaction word; tone changes the exact feeling." },
      { korean:"뭐해", romanization:"mwohae", english:"What are you doing?", note:"Spacing is often dropped casually in chat even though 뭐 해 is the standard spacing." },
      { korean:"잘자", romanization:"jalja", english:"Sleep well", note:"Often typed without spacing in casual messages." },
      { korean:"진짜?", romanization:"jinjja?", english:"Really?", note:"One of the most useful natural reactions." }
    ]
  },
  {
    id: "reactions",
    title: "Korean reactions",
    description: "Quick responses that make conversations sound less translated and more alive.",
    phrases: [
      { korean:"진짜?", romanization:"jinjja?", english:"Really?" },
      { korean:"헐!", romanization:"heol!", english:"No way! / Whoa!" },
      { korean:"대박!", romanization:"daebak!", english:"That's amazing! / Wow!" },
      { korean:"미쳤다.", romanization:"michyeotda.", english:"That's insane.", note:"Can be positive or negative depending on context; casual slang." },
      { korean:"귀여워!", romanization:"gwiyeowo!", english:"So cute!" },
      { korean:"부럽다.", romanization:"bureopda.", english:"I'm jealous / Lucky you." },
      { korean:"웃겨.", romanization:"utgyeo.", english:"That's funny." },
      { korean:"말도 안 돼.", romanization:"maldo an dwae.", english:"No way / That can't be true." },
      { korean:"그렇구나.", romanization:"geureokuna.", english:"Oh, I see." },
      { korean:"그러네.", romanization:"geureone.", english:"Oh, you're right." },
      { korean:"맞아.", romanization:"maja.", english:"Exactly / That's right." },
      { korean:"아 진짜?", romanization:"a jinjja?", english:"Oh, really?", note:"Very natural conversational rhythm." }
    ]
  },
  {
    id: "korean-jokes",
    title: "Korean-only jokes",
    description: "Corny wordplay that teaches how Korean sounds, splits, and double meanings can create jokes.",
    phrases: [
      { korean:"세상에서 가장 뜨거운 과일은? 천도복숭아!", romanization:"sesangeseo gajang tteugeoun gwail-eun? cheondoboksunga!", english:"What's the hottest fruit in the world? A nectarine!", note:"천도 sounds like 'one thousand degrees' (천 도), creating the pun." },
      { korean:"세상에서 가장 차가운 복숭아는? 냉동복숭아!", romanization:"sesangeseo gajang chagaun boksunga-neun? naengdongboksunga!", english:"What's the coldest peach? Frozen peach!", note:"A deliberately obvious dad-joke answer built from 냉동, 'frozen.'" },
      { korean:"오리가 얼면? 언덕!", romanization:"origa eoreumyeon? eondeok!", english:"What happens when a duck freezes? A hill!", note:"언 duck joke: 얼다 (freeze) + 오리 wordplay leads into the sound of 언덕." },
      { korean:"사과가 웃으면? 풋사과!", romanization:"sagwaga useumyeon? putsagwa!", english:"What is an apple when it laughs? A green apple!", note:"풋 can evoke the little '풋' snicker sound as well as unripe/green fruit." },
      { korean:"왕이 넘어지면? 킹콩!", romanization:"wangi neomeojimyeon? kingkong!", english:"What happens when a king falls? King Kong!", note:"A classic sound-based Korean dad joke: king + a falling/impact punchline." },
      { korean:"세상에서 가장 억울한 도형은? 원통해!", romanization:"sesangeseo gajang eogulhan dohyeong-eun? wontonghae!", english:"Which shape feels most wronged? A cylinder!", note:"원통 means cylinder, while 원통하다 means to feel deeply wronged/frustrated." },
      { korean:"신사가 자기소개할 때 하는 말은? 신사임당!", romanization:"sinsaga jagisogaehal ttae haneun mareun? sinsaimdang!", english:"What does a gentleman say when introducing himself? 'I'm a gentleman!'", note:"신사입니다 ('I am a gentleman') is twisted into the famous name 신사임당." },
      { korean:"자동차를 톡 치면? 카톡!", romanization:"jadongchareul tok chimyeon? katok!", english:"What if you tap a car? KakaoTalk!", note:"카 (car) + 톡 (tap/pop sound) becomes 카톡, the common nickname for KakaoTalk." }
    ]
  },
  {
    id: "cheesy-flirting",
    title: "Cheesy Korean flirting",
    description: "Corny, playful lines built around Korean wordplay, slang, and expressions that lose some of their charm in translation.",
    phrases: [
      { korean: "너 혹시 떡이야? 나랑 너무 찰떡인데?", romanization: "neo hoksi tteogiya? narang neomu chaltteoginde?", english: "Are you tteok? Because you and I are such a perfect match.", note: "찰떡 literally means sticky rice cake, but 찰떡 also means a perfect match." },
      { korean: "내 이상형이 누구냐고? 너 이상은 없어.", romanization: "nae isanghyeongi nugunyago? neo isangeun eopseo.", english: "Who is my ideal type? There is nobody above you.", note: "Wordplay on 이상형 (ideal type) and 이상 (above / beyond)." },
      { korean: "너 혹시 김이야? 나는 밥인데, 우리 만나면 김밥이네.", romanization: "neo hoksi gimiya? naneun babinde, uri mannamyeon gimbabine.", english: "Are you gim? I am rice — if we get together, we are gimbap.", note: "김 + 밥 = 김밥. Deliberately ridiculous, which is the charm." },
      { korean: "너 때문에 심쿵했잖아. 책임져.", romanization: "neo ttaemune simkunghaetjana. chaegimjyeo.", english: "You made my heart skip. Take responsibility.", note: "심쿵 is Korean slang for a sudden heart-thump caused by someone attractive or adorable." },
      { korean: "너는 내 취향이 아니라 내 취향 그 자체야.", romanization: "neoneun nae chwihyangi anira nae chwihyang geu jacheya.", english: "You are not just my type — you are the definition of my type.", note: "그 자체 means 'the thing itself,' making the line intentionally dramatic." },
      { korean: "너 혹시 자석이야? 왜 자꾸 너한테 끌리지?", romanization: "neo hoksi jaseogiya? wae jakku neohante kkeulliji?", english: "Are you a magnet? Why do I keep getting drawn to you?", note: "끌리다 means both to be pulled and to feel attracted to someone." },
      { korean: "우리 무슨 사이야? 나는 사이보다 사랑이 좋은데.", romanization: "uri museun saiya? naneun saiboda sarangi joeunde.", english: "What are we? I like love more than just a 'between-us' relationship.", note: "Wordplay using 사이 (relationship / space between people) and 사랑 (love)." },
      { korean: "너만 보면 왜 이렇게 설레지? 봄도 아닌데.", romanization: "neoman bomyeon wae ireoke seolleji? bomdo aninde.", english: "Why do I get butterflies whenever I see you? It is not even spring.", note: "A playful contrast between 설레다 (to feel fluttery/excited) and 봄 (spring), a season associated with romance." },
      { korean: "너 혹시 별이야? 자꾸 눈이 가.", romanization: "neo hoksi byeoriya? jakku nuni ga.", english: "Are you a star? My eyes keep going to you.", note: "눈이 가다 is a natural Korean expression meaning your attention keeps being drawn to something or someone." },
      { korean: "너 보면 눈이 안 떨어져.", romanization: "neo bomyeon nuni an tteoreojyeo.", english: "When I see you, I cannot take my eyes off you.", note: "눈이 안 떨어지다 literally means your eyes will not come away." },
      { korean: "너랑 있으면 시간이 왜 이렇게 빨리 가? 시간도 너 좋아하나 봐.", romanization: "neorang isseumyeon sigani wae ireoke ppalli ga? sigando neo joahana bwa.", english: "Why does time pass so fast when I am with you? Maybe time likes you too.", note: "Classic over-the-top Korean-style cheese." },
      { korean: "너 혹시 와이파이야? 가까이 가면 자꾸 연결되고 싶어.", romanization: "neo hoksi waipaiya? gakkai gamyeon jakku yeongyeoldoego sipeo.", english: "Are you Wi-Fi? When I get close, I keep wanting to connect.", note: "A modern cheesy line using 연결되다, 'to connect.'" },
      { korean: "너랑 나랑 궁합 봤어? 안 봐도 찰떡인데.", romanization: "neorang narang gunghap bwasseo? an bwado chaltteoginde.", english: "Have you checked our compatibility? We are obviously a perfect match even without checking.", note: "궁합 is compatibility between two people; 찰떡 reinforces the 'perfect match' joke." },
      { korean: "너 때문에 자꾸 웃게 돼. 이거 책임져야 하는 거 아니야?", romanization: "neo ttaemune jakku utge dwae. igeo chaegimjyeoya haneun geo aniya?", english: "You keep making me smile. Shouldn't you take responsibility for this?", note: "책임져 is often used jokingly in Korean when someone causes a cute emotional reaction." },
      { korean: "너한테 정들었나 봐. 이제 못 놓겠어.", romanization: "neohante jeongdeureonna bwa. ije mot nokesseo.", english: "I think I have grown attached to you. Now I cannot let go.", note: "정 is a very Korean idea of deep affection/attachment that grows through time and familiarity." },
      { korean: "너는 왜 이렇게 내 마음에 잘 들어와? 문도 안 열어 줬는데.", romanization: "neoneun wae ireoke nae maeume jal deureowa? mundo an yeoreo jwonneunde.", english: "Why do you get into my heart so easily? I did not even open the door.", note: "A literal joke on 마음에 들어오다, 'to come into one's heart,' made intentionally cheesy." }
    ]
  },
  {
    id: "relationship-words",
    title: "Relationship words",
    description: "Common Korean words for talking about close relationships.",
    phrases: [
      { korean: "연인", romanization: "yeonin", english: "Romantic partner / lover", note: "Neutral relationship term." },
      { korean: "남자친구", romanization: "namjachingu", english: "Boyfriend" },
      { korean: "여자친구", romanization: "yeojachingu", english: "Girlfriend" },
      { korean: "애인", romanization: "aein", english: "Boyfriend / girlfriend / lover", note: "Common but can feel more explicitly romantic than 연인." },
      { korean: "우리 사이", romanization: "uri sai", english: "Our relationship / the relationship between us" },
      { korean: "관계", romanization: "gwangye", english: "Relationship / relation", note: "Broader and more formal than 우리 사이." },
      { korean: "소중한 사람", romanization: "sojunghan saram", english: "A precious / special person" }
    ]
  },
  {
    id: "morning-night",
    title: "Morning & night",
    description: "Easy messages you can reuse every day.",
    phrases: [
      { korean: "잘 잤어?", romanization: "jal jasseo?", english: "Did you sleep well?" },
      { korean: "일어났어?", romanization: "ireonasseo?", english: "Are you awake? / Did you get up?" },
      { korean: "좋은 하루 보내.", romanization: "joeun haru bonae.", english: "Have a good day." },
      { korean: "오늘도 힘내.", romanization: "oneuldo himnae.", english: "You got this today / Hang in there today." },
      { korean: "잘 자.", romanization: "jal ja.", english: "Good night / Sleep well." },
      { korean: "좋은 꿈 꿔.", romanization: "joeun kkum kkwo.", english: "Sweet dreams." },
      { korean: "내일 얘기하자.", romanization: "naeil yaegihaja.", english: "Let's talk tomorrow." }
    ]
  }
];

const partnerKoreanDialogues = [
  {
    title: "Lunch check-in",
    situation: "A simple midday exchange.",
    lines: [
      { speaker: "A", korean: "뭐 해?", romanization: "mwo hae?", english: "What are you doing?" },
      { speaker: "B", korean: "일하고 있어. 너는?", romanization: "ilhago isseo. neoneun?", english: "I'm working. You?" },
      { speaker: "A", korean: "나 잠깐 쉬는 중이야. 점심 먹었어?", romanization: "na jamkkan swineun jungiya. jeomsim meogeosseo?", english: "I'm taking a short break. Did you have lunch?" },
      { speaker: "B", korean: "아직 안 먹었어. 너는?", romanization: "ajik an meogeosseo. neoneun?", english: "Not yet. How about you?" }
    ]
  },
  {
    title: "Miss you",
    situation: "A short affectionate check-in.",
    lines: [
      { speaker: "A", korean: "오늘 많이 보고 싶어.", romanization: "oneul mani bogo sipeo.", english: "I miss you a lot today." },
      { speaker: "B", korean: "나도 보고 싶어.", romanization: "nado bogo sipeo.", english: "I miss you too." },
      { speaker: "A", korean: "저녁에 통화할까?", romanization: "jeonyeoge tonghwahalkka?", english: "Shall we call this evening?" },
      { speaker: "B", korean: "응, 좋아.", romanization: "eung, joa.", english: "Yeah, sounds good." }
    ]
  },
  {
    title: "Small disagreement",
    situation: "Keeping a small disagreement calm.",
    lines: [
      { speaker: "A", korean: "나 좀 화났어.", romanization: "na jom hwanasseo.", english: "I'm a little angry." },
      { speaker: "B", korean: "미안해. 내가 잘못했어.", romanization: "mianhae. naega jalmothaesseo.", english: "I'm sorry. I was wrong." },
      { speaker: "A", korean: "그런 뜻은 아니었다고 먼저 말해 줬으면 좋았을 텐데.", romanization: "geureon tteuseun anieotdago meonjeo malhae jwosseumyeon joasseul tende.", english: "I wish you'd told me earlier that you didn't mean it that way." },
      { speaker: "B", korean: "우리 차분하게 얘기하자.", romanization: "uri chabunhage yaegihaja.", english: "Let's talk calmly." }
    ]
  },
  {
    title: "Evening plan",
    situation: "Making a simple plan together.",
    lines: [
      { speaker: "A", korean: "오늘 저녁에 시간 돼?", romanization: "oneul jeonyeoge sigan dwae?", english: "Are you free this evening?" },
      { speaker: "B", korean: "일곱 시 이후에는 괜찮아.", romanization: "ilgop si ihueneun gwaenchana.", english: "I'm free after seven." },
      { speaker: "A", korean: "그럼 만날까?", romanization: "geureom mannalkka?", english: "Then shall we meet?" },
      { speaker: "B", korean: "좋아. 네가 장소 정해.", romanization: "joa. nega jangso jeonghae.", english: "Sure. You choose the place." }
    ]
  },
  {
    title: "Good night",
    situation: "A short end-of-day exchange.",
    lines: [
      { speaker: "A", korean: "오늘 하루 어땠어?", romanization: "oneul haru eottaesseo?", english: "How was your day?" },
      { speaker: "B", korean: "조금 피곤했어.", romanization: "jogeum pigonhaesseo.", english: "It was a little tiring." },
      { speaker: "A", korean: "그럼 좀 쉬어. 잘 자.", romanization: "geureom jom swieo. jal ja.", english: "Then get some rest. Sleep well." },
      { speaker: "B", korean: "응. 좋은 꿈 꿔. 내일 얘기하자.", romanization: "eung. joeun kkum kkwo. naeil yaegihaja.", english: "Yeah. Sweet dreams. Let's talk tomorrow." }
    ]
  }
];

const messageMakeoverPresets = [
  { key:"eat", label:"Did you eat?", english:"Did you eat?", casual:"밥 먹었어?", polite:"밥 먹었어요?", note:"Natural Korean check-in; doesn't need a literal lunch/dinner word unless you mean a specific meal." },
  { key:"miss", label:"I miss you", english:"I miss you.", casual:"보고 싶어.", polite:"보고 싶어요.", note:"Korean uses 'want to see [you]' for 'I miss you.'" },
  { key:"busy", label:"Are you busy?", english:"Are you busy right now?", casual:"지금 바빠?", polite:"지금 바빠요?", note:"The subject is normally omitted." },
  { key:"home", label:"Did you get home?", english:"Did you get home?", casual:"집에 도착했어?", polite:"집에 도착했어요?", note:"Useful after someone travels home." },
  { key:"call", label:"Call later?", english:"Shall we call later?", casual:"이따 통화할까?", polite:"이따 통화할까요?", note:"통화하다 is more natural than translating 'call' word-for-word." },
  { key:"sleep", label:"Sleep well", english:"Good night, sleep well.", casual:"잘 자.", polite:"잘 자요.", note:"Short Korean is often more natural than a full translated sentence." },
  { key:"sorry", label:"I didn't mean it", english:"Sorry, I didn't mean it that way.", casual:"미안해. 그런 뜻은 아니었어.", polite:"미안해요. 그런 뜻은 아니었어요.", note:"A very useful making-up pattern." },
  { key:"care", label:"Take care", english:"Take care and message me when you arrive.", casual:"조심히 가. 도착하면 연락해.", polite:"조심히 가세요. 도착하면 연락해 주세요.", note:"Korean often expresses care through concrete actions." }
];

const messageMakeoverPeople = [
  { id:"friend", label:"Friend 🙂", hint:"normal comfortable friendship" },
  { id:"close_friend", label:"Close friend 🤝", hint:"very casual, teasing, slang allowed" },
  { id:"friend_pulling", label:"Friend I'm trying to pull 👀", hint:"still friends, but testing the waters" },
  { id:"crush", label:"Crush 🫣", hint:"clear interest, not officially together" },
  { id:"talking_stage", label:"Talking stage 😵‍💫", hint:"both sides probably know something is happening" },
  { id:"partner", label:"Partner 💗", hint:"established relationship, warmer and more comfortable" },
  { id:"senior", label:"Older / senior 🙇", hint:"respectful relationship" },
  { id:"unsure", label:"Not sure 🤷", hint:"keep it neutral and safe" }
];

const messageMakeoverVibes = [
  { id:"natural", label:"Natural" },
  { id:"cute", label:"Cute 🥹" },
  { id:"funny", label:"Funny 😂" },
  { id:"flirty", label:"Flirty 👀" },
  { id:"bold", label:"Bold 😏" },
  { id:"playful_naughty", label:"Playful 🤭" },
  { id:"caring", label:"Caring 🫶" },
  { id:"dry", label:"Dry 💀" },
  { id:"polite", label:"Polite 🙂" },
  { id:"make_up", label:"Make up 🥲" }
];

export default function PartnerKorean({ goBack, playKorean, callIntelligence, aiBusy }) {
  const [partnerCategory, setPartnerCategory] = useState("all");
  const [partnerQuery, setPartnerQuery] = useState("");
  const [partnerRomanization, setPartnerRomanization] = useState(true);
  const [partnerMessage, setPartnerMessage] = useState("");
  const [partnerMakeoverKey, setPartnerMakeoverKey] = useState("eat");
  const [makeoverPerson, setMakeoverPerson] = useState("friend_pulling");
  const [makeoverVibe, setMakeoverVibe] = useState("natural");
  const [makeoverIntensity, setMakeoverIntensity] = useState(45);
  const [makeoverResult, setMakeoverResult] = useState(null);
  const [makeoverError, setMakeoverError] = useState("");
  async function generateMessageMakeover() {
    const message = partnerMessage.trim();
    if (!message) { setMakeoverError("Type a message first."); return; }
    setMakeoverError("");
    setMakeoverResult(null);
    const person = messageMakeoverPeople.find(item => item.id === makeoverPerson) || messageMakeoverPeople[0];
    const vibe = messageMakeoverVibes.find(item => item.id === makeoverVibe) || messageMakeoverVibes[0];
    const result = await callIntelligence("message_makeover", {
      message: message.slice(0,600),
      relationship: makeoverPerson,
      relationshipLabel: person.label,
      relationshipHint: person.hint,
      vibe: makeoverVibe,
      vibeLabel: vibe.label,
      flirtIntensity: Number(makeoverIntensity),
      emojiGuidance: "Use emojis naturally. Keep playful output non-explicit.",
    });
    if (!result) {
      setMakeoverError("Hallim couldn't generate this version right now. The instant presets still work below.");
      return;
    }
    setMakeoverResult(result);
  }

    const selectedCategory = partnerKoreanCategories.find((item) => item.id === partnerCategory) || null;
    const source = partnerCategory === "all"
      ? partnerKoreanCategories.flatMap((group) =>
          group.phrases.map((item) => ({ ...item, categoryTitle: group.title }))
        )
      : (selectedCategory?.phrases || []).map((item) => ({ ...item, categoryTitle: selectedCategory?.title || "" }));

    const q = partnerQuery.trim().toLowerCase();
    const filtered = q
      ? source.filter((item) =>
          [item.korean, item.romanization, item.english, item.note || "", item.categoryTitle]
            .join(" ")
            .toLowerCase()
            .includes(q)
        )
      : source;

    return (
      <section className="partnerKoreanPage">

        <header className="partnerKoreanHero">
          <span className="eyebrow">Partner Korean</span>
          <h1>Everyday Korean for someone close to you.</h1>
          <p>A separate phrase bank for daily check-ins, affection, care, small disagreements, apologies, plans, and short relationship conversations.</p>
          <div className="partnerHeroActions">
            <button onClick={() => document.getElementById("partner-phrases")?.scrollIntoView({behavior:"smooth"})}>Browse phrases</button>
            <button onClick={() => document.getElementById("partner-dialogues")?.scrollIntoView({behavior:"smooth"})}>Mini conversations</button>
          </div>
        </header>

        <section className="messageMakeover">
          <div className="featurePanelHead">
            <span className="eyebrow">AI Message Makeover</span>
            <h2>Turn translated English into something you'd actually text.</h2>
            <p>Tell Hallim who it is for, pick the vibe, then let AI adapt the Korean naturally.</p>
          </div>

          <input
            value={partnerMessage}
            onChange={(event) => { setPartnerMessage(event.target.value); setMakeoverError(""); }}
            placeholder="Type an English message, e.g. Did you eat?"
          />

          <div className="makeoverControlBlock">
            <small>Who is this for? 😶‍🌫️</small>
            <div className="makeoverChoiceGrid people">
              {messageMakeoverPeople.map((item) => (
                <button key={item.id} className={makeoverPerson === item.id ? "active" : ""} onClick={() => setMakeoverPerson(item.id)}>
                  <b>{item.label}</b><span>{item.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="makeoverControlBlock">
            <small>What vibe do you want?</small>
            <div className="makeoverChoiceGrid vibes">
              {messageMakeoverVibes.map((item) => (
                <button key={item.id} className={makeoverVibe === item.id ? "active" : ""} onClick={() => setMakeoverVibe(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="makeoverIntensity">
            <div><small>How obvious should I make it?</small><b>{makeoverIntensity}%</b></div>
            <input type="range" min="0" max="100" step="5" value={makeoverIntensity} onChange={(event) => setMakeoverIntensity(event.target.value)} />
            <div className="makeoverIntensityLabels"><span>Just friendly</span><span>Obviously flirting</span></div>
          </div>

          <button className="makeoverGenerate" disabled={aiBusy === "message_makeover" || !partnerMessage.trim()} onClick={generateMessageMakeover}>
            {aiBusy === "message_makeover" ? "Making it natural…" : "✨ Make it Korean"}
          </button>

          {makeoverError && <div className="makeoverError">{makeoverError}</div>}

          {makeoverResult && (
            <div className="aiMakeoverResult">
              <div className="aiMakeoverBest">
                <small>BEST MATCH</small>
                <button onClick={() => playKorean(makeoverResult.bestMatch)}>
                  <b>{makeoverResult.bestMatch}</b><span>▶ Hear</span>
                </button>
                <em>{makeoverResult.romanization}</em>
                <p>{makeoverResult.naturalMeaning}</p>
                <aside>{makeoverResult.why}</aside>
              </div>
              <div className="aiMakeoverVariants">
                <button onClick={() => playKorean(makeoverResult.softer)}><small>Softer</small><b>{makeoverResult.softer}</b></button>
                <button onClick={() => playKorean(makeoverResult.bolder)}><small>Bolder</small><b>{makeoverResult.bolder}</b></button>
                <button onClick={() => playKorean(makeoverResult.funnier)}><small>Funnier</small><b>{makeoverResult.funnier}</b></button>
              </div>
            </div>
          )}

          <div className="makeoverInstantDivider"><span>or use an instant preset</span></div>
          <div className="makeoverPresets">
            {messageMakeoverPresets.map((item) => (
              <button
                key={item.key}
                className={partnerMakeoverKey === item.key ? "active" : ""}
                onClick={() => { setPartnerMakeoverKey(item.key); setPartnerMessage(item.english); setMakeoverResult(null); }}
              >{item.label}</button>
            ))}
          </div>

          {(() => {
            const typed = partnerMessage.trim().toLowerCase();
            const chosen = messageMakeoverPresets.find((item) =>
              typed && (typed.includes(item.key) || typed.includes(item.label.toLowerCase().split(" ")[0]))
            ) || messageMakeoverPresets.find((item) => item.key === partnerMakeoverKey) || messageMakeoverPresets[0];
            return !makeoverResult ? (
              <div className="makeoverResult">
                <article><small>CASUAL / CLOSE</small><button onClick={() => playKorean(chosen.casual)}>{chosen.casual}<span>▶ Hear</span></button></article>
                <article><small>POLITE</small><button onClick={() => playKorean(chosen.polite)}>{chosen.polite}<span>▶ Hear</span></button></article>
                <p>{chosen.note}</p>
              </div>
            ) : null;
          })()}
        </section>

        <section id="partner-phrases" className="partnerPhraseSection">
          <div className="partnerSectionHead">
            <div>
              <span className="eyebrow">Phrase bank</span>
              <h2>Find the line you want fast.</h2>
            </div>
            <div className="partnerTools">
              <input
                value={partnerQuery}
                onChange={(event) => setPartnerQuery(event.target.value)}
                placeholder="Search: miss you, lunch, sorry..."
              />
              <button onClick={() => setPartnerRomanization((value) => !value)}>
                {partnerRomanization ? "Hide romanization" : "Show romanization"}
              </button>
            </div>
          </div>

          <div className="partnerCategories">
            <button
              className={partnerCategory === "all" ? "active" : ""}
              onClick={() => { setPartnerCategory("all"); setPartnerQuery(""); }}
            >
              All
            </button>
            {partnerKoreanCategories.map((item) => (
              <button
                key={item.id}
                className={partnerCategory === item.id ? "active" : ""}
                onClick={() => { setPartnerCategory(item.id); setPartnerQuery(""); }}
              >
                {item.title}
              </button>
            ))}
          </div>

          <div className="partnerCategoryIntro">
            <b>{partnerCategory === "all" ? "All phrases" : selectedCategory?.title}</b>
            <p>{partnerCategory === "all"
              ? "Search or browse every Partner Korean phrase from every category in one place."
              : selectedCategory?.description}</p>
          </div>

          <div className="partnerPhraseList">
            {filtered.map((item, index) => (
              <article key={item.korean + index}>
                <div>
                  <h3>{item.korean}</h3>
                  {partnerRomanization && <em>{item.romanization}</em>}
                  <p>{item.english}</p>
                  {partnerCategory === "all" && <small>{item.categoryTitle}</small>}
                  {item.note && <aside>{item.note}</aside>}
                </div>
                <button onClick={() => playKorean(item.korean, 0.92)}>▶ Hear</button>
              </article>
            ))}
          </div>

          {!filtered.length && (
            <div className="partnerEmpty">No phrase matched that search. Try another category or a shorter word.</div>
          )}
        </section>

        <section id="partner-dialogues" className="partnerDialogueSection">
          <span className="eyebrow">Mini conversations</span>
          <h2>See how the phrases fit together.</h2>
          <p className="partnerDialogueLead">Short learning examples showing how casual Korean flows in context.</p>

          <div className="partnerDialogues">
            {partnerKoreanDialogues.map((dialogue) => (
              <article key={dialogue.title}>
                <div className="partnerDialogueTop">
                  <div><h3>{dialogue.title}</h3><p>{dialogue.situation}</p></div>
                  <button onClick={() => playKorean(dialogue.lines.map((line) => line.korean).join(". "), 0.9)}>▶ Play dialogue</button>
                </div>
                <div className="partnerDialogueLines">
                  {dialogue.lines.map((line, index) => (
                    <div className={line.speaker === "A" ? "speakerA" : "speakerB"} key={dialogue.title + index}>
                      <small>Speaker {line.speaker}</small>
                      <b>{line.korean}</b>
                      {partnerRomanization && <em>{line.romanization}</em>}
                      <p>{line.english}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="partnerUsageNote">
          <b>Register note</b>
          <p>Most phrases here use casual 반말 because this section is for close relationships. Use polite -요 forms when the relationship or situation calls for more distance or respect.</p>
        </section>
      </section>
    );
  }
