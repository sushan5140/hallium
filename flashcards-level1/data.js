/* Hallium Starter Unit 1 — same 12 vocabulary items and sentences as main app/page.js.
   Visual cues refer to the particular Korean meaning, never to an adjacent object. */
window.HALLIUM_STARTER_WORDS = Object.freeze([
  {
    id:"hello",ko:"안녕하세요",latin:"annyeonghaseyo",meaning:"Hello (polite greeting)",short:"Hello",
    group:"Greetings",type:"POLITE GREETING",example:"안녕하세요. 저는 민지예요.",
    translation:"Hello. I'm Minji.",tip:"Let all five syllables flow together; keep the ㅎ in 하 light.",
    description:"Someone waving hello to another person.",art:"greeting",sentencePrompt:"_____. 저는 민지예요.",contrast:"안녕하세요 is a polite greeting. 안녕 is casual."
  },
  {
    id:"name",ko:"이름",latin:"ireum",meaning:"Name",short:"Name",
    group:"Identity",type:"NOUN · IDENTITY",example:"제 이름은 수아예요.",
    translation:"My name is Sua.",tip:"ㅡ in 름 is the Korean eu vowel, not the English “oo”; finish cleanly on ㅁ.",
    description:"A name tag with a small portrait, not a sign for a place.",art:"name",sentencePrompt:"제 _____은 수아예요.",contrast:"이름 is a person's name. 이름표 is a name tag."
  },
  {
    id:"student",ko:"학생",latin:"haksaeng",meaning:"Student",short:"Student",
    group:"Identity",type:"NOUN · PERSON",example:"저는 학생이에요.",
    translation:"I am a student.",tip:"학생 is commonly heard [학쌩] (hak-ssaeng). Don't add a vowel after 학.",
    description:"A student wearing a school uniform and holding books, without a graduation cap.",art:"student",sentencePrompt:"저는 _____이에요.",contrast:"학생 means student. 선생님 means teacher."
  },
  {
    id:"friend",ko:"친구",latin:"chingu",meaning:"Friend",short:"Friend",
    group:"Identity",type:"NOUN · PERSON",example:"민지는 제 친구예요.",
    translation:"Minji is my friend.",tip:"ㅊ in 친 has a puff of air; ㄱ in 구 is a lighter k/g sound.",
    description:"Two friendly peers greeting one another, not one student alone.",art:"friend",sentencePrompt:"민지는 제 _____예요.",contrast:"친구 means a friend, not family or a teacher."
  },
  {
    id:"book",ko:"책",latin:"chaek",meaning:"Book",short:"Book",
    group:"Objects",type:"NOUN · READING",example:"이것은 책이에요.",
    translation:"This is a book.",tip:"Start with aspirated ㅊ; end on unreleased final ㄱ without an extra vowel.",
    description:"An open PRINTED book with facing text pages, a picture and a distinct binding.",art:"book",sentencePrompt:"이것은 _____이에요.",contrast:"책 is a book for reading. 공책 / 노트 is a notebook for writing."
  },
  {
    id:"bag",ko:"가방",latin:"gabang",meaning:"Bag",short:"Bag",
    group:"Objects",type:"NOUN · OBJECT",example:"이것은 제 가방이에요.",
    translation:"This is my bag.",tip:"Initial ㄱ is light; do not pronounce 가 like aspirated 카. End 방 with -ng.",
    description:"A proper backpack with shoulder straps, handles and a zipped pocket.",art:"bag",sentencePrompt:"이것은 제 _____이에요.",contrast:"가방 covers bags and backpacks; 지갑 means wallet."
  },
  {
    id:"water",ko:"물",latin:"mul",meaning:"Water",short:"Water",
    group:"Objects",type:"NOUN · DRINK",example:"물을 마셔요.",
    translation:"I drink water.",tip:"ㅜ is a clean Korean u sound; finish on final ㄹ without adding a vowel.",
    description:"A transparent drinking glass visibly filled with water and a blue droplet.",art:"water",sentencePrompt:"_____을 마셔요.",contrast:"물 means water; 우유 is milk."
  },
  {
    id:"coffee",ko:"커피",latin:"keopi",meaning:"Coffee",short:"Coffee",
    group:"Objects",type:"NOUN · DRINK",example:"저는 커피를 좋아해요.",
    translation:"I like coffee.",tip:"ㅋ and ㅍ have clear aspiration; ㅓ in 커 is eo, not pure English ‘oh’.",
    description:"A ceramic coffee cup full of brown coffee with a handle and rising steam.",art:"coffee",sentencePrompt:"저는 _____를 좋아해요.",contrast:"커피 is coffee; 카페 is the place where you may buy it."
  },
  {
    id:"school",ko:"학교",latin:"hakgyo",meaning:"School",short:"School",
    group:"Places",type:"NOUN · PLACE",example:"저는 학교에 가요.",
    translation:"I go to school.",tip:"Commonly pronounced [학꾜] (hak-kkyo) with a tense sound in 교.",
    description:"A school building with rows of windows, a clock and an entrance.",art:"school",sentencePrompt:"저는 _____에 가요.",contrast:"학교 is the school building/institution. 학생 is a student."
  },
  {
    id:"home",ko:"집",latin:"jip",meaning:"Home / house",short:"Home",
    group:"Places",type:"NOUN · PLACE",example:"저녁에 집에 가요.",
    translation:"I go home in the evening.",tip:"Final ㅂ is unreleased: close the lips instead of adding a ‘buh’ sound.",
    description:"A house with a pitched roof, front door, and warm lit windows.",art:"home",sentencePrompt:"저녁에 _____에 가요.",contrast:"집 refers to a house or home; 학교 is school."
  },
  {
    id:"library",ko:"도서관",latin:"doseogwan",meaning:"Library",short:"Library",
    group:"Places",type:"NOUN · PLACE",example:"오후에 도서관에 가요.",
    translation:"I go to the library in the afternoon.",tip:"Keep ㄷ and ㄱ light and pronounce ㅘ in 관 as one wa glide.",
    description:"Public library room with tall bookcases packed with printed books and a reading desk.",art:"library",sentencePrompt:"오후에 _____에 가요.",contrast:"도서관 is the place where books are collected and read. 책 is a book."
  },
  {
    id:"cafe",ko:"카페",latin:"kape",meaning:"Café / coffee shop",short:"Café",
    group:"Places",type:"NOUN · PLACE",example:"친구와 카페에 가요.",
    translation:"I go to a café with a friend.",tip:"Both ㅋ and ㅍ are aspirated; give each a short, clear puff of air.",
    description:"A café storefront with an awning, a counter and visible coffee cup.",art:"cafe",sentencePrompt:"친구와 _____에 가요.",contrast:"카페 is a café, while 커피 is the drink."
  }
]);
window.HALLIUM_STARTER_GROUPS = Object.freeze(["All","Greetings","Identity","Objects","Places"]);
