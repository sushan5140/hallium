"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getHallimSupabase } from "../lib/supabase/client";
import PartnerKorean from "./partner/PartnerKorean";
import LandingPage from "./landing/LandingPage";

const units = [
  {
    id: "unit-1", number: 1, levelId: "new", levelLabel: "Starter", levelRank: 0,
    title: "First conversations",
    subtitle: "Start speaking, identifying things, and moving through everyday places.",
    lessons: [lesson1(), lesson2(), lesson3(), lesson4(), lesson5(), checkpoint1()],
  },
  {
    id: "unit-2", number: 2, levelId: "foundation", levelLabel: "Foundation", levelRank: 1,
    title: "My everyday life",
    subtitle: "Time, routines, daily actions, likes, and simple plans.",
    lessons: makeUnitLessons(2, "foundation", [
      {
        title: "My morning", subtitle: "Talk about a simple morning routine.",
        words: [["아침","morning"],["일어나요","wake up"],["먹어요","eat"]],
        pattern: ["Time + 에", "Use 에 after a time to say when something happens.", "아침에 일어나요.", [["아침에","in the morning"],["일어나요","wake up"]]],
        check: ["Which means “I wake up in the morning”?", ["아침에 일어나요.","아침은 일어나요.","아침에 학생이에요.","아침을 가요."], 0, "Time + 에 marks when the action happens."],
        listen: ["아침에 일어나요. 그리고 밥을 먹어요.", "What happens after waking up?", ["They eat.","They study.","They go to a cafe.","They sleep."], 0, "먹어요 means eat."],
        build: ["Build: I wake up in the morning.", ["일어나요","아침에"], "아침에 일어나요"],
        canDo: ["say when a routine happens","recognize basic morning actions"],
      },
      {
        title: "What time is it?", subtitle: "Ask and understand simple clock times.",
        words: [["지금","now"],["시","o'clock"],["몇","how many / what number"]],
        pattern: ["몇 시예요?", "Use 몇 시예요? to ask what time it is.", "지금 몇 시예요?", [["지금","now"],["몇 시예요?","what time is it?"]]],
        check: ["How do you ask “What time is it now?”", ["지금 몇 시예요?","지금 어디예요?","몇 명이에요?","지금 뭐 먹어요?"], 0, "지금 몇 시예요? asks the current time."],
        listen: ["지금 세 시예요. 네 시에 카페에 가요.", "When is the cafe plan?", ["3 o'clock","4 o'clock","5 o'clock","Morning"], 1, "네 시에 means at four o'clock."],
        build: ["Build: It is three o'clock now.", ["세 시예요","지금"], "지금 세 시예요"],
        canDo: ["ask the time","understand a simple time-based plan"],
      },
      {
        title: "What I like", subtitle: "Say what you like and do not like.",
        words: [["좋아해요","like"],["싫어해요","dislike"],["음악","music"]],
        pattern: ["Noun + 을/를 좋아해요", "Mark the thing you like with 을/를 before 좋아해요.", "저는 음악을 좋아해요.", [["저는","I"],["음악을","music + object"],["좋아해요","like"]]],
        check: ["Which means “I like coffee”?", ["저는 커피를 좋아해요.","저는 커피에 가요.","커피는 저예요.","저는 커피가 싫어요?"], 0, "커피를 좋아해요 means like coffee."],
        listen: ["저는 음악을 좋아해요. 하지만 아침 운동은 싫어해요.", "What does the speaker like?", ["Morning exercise","Music","Coffee","School"], 1, "음악을 좋아해요 means likes music."],
        build: ["Build: I like music.", ["음악을","저는","좋아해요"], "저는 음악을 좋아해요"],
        canDo: ["say what you like","recognize 을/를 with 좋아해요"],
      },
      {
        title: "Weekend plans", subtitle: "Make a simple plan for the weekend.",
        words: [["주말","weekend"],["만나요","meet"],["공부해요","study"]],
        pattern: ["Noun + 을/를 만나요", "Mark the person you meet with 을/를 before 만나요.", "주말에 친구를 만나요.", [["주말에","on the weekend"],["친구를","friend + object"],["만나요","meet"]]],
        check: ["Which sentence describes meeting a friend on the weekend?", ["주말에 친구를 만나요.","친구는 주말이에요.","주말을 친구예요.","친구에 주말 가요."], 0, "친구를 만나요 means meet with a friend."],
        listen: ["토요일에 친구하고 카페에 가요. 일요일에는 공부해요.", "What happens on Sunday?", ["Cafe","Study","Shopping","Work"], 1, "일요일에는 공부해요 means studies on Sunday."],
        build: ["Build: I study on Sunday.", ["공부해요","일요일에"], "일요일에 공부해요"],
        canDo: ["talk about weekend plans","connect people and activities"],
      },
    ]),
  },
  {
    id: "unit-3", number: 3, levelId: "foundation", levelLabel: "Foundation", levelRank: 1,
    title: "Food & ordering",
    subtitle: "Understand menus, quantities, preferences, and polite requests.",
    lessons: makeUnitLessons(3, "foundation", [
      {
        title: "Food I know", subtitle: "Recognize common food and drink words.",
        words: [["밥","rice / meal"],["김치","kimchi"],["차","tea"]],
        pattern: ["Noun + 주세요", "Use 주세요 after a noun to politely ask for it.", "물 주세요.", [["물","water"],["주세요","please give me"]]],
        check: ["How do you politely ask for water?", ["물 주세요.","물 가요.","물이에요?","물을 싫어해요."], 0, "Noun + 주세요 is a polite request."],
        listen: ["김치하고 밥 주세요. 물도 주세요.", "What drink is requested?", ["Coffee","Water","Tea","Milk"], 1, "물도 주세요 means water too, please."],
        build: ["Build: Please give me tea.", ["차","주세요"], "차 주세요"],
        canDo: ["recognize basic food words","make a simple polite request"],
      },
      {
        title: "One, two, three", subtitle: "Order simple quantities.",
        words: [["하나","one"],["둘","two"],["개","counter for things"]],
        pattern: ["Number + 개", "Use 개 as a general counter for many countable things. Restaurants often use more specific counters too.", "사과 두 개 주세요.", [["사과","apple"],["두 개","two items"],["주세요","please give me"]]],
        check: ["Which asks for two items?", ["두 개 주세요.","둘은 가요.","두 시 주세요.","개 두예요."], 0, "두 개 means two items."],
        listen: ["김밥 하나하고 물 두 병 주세요.", "How many waters?", ["One","Two","Three","Four"], 1, "물 두 병 means two bottles of water."],
        build: ["Build: Please give me two.", ["주세요","두 개"], "두 개 주세요"],
        canDo: ["use a basic counter","understand simple quantities"],
      },
      {
        title: "What do you want?", subtitle: "Express a simple preference when ordering.",
        words: [["뭐","what"],["먹고 싶어요","want to eat"],["마시고 싶어요","want to drink"]],
        pattern: ["Verb + 고 싶어요", "Attach -고 싶어요 to a verb stem to say what you want to do.", "커피를 마시고 싶어요.", [["커피를","coffee + object"],["마시고 싶어요","want to drink"]]],
        check: ["Which means “I want to eat”?", ["먹고 싶어요.","먹어요?","먹지 않아요.","먹었어요."], 0, "-고 싶어요 expresses wanting to do an action."],
        listen: ["저는 비빔밥을 먹고 싶어요. 친구는 차를 마시고 싶어요.", "What does the friend want?", ["Bibimbap","Tea","Coffee","Water"], 1, "친구는 차를 마시고 싶어요."],
        build: ["Build: I want to drink coffee.", ["커피를","마시고 싶어요"], "커피를 마시고 싶어요"],
        canDo: ["say what you want to eat or drink","recognize -고 싶어요"],
      },
      {
        title: "At the counter", subtitle: "Put requests, quantities, and preferences together.",
        words: [["여기요","excuse me / here"],["맛있어요","delicious"],["더","more"]],
        pattern: ["Noun + 도", "Use 도 to mean also/too.", "물도 주세요.", [["물도","water too"],["주세요","please give me"]]],
        check: ["Which means “Please give me water too”?", ["물도 주세요.","물은 가요.","물에 주세요.","물만 가요."], 0, "도 adds the meaning also/too."],
        listen: ["여기요. 김밥 하나하고 물도 주세요.", "What is additionally requested?", ["Coffee","Water","Tea","Rice"], 1, "물도 주세요 means water too."],
        build: ["Build: Please give me one kimbap.", ["김밥","하나","주세요"], "김밥 하나 주세요"],
        canDo: ["combine a polite order","understand 도 in a restaurant request"],
      },
    ]),
  },
  {
    id: "unit-4", number: 4, levelId: "elementary", levelLabel: "Elementary", levelRank: 2,
    title: "Shopping & quantities",
    subtitle: "Ask prices, choose items, compare simple options, and buy what you need.",
    lessons: makeUnitLessons(4, "elementary", [
      {
        title: "How much is this?", subtitle: "Ask and understand simple prices.",
        words: [["얼마예요","how much is it"],["원","won"],["비싸요","expensive"]],
        pattern: ["얼마예요?", "Use 얼마예요? to ask the price of something.", "이거 얼마예요?", [["이거","this thing"],["얼마예요?","how much is it?"]]],
        check: ["How do you ask the price?", ["이거 얼마예요?","이거 어디예요?","몇 시예요?","뭐 먹어요?"], 0, "얼마예요? asks how much something costs."],
        listen: ["이거 만 원이에요. 저거는 오천 원이에요.", "Which is cheaper?", ["This one","That one","Same price","Unknown"], 1, "오천 원 is less than 만 원."],
        build: ["Build: How much is this?", ["얼마예요?","이거"], "이거 얼마예요?"],
        canDo: ["ask a price","recognize won amounts in context"],
      },
      {
        title: "Do you have this?", subtitle: "Ask whether a shop has something.",
        words: [["있어요","there is / have"],["없어요","there is not / do not have"],["색깔","color"]],
        pattern: ["Noun + 있어요?", "Use 있어요? to ask whether something exists or is available.", "검은색 있어요?", [["검은색","black color"],["있어요?","do you have it?"]]],
        check: ["Which asks “Do you have black?”", ["검은색 있어요?","검은색이에요.","검은색 가요?","검은색 좋아해요?"], 0, "있어요? asks availability."],
        listen: ["파란색은 없어요. 검은색은 있어요.", "Which color is available?", ["Blue","Black","Both","Neither"], 1, "검은색은 있어요 means black is available."],
        build: ["Build: Do you have this?", ["있어요?","이거"], "이거 있어요?"],
        canDo: ["ask about availability","understand 있어요/없어요"],
      },
      {
        title: "I’ll take this one", subtitle: "Choose an item naturally.",
        words: [["이걸로","with this / this one"],["살게요","I’ll buy"],["괜찮아요","it is okay"]],
        pattern: ["Noun + (으)로", "Use (으)로 in 이걸로/저걸로 to indicate your selection or choice.", "이걸로 할게요.", [["이걸로","with this one"],["할게요","I’ll go with it"]]],
        check: ["Which naturally means “I’ll take this one”?", ["이걸로 할게요.","이거에 가요.","이거는 없어요?","이거를 몇 시예요?"], 0, "이걸로 할게요 is a common selection phrase."],
        listen: ["빨간색도 괜찮지만 저는 검은색으로 할게요.", "Which color does the speaker choose?", ["Red","Black","Blue","White"], 1, "검은색으로 할게요 indicates the final choice."],
        build: ["Build: I’ll go with this one.", ["할게요","이걸로"], "이걸로 할게요"],
        canDo: ["make a shopping choice","understand a simple selection phrase"],
      },
      {
        title: "Shopping conversation", subtitle: "Combine price, availability, and choice.",
        words: [["입어 보다","try on"],["사이즈","size"],["조금","a little"]],
        pattern: ["Verb + 아/어 봐요", "Use -아/어 봐요 to suggest or talk about trying an action.", "한번 입어 봐요.", [["한번","once / try"],["입어 봐요","try wearing it"]]],
        check: ["What does 입어 봐요 suggest?", ["Try it on","Buy it now","It is expensive","There is no size"], 0, "-아/어 보다 expresses trying an action."],
        listen: ["이 사이즈는 조금 작아요. 큰 사이즈를 입어 봐요.", "What should the customer try?", ["A smaller size","A larger size","A different color","Nothing"], 1, "큰 사이즈 means a larger size."],
        build: ["Build: Try it on once.", ["입어 봐요","한번"], "한번 입어 봐요"],
        canDo: ["follow a short shopping exchange","understand -아/어 보다"],
      },
    ]),
  },
  {
    id: "unit-5", number: 5, levelId: "elementary", levelLabel: "Elementary", levelRank: 2,
    title: "Directions & meeting up",
    subtitle: "Ask where places are, follow directions, and arrange where to meet.",
    lessons: makeUnitLessons(5, "elementary", [
      {
        title: "Where is it?", subtitle: "Ask where a place is.",
        words: [["어디","where"],["근처","nearby"],["역","station"]],
        pattern: ["Noun + 어디예요?", "Use 어디예요? to ask where a place is.", "지하철역이 어디예요?", [["지하철역이","subway station"],["어디예요?","where is it?"]]],
        check: ["How do you ask where the station is?", ["역이 어디예요?","역이 얼마예요?","역을 먹어요?","역에 몇 시예요?"], 0, "어디예요? asks location."],
        listen: ["카페는 지하철역 근처예요.", "Where is the cafe?", ["Near the station","At home","Inside school","Far away"], 0, "근처 means nearby."],
        build: ["Build: Where is the station?", ["어디예요?","역이"], "역이 어디예요?"],
        canDo: ["ask where a place is","recognize 근처"],
      },
      {
        title: "Go straight", subtitle: "Understand basic movement directions.",
        words: [["쭉","straight"],["왼쪽","left"],["오른쪽","right"]],
        pattern: ["Direction + 으로 가세요", "Use (으)로 with a direction and 가세요 for polite directions.", "오른쪽으로 가세요.", [["오른쪽으로","to the right"],["가세요","please go"]]],
        check: ["Which means “Please go right”?", ["오른쪽으로 가세요.","오른쪽이 얼마예요?","오른쪽을 먹어요.","오른쪽이에요?"], 0, "(으)로 가세요 gives a direction."],
        listen: ["쭉 가세요. 그리고 왼쪽으로 가세요.", "What comes after going straight?", ["Turn right","Go left","Stop","Go back"], 1, "왼쪽으로 가세요 means go left."],
        build: ["Build: Please go left.", ["가세요","왼쪽으로"], "왼쪽으로 가세요"],
        canDo: ["follow left/right directions","give one simple direction"],
      },
      {
        title: "Let’s meet there", subtitle: "Arrange a place and time to meet.",
        words: [["거기","there"],["앞","front"],["만날까요","shall we meet"]],
        pattern: ["Verb + (으)ㄹ까요?", "Use -(으)ㄹ까요? to make a suggestion together.", "역 앞에서 만날까요?", [["역 앞에서","in front of the station"],["만날까요?","shall we meet?"]]],
        check: ["Which is a suggestion to meet?", ["만날까요?","만나요.","만났어요.","만나지 않아요."], 0, "-(으)ㄹ까요? can make a joint suggestion."],
        listen: ["여섯 시에 역 앞에서 만날까요?", "Where will they meet?", ["At a cafe","In front of the station","At school","At home"], 1, "역 앞에서 means in front of the station."],
        build: ["Build: Shall we meet there?", ["만날까요?","거기에서"], "거기에서 만날까요?"],
        canDo: ["suggest meeting","understand place + time arrangements"],
      },
      {
        title: "Finding each other", subtitle: "Handle a short directions-and-meeting exchange.",
        words: [["도착했어요","arrived"],["기다려요","wait"],["보여요","can see"]],
        pattern: ["Verb + 고 있어요", "Use -고 있어요 for an action currently in progress.", "앞에서 기다리고 있어요.", [["앞에서","in front"],["기다리고 있어요","am waiting"]]],
        check: ["Which means “I am waiting”?", ["기다리고 있어요.","기다렸어요.","기다릴까요?","기다리지 않아요."], 0, "-고 있어요 expresses an action in progress."],
        listen: ["저는 역 앞에 도착했어요. 지금 카페 앞에서 기다리고 있어요.", "What is the speaker doing now?", ["Eating","Waiting","Shopping","Studying"], 1, "기다리고 있어요 means is waiting."],
        build: ["Build: I am waiting in front.", ["기다리고 있어요","앞에서"], "앞에서 기다리고 있어요"],
        canDo: ["say you arrived","describe what you are doing now"],
      },
    ]),
  },
  {
    id: "unit-6", number: 6, levelId: "elementary", levelLabel: "Elementary", levelRank: 2,
    title: "Past events & plans",
    subtitle: "Talk about yesterday, describe what happened, and make near-future plans.",
    lessons: makeUnitLessons(6, "elementary", [
      {
        title: "What did you do?", subtitle: "Use polite past tense for everyday actions.",
        words: [["어제","yesterday"],["갔어요","went"],["먹었어요","ate"]],
        pattern: ["Verb + 았/었어요", "Use -았/었어요 for polite past tense.", "어제 카페에 갔어요.", [["어제","yesterday"],["카페에","to the cafe"],["갔어요","went"]]],
        check: ["Which is past tense?", ["먹었어요.","먹어요.","먹고 싶어요.","먹을까요?"], 0, "-았/었어요 marks a past action."],
        listen: ["어제 친구하고 식당에 갔어요. 비빔밥을 먹었어요.", "What did the speaker eat?", ["Kimchi","Bibimbap","Kimbap","Coffee"], 1, "비빔밥을 먹었어요."],
        build: ["Build: I went to a cafe yesterday.", ["카페에","어제","갔어요"], "어제 카페에 갔어요"],
        canDo: ["talk about a past action","recognize polite past tense"],
      },
      {
        title: "It was good", subtitle: "Describe a past experience.",
        words: [["재미있었어요","was fun"],["좋았어요","was good"],["바빴어요","was busy"]],
        pattern: ["Adjective + 았/었어요", "Descriptive verbs also use -았/었어요 for past states.", "영화가 재미있었어요.", [["영화가","movie + subject"],["재미있었어요","was fun"]]],
        check: ["Which means “It was fun”?", ["재미있었어요.","재미있어요.","재미있을까요?","재미없어요."], 0, "재미있었어요 is past."],
        listen: ["주말에 여행을 다녀왔어요. 조금 바빴지만 재미있었어요.", "How was the trip?", ["Boring","Fun","Easy","Cheap"], 1, "재미있었어요 means it was fun."],
        build: ["Build: The movie was good.", ["좋았어요","영화가"], "영화가 좋았어요"],
        canDo: ["describe a past experience","combine event + evaluation"],
      },
      {
        title: "I’m going to", subtitle: "Express a simple future plan.",
        words: [["내일","tomorrow"],["갈 거예요","will go"],["할 거예요","will do"]],
        pattern: ["Verb + (으)ㄹ 거예요", "Use -(으)ㄹ 거예요 for a plan or likely future action.", "내일 공부할 거예요.", [["내일","tomorrow"],["공부할 거예요","will study"]]],
        check: ["Which means “I will study tomorrow”?", ["내일 공부할 거예요.","어제 공부했어요.","지금 공부해요.","공부하고 싶어요."], 0, "-(으)ㄹ 거예요 expresses a future plan."],
        listen: ["내일 오전에는 공부하고 오후에는 친구를 만날 거예요.", "What happens in the afternoon?", ["Study","Meet a friend","Work","Sleep"], 1, "오후에는 친구를 만날 거예요."],
        build: ["Build: I will go tomorrow.", ["갈 거예요","내일"], "내일 갈 거예요"],
        canDo: ["state a future plan","contrast yesterday and tomorrow"],
      },
      {
        title: "Weekend recap & next plan", subtitle: "Connect past events with future plans.",
        words: [["그래서","so / therefore"],["다음","next"],["이번","this"]],
        pattern: ["Past + 그래서 + plan", "Use 그래서 to connect a situation or result to what comes next.", "어제 바빴어요. 그래서 오늘 쉴 거예요.", [["어제 바빴어요","yesterday was busy"],["그래서","so"],["오늘 쉴 거예요","I will rest today"]]],
        check: ["What does 그래서 do?", ["Connects a result or consequence","Asks a price","Marks a destination","Makes a request"], 0, "그래서 commonly means so/therefore."],
        listen: ["이번 주말에는 공부했어요. 그래서 다음 주말에는 친구를 만날 거예요.", "What is planned for next weekend?", ["Study","Meet a friend","Travel","Work"], 1, "다음 주말에는 친구를 만날 거예요."],
        build: ["Build: So I will rest today.", ["오늘","그래서","쉴 거예요"], "그래서 오늘 쉴 거예요"],
        canDo: ["connect past and future","use 그래서 in a short story"],
      },
    ]),
  },
  {
    id: "unit-7", number: 7, levelId: "lower-intermediate", levelLabel: "Lower Intermediate", levelRank: 3,
    title: "Reasons & opinions",
    subtitle: "Explain why, give opinions, and respond with more than one short sentence.",
    lessons: makeUnitLessons(7, "lower-intermediate", [
      {
        title: "Because…", subtitle: "Give a reason with -아서/어서.",
        words: [["피곤해요","tired"],["늦었어요","was late"],["쉬어요","rest"]],
        pattern: ["A/V + 아서/어서", "Use -아서/어서 to connect a reason or natural sequence.", "피곤해서 집에서 쉬어요.", [["피곤해서","because I am tired"],["집에서","at home"],["쉬어요","rest"]]],
        check: ["Which means “I rest because I am tired”?", ["피곤해서 쉬어요.","피곤하지만 쉬어요.","피곤하면 가요.","피곤할까요?"], 0, "-아서/어서 can connect a reason."],
        listen: ["오늘 비가 와서 집에 있어요.", "Why is the speaker at home?", ["They are tired","It is raining","They are busy","They are studying"], 1, "비가 와서 gives the reason."],
        build: ["Build: I rest because I am tired.", ["집에서","피곤해서","쉬어요"], "피곤해서 집에서 쉬어요"],
        canDo: ["give a simple reason","connect two clauses naturally"],
      },
      {
        title: "What do you think?", subtitle: "State a simple opinion politely.",
        words: [["생각해요","think"],["중요해요","important"],["필요해요","necessary"]],
        pattern: ["-다고 생각해요", "Use -다고 생각해요 after a statement to say “I think that…”", "한국어 연습이 중요하다고 생각해요.", [["한국어 연습이","Korean practice"],["중요하다고","that it is important"],["생각해요","I think"]]],
        check: ["Which expresses an opinion?", ["중요하다고 생각해요.","중요해서 가요.","중요했어요.","중요할까요?"], 0, "-다고 생각해요 frames an opinion."],
        listen: ["저는 매일 조금씩 공부하는 게 중요하다고 생각해요.", "What does the speaker value?", ["Studying a little every day","Long vacations","Shopping","Eating out"], 0, "The opinion says daily small study is important."],
        build: ["Build: I think practice is important.", ["중요하다고","연습이","생각해요"], "연습이 중요하다고 생각해요"],
        canDo: ["state an opinion","understand -다고 생각해요"],
      },
      {
        title: "But / although", subtitle: "Express contrast with -지만.",
        words: [["하지만","but"],["어렵다","to be difficult"],["재미있다","to be fun"]],
        pattern: ["A/V + 지만", "Use -지만 to contrast two facts.", "어렵지만 재미있어요.", [["어렵지만","although it is difficult"],["재미있어요","it is fun"]]],
        check: ["Which means “It is difficult but fun”?", ["어렵지만 재미있어요.","어려워서 재미있어요.","어려우면 재미있어요.","어려웠어요."], 0, "-지만 expresses contrast."],
        listen: ["한국어 발음은 어렵지만 공부하는 게 재미있어요.", "What is difficult?", ["Grammar","Pronunciation","Reading","Shopping"], 1, "발음은 어렵지만 means pronunciation is difficult, but..."],
        build: ["Build: It is difficult but fun.", ["재미있어요","어렵지만"], "어렵지만 재미있어요"],
        canDo: ["contrast two ideas","make an opinion more nuanced"],
      },
      {
        title: "Explain your choice", subtitle: "Combine opinion, reason, and contrast.",
        words: [["선택","choice"],["장점","advantage"],["단점","disadvantage"]],
        pattern: ["Opinion + 이유는…", "Use 이유는… to explicitly introduce your reason.", "제가 이걸 선택한 이유는 편해서예요.", [["선택한 이유는","the reason I chose it"],["편해서예요","is because it is convenient"]]],
        check: ["What does 이유 mean?", ["Reason","Price","Place","Time"], 0, "이유 means reason."],
        listen: ["이 앱은 조금 어렵지만 유용해요. 제가 계속 쓰는 이유는 복습이 좋아서예요.", "Why does the speaker keep using it?", ["It is cheap","The review is good","It is easy","It has games"], 1, "복습이 좋아서예요 gives the reason."],
        build: ["Build: The reason is that it is convenient.", ["편해서예요","이유는"], "이유는 편해서예요"],
        canDo: ["explain a choice","combine reason and contrast"],
      },
    ]),
  },
  {
    id: "unit-8", number: 8, levelId: "lower-intermediate", levelLabel: "Lower Intermediate", levelRank: 3,
    title: "Comparing & choosing",
    subtitle: "Compare options, express preferences, and justify a decision.",
    lessons: makeUnitLessons(8, "lower-intermediate", [
      {
        title: "More than", subtitle: "Compare two things with 보다.",
        words: [["보다","than"],["더","more"],["덜","less"]],
        pattern: ["A보다 B가 더…", "Use 보다 after the comparison reference and 더 before the stronger quality.", "커피보다 차가 더 좋아요.", [["커피보다","than coffee"],["차가","tea"],["더 좋아요","is better / I like more"]]],
        check: ["Which means “Tea is better than coffee”?", ["커피보다 차가 더 좋아요.","차보다 커피가 같아요.","차가 커피에서 가요.","커피하고 차예요."], 0, "A보다 B가 더... compares B against A."],
        listen: ["저는 버스보다 지하철이 더 편해요.", "Which does the speaker find more convenient?", ["Bus","Subway","Taxi","Walking"], 1, "지하철이 더 편해요."],
        build: ["Build: Tea is better than coffee.", ["차가","더 좋아요","커피보다"], "커피보다 차가 더 좋아요"],
        canDo: ["make a basic comparison","use 보다 and 더"],
      },
      {
        title: "The most", subtitle: "Express a favorite or strongest preference.",
        words: [["제일","the most"],["가장","the most"],["편해요","convenient"]],
        pattern: ["제일 / 가장 + adjective", "Use 제일 or 가장 before an adjective/adverb for “the most.”", "이 방법이 제일 편해요.", [["이 방법이","this method"],["제일","the most"],["편해요","convenient"]]],
        check: ["Which means “This is the most convenient”?", ["이게 제일 편해요.","이게 더 편해요?","이게 편했어요.","이게 편해서 가요."], 0, "제일 expresses the superlative."],
        listen: ["세 가지 방법 중에서 두 번째가 가장 쉬워요.", "Which is easiest?", ["First","Second","Third","All equal"], 1, "두 번째가 가장 쉬워요."],
        build: ["Build: This method is the most convenient.", ["이 방법이","편해요","제일"], "이 방법이 제일 편해요"],
        canDo: ["express a strongest preference","understand 제일/가장"],
      },
      {
        title: "If…", subtitle: "Discuss a condition with -(으)면.",
        words: [["만약","if"],["시간","time"],["가능해요","possible"]],
        pattern: ["A/V + (으)면", "Use -(으)면 for if/when conditions.", "시간이 있으면 같이 가요.", [["시간이 있으면","if you have time"],["같이 가요","let's go together"]]],
        check: ["Which means “If you have time”?", ["시간이 있으면","시간이 있어서","시간이 있지만","시간이 있었어요"], 0, "-(으)면 marks a condition."],
        listen: ["비가 안 오면 공원에 갈 거예요.", "What condition affects the plan?", ["If it is not raining","If it is expensive","If they are late","If they are hungry"], 0, "비가 안 오면 means if it does not rain."],
        build: ["Build: If you have time, let’s go together.", ["같이 가요","시간이 있으면"], "시간이 있으면 같이 가요"],
        canDo: ["express a condition","discuss conditional plans"],
      },
      {
        title: "Choose and justify", subtitle: "Compare alternatives and explain a final decision.",
        words: [["대신","instead"],["결정했어요","decided"],["조건","condition"]],
        pattern: ["A 대신 B", "Use 대신 to say B is chosen or used instead of A.", "버스 대신 지하철을 탈 거예요.", [["버스 대신","instead of the bus"],["지하철을","subway + object"],["탈 거예요","will take"]]],
        check: ["What does 대신 express?", ["Instead of","Because","Although","Before"], 0, "대신 means instead/in place of."],
        listen: ["차는 편하지만 비싸요. 그래서 차 대신 지하철을 타기로 했어요.", "What did the speaker decide?", ["Take a car","Take the subway","Walk","Stay home"], 1, "차 대신 지하철을... means subway instead of car."],
        build: ["Build: I will take the subway instead of the bus.", ["지하철을","버스 대신","탈 거예요"], "버스 대신 지하철을 탈 거예요"],
        canDo: ["justify a decision","use 대신 after comparison"],
      },
    ]),
  },
  {
    id: "unit-9", number: 9, levelId: "lower-intermediate", levelLabel: "Lower Intermediate", levelRank: 3,
    title: "Connected conversations",
    subtitle: "Keep a conversation moving with background, reactions, clarification, and follow-up.",
    lessons: makeUnitLessons(9, "lower-intermediate", [
      {
        title: "Give background", subtitle: "Use -는데요 to add context or soften a lead-in.",
        words: [["사실","actually"],["요즘","these days"],["상황","situation"]],
        pattern: ["A/V + 는데요 / (으)ㄴ데요", "Use -는데요 to give background, contrast softly, or set up what comes next.", "요즘 한국어를 공부하고 있는데요.", [["요즘","these days"],["공부하고 있는데요","I am studying, and..."]]],
        check: ["What is a common role of -는데요?", ["Giving background or a soft lead-in","Counting objects","Marking only past tense","Asking a price"], 0, "-는데요 often sets context for what follows."],
        listen: ["요즘 한국어를 공부하고 있는데요. 듣기가 아직 어려워요.", "What difficulty follows the background?", ["Listening","Reading","Shopping","Writing prices"], 0, "듣기가 아직 어려워요."],
        build: ["Build: These days I am studying Korean, and…", ["한국어를","요즘","공부하고 있는데요"], "요즘 한국어를 공부하고 있는데요"],
        canDo: ["give conversational background","recognize a soft lead-in"],
      },
      {
        title: "React naturally", subtitle: "Use short reactions to keep the exchange alive.",
        words: [["정말요","really"],["그렇군요","I see"],["맞아요","that's right"]],
        pattern: ["Reaction + follow-up", "Use a natural reaction before asking or adding something.", "정말요? 언제 시작했어요?", [["정말요?","really?"],["언제 시작했어요?","when did you start?"]]],
        check: ["Which is a natural reaction meaning “I see”?", ["그렇군요.","얼마예요?","주세요.","갈 거예요."], 0, "그렇군요 is a common acknowledgement/reaction."],
        listen: ["A: 다음 달에 한국에 가요. B: 정말요? 얼마나 있을 거예요?", "What does B do?", ["Changes topic completely","Reacts and asks a follow-up","Ends the conversation","Orders food"], 1, "B reacts, then asks a related question."],
        build: ["Build: Really? When did you start?", ["언제 시작했어요?","정말요?"], "정말요? 언제 시작했어요?"],
        canDo: ["react naturally","ask a related follow-up question"],
      },
      {
        title: "Clarify what you heard", subtitle: "Ask someone to repeat or explain.",
        words: [["다시","again"],["뜻","meaning"],["설명해 주세요","please explain"]],
        pattern: ["다시 + Verb + 주세요", "Use 다시 with a request to ask for repetition.", "다시 말해 주세요.", [["다시","again"],["말해 주세요","please say"]]],
        check: ["How do you ask “Please say it again”?", ["다시 말해 주세요.","다시 갈까요?","뜻이 얼마예요?","말했어요."], 0, "다시 말해 주세요 asks for repetition."],
        listen: ["죄송하지만 잘 못 들었어요. 다시 말해 주세요.", "Why does the speaker ask again?", ["They did not hear well","They are angry","They want to leave","They know the answer"], 0, "잘 못 들었어요 means did not hear well."],
        build: ["Build: Please explain again.", ["설명해 주세요","다시"], "다시 설명해 주세요"],
        canDo: ["ask for repetition","repair a conversation politely"],
      },
      {
        title: "Keep it going", subtitle: "Combine background, reaction, reason, and follow-up.",
        words: [["그러면","then / in that case"],["혹시","by any chance"],["계속","continue"]],
        pattern: ["그러면 + follow-up", "Use 그러면 to respond to new information and continue logically.", "그러면 다음 주에 만날까요?", [["그러면","then / in that case"],["다음 주에","next week"],["만날까요?","shall we meet?"]]],
        check: ["What does 그러면 help you do?", ["Continue from the previous information","Count items","Make a past tense","Mark possession"], 0, "그러면 connects your next response to what was just said."],
        listen: ["A: 이번 주는 너무 바빠요. B: 그렇군요. 그러면 다음 주에 만날까요?", "What does B suggest?", ["This week","Next week","Tomorrow morning","Never"], 1, "다음 주에 만날까요?"],
        build: ["Build: Then shall we meet next week?", ["다음 주에","그러면","만날까요?"], "그러면 다음 주에 만날까요?"],
        canDo: ["sustain a multi-turn exchange","connect reactions to follow-up questions"],
      },
    ]),
  },
  {
    id: "unit-10", number: 10, levelId: "intermediate", levelLabel: "Intermediate", levelRank: 4,
    title: "Cause, change & consequence",
    subtitle: "Explain how situations changed, why they happened, and what followed.",
    lessons: makeUnitLessons(10, "intermediate", [
      {
        title: "How it came to be", subtitle: "Describe a change or outcome with -게 되다.",
        words: [["계기","turning point"],["결국","eventually"],["변화","change"]],
        pattern: ["Verb + 게 되다", "Use -게 되다 when a situation changes or something comes to happen, often without presenting it as a simple deliberate choice.", "한국에서 일하게 되었어요.", [["한국에서","in Korea"],["일하게 되었어요","came to work / ended up working"]]],
        check: ["Which best expresses “I came to work in Korea”?", ["한국에서 일하게 되었어요.","한국에서 일하고 싶어요.","한국에서 일했지만요.","한국에서 일할까요?"], 0, "-게 되다 presents a resulting change or situation."],
        listen: ["친구의 추천으로 한국 드라마를 보기 시작했고, 그게 계기가 돼서 한국어를 공부하게 되었어요.", "What led the speaker to study Korean?", ["A friend's recommendation and Korean dramas","A job interview","A school exam","A restaurant"], 0, "The drama became the 계기, leading to Korean study."],
        build: ["Build: I came to study Korean.", ["한국어를","공부하게 되었어요"], "한국어를 공부하게 되었어요"],
        canDo: ["describe how a situation changed","explain an outcome with -게 되다"],
      },
      {
        title: "Give a clear reason", subtitle: "Use -기 때문에 for an explicit reason.",
        words: [["원인","cause"],["결과","result"],["영향","influence"]],
        pattern: ["A/V + 기 때문에", "Use -기 때문에 to state a relatively explicit reason or cause.", "시간이 부족하기 때문에 먼저 중요한 일을 해야 해요.", [["시간이 부족하기 때문에","because time is limited"],["중요한 일을","important work"],["해야 해요","must do"]]],
        check: ["Which form gives an explicit reason?", ["-기 때문에","-지만","-는 반면에","-게 되다"], 0, "-기 때문에 directly marks a reason."],
        listen: ["자료가 충분하지 않기 때문에 지금 결론을 내리기는 어려워요.", "Why is a conclusion difficult now?", ["There is not enough evidence","The meeting is over","The result is obvious","The speaker forgot"], 0, "자료가 충분하지 않기 때문에 gives the reason."],
        build: ["Build: Because time is limited, we must decide.", ["시간이 부족하기 때문에","결정해야 해요"], "시간이 부족하기 때문에 결정해야 해요"],
        canDo: ["state an explicit reason","connect cause and consequence"],
      },
      {
        title: "Add another factor", subtitle: "Use -는 데다가 to add a related point.",
        words: [["게다가","moreover"],["부담","burden"],["조건","condition"]],
        pattern: ["A/V + 는 데다가", "Use -는 데다가 to add another related fact, often reinforcing the same evaluation.", "비가 오는 데다가 바람도 많이 불어요.", [["비가 오는 데다가","in addition to it raining"],["바람도","the wind also"],["많이 불어요","blows strongly"]]],
        check: ["What does -는 데다가 do?", ["Adds another related factor","Marks only past tense","Asks a question","Makes a command"], 0, "-는 데다가 adds another point of the same general direction."],
        listen: ["가격이 비싼 데다가 사용법도 복잡해서 다른 제품을 알아보고 있어요.", "Why is the speaker considering another product?", ["It is expensive and complicated","It is unavailable","It is too small","It arrived late"], 0, "Two negative factors are added together."],
        build: ["Build: It is expensive and also complicated.", ["비싼 데다가","복잡해요"], "비싼 데다가 복잡해요"],
        canDo: ["add a reinforcing factor","understand cumulative reasoning"],
      },
      {
        title: "Concede, then qualify", subtitle: "Use -기는 하지만 for balanced evaluation.",
        words: [["인정하다","acknowledge"],["한계","limitation"],["장점","advantage"]],
        pattern: ["A/V + 기는 하지만", "Use -기는 하지만 to acknowledge one point before presenting a contrasting qualification.", "편리하기는 하지만 비용이 많이 들어요.", [["편리하기는 하지만","it is convenient, but"],["비용이","cost"],["많이 들어요","is high / costs a lot"]]],
        check: ["Which structure explicitly acknowledges a point before contrasting it?", ["-기는 하지만","-기 때문에","-게 되다","-자고 하다"], 0, "-기는 하지만 concedes one point, then qualifies it."],
        listen: ["이 방법이 효과적이기는 하지만 모든 상황에 적용할 수 있는 것은 아니에요.", "What limitation is mentioned?", ["It cannot be applied to every situation","It has no effect","It is free","It is always correct"], 0, "The second clause limits the first claim."],
        build: ["Build: It is useful, but it has limitations.", ["유용하기는 하지만","한계가 있어요"], "유용하기는 하지만 한계가 있어요"],
        canDo: ["make a balanced evaluation","acknowledge and qualify a claim"],
      },
    ]),
  },
  {
    id: "unit-11", number: 11, levelId: "intermediate", levelLabel: "Intermediate", levelRank: 4,
    title: "Reported speech & viewpoints",
    subtitle: "Report statements, questions, requests, and suggestions accurately.",
    lessons: makeUnitLessons(11, "intermediate", [
      {
        title: "Report what someone said", subtitle: "Use -다고 하다 for statements.",
        words: [["전하다","convey"],["발표","announcement"],["내용","content"]],
        pattern: ["Statement + 다고 하다", "Use -다고 하다 to report a statement without quoting it word-for-word.", "회의가 취소됐다고 했어요.", [["회의가","meeting"],["취소됐다고","that it was cancelled"],["했어요","said"]]],
        check: ["Which reports “They said the meeting was cancelled”?", ["회의가 취소됐다고 했어요.","회의를 취소하라고 했어요.","회의가 취소됐냐고 했어요.","회의를 취소하자고 했어요."], 0, "-다고 하다 reports a statement."],
        listen: ["담당자가 일정이 다음 주로 바뀌었다고 했어요.", "What did the person in charge say?", ["The schedule moved to next week","The event was cancelled forever","The room changed","The price increased"], 0, "일정이 다음 주로 바뀌었다고 했어요."],
        build: ["Build: They said the schedule changed.", ["일정이 바뀌었다고","했어요"], "일정이 바뀌었다고 했어요"],
        canDo: ["report a statement","distinguish reported statements from direct quotes"],
      },
      {
        title: "Report a question", subtitle: "Use -냐고 하다 for questions.",
        words: [["묻다","ask"],["확인하다","confirm"],["여부","whether or not"]],
        pattern: ["Question + 냐고 하다", "Use -냐고 하다 to report what someone asked.", "언제 출발하냐고 물었어요.", [["언제","when"],["출발하냐고","whether/when they depart"],["물었어요","asked"]]],
        check: ["Which reports a question?", ["언제 출발하냐고 물었어요.","출발한다고 했어요.","출발하라고 했어요.","출발하자고 했어요."], 0, "-냐고 reports a question."],
        listen: ["친구가 신청 마감일이 언제냐고 물어봤어요.", "What did the friend ask about?", ["The application deadline","The fee","The location","The result"], 0, "마감일이 언제냐고 asks when the deadline is."],
        build: ["Build: They asked when it starts.", ["언제 시작하냐고","물었어요"], "언제 시작하냐고 물었어요"],
        canDo: ["report a question","recognize indirect question forms"],
      },
      {
        title: "Report a request", subtitle: "Use -(으)라고 하다 for requests or commands.",
        words: [["요청","request"],["지시","instruction"],["제출하다","submit"]],
        pattern: ["Verb + (으)라고 하다", "Use -(으)라고 하다 to report a request, instruction, or command.", "서류를 오늘까지 제출하라고 했어요.", [["서류를","documents"],["오늘까지","by today"],["제출하라고 했어요","said to submit"]]],
        check: ["Which means “They told me to submit the documents”?", ["서류를 제출하라고 했어요.","서류를 제출한다고 했어요.","서류를 제출하냐고 했어요.","서류를 제출하자고 했어요."], 0, "-(으)라고 하다 reports an instruction."],
        listen: ["교수님이 보고서를 금요일까지 보내라고 하셨어요.", "What instruction was given?", ["Send the report by Friday","Rewrite the report next month","Cancel the report","Read it on Monday"], 0, "보내라고 하셨어요 reports the instruction."],
        build: ["Build: They told me to wait.", ["기다리라고","했어요"], "기다리라고 했어요"],
        canDo: ["report a request or command","recognize -(으)라고 하다"],
      },
      {
        title: "Report a suggestion", subtitle: "Use -자고 하다 for suggestions.",
        words: [["제안","suggestion"],["논의하다","discuss"],["합의","agreement"]],
        pattern: ["Verb + 자고 하다", "Use -자고 하다 to report a suggestion to do something together.", "다시 논의하자고 했어요.", [["다시","again"],["논의하자고","that we should discuss"],["했어요","suggested/said"]]],
        check: ["Which reports “They suggested meeting tomorrow”?", ["내일 만나자고 했어요.","내일 만나라고 했어요.","내일 만나냐고 했어요.","내일 만난다고 했어요."], 0, "-자고 하다 reports a suggestion."],
        listen: ["팀에서 먼저 작은 규모로 시험해 보자고 했어요.", "What did the team suggest?", ["Try it on a small scale first","Cancel the project","Hire more people immediately","Skip testing"], 0, "시험해 보자고 했어요 is a reported suggestion."],
        build: ["Build: They suggested discussing it again.", ["다시 논의하자고","했어요"], "다시 논의하자고 했어요"],
        canDo: ["report a suggestion","distinguish four reported-speech types"],
      },
    ]),
  },
  {
    id: "unit-12", number: 12, levelId: "intermediate", levelLabel: "Intermediate", levelRank: 4,
    title: "Structured viewpoints",
    subtitle: "Compare positions, cite a source, and describe broader tendencies.",
    lessons: makeUnitLessons(12, "intermediate", [
      {
        title: "Not only A but also B", subtitle: "Use -(으)ㄹ 뿐만 아니라 to broaden a claim.",
        words: [["측면","aspect"],["효율","efficiency"],["접근성","accessibility"]],
        pattern: ["A/V + (으)ㄹ 뿐만 아니라", "Use -(으)ㄹ 뿐만 아니라 to say that one point is true and another is additionally true.", "시간을 절약할 뿐만 아니라 비용도 줄일 수 있어요.", [["시간을 절약할 뿐만 아니라","not only saves time"],["비용도","cost also"],["줄일 수 있어요","can reduce"]]],
        check: ["What does -(으)ㄹ 뿐만 아니라 express?", ["Not only A but also B","Because of A","If A","A was reported"], 0, "It broadens a claim with an additional point."],
        listen: ["이 서비스는 사용하기 쉬울 뿐만 아니라 접근성도 좋아요.", "What two strengths are mentioned?", ["Ease of use and accessibility","Price and speed","Color and size","Location and timing"], 0, "Both ease of use and accessibility are praised."],
        build: ["Build: It saves time and also reduces cost.", ["시간을 절약할 뿐만 아니라","비용도 줄여요"], "시간을 절약할 뿐만 아니라 비용도 줄여요"],
        canDo: ["broaden a claim","connect two supporting points"],
      },
      {
        title: "Contrast two sides", subtitle: "Use -(으)ㄴ/는 반면에 for structured contrast.",
        words: [["반면","on the other hand"],["차이","difference"],["관점","viewpoint"]],
        pattern: ["A/V + (으)ㄴ/는 반면에", "Use 반면에 to contrast two characteristics, situations, or groups.", "온라인 수업은 편리한 반면에 집중하기 어려울 수 있어요.", [["온라인 수업은","online classes"],["편리한 반면에","while convenient"],["집중하기 어려울 수 있어요","can be hard to focus"]]],
        check: ["Which form sets up a structured contrast?", ["-(으)ㄴ/는 반면에","-기 때문에","-게 되다","-자고 하다"], 0, "반면에 contrasts two sides."],
        listen: ["도시는 기회가 많은 반면에 생활비가 높은 편이에요.", "What contrast is made?", ["More opportunities but higher living costs","Fewer jobs but cheaper housing","Better weather but worse transport","More parks but fewer people"], 0, "Opportunities are contrasted with living cost."],
        build: ["Build: It is convenient, but it can be expensive.", ["편리한 반면에","비쌀 수 있어요"], "편리한 반면에 비쌀 수 있어요"],
        canDo: ["compare two sides formally","understand 반면에"],
      },
      {
        title: "Cite a source", subtitle: "Use -에 따르면 for source-based information.",
        words: [["자료","data/material"],["조사","survey"],["보고서","report"]],
        pattern: ["Noun + 에 따르면", "Use -에 따르면 to identify the source of reported information.", "조사 결과에 따르면 만족도가 높아졌어요.", [["조사 결과에 따르면","according to the survey results"],["만족도가","satisfaction"],["높아졌어요","increased"]]],
        check: ["Which means “according to the report”?", ["보고서에 따르면","보고서이기 때문에","보고서인 반면에","보고서라고 하자"], 0, "-에 따르면 identifies a source."],
        listen: ["최근 조사에 따르면 응답자의 절반 이상이 이 기능을 자주 사용한다고 해요.", "What is the source?", ["A recent survey","A personal guess","A teacher's order","A weather report"], 0, "최근 조사에 따르면 names the source."],
        build: ["Build: According to the report, usage increased.", ["보고서에 따르면","사용량이 늘었어요"], "보고서에 따르면 사용량이 늘었어요"],
        canDo: ["cite a source","separate evidence from personal opinion"],
      },
      {
        title: "Describe a tendency", subtitle: "Use -는 경향이 있다 for recurring patterns.",
        words: [["경향","tendency"],["현상","phenomenon"],["증가하다","increase"]],
        pattern: ["Verb + 는 경향이 있다", "Use -는 경향이 있다 to describe a tendency rather than an absolute rule.", "시간이 부족하면 쉬운 선택을 하는 경향이 있어요.", [["시간이 부족하면","when time is limited"],["쉬운 선택을 하는","choose easy options"],["경향이 있어요","tend to"]]],
        check: ["Why use -는 경향이 있다?", ["To describe a tendency without claiming it is always true","To give a direct command","To mark a price","To quote a question"], 0, "It describes a recurring pattern, not an absolute."],
        listen: ["사람들은 정보가 너무 많으면 익숙한 선택지를 고르는 경향이 있어요.", "What tendency is described?", ["Choosing familiar options when overloaded","Always choosing the cheapest option","Avoiding all information","Changing languages"], 0, "익숙한 선택지를 고르는 경향이 있어요."],
        build: ["Build: People tend to choose familiar options.", ["익숙한 선택을 하는","경향이 있어요"], "익숙한 선택을 하는 경향이 있어요"],
        canDo: ["describe a tendency","avoid overgeneralizing a claim"],
      },
    ]),
  },
  {
    id: "unit-13", number: 13, levelId: "advanced", levelLabel: "Advanced", levelRank: 5,
    title: "Inference & stance",
    subtitle: "Express inference, expectation, general tendency, and cautious interpretation.",
    lessons: makeUnitLessons(13, "advanced", [
      {
        title: "In effect, it means…", subtitle: "Use -(으)ㄴ/는 셈이다 to interpret a situation.",
        words: [["해석","interpretation"],["사실상","in effect"],["의미","meaning"]],
        pattern: ["A/V + (으)ㄴ/는 셈이다", "Use -(으)ㄴ/는 셈이다 to interpret what a situation amounts to in effect.", "매일 두 시간씩 공부했으니 일주일에 열네 시간을 공부한 셈이에요.", [["매일 두 시간씩","two hours each day"],["일주일에 열네 시간을","fourteen hours a week"],["공부한 셈이에요","amounts to having studied"]]],
        check: ["What does -(으)ㄴ/는 셈이다 often do?", ["Interprets what a situation amounts to","Gives a direct command","Marks only future tense","Reports a question"], 0, "It draws an interpretive conclusion from facts."],
        listen: ["무료 체험 기간이 한 달이니까 실제로는 첫 달 비용을 내지 않는 셈이에요.", "What interpretation is made?", ["The first month effectively costs nothing","The service is permanently free","The price doubles","The trial lasts one day"], 0, "The free trial means the first month effectively costs nothing."],
        build: ["Build: That effectively means we saved time.", ["시간을 아낀","셈이에요"], "시간을 아낀 셈이에요"],
        canDo: ["draw an interpretive conclusion","use -는 셈이다"],
      },
      {
        title: "That cannot be the case", subtitle: "Use -(으)ㄹ 리가 없다 for strong negative inference.",
        words: [["가능성","possibility"],["근거","basis/evidence"],["의심","doubt"]],
        pattern: ["Verb/Adjective + (으)ㄹ 리가 없다", "Use -(으)ㄹ 리가 없다 when you judge that something cannot reasonably be true.", "그 사람이 약속을 잊었을 리가 없어요.", [["그 사람이","that person"],["약속을 잊었을","have forgotten the promise"],["리가 없어요","there is no way"]]],
        check: ["Which means “There is no way they forgot”?", ["잊었을 리가 없어요.","잊게 되었어요.","잊었다고 해요.","잊자고 했어요."], 0, "-(으)ㄹ 리가 없다 expresses strong negative inference."],
        listen: ["데이터가 이렇게 일관적인데 우연일 리가 없다고 생각했어요.", "What does the speaker infer?", ["It is unlikely to be mere coincidence","The data is useless","The result is definitely wrong","Nothing can be concluded"], 0, "우연일 리가 없다 rejects coincidence as plausible."],
        build: ["Build: There is no way it is a coincidence.", ["우연일","리가 없어요"], "우연일 리가 없어요"],
        canDo: ["express strong negative inference","distinguish inference from fact"],
      },
      {
        title: "It tends to happen", subtitle: "Use -기 마련이다 for a general expectation.",
        words: [["일반적","general"],["과정","process"],["자연스럽다","natural"]],
        pattern: ["A/V + 기 마련이다", "Use -기 마련이다 for something generally expected to happen or be true.", "처음에는 실수하기 마련이에요.", [["처음에는","at first"],["실수하기","make mistakes"],["마련이에요","is generally to be expected"]]],
        check: ["Which form expresses a general expectation?", ["-기 마련이다","-냐고 하다","-에 따르면","-는 반면에"], 0, "-기 마련이다 presents something as generally expected."],
        listen: ["새로운 환경에 적응하려면 시간이 걸리기 마련이에요.", "What is presented as natural/expected?", ["Adjustment takes time","Everyone adapts instantly","The environment never changes","Time is irrelevant"], 0, "시간이 걸리기 마련이에요."],
        build: ["Build: At first, mistakes are natural.", ["처음에는","실수하기 마련이에요"], "처음에는 실수하기 마련이에요"],
        canDo: ["express a general expectation","use -기 마련이다 carefully"],
      },
      {
        title: "It seems as though…", subtitle: "Use -(으)ㄴ/는 듯하다 for cautious inference.",
        words: [["추정","estimation"],["조심스럽다","cautious"],["맥락","context"]],
        pattern: ["A/V + (으)ㄴ/는 듯하다", "Use -(으)ㄴ/는 듯하다 to present an observation or inference cautiously.", "상황이 조금 나아진 듯해요.", [["상황이","situation"],["조금 나아진","improved a little"],["듯해요","seems"]]],
        check: ["Why use -듯하다?", ["To make an inference more cautious","To issue a command","To count objects","To quote a request"], 0, "-듯하다 softens an inference."],
        listen: ["표정만 보면 결과에 만족한 듯하지만 아직 공식 발표는 없어요.", "What is certain?", ["There is no official announcement yet","The result is definitely accepted","The speaker knows the final score","Everyone is unhappy"], 0, "The satisfaction is inferred; lack of official announcement is stated."],
        build: ["Build: The situation seems to have improved.", ["상황이","나아진 듯해요"], "상황이 나아진 듯해요"],
        canDo: ["make cautious inferences","separate observation from certainty"],
      },
    ]),
  },
  {
    id: "unit-14", number: 14, levelId: "advanced", levelLabel: "Advanced", levelRank: 5,
    title: "Formal argument",
    subtitle: "Build formal written reasoning with scope, cause, and purpose.",
    lessons: makeUnitLessons(14, "advanced", [
      {
        title: "Including / starting with", subtitle: "Use -을/를 비롯해 to frame representative examples.",
        words: [["비롯하다","begin/include"],["분야","field"],["사례","case/example"]],
        pattern: ["Noun + 을/를 비롯해", "Use -을/를 비롯해 to introduce a representative example and extend the scope beyond it.", "한국을 비롯해 여러 나라에서 이 제도를 운영하고 있어요.", [["한국을 비롯해","including Korea"],["여러 나라에서","in several countries"],["운영하고 있어요","are operating"]]],
        check: ["What does -을/를 비롯해 do?", ["Introduces a representative example within a broader set","Marks a question","Expresses a command","Means only one item"], 0, "It broadens from an example to a larger set."],
        listen: ["서울을 비롯한 주요 도시에서 대중교통 정책을 강화하고 있어요.", "What scope is described?", ["Major cities including Seoul","Only one neighborhood","Rural villages only","No specific places"], 0, "서울을 비롯한 주요 도시."],
        build: ["Build: Including Korea, several countries use it.", ["한국을 비롯해","여러 나라에서 사용해요"], "한국을 비롯해 여러 나라에서 사용해요"],
        canDo: ["frame representative examples","broaden the scope of an argument"],
      },
      {
        title: "Because / since, formally", subtitle: "Use -(으)므로 in formal reasoning.",
        words: [["따라서","therefore"],["근거","grounds"],["타당하다","valid"]],
        pattern: ["A/V + (으)므로", "Use -(으)므로 in formal or written contexts to state a reason.", "자료가 충분하지 않으므로 추가 조사가 필요합니다.", [["자료가 충분하지 않으므로","since the data is insufficient"],["추가 조사가","additional investigation"],["필요합니다","is necessary"]]],
        check: ["Where is -(으)므로 most natural?", ["Formal/written reasoning","Casual greeting","Counting objects","Ordering coffee"], 0, "-(으)므로 is common in formal reasoning."],
        listen: ["현재 표본이 작으므로 결과를 일반화할 때 주의해야 합니다.", "Why is caution needed?", ["The sample is small","The price changed","The speaker is tired","The report is missing"], 0, "표본이 작으므로 gives the formal reason."],
        build: ["Build: Since the evidence is limited, caution is needed.", ["근거가 제한적이므로","주의가 필요합니다"], "근거가 제한적이므로 주의가 필요합니다"],
        canDo: ["state a formal reason","connect evidence to a recommendation"],
      },
      {
        title: "Because of an unexpected event", subtitle: "Use -는 바람에 for an unwanted consequence.",
        words: [["예상치 못하다","unexpected"],["차질","disruption"],["지연","delay"]],
        pattern: ["Verb + 는 바람에", "Use -는 바람에 when an unexpected event causes an undesirable result.", "갑자기 비가 오는 바람에 행사가 취소됐어요.", [["갑자기 비가 오는 바람에","because it suddenly rained"],["행사가","event"],["취소됐어요","was cancelled"]]],
        check: ["What nuance does -는 바람에 usually carry?", ["An unexpected cause leading to an undesirable result","A neutral list","A positive compliment","A future promise"], 0, "-는 바람에 commonly carries an unwanted-result nuance."],
        listen: ["서버에 문제가 생기는 바람에 발표 시작이 늦어졌어요.", "What caused the delay?", ["A server problem","A late train","Bad weather","A missing speaker"], 0, "서버에 문제가 생기는 바람에."],
        build: ["Build: Because of a server problem, it was delayed.", ["서버에 문제가 생기는 바람에","지연됐어요"], "서버에 문제가 생기는 바람에 지연됐어요"],
        canDo: ["express an unexpected negative cause","use -는 바람에 appropriately"],
      },
      {
        title: "State a formal purpose", subtitle: "Use -고자 하다 in formal plans and writing.",
        words: [["목적","purpose"],["개선하다","improve"],["분석하다","analyze"]],
        pattern: ["Verb + 고자 하다", "Use -고자 하다 to state an intended purpose in formal writing or speech.", "문제의 원인을 분석하고자 합니다.", [["문제의 원인을","cause of the problem"],["분석하고자 합니다","intend to analyze"]]],
        check: ["Which best fits a formal research purpose?", ["원인을 분석하고자 합니다.","원인을 분석하자고 했어요.","원인을 분석하냐고 했어요.","원인을 분석할 리가 없어요."], 0, "-고자 하다 states formal intention/purpose."],
        listen: ["본 연구에서는 학습 방식에 따른 차이를 확인하고자 합니다.", "What is the purpose?", ["To examine differences by learning method","To cancel a study","To give instructions","To compare prices"], 0, "확인하고자 합니다 states the purpose."],
        build: ["Build: We intend to analyze the cause.", ["원인을","분석하고자 합니다"], "원인을 분석하고자 합니다"],
        canDo: ["state formal purpose","recognize research-style intention"],
      },
    ]),
  },
  {
    id: "unit-15", number: 15, levelId: "advanced", levelLabel: "Advanced", levelRank: 5,
    title: "Precision in discourse",
    subtitle: "Limit claims, extend arguments, and describe complex states precisely.",
    lessons: makeUnitLessons(15, "advanced", [
      {
        title: "No more than / merely", subtitle: "Use -에 불과하다 to limit the strength of a claim.",
        words: [["불과하다","amount to only"],["일부","a part"],["제한적","limited"]],
        pattern: ["Noun + 에 불과하다", "Use -에 불과하다 to emphasize that something is only a limited amount, case, or status.", "이 결과는 초기 관찰에 불과해요.", [["이 결과는","this result"],["초기 관찰에","to an initial observation"],["불과해요","amounts only to"]]],
        check: ["What does -에 불과하다 do?", ["Limits a claim by saying it is merely something","Makes a suggestion","Reports a question","Marks a destination"], 0, "It emphasizes limitation."],
        listen: ["이번 결과는 한 지역의 사례에 불과하므로 전체를 대표한다고 보기 어려워요.", "Why should the result not be generalized?", ["It is only one regional case","It contains too much data","It is too expensive","It is a direct quote"], 0, "한 지역의 사례에 불과하다 limits the claim."],
        build: ["Build: This is only an initial observation.", ["초기 관찰에","불과해요"], "초기 관찰에 불과해요"],
        canDo: ["limit the strength of a claim","avoid overstatement"],
      },
      {
        title: "It does not stop at…", subtitle: "Use -는 데 그치지 않고 to extend an argument.",
        words: [["그치다","stop/end"],["확장하다","expand"],["영향을 미치다","affect"]],
        pattern: ["Verb + 는 데 그치지 않고", "Use -는 데 그치지 않고 to say an effect or action goes beyond one thing.", "이 변화는 비용을 줄이는 데 그치지 않고 접근성도 높였어요.", [["비용을 줄이는 데 그치지 않고","did not stop at reducing cost"],["접근성도","accessibility also"],["높였어요","increased"]]],
        check: ["What does -는 데 그치지 않고 signal?", ["The effect goes beyond the first point","A direct command","A negative inference","A reported question"], 0, "It extends the argument beyond one result."],
        listen: ["이 정책은 교통 문제를 완화하는 데 그치지 않고 지역 경제에도 영향을 미쳤어요.", "What additional effect is mentioned?", ["Impact on the local economy","Higher rainfall","A shorter report","A new language"], 0, "지역 경제에도 영향을 미쳤어요."],
        build: ["Build: It goes beyond saving time and reduces cost too.", ["시간을 아끼는 데 그치지 않고","비용도 줄여요"], "시간을 아끼는 데 그치지 않고 비용도 줄여요"],
        canDo: ["extend an argument","describe broader consequences"],
      },
      {
        title: "While remaining in a state", subtitle: "Use -(으)ㄴ 채로 to describe an unchanged state.",
        words: [["상태","state"],["유지하다","maintain"],["그대로","as it is"]],
        pattern: ["A/V + (으)ㄴ 채로", "Use -(으)ㄴ 채로 when one state remains unchanged while another action occurs.", "문을 연 채로 회의를 진행했어요.", [["문을 연 채로","with the door left open"],["회의를","meeting"],["진행했어요","conducted"]]],
        check: ["Which means “with the door left open”?", ["문을 연 채로","문을 열 리가 없이","문을 열자고","문을 여는 바람에"], 0, "-(으)ㄴ 채로 keeps a state in place."],
        listen: ["문제를 해결하지 않은 채로 다음 단계로 넘어가면 같은 오류가 반복될 수 있어요.", "What warning is given?", ["Moving on without solving the problem may repeat the error","The problem solved itself","The next step is unnecessary","Errors cannot repeat"], 0, "해결하지 않은 채로 means leaving it unresolved."],
        build: ["Build: They moved on without solving the problem.", ["문제를 해결하지 않은 채로","넘어갔어요"], "문제를 해결하지 않은 채로 넘어갔어요"],
        canDo: ["describe an unchanged state","understand -채로"],
      },
      {
        title: "Around / over an issue", subtitle: "Use -을/를 둘러싸고 for disputed topics.",
        words: [["논쟁","debate"],["쟁점","issue"],["입장","position"]],
        pattern: ["Noun + 을/를 둘러싸고", "Use -을/를 둘러싸고 when discussion, conflict, or differing positions center on an issue.", "정책의 효과를 둘러싸고 의견이 엇갈리고 있어요.", [["정책의 효과를 둘러싸고","over the effect of the policy"],["의견이","opinions"],["엇갈리고 있어요","are divided"]]],
        check: ["What kind of context fits -을/를 둘러싸고?", ["Debate or differing positions around an issue","Ordering food","Giving a direct command","Counting people"], 0, "It frames an issue around which views differ."],
        listen: ["개인정보 보호를 둘러싸고 기업과 이용자 사이의 입장 차이가 커지고 있어요.", "What is the disagreement about?", ["Privacy protection","Food prices","Weather","Transport time"], 0, "개인정보 보호를 둘러싸고 frames the disputed issue."],
        build: ["Build: Opinions are divided over the policy.", ["정책을 둘러싸고","의견이 엇갈려요"], "정책을 둘러싸고 의견이 엇갈려요"],
        canDo: ["frame a debated issue","describe competing positions precisely"],
      },
    ]),
  }
];

const lessons = units.flatMap((unit) => unit.lessons);

function studyWord(korean, romanization, meaning, group, sentence, syllables, options = {}) {
  return {
    korean,
    romanization,
    soundCue: options.soundCue || romanization,
    naturalPronunciation: options.naturalPronunciation || null,
    meaning,
    group,
    syllables,
    sentence,
    mistake: options.mistake || "Keep the Korean rhythm even and avoid adding extra English-style vowels.",
    tags: options.tags || [["Natural rhythm","Keep the syllables connected in a Korean rhythm."]],
    contrast: options.contrast || [],
    rules: options.rules || ["Listen to the full word before isolating individual syllables.", "Prefer the Korean audio over English spelling when the two feel different."],
  };
}

function studyGrammar(pattern, spokenChunks, romanization, meaning, rule, usage, examples, options = {}) {
  return {
    pattern,
    spokenChunks,
    romanization,
    meaning,
    rule,
    usage,
    mistake: options.mistake || "Do not translate the form word-for-word; use it for the Korean function shown here.",
    tags: options.tags || ["Core pattern","Everyday Korean"],
    examples,
  };
}

const structuredStudy = {
  vocabulary: [
    {
      korean: "안녕하세요", romanization: "annyeonghaseyo", soundCue: "an-nyeong-ha-se-yo", meaning: "hello", group: "Greetings",
      syllables: [["안","an"],["녕","nyeong"],["하","ha"],["세","se"],["요","yo"]],
      sentence: "안녕하세요. 저는 민지예요.",
      mistake: "Do not separate every syllable too sharply. It should flow as one greeting.",
      tags: [["Connected speech","Keep the syllables linked."],["ㅎ","Use a light h sound."],["녕","ㄴ + ㅕ gives a ny-like start."]],
      contrast: [],
      rules: ["녕 begins with the ny sound ㄴ+ㅕ, not an English nee sound.", "ㅎ in 하 stays light; do not force a heavy h.", "Keep the five syllables connected rather than pronouncing each one separately."]
    },
    {
      korean: "이름", romanization: "ireum", soundCue: "i-reum", meaning: "name", group: "Identity",
      syllables: [["이","i"],["름","reum"]],
      sentence: "제 이름은 수아예요.",
      mistake: "Do not turn ㅡ into oo. Keep the vowel flatter and more central.",
      tags: [["ㅡ","Korean eu vowel."],["받침 ㅁ","Finish cleanly on m."]],
      contrast: [],
      rules: ["ㅡ in 름 is the Korean eu vowel; it is not the English oo sound.", "Final ㅁ is a clean m sound with no extra vowel after it."]
    },
    {
      korean: "학생", romanization: "haksaeng", soundCue: "hak-ssaeng", naturalPronunciation: "학쌩", meaning: "student", group: "Identity",
      syllables: [["학","hak"],["생","ssaeng"]],
      sentence: "저는 학생이에요.",
      mistake: "Do not read it mechanically as hak-saeng. The second syllable becomes tense in natural pronunciation.",
      tags: [["된소리","생 is heard with a tense ㅆ-like onset."],["받침 ㄱ","Close 학 without releasing an extra vowel."]],
      contrast: [["사","ㅅ plain"],["싸","ㅆ tense"]],
      rules: ["In natural pronunciation 학+생 triggers a tense ㅆ-like sound, so 생 is heard closer to ssaeng.", "Final ㄱ in 학 is unreleased; do not add an extra kuh sound.", "ㅐ in 생 is close to the vowel in seh, not a long English ay."]
    },
    {
      korean: "친구", romanization: "chingu", soundCue: "chin-gu", meaning: "friend", group: "Identity",
      syllables: [["친","chin"],["구","gu"]],
      sentence: "민지는 제 친구예요.",
      mistake: "Do not make 구 a heavy English goo. Keep ㄱ light and unaspirated.",
      tags: [["ㅊ","Aspirated consonant."],["ㄱ","Lenis: between a light k and g."]],
      contrast: [["구","ㄱ lenis"],["쿠","ㅋ aspirated"],["꾸","ㄲ tense"]],
      rules: ["ㅊ is aspirated, so 친 starts with a clear puff of air.", "The ㄱ in 구 is between a light k and g; avoid an overly hard English g."]
    },
    {
      korean: "책", romanization: "chaek", soundCue: "chaek", meaning: "book", group: "Objects",
      syllables: [["책","chaek"]],
      sentence: "이것은 책이에요.",
      mistake: "Do not add a final 'uh' after ㄱ. The word stops cleanly.",
      tags: [["ㅊ","Aspirated onset."],["받침 ㄱ","Unreleased final k."]],
      contrast: [["자","ㅈ lenis"],["차","ㅊ aspirated"],["짜","ㅉ tense"]],
      rules: ["ㅊ is aspirated; let a small puff of air out at the start.", "Final ㄱ is a 받침 sound: stop at k without releasing an extra vowel."]
    },
    {
      korean: "가방", romanization: "gabang", soundCue: "ka-bang · soft k/g", meaning: "bag", group: "Objects",
      syllables: [["가","ka/ga"],["방","bang"]],
      sentence: "이것은 제 가방이에요.",
      mistake: "Do not use a strong English G for 가, and do not aspirate it like 카.",
      tags: [["Initial ㄱ","Often heard closer to a soft k at the start of a word."],["Lenis","Less air than ㅋ, less tension than ㄲ."],["받침 ㅇ","Final ng sound."]],
      contrast: [["가","ㄱ lenis"],["카","ㅋ aspirated"],["까","ㄲ tense"]],
      rules: ["Initial ㄱ is a lenis consonant. At the start of a word it often sounds closer to a soft k than a fully voiced English g.", "Do not aspirate ㄱ like ㅋ. It should be softer than the k in key.", "방 begins with ㅂ, which is also a soft lenis consonant.", "Final ㅇ is the ng sound, as in sing."]
    },
    {
      korean: "물", romanization: "mul", soundCue: "mul", meaning: "water", group: "Objects",
      syllables: [["물","mul"]],
      sentence: "물을 마셔요.",
      mistake: "Do not add a vowel after the final ㄹ. Finish directly on the l-like sound.",
      tags: [["ㅜ","Short Korean u vowel."],["받침 ㄹ","Final l-like tongue position."]],
      contrast: [],
      rules: ["ㅜ is the Korean u vowel, similar to oo but shorter and cleaner.", "Final ㄹ is a 받침 l-like sound; end with the tongue touching behind the upper teeth."]
    },
    {
      korean: "커피", romanization: "keopi", soundCue: "keo-pi", meaning: "coffee", group: "Objects",
      syllables: [["커","keo"],["피","pi"]],
      sentence: "저는 커피를 좋아해요.",
      mistake: "Do not read 커 as ko. The vowel is ㅓ, not ㅗ.",
      tags: [["ㅋ","Aspirated k."],["ㅓ","eo vowel."],["ㅍ","Aspirated p."]],
      contrast: [["거","ㄱ lenis"],["커","ㅋ aspirated"],["꺼","ㄲ tense"]],
      rules: ["ㅋ is aspirated, so 커 starts with a stronger puff than ㄱ.", "ㅓ in 커 is eo; avoid turning it into a pure English oh.", "ㅍ in 피 is also aspirated."]
    },
    {
      korean: "학교", romanization: "hakgyo", soundCue: "hak-kkyo", naturalPronunciation: "학꾜", meaning: "school", group: "Places",
      syllables: [["학","hak"],["교","kkyo"]],
      sentence: "저는 학교에 가요.",
      mistake: "Do not read it as hak-gyo with a loose ㄱ. The second onset is noticeably tense.",
      tags: [["된소리","교 becomes tense after 학."],["받침 ㄱ","학 closes on an unreleased k."],["ㅛ","Keep the y glide."]],
      contrast: [["교","ㄱ form"],["쿄","ㅋ aspirated"],["꾜","ㄲ tense"]],
      rules: ["학교 is commonly pronounced with a tense ㄲ sound in 교, so it sounds closer to hak-kkyo.", "The 받침 ㄱ in 학 closes the first syllable without an extra vowel.", "교 contains ㅛ, so keep the y glide before o."]
    },
    {
      korean: "집", romanization: "jip", soundCue: "jip", meaning: "home", group: "Places",
      syllables: [["집","jip"]],
      sentence: "저녁에 집에 가요.",
      mistake: "Do not release the final ㅂ as buh. Close the lips and stop.",
      tags: [["ㅈ","Lenis j/ch-like onset."],["받침 ㅂ","Unreleased final p."]],
      contrast: [["자","ㅈ lenis"],["차","ㅊ aspirated"],["짜","ㅉ tense"]],
      rules: ["ㅈ at the start is an unaspirated j/ch-like sound, softer than ㅊ.", "Final ㅂ is unreleased in 받침 position; finish with the lips closed rather than adding buh."]
    },
    {
      korean: "도서관", romanization: "doseogwan", soundCue: "do-seo-gwan", meaning: "library", group: "Places",
      syllables: [["도","do/to"],["서","seo"],["관","gwan/kwan"]],
      sentence: "오후에 도서관에 가요.",
      mistake: "Do not force English d and g. Initial ㄷ and ㄱ are softer lenis sounds.",
      tags: [["Initial ㄷ","Between a light t and d."],["ㄱ","Lenis k/g."],["ㅘ","Pronounce as one wa glide."]],
      contrast: [["가","ㄱ lenis"],["카","ㅋ aspirated"],["까","ㄲ tense"]],
      rules: ["Initial ㄷ is lenis and can sound between English d and t.", "ㄱ in 관 is also lenis; keep it softer than aspirated ㅋ.", "관 combines ㄱ+ㅘ, producing a gwa-like syllable rather than gu-a."]
    },
    {
      korean: "카페", romanization: "kape", soundCue: "ka-pe", meaning: "cafe", group: "Places",
      syllables: [["카","ka"],["페","pe"]],
      sentence: "친구와 카페에 가요.",
      mistake: "Do not soften 카 into 가. ㅋ should have a clear puff of air.",
      tags: [["ㅋ","Strong aspiration."],["ㅍ","Strong aspiration."]],
      contrast: [["가","ㄱ lenis"],["카","ㅋ aspirated"],["까","ㄲ tense"]],
      rules: ["ㅋ is strongly aspirated compared with ㄱ.", "ㅍ in 페 is aspirated too, with a clear puff of air.", "Keep both syllables short and even rather than stressing one heavily."]
    },
  ],
  grammar: [
    {
      pattern: "Noun + 이에요 / 예요",
      spokenChunks: ["이에요", "예요"],
      romanization: "ieyo / yeyo",
      meaning: "to be / am / is / are",
      rule: "Use 이에요 after a consonant and 예요 after a vowel.",
      usage: "Use this polite pattern to identify or describe someone or something.",
      mistake: "Do not choose the form randomly: 학생 → 학생이에요, 친구 → 친구예요.",
      tags: ["Polite speech","Copula","Consonant vs vowel"],
      examples: ["저는 학생이에요.", "민지는 친구예요."],
    },
    {
      pattern: "이것 / 그것 / 저것",
      spokenChunks: ["이것", "그것", "저것"],
      romanization: "igeot / geugeot / jeogeot",
      meaning: "this / that / that over there",
      rule: "Choose the demonstrative based on distance and shared context.",
      usage: "이것 is near the speaker, 그것 is near the listener or already known, and 저것 is farther from both.",
      mistake: "Do not translate all three as the same English 'that' when deciding which Korean form to use.",
      tags: ["Demonstratives","Distance","Context"],
      examples: ["이것은 책이에요.", "그것은 커피예요.", "저것은 가방이에요."],
    },
    {
      pattern: "Place + 에 가요",
      spokenChunks: ["에 가요"],
      romanization: "e gayo",
      meaning: "go to a place",
      rule: "Put 에 after the destination, then use 가요.",
      usage: "Use 에 to mark the destination of movement with verbs such as 가요.",
      mistake: "Do not use 이에요/예요 when you mean movement. 학교예요 = 'it is a school'; 학교에 가요 = 'go to school.'",
      tags: ["Destination","Particle 에","Movement"],
      examples: ["학교에 가요.", "저는 도서관에 가요."],
    },
  ],
  test: [
    { prompt: "What does 학생 mean?", options: ["student","teacher","friend","school"], answer: 0, explanation: "학생 means student." },
    { prompt: "Which word means library?", options: ["카페","집","도서관","학교"], answer: 2, explanation: "도서관 means library." },
    { prompt: "Choose the correct form: 저는 학생___", options: ["예요","이에요","에 가요","저것"], answer: 1, explanation: "학생 ends in a consonant, so 이에요 is used." },
    { prompt: "Which sentence means “This is a book”?", options: ["그것은 책이에요.","이것은 책이에요.","저는 책이에요.","책에 가요."], answer: 1, explanation: "이것 is “this,” and 책이에요 means “is a book.”" },
    { prompt: "Which sentence means “I go to the library”?", options: ["저는 도서관이에요.","저는 도서관에 가요.","이것은 도서관이에요.","저는 학교예요."], answer: 1, explanation: "도서관에 가요 marks the library as the destination." },
    { prompt: "What does 커피 mean?", options: ["water","coffee","bag","book"], answer: 1, explanation: "커피 means coffee." },
  ],
};

const elementaryStudy = {
  id: "elementary",
  label: "Elementary",
  vocabulary: [
    studyWord("얼마예요", "eolmayeyo", "how much is it?", "Shopping", "이거 얼마예요?", [["얼","eol"],["마","ma"],["예","ye"],["요","yo"]], {
      mistake: "Do not read 얼마 as 'ol-ma'. The first vowel is ㅓ (eo).",
      tags: [["ㅓ","eo vowel"],["Question","Use rising question intonation lightly."]],
      rules: ["얼마 asks an amount or price.", "예요 remains smooth; avoid over-separating 예-요."],
    }),
    studyWord("있어요", "isseoyo", "there is / have", "Availability", "검은색 있어요?", [["있","it"],["어","eo"],["요","yo"]], {
      soundCue: "i-sseo-yo",
      naturalPronunciation: "이써요",
      mistake: "있어요 is not pronounced as three English-looking chunks. The ㅆ sound carries into the next syllable.",
      tags: [["연음","Final ㅆ links into 어."],["ㅆ","Tense s sound."]],
      contrast: [["사","ㅅ plain"],["싸","ㅆ tense"]],
      rules: ["있어요 is naturally heard close to 이써요.", "Use it for existence, presence, or availability."],
    }),
    studyWord("없어요", "eopseoyo", "there is not / do not have", "Availability", "파란색은 없어요.", [["없","eop"],["어","seo"],["요","yo"]], {
      soundCue: "eop-sseo-yo",
      naturalPronunciation: "업써요",
      mistake: "Do not pronounce every written consonant separately.",
      tags: [["받침 cluster","The written ㅄ simplifies in pronunciation."],["ㅆ-like onset","The following sound becomes strong."]],
      rules: ["없어요 is commonly heard close to 업써요.", "Use it as the negative counterpart of 있어요."],
    }),
    studyWord("사이즈", "saijeu", "size", "Shopping", "큰 사이즈 있어요?", [["사","sa"],["이","i"],["즈","jeu"]]),
    studyWord("왼쪽", "oenjjok", "left side", "Directions", "왼쪽으로 가세요.", [["왼","oen"],["쪽","jjok"]], {
      soundCue: "wen-jjok",
      tags: [["ㅉ","Tense jj sound."],["Direction","Often followed by 으로."]],
      rules: ["쪽 begins with tense ㅉ.", "왼쪽으로 means toward/to the left."],
    }),
    studyWord("오른쪽", "oreunjjok", "right side", "Directions", "오른쪽으로 가세요.", [["오","o"],["른","reun"],["쪽","jjok"]], {
      tags: [["ㅉ","Tense jj sound."],["ㅡ","Central eu vowel."]],
      rules: ["Keep 른 compact rather than adding an English vowel.", "쪽 uses tense ㅉ."],
    }),
    studyWord("어제", "eoje", "yesterday", "Time", "어제 친구를 만났어요.", [["어","eo"],["제","je"]]),
    studyWord("내일", "naeil", "tomorrow", "Time", "내일 공부할 거예요.", [["내","nae"],["일","il"]]),
    studyWord("갔어요", "gasseoyo", "went", "Past tense", "어제 카페에 갔어요.", [["갔","gat"],["어","sseo"],["요","yo"]], {
      soundCue: "ga-sseo-yo",
      naturalPronunciation: "가써요",
      tags: [["Past tense","가다 → 갔어요"],["ㅆ","Past marker is heard strongly."]],
      rules: ["가다 becomes 갔어요 in polite past tense.", "The past ㅆ links into 어 and is heard clearly."],
    }),
    studyWord("갈 거예요", "gal geoyeyo", "will go / am going to go", "Plans", "내일 학교에 갈 거예요.", [["갈","gal"],["거","geo"],["예","ye"],["요","yo"]], {
      naturalPronunciation: "갈 꺼예요",
      tags: [["Future plan","-(으)ㄹ 거예요"],["Spacing","Treat 갈 거예요 as one grammatical chunk."]],
      rules: ["Use -(으)ㄹ 거예요 for a future plan or likely action.", "Keep 거예요 connected in speech."],
    }),
  ],
  grammar: [
    studyGrammar("Noun + 있어요 / 없어요", ["있어요","없어요"], "isseoyo / eopseoyo", "there is / have · there is not / do not have",
      "Use 있어요 for existence/availability and 없어요 for absence/unavailability.",
      "Useful for shopping, locations, possessions, and asking whether something is available.",
      ["검은색 있어요?", "큰 사이즈는 없어요."],
      { tags:["Existence","Availability","Everyday speech"], mistake:"Do not use 이에요/예요 when you mean that something exists or is available." }),
    studyGrammar("Verb + 았/었어요", ["갔어요","먹었어요"], "at/eosseoyo", "polite past tense",
      "Attach -았/었어요 according to the verb stem; many common forms contract.",
      "Use it to describe completed past actions and experiences.",
      ["어제 카페에 갔어요.", "비빔밥을 먹었어요."],
      { tags:["Past tense","Completed action"], mistake:"Do not mix present 가요 with past-time words when you mean a completed action: 어제 갔어요." }),
    studyGrammar("Verb + (으)ㄹ 거예요", ["갈 거예요","할 거예요"], "(eu)l geoyeyo", "will / be going to",
      "Use -(으)ㄹ 거예요 after a verb stem to express a plan or likely future action.",
      "Useful for tomorrow, weekends, appointments, and personal plans.",
      ["내일 공부할 거예요.", "주말에 친구를 만날 거예요."],
      { tags:["Future","Plans","Prediction"], mistake:"Do not use the past form -았/었어요 for a future plan." }),
    studyGrammar("Verb + (으)ㄹ까요?", ["갈까요","만날까요"], "(eu)lkkayo", "shall we? / should we?",
      "Use -(으)ㄹ까요? to suggest doing something together or ask what would be good.",
      "Use it naturally when arranging meetings or proposing an activity.",
      ["역 앞에서 만날까요?", "같이 갈까요?"],
      { tags:["Suggestion","Conversation"], mistake:"Do not confuse 갈까요? (shall we go?) with 갈 거예요 (will go)." }),
  ],
  test: [
    { prompt:"Which phrase asks the price?", options:["얼마예요?","어디예요?","몇 시예요?","뭐예요?"], answer:0, explanation:"얼마예요? asks how much something costs." },
    { prompt:"Which means “Do you have this?”", options:["이거 있어요?","이거 갔어요?","이거 먹어요?","이거 만날까요?"], answer:0, explanation:"있어요? asks whether something exists or is available." },
    { prompt:"Which is the polite past form of 가다?", options:["가요","갔어요","갈 거예요","갈까요?"], answer:1, explanation:"갔어요 means went." },
    { prompt:"Which means “I will study tomorrow”?", options:["내일 공부했어요.","내일 공부할 거예요.","어제 공부해요.","공부할까요?"], answer:1, explanation:"-(으)ㄹ 거예요 expresses a future plan." },
    { prompt:"Which means “Please go left”?", options:["왼쪽으로 가세요.","오른쪽으로 가세요.","왼쪽이 없어요.","왼쪽을 샀어요."], answer:0, explanation:"왼쪽으로 가세요 gives the direction to the left." },
    { prompt:"Which is a suggestion to meet?", options:["만났어요.","만나요.","만날까요?","만날 거예요."], answer:2, explanation:"만날까요? means shall we meet?" },
    { prompt:"What does 내일 mean?", options:["yesterday","today","tomorrow","weekend"], answer:2, explanation:"내일 means tomorrow." },
  ],
};

const lowerIntermediateStudy = {
  id: "lower-intermediate",
  label: "Lower Intermediate",
  vocabulary: [
    studyWord("이유", "iyu", "reason", "Reasoning", "이유가 뭐예요?", [["이","i"],["유","yu"]]),
    studyWord("생각해요", "saenggakaeyo", "think", "Opinions", "저는 중요하다고 생각해요.", [["생","saeng"],["각","gak"],["해","hae"],["요","yo"]], {
      soundCue:"saeng-ga-kae-yo",
      naturalPronunciation:"생가캐요",
      tags:[["연음","각 + 해 links smoothly."],["Opinion","Often used with -다고."]],
      rules:["생각해요 means think.", "In connected speech 각해 links rather than stopping between every syllable."],
    }),
    studyWord("중요해요", "jungyohaeyo", "important", "Opinions", "연습이 중요해요.", [["중","jung"],["요","yo"],["해","hae"],["요","yo"]]),
    studyWord("하지만", "hajiman", "but / however", "Connection", "어렵지만 재미있어요.", [["하","ha"],["지","ji"],["만","man"]]),
    studyWord("더", "deo", "more", "Comparison", "지하철이 더 편해요.", [["더","deo"]]),
    studyWord("제일", "jeil", "the most", "Comparison", "이 방법이 제일 편해요.", [["제","je"],["일","il"]]),
    studyWord("대신", "daesin", "instead", "Choice", "버스 대신 지하철을 타요.", [["대","dae"],["신","sin"]]),
    studyWord("사실", "sasil", "actually / fact", "Conversation", "사실 요즘 많이 바빠요.", [["사","sa"],["실","sil"]]),
    studyWord("다시", "dasi", "again", "Conversation repair", "다시 말해 주세요.", [["다","da"],["시","si"]]),
    studyWord("계속", "gyesok", "continuously / keep", "Conversation", "계속 공부하고 있어요.", [["계","gye"],["속","sok"]]),
  ],
  grammar: [
    studyGrammar("A/V + 아서/어서", ["피곤해서","비가 와서"], "aseo / eoseo", "because / so; then",
      "Use -아서/어서 to connect a reason or a natural sequence.",
      "Use it when one situation naturally explains or leads into the next.",
      ["피곤해서 집에서 쉬어요.", "비가 와서 집에 있어요."],
      { tags:["Reason","Clause connection"], mistake:"Do not force because into every translation; -아서/어서 can also connect a natural sequence." }),
    studyGrammar("-다고 생각해요", ["중요하다고 생각해요"], "dago saenggakaeyo", "I think that…",
      "Quote a statement with -다고 and follow it with 생각해요.",
      "Use it to state an opinion more explicitly than a bare adjective or statement.",
      ["연습이 중요하다고 생각해요.", "이 방법이 좋다고 생각해요."],
      { tags:["Opinion","Reported thought"], mistake:"Keep the statement before -다고 complete; do not attach 생각해요 directly to an English-style fragment." }),
    studyGrammar("A/V + 지만", ["어렵지만","좋지만"], "jiman", "but / although",
      "Attach -지만 to the first clause to contrast it with the next.",
      "Useful for balanced opinions and explaining pros/cons.",
      ["어렵지만 재미있어요.", "비싸지만 편해요."],
      { tags:["Contrast","Connected speech"] }),
    studyGrammar("A보다 B가 더…", ["보다","더"], "boda / deo", "B is more … than A",
      "Put 보다 after the comparison reference and 더 before the stronger quality.",
      "Use it for preferences, transport, products, methods, and experiences.",
      ["커피보다 차가 더 좋아요.", "버스보다 지하철이 더 편해요."],
      { tags:["Comparison","Preference"], mistake:"The item before 보다 is the reference; the item with 더 is the one that has more of the quality." }),
    studyGrammar("A/V + (으)면", ["있으면","안 오면"], "(eu)myeon", "if / when",
      "Attach -(으)면 to set a condition.",
      "Use it for possible plans, advice, and situations that depend on something.",
      ["시간이 있으면 같이 가요.", "비가 안 오면 공원에 갈 거예요."],
      { tags:["Condition","Plans"] }),
    studyGrammar("A/V + 는데요 / (으)ㄴ데요", ["공부하고 있는데요"], "neundeyo", "background / soft contrast / lead-in",
      "Use -는데요 to provide background or gently set up what comes next.",
      "Common in connected conversation before a question, request, contrast, or added detail.",
      ["요즘 한국어를 공부하고 있는데요.", "조금 비싼데요."],
      { tags:["Conversation","Background","Nuance"], mistake:"Do not translate -는데요 as one fixed English word; its job depends on conversational context." }),
  ],
  test: [
    { prompt:"Which means “I rest because I am tired”?", options:["피곤해서 쉬어요.","피곤하지만 쉬어요.","피곤하면 쉬었어요.","피곤할까요?"], answer:0, explanation:"-아서/어서 can connect a reason." },
    { prompt:"Which explicitly means “I think it is important”?", options:["중요해서 가요.","중요하다고 생각해요.","중요하지만 가요.","중요했어요."], answer:1, explanation:"-다고 생각해요 expresses an opinion." },
    { prompt:"Which means “It is difficult but fun”?", options:["어렵지만 재미있어요.","어려워서 재미있어요.","어려우면 재미있어요.","어려웠어요."], answer:0, explanation:"-지만 expresses contrast." },
    { prompt:"Which means “The subway is more convenient than the bus”?", options:["지하철보다 버스가 더 편해요.","버스보다 지하철이 더 편해요.","버스 대신 편해요.","지하철이 제일 버스예요."], answer:1, explanation:"버스 is the reference before 보다; 지하철 is more convenient." },
    { prompt:"Which means “If you have time”?", options:["시간이 있어서","시간이 있으면","시간이 있지만","시간이 있었어요"], answer:1, explanation:"-(으)면 marks a condition." },
    { prompt:"Which phrase politely asks for repetition?", options:["다시 말해 주세요.","계속 갔어요.","사실이에요.","이유가 더예요."], answer:0, explanation:"다시 말해 주세요 means please say it again." },
    { prompt:"What does 대신 mean?", options:["instead","because","although","most"], answer:0, explanation:"대신 means instead/in place of." },
    { prompt:"What is a common role of -는데요?", options:["Give background or soften a lead-in","Count objects","Mark only past tense","Ask a price"], answer:0, explanation:"-는데요 often provides conversational background." },
  ],
};

const intermediateStudy = {
  id: "intermediate",
  label: "Intermediate",
  vocabulary: [
    studyWord("계기","gyegi","turning point / trigger","Change","그 경험이 큰 계기가 되었어요.",[["계","gye"],["기","gi"]]),
    studyWord("결과","gyeolgwa","result","Reasoning","결과를 근거와 함께 설명해요.",[["결","gyeol"],["과","gwa"]]),
    studyWord("영향","yeonghyang","influence / effect","Reasoning","정책이 생활에 영향을 미쳤어요.",[["영","yeong"],["향","hyang"]]),
    studyWord("근거","geungeo","evidence / basis","Evidence","주장을 뒷받침할 근거가 필요해요.",[["근","geun"],["거","geo"]]),
    studyWord("관점","gwanjeom","viewpoint","Opinion","다른 관점에서 생각해 봐요.",[["관","gwan"],["점","jeom"]]),
    studyWord("조사","josa","survey / investigation","Evidence","최근 조사에 따르면 사용량이 늘었어요.",[["조","jo"],["사","sa"]]),
    studyWord("경향","gyeonghyang","tendency","Analysis","익숙한 선택을 하는 경향이 있어요.",[["경","gyeong"],["향","hyang"]]),
    studyWord("한계","hangye","limitation","Evaluation","이 방법에도 분명한 한계가 있어요.",[["한","han"],["계","gye"]]),
    studyWord("요청","yocheong","request","Reported speech","담당자가 자료를 보내 달라고 요청했어요.",[["요","yo"],["청","cheong"]]),
    studyWord("합의","habui","agreement / consensus","Discussion","논의 끝에 합의에 도달했어요.",[["합","hap"],["의","ui"]]),
  ],
  grammar: [
    studyGrammar("Verb + 게 되다",["하게 되었어요"],"ge doeda","come to / end up",
      "Use -게 되다 to present a resulting change or situation.","Useful for life changes, outcomes, and developments.",["한국에서 일하게 되었어요.","한국어를 공부하게 되었어요."],{tags:["Change","Outcome"]}),
    studyGrammar("A/V + 기 때문에",["부족하기 때문에"],"gi ttaemune","because",
      "Use -기 때문에 for an explicit reason or cause.","Useful in explanations and structured reasoning.",["시간이 부족하기 때문에 먼저 결정해야 해요.","자료가 충분하지 않기 때문에 결론을 내리기 어려워요."],{tags:["Cause","Reason"]}),
    studyGrammar("Statement + 다고 하다",["바뀌었다고 했어요"],"dago hada","say that…",
      "Use -다고 하다 to report a statement.","Use it when conveying someone else's statement indirectly.",["일정이 바뀌었다고 했어요.","효과가 있다고 설명했어요."],{tags:["Reported speech","Statement"]}),
    studyGrammar("Question + 냐고 하다",["언제냐고 물었어요"],"nyago hada","ask whether/what…",
      "Use -냐고 하다 to report a question.","Use it for indirect questions.",["언제 시작하냐고 물었어요.","가능하냐고 확인했어요."],{tags:["Reported speech","Question"]}),
    studyGrammar("A/V + (으)ㄴ/는 반면에",["편리한 반면에"],"(eu)n/neun banmyeone","whereas / on the other hand",
      "Use 반면에 for a structured contrast.","Useful in comparisons, essays, and balanced evaluations.",["편리한 반면에 비용이 높아요.","기회가 많은 반면에 경쟁도 치열해요."],{tags:["Contrast","Writing"]}),
    studyGrammar("Noun + 에 따르면",["조사에 따르면"],"e ttareumyeon","according to",
      "Use -에 따르면 to identify the source of information.","Useful for evidence-based statements.",["조사에 따르면 이용자가 늘었어요.","보고서에 따르면 차이가 크지 않아요."],{tags:["Evidence","Source"]}),
  ],
  test: [
    {prompt:"Which expresses a change that came to happen?",options:["-게 되다","-자고 하다","-냐고 하다","-에 따르면"],answer:0,explanation:"-게 되다 presents a resulting change."},
    {prompt:"Which gives an explicit reason?",options:["-기 때문에","-는 반면에","-게 되다","-다고 하다"],answer:0,explanation:"-기 때문에 gives a reason."},
    {prompt:"Which reports a statement?",options:["-다고 하다","-냐고 하다","-(으)라고 하다","-자고 하다"],answer:0,explanation:"-다고 하다 reports a statement."},
    {prompt:"Which reports a question?",options:["-냐고 하다","-다고 하다","-자고 하다","-게 되다"],answer:0,explanation:"-냐고 하다 reports a question."},
    {prompt:"Which means “according to the survey”?",options:["조사에 따르면","조사인 반면에","조사하기 때문에","조사하게 되면"],answer:0,explanation:"조사에 따르면 identifies the survey as the source."},
    {prompt:"Which form sets up a formal contrast?",options:["-(으)ㄴ/는 반면에","-게 되다","-냐고 하다","-고자 하다"],answer:0,explanation:"반면에 contrasts two sides."},
    {prompt:"What does 경향 mean?",options:["tendency","instruction","price","location"],answer:0,explanation:"경향 means tendency."},
    {prompt:"What does 근거 mean?",options:["evidence/basis","agreement","delay","command"],answer:0,explanation:"근거 means evidence or basis."},
  ],
};

const advancedStudy = {
  id: "advanced",
  label: "Advanced",
  vocabulary: [
    studyWord("해석","haeseok","interpretation","Stance","결과에 대한 해석이 달라질 수 있어요.",[["해","hae"],["석","seok"]]),
    studyWord("추정","chujeong","estimation / inference","Stance","현재 자료만으로는 추정에 불과해요.",[["추","chu"],["정","jeong"]]),
    studyWord("타당하다","tadanghada","be valid / reasonable","Argument","그 결론이 타당한지 검토해야 해요.",[["타","ta"],["당","dang"],["하","ha"],["다","da"]]),
    studyWord("쟁점","jaengjeom","issue / point of dispute","Debate","핵심 쟁점을 먼저 정리해요.",[["쟁","jaeng"],["점","jeom"]]),
    studyWord("불과하다","bulgwahada","amount to only","Precision","초기 관찰에 불과해요.",[["불","bul"],["과","gwa"],["하","ha"],["다","da"]]),
    studyWord("제한적","jehanjeok","limited","Precision","자료가 아직 제한적이에요.",[["제","je"],["한","han"],["적","jeok"]]),
    studyWord("지연","jiyeon","delay","Cause","서버 문제로 발표가 지연됐어요.",[["지","ji"],["연","yeon"]]),
    studyWord("목적","mokjeok","purpose","Formal writing","연구 목적을 분명히 밝혀요.",[["목","mok"],["적","jeok"]]),
    studyWord("입장","ipjang","position / stance","Debate","두 집단의 입장이 달라요.",[["입","ip"],["장","jang"]]),
    studyWord("일반화하다","ilhwanhwahada","generalize","Reasoning","한 사례를 전체로 일반화하면 안 돼요.",[["일","il"],["반","ban"],["화","hwa"],["하","ha"],["다","da"]]),
  ],
  grammar: [
    studyGrammar("A/V + (으)ㄴ/는 셈이다",["공부한 셈이에요"],"(eu)n/neun semida","amount to / effectively mean",
      "Use -는 셈이다 to interpret what the facts amount to.","Useful for inference from quantities or circumstances.",["첫 달은 무료인 셈이에요.","일주일에 열네 시간을 공부한 셈이에요."],{tags:["Inference","Interpretation"]}),
    studyGrammar("A/V + (으)ㄹ 리가 없다",["우연일 리가 없어요"],"(eu)l riga eopda","there is no way",
      "Use -(으)ㄹ 리가 없다 for strong negative inference.","Use only when the evidence makes a possibility unreasonable.",["그 사람이 잊었을 리가 없어요.","우연일 리가 없어요."],{tags:["Inference","Stance"]}),
    studyGrammar("A/V + (으)ㄴ/는 듯하다",["나아진 듯해요"],"(eu)n/neun deuthada","seem / appear",
      "Use -듯하다 to make an observation or inference cautiously.","Useful when evidence is suggestive but not conclusive.",["상황이 나아진 듯해요.","결과에 만족한 듯해요."],{tags:["Caution","Inference"]}),
    studyGrammar("A/V + (으)므로",["제한적이므로"],"(eu)meuro","because / since (formal)",
      "Use -(으)므로 for formal written reasoning.","Useful in reports, arguments, and recommendations.",["자료가 제한적이므로 주의가 필요합니다.","표본이 작으므로 일반화하기 어렵습니다."],{tags:["Formal","Reason"]}),
    studyGrammar("Verb + 고자 하다",["분석하고자 합니다"],"goja hada","intend to / aim to",
      "Use -고자 하다 to state formal purpose or intention.","Common in formal presentations and academic-style writing.",["원인을 분석하고자 합니다.","차이를 확인하고자 합니다."],{tags:["Formal","Purpose"]}),
    studyGrammar("Noun + 에 불과하다",["관찰에 불과해요"],"e bulgwahada","be merely / no more than",
      "Use -에 불과하다 to limit the strength or scope of a claim.","Useful for cautious argumentation.",["초기 관찰에 불과해요.","한 지역의 사례에 불과합니다."],{tags:["Precision","Limitation"]}),
  ],
  test: [
    {prompt:"Which structure interprets what a situation effectively amounts to?",options:["-(으)ㄴ/는 셈이다","-(으)라고 하다","-에 따르면","-는 바람에"],answer:0,explanation:"-는 셈이다 draws an interpretive conclusion."},
    {prompt:"Which means “there is no way…”?",options:["-(으)ㄹ 리가 없다","-는 경향이 있다","-게 되다","-고자 하다"],answer:0,explanation:"-(으)ㄹ 리가 없다 expresses strong negative inference."},
    {prompt:"Which form makes an inference cautious?",options:["-(으)ㄴ/는 듯하다","-는 바람에","-에 불과하다","-자고 하다"],answer:0,explanation:"-듯하다 softens an inference."},
    {prompt:"Which form is appropriate for a formal reason?",options:["-(으)므로","-냐고 하다","-게 되다","-자고 하다"],answer:0,explanation:"-(으)므로 is common in formal reasoning."},
    {prompt:"Which form states a formal purpose?",options:["-고자 하다","-는 반면에","-다고 하다","-게 되다"],answer:0,explanation:"-고자 하다 states formal intention."},
    {prompt:"Which means “merely an initial observation”?",options:["초기 관찰에 불과해요.","초기 관찰일 리가 없어요.","초기 관찰하고자 해요.","초기 관찰에 따르면"],answer:0,explanation:"-에 불과하다 limits the claim."},
    {prompt:"What does 쟁점 mean?",options:["issue / point of dispute","price","greeting","destination"],answer:0,explanation:"쟁점 is an issue under debate."},
    {prompt:"What does 타당하다 mean?",options:["be valid/reasonable","be cheap","be late","be silent"],answer:0,explanation:"타당하다 means to be valid or reasonable."},
  ],
};

const levelStudyPacks = {
  new: { ...structuredStudy, id: "foundation", label: "Foundation" },
  foundation: { ...structuredStudy, id: "foundation", label: "Foundation" },
  elementary: elementaryStudy,
  "lower-intermediate": lowerIntermediateStudy,
  intermediate: intermediateStudy,
  advanced: advancedStudy,
};

const learnerLevels = [
  { id: "new", rank: 0, label: "New to Korean", short: "Starter", topik: "Pre-TOPIK", description: "I am just starting, or I only know a few Korean words.", canDo: "Build Hangul confidence, greetings, identity, and the first everyday patterns." },
  { id: "foundation", rank: 1, label: "Foundation", short: "Foundation", topik: "TOPIK 1 range", description: "I can read Hangul and understand some basic phrases and sentences.", canDo: "Strengthen core vocabulary, particles, sentence patterns, and survival Korean." },
  { id: "elementary", rank: 2, label: "Elementary", short: "Elementary", topik: "TOPIK 2 range", description: "I can handle familiar everyday topics but still need support forming sentences.", canDo: "Connect sentences, understand common daily situations, and build reliable listening." },
  { id: "lower-intermediate", rank: 3, label: "Lower Intermediate", short: "Lower Int.", topik: "TOPIK 3 range", description: "I can follow everyday Korean and express simple opinions or explanations.", canDo: "Handle connected conversations, reasons, comparisons, and broader reading/listening." },
  { id: "intermediate", rank: 4, label: "Intermediate", short: "Intermediate", topik: "TOPIK 4 range", description: "I can communicate comfortably on many familiar topics and understand longer Korean.", canDo: "Refine nuance, longer discourse, academic-style vocabulary, and TOPIK II skills." },
  { id: "advanced", rank: 5, label: "Advanced", short: "Advanced", topik: "TOPIK 5–6 range", description: "I can understand complex Korean and want high-level accuracy and fluency.", canDo: "Develop advanced comprehension, precision, natural expression, and exam-level control." },
];

const learnerProfileKey = "hallim:learner-profile:v1";
const studyResultsKey = "hallim:study-results:v1";
const aiAuditKey = "hallim:ai-audit:v1";
const intelligenceStateKey = "hallim:intelligence:v1";
const referralKey = "hallim:referral:v1";

function readLearnerProfile() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(learnerProfileKey) || "null"); } catch { return null; }
}

function levelById(id) {
  return learnerLevels.find((level) => level.id === id) || learnerLevels[0];
}

function readStudyResults() {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(studyResultsKey) || "[]"); } catch { return []; }
}

function readAiAudit() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(aiAuditKey) || "null"); } catch { return null; }
}

function readIntelligenceState() {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(intelligenceStateKey) || "{}"); } catch { return {}; }
}

function readReferralCode() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(referralKey) || "";
}

const lessonKey = "hallim:vercel:lessons:v2";
const reviewKey = "hallim:vercel:review:v1";

function lessonBase(number, title, subtitle, canDo, steps, type = "lesson", meta = {}) {
  const unitNumber = meta.unitNumber || 1;
  return {
    id: meta.id || ("unit-" + unitNumber + "-lesson-" + number),
    number,
    unitNumber,
    unitId: "unit-" + unitNumber,
    levelId: meta.levelId || "new",
    title,
    subtitle,
    canDo,
    steps,
    type,
  };
}

function makeUnitLessons(unitNumber, levelId, specs) {
  const lessonRows = specs.map((spec, index) => {
    const n = index + 1;
    const steps = [
      ...spec.words.map(([ko,en,note]) => word(ko,en,note || "")),
      explain(spec.pattern[0], spec.pattern[1], spec.pattern[2], spec.pattern[3] || []),
      choice(spec.check[0], spec.check[1], spec.check[2], spec.check[3]),
      listening(spec.listen[0], spec.listen[1], spec.listen[2], spec.listen[3], spec.listen[4]),
      shadowing(spec.listen[0], "Listen, copy the rhythm, then say the whole line aloud."),
      build(spec.build[0], spec.build[1], spec.build[2]),
      finish(spec.canDo),
    ];
    return lessonBase(n, spec.title, spec.subtitle, spec.canDo, steps, "lesson", {
      unitNumber, levelId, id: "unit-" + unitNumber + "-lesson-" + n,
    });
  });

  const checkpointNumber = specs.length + 1;
  const checkpointSteps = [
    ...specs.slice(0, 3).map((spec, index) =>
      choice(
        "Checkpoint · " + spec.check[0],
        spec.check[1],
        spec.check[2],
        spec.check[3],
        "Checkpoint"
      )
    ),
    dictation(specs[0].pattern[2], "Type the Korean sentence you hear."),
    dictation(specs[1].pattern[2], "Listen for the grammar form and type the full Korean sentence."),
    reading(
      specs.map((spec) => spec.pattern[2]).join("\n"),
      "Which statement best describes this unit?",
      [
        "It combines the key patterns from the unit.",
        "It only teaches isolated alphabet sounds.",
        "It contains no Korean grammar.",
        "It is only a pronunciation drill.",
      ],
      0,
      "The checkpoint combines the unit's key patterns in context."
    ),
    finish([
      ...new Set(specs.flatMap((spec) => spec.canDo)),
      "complete Unit " + unitNumber,
    ].slice(0, 5)),
  ];

  lessonRows.push(
    lessonBase(
      checkpointNumber,
      "Unit " + unitNumber + " checkpoint",
      "Prove that the unit's language works together in context.",
      ["complete Unit " + unitNumber],
      checkpointSteps,
      "checkpoint",
      { unitNumber, levelId, id: "unit-" + unitNumber + "-checkpoint" }
    )
  );

  return lessonRows;
}
function word(korean, meaning, note = "") {
  return { kind: "word", korean, meaning, note };
}
function explain(title, body, korean, breakdown = []) {
  return { kind: "explain", title, body, korean, breakdown };
}
function choice(prompt, options, answer, explanation, label = "Try") {
  return { kind: "choice", label, prompt, options, answer, explanation };
}
function listening(transcript, prompt, options, answer, explanation) {
  return { kind: "listening", transcript, prompt, options, answer, explanation };
}
function shadowing(transcript, instruction = "Listen and repeat the full line aloud.") {
  return { kind: "shadowing", transcript, instruction };
}
function dictation(answer, prompt = "Type the Korean sentence you hear.") {
  return { kind: "dictation", answer, prompt };
}
function reading(korean, prompt, options, answer, explanation) {
  return { kind: "reading", korean, prompt, options, answer, explanation };
}
function build(prompt, tokens, answer) {
  return { kind: "build", prompt, tokens, answer };
}
function finish(canDo) {
  return { kind: "finish", canDo };
}

function lesson1() {
  return lessonBase(1, "Meeting someone new", "Greet someone and introduce who you are.", [
    "greet someone politely",
    "say your name and identity",
    "understand a basic introduction",
  ], [
    word("안녕하세요", "hello", "polite greeting"),
    word("이름", "name"),
    word("학생", "student"),
    explain("Say what someone is", "Use 이에요 after a consonant and 예요 after a vowel.", "저는 학생이에요.", [
      ["저는", "as for me / I"], ["학생", "student"], ["이에요", "am / is"],
    ]),
    choice("Complete: 저는 학생___", ["이에요", "예요", "에서", "하고"], 0, "학생 ends in a consonant, so 이에요 is used."),
    listening("안녕하세요. 제 이름은 지민이에요. 저는 학생이에요.", "What does Jimin say?", ["They are a student.", "They are a teacher.", "They are at home.", "They like coffee."], 0, "학생 means student."),
    shadowing("안녕하세요. 제 이름은 지민이에요. 저는 학생이에요."),
    build("Build: I am a student.", ["학생이에요", "저는"], "저는 학생이에요"),
    finish(["greet someone politely", "say “I am a student”", "recognize a simple self-introduction"]),
  ]);
}

function lesson2() {
  return lessonBase(2, "What's this?", "Identify common objects and ask what something is.", [
    "name everyday objects",
    "use this / that naturally",
    "ask what something is",
  ], [
    word("책", "book"),
    word("가방", "bag"),
    word("물", "water"),
    word("커피", "coffee"),
    explain("This, that, over there", "Use 이것 near you, 그것 near the listener or already mentioned, and 저것 farther away.", "이것은 책이에요.", [
      ["이것", "this"], ["책", "book"], ["이에요", "is"],
    ]),
    choice("The coffee is near the listener. Which fits?", ["이것은 커피예요.", "그것은 커피예요.", "저것은 커피예요.", "커피에 가요."], 1, "그것 points to something near the listener or something already mentioned."),
    listening("이것은 뭐예요? 이것은 책이에요.", "What is the object?", ["A bag", "A book", "Water", "Coffee"], 1, "책 means book."),
    shadowing("이것은 뭐예요? 이것은 책이에요."),
    build("Build: This is a book.", ["책이에요", "이것은"], "이것은 책이에요"),
    finish(["identify common objects", "use 이것 / 그것 / 저것", "ask and understand 뭐예요?"]),
  ]);
}

function lesson3() {
  return lessonBase(3, "Places around me", "Name common places before talking about movement.", [
    "recognize common places",
    "connect places with daily life",
    "read a tiny place description",
  ], [
    word("학교", "school"),
    word("집", "home"),
    word("도서관", "library"),
    word("카페", "cafe"),
    explain("Place words in context", "Korean often lets the place noun carry most of the meaning. Learn it inside a complete sentence.", "여기는 도서관이에요.", [
      ["여기는", "this place / here"], ["도서관", "library"], ["이에요", "is"],
    ]),
    choice("Which word means library?", ["학교", "도서관", "카페", "집"], 1, "도서관 means library."),
    reading("여기는 학교예요. 저기는 카페예요. 도서관은 학교 옆에 있어요.", "Which place is beside the school?", ["Home", "The cafe", "The library", "The station"], 2, "도서관은 학교 옆에 있어요 says the library is next to the school."),
    finish(["recognize school, home, library, and cafe", "understand a tiny place description"]),
  ]);
}

function lesson4() {
  return lessonBase(4, "Where are you going?", "Use destination 에 with 가요 to talk about movement.", [
    "say where you are going",
    "recognize destination 에",
    "understand simple movement sentences",
  ], [
    explain("Destination + 에 가요", "Put 에 after the place you are going to, then use 가요 for “go.”", "저는 도서관에 가요.", [
      ["저는", "I / as for me"], ["도서관", "library"], ["에", "to / destination"], ["가요", "go"],
    ]),
    choice("Which means “I go to school”?", ["저는 학교예요.", "저는 학교에 가요.", "학교는 저예요.", "저는 집이에요."], 1, "학교에 가요 marks school as the destination."),
    listening("오늘 저는 카페에 가요.", "Where is the speaker going?", ["School", "Home", "A cafe", "A library"], 2, "카페에 가요 means going to a cafe."),
    shadowing("오늘 저는 카페에 가요."),
    build("Build: I go to the library.", ["도서관에", "저는", "가요"], "저는 도서관에 가요"),
    reading("아침에 학교에 가요. 오후에 도서관에 가요. 저녁에 집에 가요.", "Where does the person go in the afternoon?", ["School", "Library", "Cafe", "Home"], 1, "오후에 도서관에 가요 means “I go to the library in the afternoon.”"),
    finish(["use 에 for a destination", "say where you are going", "follow a simple daily route"]),
  ]);
}

function lesson5() {
  return lessonBase(5, "A tiny first conversation", "Combine greetings, identity, objects, and places.", [
    "follow a short beginner conversation",
    "connect multiple Unit 1 patterns",
    "respond to familiar Korean without translation",
  ], [
    reading("민지: 안녕하세요? 저는 민지예요.\n준호: 안녕하세요. 저는 준호예요.\n민지: 이것은 뭐예요?\n준호: 책이에요. 저는 지금 도서관에 가요.", "Where is Junho going?", ["Home", "A cafe", "The library", "School"], 2, "준호 says 도서관에 가요."),
    choice("What is the object in the conversation?", ["A book", "A bag", "Coffee", "Water"], 0, "준호 answers 책이에요."),
    build("Build Junho's destination sentence.", ["저는", "가요", "도서관에"], "저는 도서관에 가요"),
    listening("안녕하세요. 저는 수아예요. 이것은 제 가방이에요. 지금 학교에 가요.", "Which two facts are true?", ["Sua has a bag and is going to school.", "Sua has coffee and is going home.", "Sua has a book and is going to a cafe.", "Sua is a teacher at a library."], 0, "가방 means bag and 학교에 가요 means going to school."),
    shadowing("안녕하세요. 저는 수아예요. 이것은 제 가방이에요. 지금 학교에 가요."),
    finish(["follow a complete mini-conversation", "combine identity, object, and destination patterns"]),
  ]);
}

function checkpoint1() {
  return lessonBase(6, "Unit 1 checkpoint", "Check what you can actually understand after First conversations.", [
    "identify yourself",
    "recognize everyday objects",
    "understand simple destinations",
  ], [
    choice("Which sentence introduces you as a student?", ["저는 학생이에요.", "저는 학교에 가요.", "이것은 학생이에요.", "도서관은 학생이에요."], 0, "저는 학생이에요 correctly identifies yourself as a student.", "Checkpoint"),
    listening("안녕하세요. 저는 유나예요. 지금 도서관에 가요.", "Where is Yuna going?", ["Home", "School", "The library", "A cafe"], 2, "도서관에 가요 means going to the library."),
    dictation("저는 학생이에요.", "Listen and type the complete Korean sentence."),
    choice("Which sentence points to a nearby book?", ["이것은 책이에요.", "저것은 책이에요.", "책에 가요.", "저는 책이에요."], 0, "이것 is used for something near the speaker."),
    reading("저는 민수예요. 이것은 제 가방이에요. 오후에 카페에 가요.", "Which statement is correct?", ["Minsu has a bag and goes to a cafe.", "Minsu has a book and goes home.", "Minsu is a cafe.", "Minsu goes to school in the morning."], 0, "가방 means bag and 오후에 카페에 가요 means going to a cafe in the afternoon."),
    finish(["introduce yourself", "identify familiar objects", "understand where someone is going", "complete Unit 1"]),
  ], "checkpoint");
}

const curriculumQuality = (() => {
  const published = units.flatMap((unit) => unit.lessons);
  const lessonsWith = (kind) => published.filter((lesson) => lesson.steps.some((step) => step.kind === kind)).length;
  const unitCoverage = units.map((unit) => ({
    unit: unit.number,
    title: unit.title,
    listening: unit.lessons.some((lesson) => lesson.steps.some((step) => step.kind === "listening")),
    shadowing: unit.lessons.some((lesson) => lesson.steps.some((step) => step.kind === "shadowing")),
    dictation: unit.lessons.some((lesson) => lesson.steps.some((step) => step.kind === "dictation")),
    production: unit.lessons.some((lesson) => lesson.steps.some((step) => step.kind === "build")),
    checkpoint: unit.lessons.some((lesson) => lesson.type === "checkpoint"),
  }));
  return {
    lessons: published.length,
    listeningLessons: lessonsWith("listening"),
    shadowingLessons: lessonsWith("shadowing"),
    dictationLessons: lessonsWith("dictation"),
    productionLessons: lessonsWith("build"),
    unitCoverage,
    allUnitsMultiskill: unitCoverage.every((row) =>
      row.listening && row.shadowing && row.dictation && row.production && row.checkpoint
    ),
  };
})();

function readProgress() {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(lessonKey) || "{}"); } catch { return {}; }
}

function newestByTimestamp(a, b, field = "generatedAt") {
  if (!a) return b || null;
  if (!b) return a;
  const aTime = new Date(a?.[field] || a?.updatedAt || a?.completedAt || 0).getTime();
  const bTime = new Date(b?.[field] || b?.updatedAt || b?.completedAt || 0).getTime();
  return aTime >= bTime ? a : b;
}

function mergeLessonProgress(local = {}, remote = {}) {
  const merged = { ...remote };
  for (const [lessonId, localEntry] of Object.entries(local || {})) {
    const remoteEntry = remote?.[lessonId] || {};
    merged[lessonId] = {
      ...remoteEntry,
      ...localEntry,
      completed: !!(localEntry?.completed || remoteEntry?.completed),
      stepIndex: Math.max(Number(localEntry?.stepIndex || 0), Number(remoteEntry?.stepIndex || 0)),
    };
  }
  return merged;
}

function mergeStudyResultLists(local = [], remote = []) {
  const map = new Map();
  [...(remote || []), ...(local || [])].forEach((item) => {
    if (!item) return;
    const key = [
      item.levelId || "foundation",
      item.completedAt || "",
      item.score ?? "",
      item.total ?? "",
    ].join("|");
    map.set(key, item);
  });
  return [...map.values()]
    .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))
    .slice(0, 40);
}

function mergeMistakeLogs(local = [], remote = []) {
  const map = new Map();
  [...(remote || []), ...(local || [])].forEach((item) => {
    if (!item?.id) return;
    const existing = map.get(item.id);
    if (!existing || new Date(item.lastSeenAt || item.createdAt || 0) >= new Date(existing.lastSeenAt || existing.createdAt || 0)) {
      map.set(item.id, item);
    }
  });
  return [...map.values()]
    .sort((a, b) => new Date(b.lastSeenAt || b.createdAt || 0) - new Date(a.lastSeenAt || a.createdAt || 0))
    .slice(0, 80);
}

function mergeIntelligenceState(local = {}, remote = {}) {
  const merged = { ...remote, ...local };
  ["difficulty", "studyPlan", "promotion", "learningRoute"].forEach((key) => {
    merged[key] = newestByTimestamp(local?.[key], remote?.[key]) || null;
  });
  const historyMap = new Map();
  [...(remote?.practiceHistory || []), ...(local?.practiceHistory || [])].forEach((item) => {
    if (!item) return;
    const key = [item.type || "", item.title || "", item.completedAt || ""].join("|");
    historyMap.set(key, item);
  });
  merged.practiceHistory = [...historyMap.values()]
    .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))
    .slice(0, 24);
  merged.mistakeLog = mergeMistakeLogs(local?.mistakeLog || [], remote?.mistakeLog || []);
  return merged;
}

function StaticHallimGate({ authHref, authError = "" }) {
  return <LandingPage authHref={authHref} authError={authError} />;
}

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning.";
  if (hour < 17) return "Good afternoon.";
  return "Good evening.";
}

export default function Hallim() {
  const [view, setView] = useState("home");
  const [greeting, setGreeting] = useState("Welcome back.");
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [syncStatus, setSyncStatus] = useState("local");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [syncHydrated, setSyncHydrated] = useState(false);
  const [progress, setProgress] = useState({});
  const [activeLesson, setActiveLesson] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [choiceIndex, setChoiceIndex] = useState(null);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [buildTokens, setBuildTokens] = useState([]);
  const [dictationInput, setDictationInput] = useState("");
  const [dictationChecked, setDictationChecked] = useState(false);
  const [shadowDone, setShadowDone] = useState(false);
  const [notice, setNotice] = useState("");
  const [studyTestIndex, setStudyTestIndex] = useState(0);
  const [studyTestChoice, setStudyTestChoice] = useState(null);
  const [studyTestChecked, setStudyTestChecked] = useState(false);
  const [studyScore, setStudyScore] = useState(0);
  const [studyResults, setStudyResults] = useState([]);
  const [aiAuditRecord, setAiAuditRecord] = useState(null);
  const [aiAuditLoading, setAiAuditLoading] = useState(false);
  const [aiAuditError, setAiAuditError] = useState("");
  const [aiDifficultyRecord, setAiDifficultyRecord] = useState(null);
  const [studyPlanRecord, setStudyPlanRecord] = useState(null);
  const [promotionRecord, setPromotionRecord] = useState(null);
  const [learningRouteRecord, setLearningRouteRecord] = useState(null);
  const [aiQuiz, setAiQuiz] = useState(null);
  const [aiQuizIndex, setAiQuizIndex] = useState(0);
  const [aiQuizChoice, setAiQuizChoice] = useState(null);
  const [aiQuizChecked, setAiQuizChecked] = useState(false);
  const [aiQuizScore, setAiQuizScore] = useState(0);
  const [aiBusy, setAiBusy] = useState("");
  const [aiFeatureError, setAiFeatureError] = useState("");
  const [mistakeExplanation, setMistakeExplanation] = useState(null);
  const [mistakeLog, setMistakeLog] = useState([]);
  const [mistakeReviewChoice, setMistakeReviewChoice] = useState(null);
  const [mistakeReviewChecked, setMistakeReviewChecked] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState(null);
  const [selectedGrammar, setSelectedGrammar] = useState(null);
  const [mapQuery, setMapQuery] = useState("");
  const [activeDistrict, setActiveDistrict] = useState("all");
  const [focusedWord, setFocusedWord] = useState(null);
  const [expandedUnit, setExpandedUnit] = useState(null);
  const [showOtherLevels, setShowOtherLevels] = useState(false);
  const [reviewFilter, setReviewFilter] = useState("due");
  const [learnerProfile, setLearnerProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [draftCurrentLevel, setDraftCurrentLevel] = useState("new");
  const [draftTargetLevel, setDraftTargetLevel] = useState("elementary");
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const koreanVoiceRef = useRef(null);
  const syncTimerRef = useRef(null);
  const authUserRef = useRef(null);
  const homeScrollRef = useRef(0);
  const navigationHistoryRef = useRef([]);
  const viewScrollRef = useRef({ home: 0 });

  useEffect(() => {
    setProgress(readProgress());
    setStudyResults(readStudyResults());
    setAiAuditRecord(readAiAudit());
    const savedIntelligence = readIntelligenceState();
    setAiDifficultyRecord(savedIntelligence.difficulty || null);
    setStudyPlanRecord(savedIntelligence.studyPlan || null);
    setPromotionRecord(savedIntelligence.promotion || null);
    setLearningRouteRecord(savedIntelligence.learningRoute || null);
    setMistakeLog(savedIntelligence.mistakeLog || []);
    const savedProfile = readLearnerProfile();
    if (savedProfile) {
      setLearnerProfile(savedProfile);
      setDraftCurrentLevel(savedProfile.currentLevel || "new");
      setDraftTargetLevel(savedProfile.targetLevel || "elementary");
    }
    const existingReferral = readReferralCode();
    const urlReferral = new URLSearchParams(window.location.search).get("ref") || "";
    const cleanReferral = /^[A-Za-z0-9_-]{2,48}$/.test(urlReferral) ? urlReferral : "";
    const referralCandidate = existingReferral || cleanReferral;

    if (referralCandidate) {
      const supabase = getHallimSupabase();
      supabase
        .from("ambassador_codes")
        .select("code")
        .eq("code", referralCandidate)
        .eq("status", "active")
        .maybeSingle()
        .then(({ data }) => {
          if (data?.code) {
            localStorage.setItem(referralKey, data.code);
            setReferralCode(data.code);

            const visitStorageKey = "hallim:referral-visit:" + data.code;
            if (!localStorage.getItem(visitStorageKey)) {
              const visitId = crypto.randomUUID();
              supabase.from("referral_visits").insert({
                visit_id: visitId,
                code: data.code,
                landing_path: window.location.pathname || "/",
              }).then(({ error }) => {
                if (!error) localStorage.setItem(visitStorageKey, visitId);
              });
            }
          } else if (existingReferral === referralCandidate) {
            localStorage.removeItem(referralKey);
            setReferralCode("");
          }
        });
    }
    setGreeting(timeGreeting());
    setProfileLoaded(true);
  }, []);

  useEffect(() => {
    const supabase = getHallimSupabase();
    let active = true;

    const bootstrapAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) {
        setAuthError(error.message);
        setAuthReady(true);
        return;
      }
      const user = data?.session?.user || null;
      authUserRef.current = user;
      setAuthUser(user);
      setAuthReady(true);
      if (user) {
        await hydrateFromCloud(user);
        const authParams = new URLSearchParams(window.location.search);
        const requestedView = authParams.get("view");
        const requestedLesson = authParams.get("lesson");
        const allowedViews = new Set(["home","companion","review","vocab","grammar","test","profile"]);
        // The Beginner to TOPIK bridge links to existing lesson IDs. Reuse their
        // original lesson component and progress records, not a duplicate.
        if (requestedView === "lesson" && requestedLesson && lessons.some(item => item.id === requestedLesson)) {
          const previousStep = readProgress()?.[requestedLesson]?.stepIndex || 0;
          setActiveLesson(requestedLesson);
          setStepIndex(previousStep);
          setView("lesson");
        } else if (requestedView && allowedViews.has(requestedView)) {
          setView(requestedView);
        }
        if (authParams.get("auth") === "google") {
          setAuthMessage("Signed in with Google. Hallim restored your private learning state.");
        }
        if (requestedView || authParams.get("auth") === "google") {
          window.history.replaceState({}, "", window.location.pathname);
        }
      }
    };

    bootstrapAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const user = session?.user || null;
      authUserRef.current = user;
      setAuthUser(user);
      setAuthReady(true);
      if (user) {
        window.setTimeout(() => hydrateFromCloud(user), 0);
      } else {
        setSyncHydrated(false);
        setSyncStatus("local");
        setLastSyncedAt(null);
      }
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
      if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const chooseKoreanVoice = () => {
      const voices = window.speechSynthesis.getVoices().filter((voice) =>
        voice.lang?.toLowerCase().startsWith("ko")
      );
      koreanVoiceRef.current =
        voices.find((voice) => /google|microsoft|samsung|siri/i.test(voice.name || "")) ||
        voices.find((voice) => voice.localService) ||
        voices[0] ||
        null;
    };
    chooseKoreanVoice();
    window.speechSynthesis.addEventListener("voiceschanged", chooseKoreanVoice);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", chooseKoreanVoice);
  }, []);


  useEffect(() => {
    if (!authUser || !syncHydrated) return;
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    setSyncStatus((status) => status === "syncing" ? status : "saving");
    syncTimerRef.current = window.setTimeout(() => {
      pushCloudState(authUser);
    }, 900);
    return () => {
      if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    };
  }, [
    authUser?.id,
    syncHydrated,
    progress,
    studyResults,
    learnerProfile,
    aiAuditRecord,
    aiDifficultyRecord,
    studyPlanRecord,
    promotionRecord,
    learningRouteRecord,
    mistakeLog,
  ]);

  const currentLevel = levelById(learnerProfile?.currentLevel || draftCurrentLevel);
  const targetLevel = levelById(learnerProfile?.targetLevel || draftTargetLevel);
  const activeStudy = levelStudyPacks[currentLevel.id] || structuredStudy;
  const activeStudyResults = studyResults.filter((result) => (result.levelId || "foundation") === activeStudy.id);
  const targetChoices = learnerLevels.filter((level) => level.rank > levelById(draftCurrentLevel).rank);
  const curriculumMaxRank = 5;
  const effectiveStartRank = Math.min(currentLevel.rank, curriculumMaxRank);
  const effectiveTargetRank = Math.min(Math.max(targetLevel.rank, effectiveStartRank), curriculumMaxRank);
  const pathUnits = units.filter((unit) => unit.levelRank >= effectiveStartRank && unit.levelRank <= effectiveTargetRank);
  const pathLessons = pathUnits.flatMap((unit) => unit.lessons);
  const firstPathLesson = pathLessons[0] || lessons[0];

  const completedCount = useMemo(
    () => lessons.filter((lesson) => progress[lesson.id]?.completed).length,
    [progress],
  );
  const completedPathCount = pathLessons.filter((lesson) => progress[lesson.id]?.completed).length;
  const unitProgress = Math.round((completedPathCount / Math.max(pathLessons.length, 1)) * 100);
  const nextLesson = pathLessons.find((lesson) => !progress[lesson.id]?.completed) || pathLessons[pathLessons.length - 1] || firstPathLesson;
  const currentLesson = lessons.find((lesson) => lesson.id === activeLesson);
  const currentStep = currentLesson?.steps[stepIndex];
  const currentLessonUnit = units.find((unit) => unit.id === currentLesson?.unitId);
  const nextLessonUnit = units.find((unit) => unit.id === nextLesson?.unitId);
  const firstPathIndex = lessons.findIndex((lesson) => lesson.id === firstPathLesson?.id);
  const latestStudyResult = activeStudyResults[0] || null;
  const bestStudyScore = activeStudyResults.length ? Math.max(...activeStudyResults.map((result) => result.score)) : null;
  const latestStudyPct = latestStudyResult ? Math.round((latestStudyResult.score / latestStudyResult.total) * 100) : null;
  const unitCompletionPct = unitProgress;
  const reviewLessonCount = pathLessons.filter((lesson) => progress[lesson.id]?.completed).length;
  const relevantMistakes = mistakeLog
    .filter((item) => !item.levelId || item.levelId === activeStudy.id)
    .sort((a,b) => new Date(b.lastSeenAt || 0) - new Date(a.lastSeenAt || 0));
  const dueMistakes = relevantMistakes
    .filter((item) => new Date(item.nextReviewAt || 0).getTime() <= Date.now())
    .sort((a,b) => new Date(a.nextReviewAt || 0) - new Date(b.nextReviewAt || 0));
  const weakSkillMap = relevantMistakes.reduce((map,item) => {
    const skill = item.skill || "Mixed review";
    map[skill] = (map[skill] || 0) + Math.max(1, Number(item.misses || 1) - Number(item.successfulReviews || 0));
    return map;
  }, {});
  const topWeakSkills = Object.entries(weakSkillMap)
    .sort((a,b) => b[1] - a[1])
    .slice(0,3)
    .map(([skill,weight]) => ({ skill, weight }));
  const reviewLabel = dueMistakes.length
    ? dueMistakes.length + (dueMistakes.length === 1 ? " weakness due" : " weaknesses due")
    : reviewLessonCount
      ? reviewLessonCount + (reviewLessonCount === 1 ? " lesson ready" : " lessons ready")
      : "No review due yet";

  // Word-map projection of the real vocabulary pack. The V4 map groups words
  // by district; Hallim already groups each studyWord by `group`, so the
  // districts are the learner's actual vocabulary groups, not decoration.
  const vocabDistricts = (() => {
    const order = [];
    const byGroup = new Map();
    for (const word of activeStudy.vocabulary || []) {
      if (!byGroup.has(word.group)) { byGroup.set(word.group, []); order.push(word.group); }
      byGroup.get(word.group).push(word);
    }
    return order.map((name, index) => ({ name, position: index + 1, words: byGroup.get(name) }));
  })();

  // Mastery is derived from real Hallim evidence: lesson completion, the most
  // recent level test, and the spaced-review mistake log. It is never random.
  function wordMastery(word) {
    const hits = relevantMistakes.filter((item) => {
      const text = String(item.prompt || "") + " " + String((item.options || [])[item.answer] || "");
      return text.includes(word.korean);
    });
    const unresolved = hits.filter((item) => item.lastResult !== "correct").length;
    const recovered = hits.filter((item) => item.lastResult === "correct").length;
    const studied = completedPathCount > 0 ? 18 : 0;
    const tested = latestStudyPct == null ? 0 : Math.round(latestStudyPct * 0.4);
    return Math.max(6, Math.min(28 + studied + tested + recovered * 8 - unresolved * 14, 98));
  }

  const mapMatches = (word) => {
    const q = mapQuery.trim().toLowerCase();
    if (!q) return true;
    return [word.korean, word.romanization, word.meaning].some((field) => String(field).toLowerCase().includes(q));
  };
  const visibleDistricts = vocabDistricts.filter((d) => activeDistrict === "all" || d.name === activeDistrict);
  const strongWords = (activeStudy.vocabulary || []).filter((w) => wordMastery(w) >= 70).length;
  const activeWord = focusedWord || (activeStudy.vocabulary || [])[0] || null;
  const relatedWords = activeWord
    ? (activeStudy.vocabulary || []).filter((w) => w.group === activeWord.group && w.korean !== activeWord.korean).slice(0, 4)
    : [];

  const fallbackLearningRoute = (() => {
    if (dueMistakes.length) {
      return {
        headline: "A weakness is due for review",
        focus: topWeakSkills[0]?.skill || activeStudy.label + " retention",
        reason: "Hallim remembered questions you missed earlier and scheduled them back before they fade.",
        steps: [
          { kind:"review_queue", title:"Review " + dueMistakes.length + " due " + (dueMistakes.length === 1 ? "weakness" : "weaknesses"), why:"Use spaced review on the exact questions Hallim remembered." },
          { kind:"adaptive_review", title:"Transfer the weak skill", why:"Generate fresh practice after the scheduled recall." },
          { kind:"companion", title:"Use it in context", why:"Return the repaired skill to a real lesson." },
        ],
      };
    }
    if (!latestStudyResult) {
      return {
        headline: "Build your " + activeStudy.label + " baseline",
        focus: "Vocabulary → Grammar → Test",
        reason: "Hallim needs a clean level-specific result before it can target weaknesses precisely.",
        steps: [
          { kind:"vocab", title:"Review core vocabulary", why:"Build recognition before testing recall." },
          { kind:"grammar", title:"Study the active grammar pack", why:"Connect words into the patterns used at this level." },
          { kind:"test", title:"Take the " + activeStudy.label + " study test", why:"Give Hallim measurable evidence for your next route." },
        ],
      };
    }
    if (latestStudyPct < 70) {
      return {
        headline: "Reinforce before adding difficulty",
        focus: activeStudy.label + " recall",
        reason: "Your latest level-specific test shows that the current layer needs another pass.",
        steps: [
          { kind:"vocab", title:"Repair vocabulary recall", why:"Revisit the words used by the current pack." },
          { kind:"grammar", title:"Rebuild the weak grammar layer", why:"Review the forms before another assessment." },
          { kind:"adaptive_review", title:"Run targeted review", why:"Generate fresh questions from already learned material." },
        ],
      };
    }
    return {
      headline: "Turn recognition into usable Korean",
      focus: "Context + transfer + reassessment",
      reason: "Your current test evidence is strong enough to keep moving while still checking retention.",
      steps: [
        { kind:"companion", title:"Continue " + nextLesson.title, why:"Use the language inside a real-life context." },
        { kind:"adaptive_review", title:"Run adaptive review", why:"Mix recall with transfer at your current difficulty." },
        { kind:"test", title:"Reassess the study pack", why:"Confirm that the gains remain stable." },
      ],
    };
  })();

  const activeLearningRoute = learningRouteRecord?.result || fallbackLearningRoute;

  const audit = (() => {
    if (!latestStudyResult && completedCount === 0) {
      return {
        verdict: "Building your baseline",
        strength: "Your learning path is set and ready.",
        focus: "Hallim needs a little performance data before it can judge strengths accurately.",
        next: "Complete the first Companion lesson, then take the Unit 1 study test after reviewing Vocabulary and Grammar.",
      };
    }
    if (!latestStudyResult) {
      return {
        verdict: "Good start — test your retention",
        strength: completedCount >= 2 ? "You are making steady curriculum progress." : "You have started building lesson context.",
        focus: "There is no structured test result yet, so recall accuracy is still unknown.",
        next: "Take the Unit 1 Vocabulary + Grammar test to establish your first measurable baseline.",
      };
    }
    if (latestStudyPct >= 85 && unitCompletionPct >= 50) {
      return {
        verdict: "Strong foundation",
        strength: `Your latest study test is ${latestStudyPct}% and your lesson progress is moving well.`,
        focus: "Keep pronunciation and listening active so recognition turns into usable Korean.",
        next: "Continue the next Companion lesson and use sentence audio in Vocabulary rather than reviewing isolated words only.",
      };
    }
    if (latestStudyPct >= 70) {
      return {
        verdict: "On track, but consolidate",
        strength: `You scored ${latestStudyPct}% on the latest structured test.`,
        focus: "A few vocabulary or grammar items are not stable enough yet.",
        next: "Review the word pronunciation cards and all three Unit 1 grammar patterns, then retake the test.",
      };
    }
    return {
      verdict: "Rebuild the weak layer first",
      strength: "You already have a measurable baseline, which makes the next step clear.",
      focus: `Your latest structured score is ${latestStudyPct}%, so recall needs reinforcement before adding more difficulty.`,
      next: "Review Vocabulary first, then Grammar, and retake the Unit 1 test before moving deeper into the path.",
    };
  })();

  function applyMergedLocalState({ profile, lessonProgress, results, intelligence, audit }) {
    if (profile) {
      localStorage.setItem(learnerProfileKey, JSON.stringify(profile));
      setLearnerProfile(profile);
      setDraftCurrentLevel(profile.currentLevel || "new");
      setDraftTargetLevel(profile.targetLevel || "elementary");
    }

    localStorage.setItem(lessonKey, JSON.stringify(lessonProgress || {}));
    setProgress(lessonProgress || {});

    localStorage.setItem(studyResultsKey, JSON.stringify(results || []));
    setStudyResults(results || []);

    localStorage.setItem(intelligenceStateKey, JSON.stringify(intelligence || {}));
    setAiDifficultyRecord(intelligence?.difficulty || null);
    setStudyPlanRecord(intelligence?.studyPlan || null);
    setPromotionRecord(intelligence?.promotion || null);
    setLearningRouteRecord(intelligence?.learningRoute || null);
    setMistakeLog(intelligence?.mistakeLog || []);

    if (audit) {
      localStorage.setItem(aiAuditKey, JSON.stringify(audit));
      setAiAuditRecord(audit);
    } else {
      localStorage.removeItem(aiAuditKey);
      setAiAuditRecord(null);
    }
  }

  async function pushCloudState(user = authUserRef.current, snapshot = null) {
    if (!user) return false;
    const supabase = getHallimSupabase();
    const now = new Date().toISOString();

    const profile = snapshot?.profile || readLearnerProfile() || {
      currentLevel: "new",
      targetLevel: "elementary",
      createdAt: now,
      updatedAt: now,
    };
    const lessonProgress = snapshot?.lessonProgress || readProgress();
    const results = snapshot?.results || readStudyResults();
    const intelligence = snapshot?.intelligence || readIntelligenceState();
    const audit = snapshot?.audit === undefined ? readAiAudit() : snapshot.audit;

    setSyncStatus("saving");

    const [profileWrite, stateWrite] = await Promise.all([
      supabase.from("profiles").upsert({
        user_id: user.id,
        display_name: null,
        current_level: profile.currentLevel || "new",
        target_level: profile.targetLevel || "elementary",
        created_at: profile.createdAt || now,
        updated_at: profile.updatedAt || now,
        source_referral: readReferralCode() || null,
      }),
      supabase.from("learner_state").upsert({
        user_id: user.id,
        schema_version: 1,
        lesson_progress: lessonProgress || {},
        study_results: results || [],
        intelligence_state: intelligence || {},
        ai_audit: audit || null,
        updated_at: now,
      }),
    ]);

    const error = profileWrite.error || stateWrite.error;
    if (error) {
      setSyncStatus("error");
      setAuthError(error.message);
      return false;
    }

    setSyncStatus("synced");
    setLastSyncedAt(now);
    return true;
  }

  async function trackLearningEvent(eventType, eventKey = null, metadata = {}) {
    const user = authUserRef.current;
    if (!user) return false;
    const supabase = getHallimSupabase();
    const { error } = await supabase.from("learning_events").insert({
      user_id: user.id,
      event_type: eventType,
      event_key: eventKey,
      metadata,
    });
    if (error && error.code !== "23505") return false;
    return true;
  }

  async function hydrateFromCloud(user) {
    if (!user) return;
    const supabase = getHallimSupabase();
    setSyncStatus("syncing");
    setAuthError("");

    const [profileRead, stateRead] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("learner_state").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

    const firstCloudProfile = !profileRead.data;
    const error = profileRead.error || stateRead.error;
    if (error) {
      setSyncStatus("error");
      setAuthError(error.message);
      setSyncHydrated(true);
      return;
    }

    const localProfile = readLearnerProfile();
    const remoteProfile = profileRead.data ? {
      currentLevel: profileRead.data.current_level,
      targetLevel: profileRead.data.target_level,
      createdAt: profileRead.data.created_at,
      updatedAt: profileRead.data.updated_at,
    } : null;

    if (!readReferralCode() && profileRead.data?.source_referral) {
      localStorage.setItem(referralKey, profileRead.data.source_referral);
      setReferralCode(profileRead.data.source_referral);
    }

    const mergedProfile = newestByTimestamp(localProfile, remoteProfile, "updatedAt") || localProfile || remoteProfile;
    const mergedProgress = mergeLessonProgress(readProgress(), stateRead.data?.lesson_progress || {});
    const mergedResults = mergeStudyResultLists(readStudyResults(), stateRead.data?.study_results || []);
    const mergedIntelligence = mergeIntelligenceState(readIntelligenceState(), stateRead.data?.intelligence_state || {});
    const mergedAudit = newestByTimestamp(readAiAudit(), stateRead.data?.ai_audit || null);

    const snapshot = {
      profile: mergedProfile || {
        currentLevel: "new",
        targetLevel: "elementary",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      lessonProgress: mergedProgress,
      results: mergedResults,
      intelligence: mergedIntelligence,
      audit: mergedAudit,
    };

    applyMergedLocalState(snapshot);
    setSyncHydrated(true);
    await pushCloudState(user, snapshot);

    authUserRef.current = user;
    const today = new Date().toISOString().slice(0,10);
    await trackLearningEvent("app_open", "app-open:" + today, {
      source_referral: readReferralCode() || null,
    });
    if (firstCloudProfile) {
      await trackLearningEvent("account_signup", "account-signup", {
        source_referral: readReferralCode() || null,
      });
    }
  }

  async function signOutHallim() {
    const supabase = getHallimSupabase();
    setAuthBusy(true);
    setAuthError("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      authUserRef.current = null;
      setAuthUser(null);
      setSyncHydrated(false);
      setSyncStatus("local");
      setLastSyncedAt(null);
      setAuthMessage("Signed out. Sign in with Google to unlock Hallim again.");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not sign out.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function manualCloudSync() {
    if (!authUserRef.current) return;
    await pushCloudState(authUserRef.current);
  }

  async function shareProgress() {
    const latest = latestStudyResult
      ? Math.round((latestStudyResult.score / latestStudyResult.total) * 100) + "% latest study test"
      : "baseline still being built";
    const focus = activeLearningRoute?.focus || "steady Korean practice";
    const text = [
      "My Hallim Korean progress",
      currentLevel.short + " → " + targetLevel.short,
      completedPathCount + " / " + pathLessons.length + " lessons & checkpoints completed",
      latest,
      "Current focus: " + focus,
    ].join("\n");

    setShareMessage("");
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Hallim Korean progress",
          text,
          url: window.location.origin,
        });
        setShareMessage("Progress shared.");
        return;
      }
      await navigator.clipboard.writeText(text + "\n" + window.location.origin);
      setShareMessage("Progress summary copied.");
    } catch (error) {
      if (error?.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(text + "\n" + window.location.origin);
          setShareMessage("Progress summary copied.");
        } catch {
          setShareMessage("Could not open sharing on this browser.");
        }
      }
    }
  }

  function saveLearnerProfile(currentLevelId = draftCurrentLevel, targetLevelId = draftTargetLevel) {
    const current = levelById(currentLevelId);
    let target = levelById(targetLevelId);
    if (target.rank <= current.rank) {
      target = learnerLevels.find((level) => level.rank > current.rank) || learnerLevels[learnerLevels.length - 1];
    }
    const profile = {
      currentLevel: current.id,
      targetLevel: target.id,
      createdAt: learnerProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLearnerProfile(profile);
    setDraftCurrentLevel(profile.currentLevel);
    setDraftTargetLevel(profile.targetLevel);
    localStorage.setItem(learnerProfileKey, JSON.stringify(profile));
    setStudyScore(0);
    setStudyTestIndex(0);
    setStudyTestChoice(null);
    setStudyTestChecked(false);
    setMistakeExplanation(null);
    setLearningRouteRecord(null);
    saveIntelligenceState({ learningRoute: null });
    setProfileEditorOpen(false);
    setOnboardingStep(1);
  }

  function chooseCurrentLevel(id) {
    setDraftCurrentLevel(id);
    const current = levelById(id);
    if (levelById(draftTargetLevel).rank <= current.rank) {
      const next = learnerLevels.find((level) => level.rank > current.rank) || learnerLevels[learnerLevels.length - 1];
      setDraftTargetLevel(next.id);
    }
  }

  function openProfileEditor() {
    setDraftCurrentLevel(learnerProfile?.currentLevel || "new");
    setDraftTargetLevel(learnerProfile?.targetLevel || "elementary");
    setProfileEditorOpen(true);
    setOnboardingStep(1);
  }

  async function runAiAudit() {
    if (aiAuditLoading) return;
    setAiAuditLoading(true);
    setAiAuditError("");

    const snapshot = {
      currentLevel: {
        id: currentLevel.id,
        label: currentLevel.label,
        topikRange: currentLevel.topik,
      },
      targetLevel: {
        id: targetLevel.id,
        label: targetLevel.label,
        topikRange: targetLevel.topik,
      },
      curriculum: {
        route: currentLevel.label + " → " + targetLevel.label,
        availableUnits: pathUnits.map((unit) => ({ number: unit.number, title: unit.title, level: unit.levelLabel })),
        completedLessons: pathLessons.filter((lesson) => progress[lesson.id]?.completed).map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
        })),
        completedCount,
        totalLessons: pathLessons.length,
        completionPercent: unitCompletionPct,
      },
      structuredStudy: {
        vocabulary: activeStudy.vocabulary.map((item) => item.korean),
        grammar: activeStudy.grammar.map((item) => item.pattern),
      },
      tests: {
        latest: latestStudyResult,
        bestScore: bestStudyScore,
        attempts: activeStudyResults.slice(0, 8),
      },
    };

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });
      const data = await response.json();
      if (!response.ok || !data?.audit) throw new Error(data?.error || "Could not generate the AI audit.");

      const record = {
        audit: data.audit,
        model: data.model || "Groq",
        generatedAt: new Date().toISOString(),
      };
      setAiAuditRecord(record);
      localStorage.setItem(aiAuditKey, JSON.stringify(record));
      await generateLearningRoute(data.audit);
    } catch (error) {
      setAiAuditError(error instanceof Error ? error.message : "Could not generate the AI audit.");
    } finally {
      setAiAuditLoading(false);
    }
  }

  function buildIntelligenceSnapshot(extra = {}) {
    const attempts = extra.attempts || activeStudyResults.slice(0, 8);
    const latest = extra.latest || attempts[0] || latestStudyResult;
    const best = attempts.length ? Math.max(...attempts.map((result) => result.score)) : bestStudyScore;
    return {
      currentLevel: { id: currentLevel.id, label: currentLevel.label, topikRange: currentLevel.topik },
      targetLevel: { id: targetLevel.id, label: targetLevel.label, topikRange: targetLevel.topik },
      curriculum: {
        route: currentLevel.label + " → " + targetLevel.label,
        availableUnits: pathUnits.map((unit) => ({ number: unit.number, title: unit.title, level: unit.levelLabel })),
        completedLessons: pathLessons.filter((lesson) => progress[lesson.id]?.completed).map((lesson) => ({
          id: lesson.id, title: lesson.title, canDo: lesson.canDo,
        })),
        completedCount,
        totalLessons: pathLessons.length,
        completionPercent: unitCompletionPct,
      },
      structuredStudy: {
        vocabulary: activeStudy.vocabulary.map((item) => ({
          korean: item.korean, meaning: item.meaning, group: item.group,
        })),
        grammar: activeStudy.grammar.map((item) => ({
          pattern: item.pattern, meaning: item.meaning, rule: item.rule, examples: item.examples,
        })),
      },
      tests: { latest, bestScore: best, attempts },
      audit: aiAuditRecord?.audit || null,
      adaptiveDifficulty: aiDifficultyRecord?.result || null,
      aiPracticeHistory: readIntelligenceState().practiceHistory || [],
      mistakeMemory: {
        dueCount: dueMistakes.length,
        topWeakSkills,
        recentMistakes: relevantMistakes.slice(0, 10).map((item) => ({
          source: item.source,
          skill: item.skill,
          prompt: item.prompt,
          selected: item.options?.[item.lastSelectedIndex] || null,
          correct: item.options?.[item.answer] || null,
          misses: item.misses || 1,
          successfulReviews: item.successfulReviews || 0,
          nextReviewAt: item.nextReviewAt,
        })),
      },
      ...extra,
    };
  }

  function saveIntelligenceState(partial) {
    const previous = readIntelligenceState();
    const next = { ...previous, ...partial };
    localStorage.setItem(intelligenceStateKey, JSON.stringify(next));
  }

  async function callIntelligence(action, payload) {
    setAiBusy(action);
    setAiFeatureError("");
    try {
      const response = await fetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const data = await response.json();
      if (!response.ok || !data?.result) throw new Error(data?.error || "Hallim Intelligence could not complete this request.");
      return data.result;
    } catch (error) {
      setAiFeatureError(error instanceof Error ? error.message : "Hallim Intelligence failed.");
      return null;
    } finally {
      setAiBusy("");
    }
  }

  function classifyQuestionSkill(question, fallback = "Mixed review") {
    if (question?.skill) return question.skill;
    const text = [question?.prompt, ...(question?.options || [])].join(" ");
    if (/what does|which word|meaning|means/i.test(text)) return "Vocabulary";
    if (/which form|pattern|sentence|correct form|complete/i.test(text)) return "Grammar";
    return fallback;
  }

  function mistakeId(question, source, levelId) {
    return [levelId || "unknown", source || "practice", String(question?.prompt || "").trim()].join("|");
  }

  function intervalForReview(successfulReviews) {
    const intervals = [3, 7, 14, 30, 60];
    return intervals[Math.min(Math.max(Number(successfulReviews || 1) - 1, 0), intervals.length - 1)];
  }

  function addDaysIso(days) {
    return new Date(Date.now() + Number(days) * 86400000).toISOString();
  }

  function writeMistakeLog(next) {
    const limited = [...next]
      .sort((a,b) => new Date(b.lastSeenAt || b.createdAt || 0) - new Date(a.lastSeenAt || a.createdAt || 0))
      .slice(0,80);
    setMistakeLog(limited);
    saveIntelligenceState({ mistakeLog: limited });
    return limited;
  }

  function recordQuestionOutcome(question, source, selectedIndex, correct, levelId = activeStudy.id) {
    if (!question || selectedIndex === null || selectedIndex === undefined) return;
    const previous = readIntelligenceState().mistakeLog || mistakeLog || [];
    const id = mistakeId(question, source, levelId);
    const existing = previous.find((item) => item.id === id);

    if (correct && !existing) return;

    const now = new Date().toISOString();
    let nextEntry;

    if (correct) {
      const successfulReviews = Number(existing.successfulReviews || 0) + 1;
      const intervalDays = intervalForReview(successfulReviews);
      nextEntry = {
        ...existing,
        successfulReviews,
        intervalDays,
        nextReviewAt: addDaysIso(intervalDays),
        lastSeenAt: now,
        lastSelectedIndex: selectedIndex,
        lastResult: "correct",
      };
    } else {
      nextEntry = {
        id,
        source,
        levelId,
        prompt: question.prompt,
        options: question.options,
        answer: question.answer,
        explanation: question.explanation || "",
        skill: classifyQuestionSkill(question, activeStudy.label + " practice"),
        createdAt: existing?.createdAt || now,
        lastSeenAt: now,
        lastSelectedIndex: selectedIndex,
        lastResult: "wrong",
        misses: Number(existing?.misses || 0) + 1,
        successfulReviews: 0,
        intervalDays: 0,
        nextReviewAt: now,
      };
    }

    return writeMistakeLog([nextEntry, ...previous.filter((item) => item.id !== id)]);
  }

  function scheduleMistakeReview(entry, selectedIndex, correct) {
    if (!entry) return;
    const previous = readIntelligenceState().mistakeLog || mistakeLog || [];
    const existing = previous.find((item) => item.id === entry.id) || entry;
    const now = new Date().toISOString();

    const successfulReviews = correct ? Number(existing.successfulReviews || 0) + 1 : 0;
    const intervalDays = correct ? intervalForReview(successfulReviews) : 1;
    const updated = {
      ...existing,
      successfulReviews,
      intervalDays,
      nextReviewAt: addDaysIso(intervalDays),
      lastSeenAt: now,
      lastSelectedIndex: selectedIndex,
      lastResult: correct ? "correct" : "wrong",
      misses: correct ? Number(existing.misses || 1) : Number(existing.misses || 1) + 1,
    };
    writeMistakeLog([updated, ...previous.filter((item) => item.id !== updated.id)]);
    trackLearningEvent("weakness_review_completed", "weakness-review:" + updated.id + ":" + new Date().toISOString().slice(0,10), {
      weakness_id: updated.id,
      skill: updated.skill,
      correct,
      interval_days: intervalDays,
    });
    setMistakeReviewChoice(null);
    setMistakeReviewChecked(false);
  }

  async function generateLearningRoute(auditOverride = null, difficultyOverride = null) {
    const result = await callIntelligence("learning_route", buildIntelligenceSnapshot({
      audit: auditOverride || aiAuditRecord?.audit || null,
      adaptiveDifficulty: difficultyOverride || aiDifficultyRecord?.result || null,
      supportedActions: ["companion","vocab","grammar","test","review_queue","adaptive_review","checkpoint"],
      nextCompanionLesson: nextLesson ? {
        id: nextLesson.id,
        title: nextLesson.title,
        unit: nextLesson.unitNumber,
        subtitle: nextLesson.subtitle,
      } : null,
    }));
    if (!result) return null;

    const supported = new Set(["companion","vocab","grammar","test","review_queue","adaptive_review","checkpoint"]);
    const steps = Array.isArray(result.steps)
      ? result.steps.filter((step) => supported.has(step?.kind)).slice(0, 3)
      : [];
    if (!steps.length) return null;

    const record = {
      result: { ...result, steps },
      generatedAt: new Date().toISOString(),
    };
    setLearningRouteRecord(record);
    saveIntelligenceState({ learningRoute: record });
    return record;
  }

  function startStudyTest() {
    setStudyScore(0);
    setStudyTestIndex(0);
    setStudyTestChoice(null);
    setStudyTestChecked(false);
    setMistakeExplanation(null);
    navigate("test");
  }

  async function launchLearningRouteStep(kind) {
    if (kind === "companion") {
      openLesson(nextLesson.id);
      return;
    }
    if (kind === "vocab") {
      navigate("vocab");
      return;
    }
    if (kind === "grammar") {
      navigate("grammar");
      return;
    }
    if (kind === "test") {
      startStudyTest();
      return;
    }
    if (kind === "review_queue") {
      navigate("review");
      return;
    }
    if (kind === "adaptive_review") {
      navigate("profile");
      await generateIntelligenceQuiz("review");
      return;
    }
    if (kind === "checkpoint") {
      navigate("profile");
      await generateIntelligenceQuiz("checkpoint");
    }
  }

  async function refreshDifficulty(latestResult = null, attemptsOverride = null) {
    const attempts = attemptsOverride || (latestResult ? [latestResult, ...activeStudyResults].slice(0, 8) : activeStudyResults.slice(0, 8));
    const result = await callIntelligence("difficulty", buildIntelligenceSnapshot({
      latest: latestResult || attempts[0] || null,
      attempts,
    }));
    if (!result) return;
    const record = { result, generatedAt: new Date().toISOString() };
    setAiDifficultyRecord(record);
    saveIntelligenceState({ difficulty: record });
    await generateLearningRoute(null, result);
  }

  async function explainStudyMistake(question) {
    if (studyTestChoice === null || studyTestChoice === question.answer) return;
    setMistakeExplanation(null);
    const result = await callIntelligence("mistake_explain", {
      learnerLevel: currentLevel.label,
      question: question.prompt,
      options: question.options,
      selectedAnswer: question.options[studyTestChoice],
      correctAnswer: question.options[question.answer],
      hallimExplanation: question.explanation,
      studiedGrammar: activeStudy.grammar.map((item) => item.pattern),
      studiedVocabulary: activeStudy.vocabulary.map((item) => item.korean),
    });
    if (result) setMistakeExplanation(result);
  }

  async function generateIntelligenceQuiz(type) {
    const action = type === "checkpoint" ? "checkpoint" : "adaptive_review";
    const result = await callIntelligence(action, buildIntelligenceSnapshot({
      requestedDifficulty: aiDifficultyRecord?.result?.level || "balanced",
    }));
    if (!result) return;
    setAiQuiz({ type, ...result });
    setAiQuizIndex(0);
    setAiQuizChoice(null);
    setAiQuizChecked(false);
    setAiQuizScore(0);
  }

  async function generateStudyPlan() {
    const result = await callIntelligence("study_plan", buildIntelligenceSnapshot({
      requestedDifficulty: aiDifficultyRecord?.result?.level || "balanced",
    }));
    if (!result) return;
    const record = { result, generatedAt: new Date().toISOString() };
    setStudyPlanRecord(record);
    saveIntelligenceState({ studyPlan: record });
  }

  async function runPromotionCheck() {
    const result = await callIntelligence("promotion", buildIntelligenceSnapshot());
    if (!result) return;
    const record = { result, generatedAt: new Date().toISOString() };
    setPromotionRecord(record);
    saveIntelligenceState({ promotion: record });
  }

  async function completeAiQuiz(finalScore) {
    if (!aiQuiz) return;
    const record = {
      type: aiQuiz.type,
      title: aiQuiz.title,
      difficulty: aiQuiz.difficulty,
      score: finalScore,
      total: aiQuiz.questions.length,
      completedAt: new Date().toISOString(),
    };
    const previous = readIntelligenceState();
    trackLearningEvent(
      aiQuiz.type === "checkpoint" ? "checkpoint_completed" : "adaptive_review_completed",
      null,
      {
        title: aiQuiz.title,
        difficulty: aiQuiz.difficulty,
        score: finalScore,
        total: aiQuiz.questions.length,
      }
    );
    const history = [record, ...(previous.practiceHistory || [])].slice(0, 12);
    saveIntelligenceState({ practiceHistory: history });
    setAiQuiz((quiz) => ({ ...quiz, finished: true, finalScore }));

    const result = await callIntelligence("difficulty", buildIntelligenceSnapshot({
      recentPractice: record,
      aiPracticeHistory: history,
    }));
    if (result) {
      const difficultyRecord = { result, generatedAt: new Date().toISOString() };
      setAiDifficultyRecord(difficultyRecord);
      saveIntelligenceState({ difficulty: difficultyRecord, practiceHistory: history });
      await generateLearningRoute(null, result);
    }
  }

  function closeAiQuiz() {
    setAiQuiz(null);
    setAiQuizIndex(0);
    setAiQuizChoice(null);
    setAiQuizChecked(false);
    setAiQuizScore(0);
  }

  function persist(next) {
    setProgress(next);
    localStorage.setItem(lessonKey, JSON.stringify(next));
  }
  function resetInteraction() {
    setChoiceIndex(null);
    setChecked(false);
    setRevealed(false);
    setBuildTokens([]);
    setDictationInput("");
    setDictationChecked(false);
    setShadowDone(false);
  }
  function openLesson(id) {
    const lesson = lessons.find((item) => item.id === id);
    if (!lesson) return;
    setActiveLesson(id);
    setStepIndex(progress[id]?.stepIndex || 0);
    resetInteraction();
    navigate("lesson");
  }
  function isUnlocked(index) {
    const lesson = lessons[index];
    const unit = units.find((item) => item.id === lesson?.unitId);
    if (!lesson || !unit) return false;
    if (unit.levelRank < effectiveStartRank) return true;
    if (unit.levelRank > effectiveTargetRank) return false;
    if (index === firstPathIndex) return true;
    const previous = lessons[index - 1];
    if (!previous) return true;
    if (units.find((item) => item.id === previous.unitId)?.levelRank < effectiveStartRank) return true;
    return !!progress[previous.id]?.completed;
  }
  function advance() {
    if (!currentLesson) return;
    const nextIndex = Math.min(stepIndex + 1, currentLesson.steps.length - 1);
    setStepIndex(nextIndex);
    resetInteraction();
    persist({
      ...progress,
      [currentLesson.id]: { ...(progress[currentLesson.id] || {}), stepIndex: nextIndex },
    });
  }
  function completeLesson() {
    if (!currentLesson) return;
    const wasAlreadyCompleted = !!progress[currentLesson.id]?.completed;
    persist({
      ...progress,
      [currentLesson.id]: { completed: true, stepIndex: currentLesson.steps.length - 1 },
    });
    if (!wasAlreadyCompleted) {
      trackLearningEvent("lesson_completed", "lesson:" + currentLesson.id, {
        lesson_id: currentLesson.id,
        unit_number: currentLesson.unitNumber,
        level_id: currentLesson.levelId,
        lesson_type: currentLesson.type,
      });
    }
    setNotice(currentLesson.type === "checkpoint" ? "Unit " + currentLesson.unitNumber + " complete" : "Lesson complete");
    // Completion returns to the catalog without leaving a finished lesson on the back stack.
    if (navigationHistoryRef.current.at(-1) === "companion") navigationHistoryRef.current.pop();
    setView("companion");
    resetInteraction();
  }
  function getKoreanVoice() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    if (koreanVoiceRef.current) return koreanVoiceRef.current;
    const voices = window.speechSynthesis.getVoices().filter((voice) =>
      voice.lang?.toLowerCase().startsWith("ko")
    );
    koreanVoiceRef.current = voices[0] || null;
    return koreanVoiceRef.current;
  }

  function speakKorean(text, rate = 1) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = Math.max(0.45, Math.min(1.15, Number(rate) || 1));
    utterance.pitch = 1;
    utterance.volume = 1;
    const voice = getKoreanVoice();
    if (voice) utterance.voice = voice;
    window.setTimeout(() => window.speechSynthesis.speak(utterance), 45);
  }

  function playKorean(text, rate = 1) {
    speakKorean(text, rate);
  }

  function playVocabKorean(text, speed = 1) {
    const effectiveRate = speed <= 0.5 ? 0.42 : speed <= 0.75 ? 0.62 : 1;
    speakKorean(text, effectiveRate);
  }

  function playSyllable(text) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text + "  " + text);
    utterance.lang = "ko-KR";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    const voice = getKoreanVoice();
    if (voice) utterance.voice = voice;
    window.setTimeout(() => window.speechSynthesis.speak(utterance), 45);
  }

  function playContrast(text) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text + ", " + text + ", " + text);
    utterance.lang = "ko-KR";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    const voice = getKoreanVoice();
    if (voice) utterance.voice = voice;
    window.setTimeout(() => window.speechSynthesis.speak(utterance), 45);
  }

  function playGrammarChunks(chunks) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const voice = getKoreanVoice();

    const speakAt = (index) => {
      if (index >= chunks.length) return;
      const utterance = new SpeechSynthesisUtterance(chunks[index] + ",");
      utterance.lang = "ko-KR";
      utterance.rate = 0.8;
      utterance.pitch = 1.02;
      utterance.volume = 0.98;
      if (voice) utterance.voice = voice;
      utterance.onend = () => window.setTimeout(() => speakAt(index + 1), 300);
      window.speechSynthesis.speak(utterance);
    };

    window.setTimeout(() => speakAt(0), 60);
  }
  function restoreScroll(targetView) {
    if (typeof window === "undefined") return;
    const top = viewScrollRef.current[targetView] || 0;
    const restore = () => window.scrollTo({ top, left: 0, behavior: "auto" });
    window.requestAnimationFrame(() => {
      restore();
      window.requestAnimationFrame(restore);
    });
    window.setTimeout(restore, 80);
  }

  // Keep an actual navigation trail. One previous-view ref sent learners back and
  // forth between unrelated rails when moving Home → Catalog → Lesson → Grammar.
  const viewTitles = {
    home: "Practice", companion: "Lesson catalog", lesson: "Lesson",
    vocab: "Word map", grammar: "Grammar", review: "Review",
    test: "Study check", testResult: "Test results",
    profile: "Progress", partner: "Real Korean",
  };

  function navigate(nextView) {
    if (nextView === view) return;
    if (typeof window !== "undefined") {
      viewScrollRef.current[view] = window.scrollY || document.documentElement.scrollTop || 0;
      if (view === "home") homeScrollRef.current = viewScrollRef.current.home;
      viewScrollRef.current[nextView] = 0;
    }
    navigationHistoryRef.current = [...navigationHistoryRef.current, view].slice(-30);
    setView(nextView);
    if (typeof window !== "undefined") window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }

  function goBack() {
    const trail = navigationHistoryRef.current;
    let target = trail.pop();
    while (target === view && trail.length) target = trail.pop();
    if (!target || target === view) target = "home";
    if (typeof window !== "undefined") {
      viewScrollRef.current[view] = window.scrollY || document.documentElement.scrollTop || 0;
    }
    setView(target);
    restoreScroll(target);
  }

  function returnHome() {
    if (typeof window !== "undefined" && view !== "home") {
      viewScrollRef.current[view] = window.scrollY || document.documentElement.scrollTop || 0;
    }
    navigationHistoryRef.current = [];
    setView("home");
    restoreScroll("home");
  }
  function normalizeKoreanAnswer(value = "") {
    return String(value)
      .normalize("NFC")
      .replace(/[\s.,!?~…"'“”‘’()\[\]{}:;·-]/g, "")
      .trim();
  }
  function dictationCorrect(step) {
    return normalizeKoreanAnswer(dictationInput) === normalizeKoreanAnswer(step.answer);
  }

  function buildPhrase(step) {
    return buildTokens.map((index) => step.tokens[index]).join(" ").replace(/\s+/g, " ").trim();
  }
  function buildCorrect(step) {
    return buildPhrase(step) === step.answer;
  }

  function LearnerSetup({ editing = false }) {
    const currentDraft = levelById(draftCurrentLevel);
    const availableTargets = learnerLevels.filter((level) => level.rank > currentDraft.rank);
    return (
      <div className="onboardingBackdrop">
        <section className="onboardingCard" role="dialog" aria-modal="true" aria-label="Set your Hallim level path">
          {editing && <button className="onboardingClose" onClick={() => setProfileEditorOpen(false)}>×</button>}
          <div className="onboardingBrand"><i>ㅎ</i><span><b>Hallim</b><small>한림</small></span></div>

          {onboardingStep === 1 && (
            <>
              <span className="eyebrow">Step 1 of 2 · Starting point</span>
              <h1>Where is your Korean right now?</h1>
              <p className="onboardingLead">Choose the closest level. Hallim uses this as your starting context, not as a permanent label.</p>
              <div className="levelChoiceList">
                {learnerLevels.slice(0,-1).map((level) => (
                  <button className={draftCurrentLevel === level.id ? "selected" : ""} key={level.id} onClick={() => chooseCurrentLevel(level.id)}>
                    <div><b>{level.label}</b><span>{level.topik}</span></div>
                    <p>{level.description}</p>
                  </button>
                ))}
              </div>
              <button className="primaryWide onboardingNext" onClick={() => setOnboardingStep(2)}>Choose my goal →</button>
            </>
          )}

          {onboardingStep === 2 && (
            <>
              <button className="stepBack" onClick={() => setOnboardingStep(1)}>← Starting level</button>
              <span className="eyebrow">Step 2 of 2 · Destination</span>
              <h1>How far do you want Hallim to take you?</h1>
              <p className="onboardingLead">Your path will connect <b>{currentDraft.label}</b> to the level you choose below.</p>
              <div className="levelChoiceList targetChoices">
                {availableTargets.map((level) => (
                  <button className={draftTargetLevel === level.id ? "selected" : ""} key={level.id} onClick={() => setDraftTargetLevel(level.id)}>
                    <div><b>{level.label}</b><span>{level.topik}</span></div>
                    <p>{level.canDo}</p>
                  </button>
                ))}
              </div>
              <div className="pathPreview">
                <small>Your Hallim route</small>
                <b>{currentDraft.label} → {levelById(draftTargetLevel).label}</b>
                <p>Hallim will use this profile to organize your curriculum, study context, tests, and future review progression.</p>
              </div>
              <button className="primaryWide onboardingNext" onClick={() => saveLearnerProfile()}>Build my Hallim path →</button>
            </>
          )}
        </section>
      </div>
    );
  }

  function HomeRail() {
    const routeLabels = {
      companion: "Continue lesson", vocab: "Open vocabulary", grammar: "Open grammar",
      test: "Start study check", review_queue: "Open review",
      adaptive_review: "Adaptive practice", checkpoint: "Open checkpoint",
    };
    return (
      <aside className="lesson-rail home-rail" aria-label="Today's study plan and curriculum">
        <header className="home-desk-intro">
          <span className="rail-kicker">YOUR LEARNING DESK</span>
          <h1>One step<br />at a time<span className="home-accent-dot">.</span></h1>
          <p>{activeLearningRoute.headline} · {activeLearningRoute.focus}</p>
        </header>
        <section className="rail-group rail-plan" aria-labelledby="rail-plan-title">
          <div className="rail-group-heading">
            <span className="rail-group-label">01 · TODAY'S PLAN</span>
            <h2 id="rail-plan-title">A clear route for today.</h2>
            <p>Small steps, real learning progress.</p>
          </div>
          <ol className="today-route">
            {activeLearningRoute.steps.slice(0, 3).map((step, index) => (
              <li key={step.kind + index} className={index === 0 ? "is-current" : ""}>
                <button onClick={() => launchLearningRouteStep(step.kind)} aria-label={(routeLabels[step.kind] || "Open practice") + ": " + step.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div className="route-task-copy">
                    <strong>{step.title}</strong>
                    <small>{step.why}</small>
                    <em>{routeLabels[step.kind] || "Open practice"} ↗</em>
                  </div>
                </button>
              </li>
            ))}
          </ol>
          <div className="home-session-checkpoint" aria-label={completedPathCount + " of " + pathLessons.length + " course lessons completed"}>
            <span className="home-session-orbit" style={{ "--completion": unitProgress + "%" }} aria-hidden="true"><i>한</i></span>
            <span className="home-session-copy"><small>YOUR LEARNING PATH</small><strong>{unitProgress}% complete</strong><span>{completedPathCount} of {pathLessons.length} lessons completed</span></span>
          </div>
        </section>
        <section className="rail-group rail-catalog" aria-labelledby="rail-catalog-title">
          <div className="rail-group-heading">
            <span className="rail-group-label">02 · YOUR CURRICULUM</span>
            <h2 id="rail-catalog-title">Keep the big picture.</h2>
            <p>One connected Korean learning path.</p>
          </div>
          <button className="curriculum-button rail-destination" onClick={() => navigate("companion")}>
            <span>Browse lesson catalog<small>{completedPathCount} of {pathLessons.length} completed</small>
              <span className="rail-catalog-track" role="progressbar" aria-label="Learning path completed" aria-valuemin={0} aria-valuemax={pathLessons.length} aria-valuenow={completedPathCount}><i style={{ width: unitProgress + "%" }} /></span>
            </span>
            <strong aria-hidden="true">↗</strong>
          </button>

        </section>
      </aside>
    );
  }

  function CatalogRail() {
    return (
      <aside className="lesson-rail catalog-rail" aria-label="Lesson catalog navigation">
        
        <header>
          <span className="rail-kicker">Your curriculum</span>
          <h1>Lesson catalog</h1>
          <p>Choose a unit, then choose a lesson. The daily study plan stays on the Practice home.</p>
        </header>
        <div className="rail-summary-card">
          <span className="rail-group-label">LEARNING PATH</span>
          <strong>{completedPathCount}/{pathLessons.length}</strong>
          <p>Lessons complete</p>
          <i><em style={{ width: unitProgress + "%" }} /></i>
        </div>
        <div className="rail-group">
          <div className="rail-group-heading">
            <span className="rail-group-label">PICK UP WHERE YOU LEFT OFF</span>
            <h2>{nextLesson.title}</h2>
            <p>Unit {nextLesson.unitNumber} · {nextLesson.subtitle}</p>
          </div>
          <button className="curriculum-button rail-destination" onClick={() => openLesson(nextLesson.id)}>
            <span>Continue this lesson</span><strong aria-hidden="true">↗</strong>
          </button>
        </div>
      </aside>
    );
  }

  function GuideRail() {
    return (
      <aside className="lesson-rail guide-rail" aria-label="Grammar field guide navigation">
        
        <header>
          <span className="rail-kicker">Korean field guide</span>
          <h1>Grammar, clearly.</h1>
          <p>Browse the active level's patterns, examples, and pronunciation without leaving the curriculum.</p>
        </header>
        <div className="rail-summary-card">
          <span className="rail-group-label">CURRENT STUDY PACK</span>
          <strong>{(activeStudy.grammar || []).length}</strong><p>{activeStudy.label} grammar patterns</p>
        </div>
        <button className="curriculum-button rail-destination" onClick={() => navigate("companion")}>
          <span>Open lesson catalog</span><strong aria-hidden="true">↗</strong>
        </button>
      </aside>
    );
  }

  function ProgressRail() {
    return (
      <aside className="lesson-rail progress-rail" aria-label="Progress navigation">
        
        <header>
          <span className="rail-kicker">Learning record</span>
          <h1>Your progress.</h1>
          <p>Progress and test insights live here; start lessons from Practice or the catalog.</p>
        </header>
        <div className="rail-summary-card">
          <span className="rail-group-label">COMPLETED LESSONS</span>
          <strong>{completedPathCount}/{pathLessons.length}</strong><p>Your current learning path</p>
          <i><em style={{ width: unitProgress + "%" }} /></i>
        </div>
        <button className="curriculum-button rail-destination" onClick={() => navigate("companion")}>
          <span>Browse lessons</span><strong aria-hidden="true">↗</strong>
        </button>
      </aside>
    );
  }

  function HomeMomentum() {
    const chapter = nextLessonUnit || pathUnits[0];
    const total = chapter?.lessons?.length || 1;
    const done = chapter?.lessons?.filter((lesson) => progress[lesson.id]?.completed).length || 0;
    const percent = Math.round((done / total) * 100);
    const currentIndex = Math.max(0, pathUnits.findIndex((unit) => unit.id === nextLessonUnit?.id));
    const routeStart = Math.max(0, Math.min(currentIndex - 1, pathUnits.length - 3));
    const visibleUnits = pathUnits.slice(routeStart, routeStart + 3);
    return (
      <section className="home-momentum rail-momentum" aria-labelledby="home-momentum-title">
        <div className="home-momentum-header">
          <div className="home-momentum-intro">
            <div className="rail-momentum-head">
              <span className="rail-group-label">03 · YOUR MOMENTUM</span>
              <span className="rail-momentum-spark" aria-hidden="true">↗</span>
            </div>
            <h2 id="home-momentum-title">One chapter closer.</h2>
            <p>A live view of your learning, based on completed Hallium lessons.</p>
          </div>
          <div className="home-momentum-path" aria-label={completedPathCount + " of " + pathLessons.length + " path lessons completed"}>
            <strong>{completedPathCount}<small> / {pathLessons.length}</small></strong>
            <span>PATH COMPLETED</span>
          </div>
        </div>
        <div className="home-momentum-grid">
          <div className="rail-momentum-chapter">
            <div className="rail-momentum-topline">
              <span>UNIT {chapter?.number || 1} · CURRENT CHAPTER</span>
              <strong>{done}<small> / {total}</small></strong>
            </div>
            <strong className="rail-momentum-chapter-name">{chapter?.title || "Your learning path"}</strong>
            <div className="rail-momentum-track" role="progressbar" aria-label="Current chapter lessons completed" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
              <i style={{ transform: "scaleX(" + (percent / 100) + ")" }} />
            </div>
            <div className="rail-momentum-markers" aria-hidden="true">
              {Array.from({ length: total }, (_, index) => <span key={index} className={index < done ? "is-done" : index === done ? "is-next" : ""} />)}
            </div>
            <span className="rail-momentum-counter">{Math.max(0, total - done)} chapter step{total - done === 1 ? "" : "s"} to go</span>
          </div>
          <div className="home-momentum-actions">
            <button className="rail-momentum-next" onClick={() => openLesson(nextLesson.id)}>
              <span>
                <small>UP NEXT · {nextLesson.type === "checkpoint" ? "CHECKPOINT" : "LESSON " + nextLesson.number}</small>
                <strong>{nextLesson.title}</strong>
                <em>Continue learning →</em>
              </span>
              <span className="rail-momentum-arrow" aria-hidden="true">↗</span>
            </button>
            <button className="rail-momentum-review" onClick={() => navigate(dueMistakes.length || reviewLessonCount ? "review" : "companion")}>
              <span>
                <strong>{dueMistakes.length ? dueMistakes.length + " due for review" : reviewLessonCount ? "Review what you've learned" : "Build your first lesson"}</strong>
                <small>{dueMistakes.length ? "Revisit the words or patterns you missed" : reviewLessonCount ? "Keep earlier lessons fresh" : "Start with a small win today"}</small>
              </span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="home-route-sequence home-momentum-route" aria-label="Current curriculum route">
            <span className="home-route-sequence-label">THE ROAD AHEAD <small>YOUR UNITS</small></span>
            {visibleUnits.map((unit) => {
              const count = unit.lessons.filter((lesson) => progress[lesson.id]?.completed).length;
              const active = unit.id === nextLessonUnit?.id;
              return (
                <button key={unit.id} className={"home-route-unit" + (active ? " is-active" : "")}
                  onClick={() => navigate("companion")} aria-label={"Browse unit " + unit.number + ": " + unit.title}>
                  <span className="home-route-number">{String(unit.number).padStart(2, "0")}</span>
                  <span className="home-route-unit-copy"><strong>{unit.title}</strong><small>{active ? "Your current unit" : count === unit.lessons.length ? "Completed" : "Explore this unit"}</small></span>
                  <span className="home-route-status">{count} / {unit.lessons.length}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  function StructuredStudy() {
    return (
        <section className="study-hub study-hub-wide">
          <div className="study-title">
            <div>
              <span className="section-label">Structured study</span>
              <h3>Study it directly, then test it.</h3>
            </div>
            <button onClick={() => navigate(reviewLessonCount || dueMistakes.length ? "review" : "companion")}>{reviewLabel} →</button>
          </div>
          <div className="study-cards">
            <a className="topik-from-zero-hub-card" href="/topik-from-zero" aria-label="Open the combined Korean to TOPIK beginner bridge"><span className="study-glyph topik">가</span><span><strong>Korean → TOPIK Bridge</strong><small>Starting from zero · 43 linked everyday + exam lessons</small></span><em>Start the combined path ↗</em></a>
            <a className="companion-hub-card" href="/?view=companion"><span className="study-glyph">말</span><span><strong>Korean Companion</strong><small>Everyday Korean · 15 units · keep your progress</small></span><em>Continue the real-life course ↗</em></a>
            <a className="topik-companion-hub-card" href="/topik-companion"><span className="study-glyph topik">시</span><span><strong>TOPIK Companion</strong><small>Already know the basics? 22 focused revision lessons</small></span><em>Prepare for the TOPIK exam ↗</em></a>
            <a className="flashcards-hub-card" href="/flashcards" aria-label="Open Hallium Starter Unit 1 illustrated flashcards">
              <span className="study-glyph flashcards">책</span>
              <span><strong>Starter Flashcards</strong><small>12 illustrated Korean words · audio · recall · review</small></span>
              <em>Explore the first collection ↗</em>
            </a>
            <a className="topik-hub-card" href="/topik-mocks" aria-label="Open Hallium TOPIK past-paper mock tests">
              <span className="study-glyph topik">◉</span>
              <span><strong>TOPIK Mock Tests</strong><small>19 source-linked past-paper practice sheets</small></span>
              <em>Choose TOPIK I or II ↗</em>
            </a>
            <a className="sp-hub-card" href="/study-partners" aria-label="Open Hallium Study Partners">
              <span className="study-glyph sp">✦</span>
              <span><strong>Study Partners</strong><small>Complementary matching · shared notes · mutual practice</small></span>
              <em>Learn with another person ↗</em>
            </a>
            <a className="hangul-hub-card" href="/hangul" aria-label="Open the separate Hallium Hangul Lab learning section">
              <span className="study-glyph hangul">ㅎ</span>
              <span><strong>Hangul Lab</strong><small>40 letters · syllables · pronunciation · handwriting</small></span>
              <em>Explore the alphabet ↗</em>
            </a>
            <button onClick={() => navigate("vocab")}>
              <span className="study-glyph">가</span>
              <span><strong>Vocabulary</strong><small>{(activeStudy.vocabulary || []).length} {activeStudy.label} words across {vocabDistricts.length} groups</small></span>
              <em>Open the word map →</em>
            </button>
            <button onClick={() => navigate("grammar")}>
              <span className="study-glyph grammar">문</span>
              <span><strong>Grammar</strong><small>{(activeStudy.grammar || []).length} {activeStudy.label} patterns with examples</small></span>
              <em>Open the field guide →</em>
            </button>
            <button onClick={startStudyTest}>
              <span className="study-glyph test">✓</span>
              <span><strong>Test</strong><small>{latestStudyPct == null ? "No evidence recorded yet" : "Last result " + latestStudyPct + "%"}</small></span>
              <em>Run the {activeStudy.label} check →</em>
            </button>
          </div>
        </section>
    );
  }

  function Home() {
    const lessonPct = Math.round(((progress[nextLesson.id]?.stepIndex || 0) / Math.max(nextLesson.steps.length - 1, 1)) * 100);
    const canDo = nextLesson.canDo || [];
    const spoken = nextLesson.steps
      .filter((step) => step.transcript || step.korean)
      .slice(0, 3)
      .map((step, index) => ({
        who: index % 2 === 0 ? "A" : "B",
        korean: String(step.transcript || step.korean).split("\n")[0],
        gloss: step.meaning || step.prompt || step.instruction || "",
      }));
    return (
      <div className="home-body">
        <div className="home-heading">
          <div>
            <span className="section-label">YOUR DAY, YOUR PACE</span>
            <h2>{greeting}<span className="home-accent-dot">.</span></h2>
            <p>From <strong>{currentLevel.label}</strong> toward <strong>{targetLevel.label}</strong>. A little Korean today becomes natural Korean tomorrow.</p>
          </div>
          <div className="daily-ring" style={{ "--daily": unitProgress + "%" }} aria-label={unitProgress + "% of your learning path completed"}>
            <strong>{unitProgress}%</strong><span>PATH</span>
          </div>
        </div>
        <article className="home-feature-lesson" aria-labelledby="home-feature-title">
          <div className="home-feature-kicker"><span><b aria-hidden="true">한</b> YOUR NEXT LESSON</span><span>UNIT {String(nextLesson.unitNumber).padStart(2, "0")} · {nextLesson.type === "checkpoint" ? "CHECKPOINT" : "LESSON " + String(nextLesson.number).padStart(2, "0")}</span></div>
          <div className="home-feature-title"><div><h3 id="home-feature-title">{nextLesson.title}</h3><p>{nextLesson.subtitle}</p></div><span className="home-feature-level">{activeStudy.label}</span></div>
          <div className="home-feature-progress">
            <div><span>Keep practicing, then finish the lesson</span><strong>{lessonPct}%</strong></div>
            <span className="home-feature-track" role="progressbar" aria-label="Current lesson progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={lessonPct}><i style={{ width: lessonPct + "%" }} /></span>
          </div>
          {spoken.length > 0 && (
            <section className="home-feature-dialogue" aria-label="Real Korean from your next lesson">
              <div className="home-feature-dialogue-title"><span>REAL KOREAN, IN CONTEXT</span><small>짧은 대화 · SHORT EXCHANGE</small></div>
              <div className="home-feature-lines">
                {spoken.map((line, index) => (
                  <div className={"home-feature-bubble" + (index % 2 ? " is-reply" : "")} key={line.korean + index}>
                    <span className="home-feature-speaker" aria-hidden="true">{line.who}</span>
                    <span className="home-feature-line-copy"><strong lang="ko">{line.korean}</strong><small>{line.gloss}</small></span>
                    <button type="button" className="home-feature-audio" aria-label={"Listen to " + line.korean}
                      onClick={() => playKorean(line.korean, 0.92)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9v6h4l5 4V5L9 9H5Z" /><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
          <div className="home-feature-bottom">
            <div className="home-feature-tip"><span aria-hidden="true">✦</span><span><strong>{canDo[0] ? "What you'll be able to do" : "Learn by doing"}</strong><small>{canDo[0] || "Listen, practice and build a Korean habit."}</small></span></div>
            <button onClick={() => openLesson(nextLesson.id)} className="home-feature-cta">{lessonPct ? "Continue your lesson" : "Start this lesson"} <span aria-hidden="true">↗</span></button>
          </div>
        </article>
        <section className="home-practice-bar" aria-label="Quick study actions">
          <div><span className="section-label">PRACTICE WITHOUT LEAVING YOUR PATH</span><h3>Try one small thing now.</h3><p>Explore real exercises; your study progress stays connected.</p></div>
          <div className="home-practice-actions">
            <button onClick={() => navigate("vocab")}>Vocabulary ↗</button>
            <button onClick={startStudyTest}>Study check ↗</button>
          </div>
        </section>
      </div>
    );
  }

  function Companion() {
    const bandLabels = [...new Set(pathUnits.map((u) => u.levelLabel))];
    return (
      <div className="curriculum-lab-body">
        <div className="lab-topline">
          <div>
            <span className="section-label">01 · KOREAN COMPANION · EVERYDAY KOREAN</span>
            <h2>Korean Companion. One connected route to real conversations.</h2>
          </div>

        </div>

        <div className="curriculum-summary">
          <strong>{pathLessons.length} lessons</strong>
          <span>{bandLabels.join(" → ") || currentLevel.label}</span>
          <i><em style={{ width: Math.max(2, unitProgress) + "%" }} /></i>
        </div>

        {targetLevel.rank > curriculumMaxRank && (
          <div className="inline-feedback is-visible success">
            Your goal reaches {targetLevel.label}. The published route currently runs through Lower Intermediate; higher bands will extend this same path.
          </div>
        )}

        {pathUnits.length !== units.length && (
          <div className="catalog-scope">
            <p>Showing the {pathLessons.length} lessons and checkpoints in your selected learning path.</p>
            <button onClick={() => setShowOtherLevels(value => !value)} aria-expanded={showOtherLevels}>
              {showOtherLevels ? "Show only my learning path" : "Explore other levels"} →
            </button>
          </div>
        )}

        <div className="unit-stack">
          {(showOtherLevels ? units : pathUnits).map((unit) => {
            const beforeStart = unit.levelRank < effectiveStartRank;
            const beyondGoal = unit.levelRank > effectiveTargetRank;
            const currentBand = unit.levelRank === effectiveStartRank && !beforeStart;
            const status = beforeStart ? "Review available" : beyondGoal ? "Beyond current goal" : currentBand ? "Current band" : "On your path";
            const doneCount = unit.lessons.filter((l) => progress[l.id]?.completed).length;
            const holdsCurrent = unit.lessons.some((l) => l.id === nextLesson.id);
            const expanded = expandedUnit === null ? holdsCurrent : expandedUnit === unit.id;

            return (
              <article
                className={"unit-row" + (expanded ? " unit-row-expanded" : "") + (holdsCurrent ? " is-current" : "") + (beyondGoal ? " is-beyond" : "")}
                key={unit.id}
              >
                <div className="unit-index">{unit.number}</div>
                <div>
                  <span>{unit.levelLabel} · {status}</span>
                  <h3>{unit.title}</h3>
                  <p>{unit.subtitle}</p>
                </div>
                <div className="unit-meta">
                  <strong>{unit.lessons.length} lessons</strong>
                  <small>{doneCount} complete</small>
                  <button onClick={() => setExpandedUnit(expanded ? "__none__" : unit.id)}>
                    {expanded ? "Hide lessons" : "Show lessons"}
                  </button>
                </div>

                {expanded && (
                  <div className="lesson-grid">
                    {unit.lessons.map((lesson) => {
                      const absoluteIndex = lessons.findIndex((item) => item.id === lesson.id);
                      const unlocked = isUnlocked(absoluteIndex);
                      const done = !!progress[lesson.id]?.completed;
                      const active = nextLesson.id === lesson.id && !done;
                      return (
                        <button
                          key={lesson.id}
                          className={"lesson-pick" + (done ? " is-complete" : "") + (active ? " is-current" : "") + (unlocked ? "" : " is-locked")}
                          disabled={!unlocked}
                          title={unlocked ? undefined : beyondGoal ? "Raise your goal to unlock" : "Complete the previous lesson first"}
                          onClick={() => openLesson(lesson.id)}
                        >
                          <span>{done ? "✓" : lesson.type === "checkpoint" ? "◆" : lesson.number}</span>
                          <span>
                            <strong>{lesson.title}</strong>
                            <small>{lesson.type === "checkpoint" ? "Unit checkpoint" : lesson.subtitle}</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  const SPEAKER_ICON = (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 9v6h4l5 4V5L9 9H5Z" />
      <path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11" />
    </svg>
  );

  // Hallim's nine step kinds, named with V4's stage vocabulary.
  const STAGE_NAMES = {
    word: ["Notice", "New word"],
    explain: ["Notice", "Pattern & meaning"],
    choice: ["Check", "Apply the pattern"],
    reading: ["Read", "Understand in context"],
    listening: ["Listen", "Hear the chunks"],
    shadowing: ["Speak", "Copy the rhythm"],
    dictation: ["Recall", "Without support"],
    build: ["Build", "Sentence lab"],
    finish: ["Complete", "Evidence"],
  };

  // The rail note and the lab headline both come from the step itself, so a
  // lesson with three word steps reads as three distinct stops, not three
  // copies of the same label.
  function stepNote(step) {
    if (step.kind === "word") return step.korean;
    if (step.kind === "explain") return step.title;
    if (step.kind === "shadowing") return "Repeat aloud";
    if (step.kind === "finish") return "Evidence";
    if (step.kind === "build") return "Sentence lab";
    return (STAGE_NAMES[step.kind] || ["", ""])[1];
  }

  function stepHeadline(step) {
    if (step.kind === "word") return "Meet the word before you use it.";
    if (step.kind === "explain") return step.title;
    if (step.kind === "shadowing") return "Copy the sound, rhythm and spacing.";
    if (step.kind === "finish") return currentLesson?.title;
    return step.prompt || currentLesson?.title;
  }

  function StepBody({ step }) {
    if (step.kind === "word") {
      return (
        <article className="sentence-canvas notice-canvas">
          <div className="prompt-row">
            <p><span>New word</span>{step.meaning}</p>
            <button className="icon-button" onClick={() => playKorean(step.korean)} aria-label={"Listen to " + step.korean}>
              {SPEAKER_ICON}
            </button>
          </div>
          <div className="korean-focus">
            <strong lang="ko">{step.korean}</strong>
            <span>{step.meaning}</span>
          </div>
          {step.note && <p className="pattern-copy" style={{ margin: "18px 28px 0", color: "var(--muted)" }}>{step.note}</p>}
          <div className="lab-actions">
            <button className="quiet-button" onClick={() => playKorean(step.korean, 0.72)}>Hear it slowly</button>
            <button className="check-button" onClick={advance}>I have this word</button>
          </div>
        </article>
      );
    }

    if (step.kind === "explain") {
      return (
        <>
          <article className="sentence-canvas notice-canvas">
            <div className="prompt-row">
              <p><span>Meaning</span>{step.body}</p>
              <button className="icon-button" onClick={() => playKorean(step.korean)} aria-label={"Listen to " + step.korean}>
                {SPEAKER_ICON}
              </button>
            </div>
            <div className="korean-focus">
              <strong lang="ko">{step.korean}</strong>
              <span>{step.title}</span>
            </div>
            {step.breakdown?.length > 0 && (
              <div className="role-ribbon">
                {step.breakdown.map(([piece, meaning]) => (
                  <button key={piece} onClick={() => playKorean(piece, 0.8)}>
                    <strong lang="ko">{piece}</strong>
                    <span>{meaning}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="lab-actions">
              <button className="quiet-button" onClick={() => playKorean(step.korean, 0.72)}>Hear it slowly</button>
              <button className="check-button" onClick={advance}>I see the pattern</button>
            </div>
          </article>
          <section className="pattern-strip">
            <div className="pattern-head">
              <span className="section-label">Pattern lens</span>
              <h3 lang="ko">{step.title}</h3>
            </div>
            <p className="pattern-copy">{step.body}</p>
          </section>
        </>
      );
    }

    if (step.kind === "listening") {
      return (
        <article className="sentence-canvas listening-canvas">
          <div className="listening-orb" aria-hidden="true"><i /><i /><i /><i /><i /></div>
          <h3>{step.prompt}</h3>
          <p>Play the line as many times as you need before answering.</p>
          <div className="listening-controls">
            <button className="primary-audio" onClick={() => playKorean(step.transcript, 0.92)}>{SPEAKER_ICON} Play Korean</button>
            <button className="quiet-audio" onClick={() => playKorean(step.transcript, 0.72)}>{SPEAKER_ICON} 0.72× slow</button>
          </div>
          <div className="listening-options">
            {step.options.map((option, index) => (
              <button
                key={option}
                disabled={checked}
                className={checked ? (index === step.answer ? "is-correct" : index === choiceIndex ? "is-wrong" : "") : choiceIndex === index ? "is-correct" : ""}
                onClick={() => setChoiceIndex(index)}
              >{option}</button>
            ))}
          </div>
          {checked && (
            <div className={"inline-feedback is-visible " + (choiceIndex === step.answer ? "success" : "error")}>
              <strong>{choiceIndex === step.answer ? "Correct." : "Not quite."}</strong> {step.explanation}
            </div>
          )}
          {revealed && <div className="inline-feedback is-visible success" lang="ko">{step.transcript}</div>}
          {checked && !revealed && (
            <div className="lab-actions">
              <button className="quiet-button" onClick={() => setRevealed(true)}>Reveal the Korean</button>
            </div>
          )}
        </article>
      );
    }

    if (step.kind === "shadowing") {
      return (
        <article className="sentence-canvas listening-canvas">
          <div className="listening-orb" aria-hidden="true"><i /><i /><i /><i /><i /></div>
          <h3>Copy the sound, rhythm and spacing.</h3>
          <p>{step.instruction}</p>
          <div className="listening-controls">
            <button className="primary-audio" onClick={() => playKorean(step.transcript, 0.92)}>{SPEAKER_ICON} Natural pace</button>
            <button className="quiet-audio" onClick={() => playKorean(step.transcript, 0.72)}>{SPEAKER_ICON} 0.72× slow</button>
          </div>
          {revealed ? (
            <div className="korean-focus" style={{ marginBottom: 20 }}>
              <strong lang="ko">{step.transcript}</strong>
              <span>Repeat until your timing matches the audio</span>
            </div>
          ) : (
            <div className="lab-actions">
              <button className="quiet-button" onClick={() => setRevealed(true)}>Reveal the Korean after listening</button>
            </div>
          )}
          <div className="inline-feedback is-visible success">
            Hallim is not scoring your pronunciation here. Repeat aloud until the rhythm feels close to the model audio.
          </div>
        </article>
      );
    }

    if (step.kind === "dictation") {
      const correct = dictationCorrect(step);
      return (
        <article className="sentence-canvas recall-canvas">
          <div className="listening-controls">
            <button className="primary-audio" onClick={() => playKorean(step.answer, 0.9)}>{SPEAKER_ICON} Play once</button>
            <button className="quiet-audio" onClick={() => playKorean(step.answer, 0.7)}>{SPEAKER_ICON} 0.7× slow</button>
          </div>
          <label className="recall-field">
            <span>{step.prompt}</span>
            <textarea
              lang="ko"
              value={dictationInput}
              onChange={(event) => setDictationInput(event.target.value)}
              placeholder="한국어로 입력하세요"
            />
            <small>Spacing and punctuation are forgiven; the Korean itself is not.</small>
          </label>
          {dictationChecked && (
            <div className={"inline-feedback is-visible " + (correct ? "success" : "error")}>
              <strong>{correct ? "Correct." : "Not yet."}</strong> {correct ? "That matches the line you heard." : "Target: " + step.answer}
            </div>
          )}
          <section className="pattern-strip recall-tip">
            <div className="pattern-head">
              <span className="section-label">Recall without support</span>
            </div>
            <p className="pattern-copy">Write what you heard before revealing anything. Retrieval is what moves a line into long-term memory.</p>
          </section>
        </article>
      );
    }

    if (step.kind === "reading") {
      return (
        <article className="sentence-canvas notice-canvas">
          <div className="prompt-row">
            <p><span>Read</span>{step.prompt}</p>
            <button className="icon-button" onClick={() => playKorean(step.korean.replace(/\n/g, " "), 0.9)} aria-label="Listen to the passage">
              {SPEAKER_ICON}
            </button>
          </div>
          <div className="korean-focus">
            {step.korean.split("\n").map((line) => <strong lang="ko" key={line} style={{ fontSize: "clamp(20px,2.4vw,30px)" }}>{line}</strong>)}
          </div>
          <div className="listening-options">
            {step.options.map((option, index) => (
              <button
                key={option}
                disabled={checked}
                className={checked ? (index === step.answer ? "is-correct" : index === choiceIndex ? "is-wrong" : "") : choiceIndex === index ? "is-correct" : ""}
                onClick={() => setChoiceIndex(index)}
              >{option}</button>
            ))}
          </div>
          {checked && (
            <div className={"inline-feedback is-visible " + (choiceIndex === step.answer ? "success" : "error")}>
              <strong>{choiceIndex === step.answer ? "Correct." : "Not quite."}</strong> {step.explanation}
            </div>
          )}
        </article>
      );
    }

    if (step.kind === "build") {
      const assembled = buildTokens.map((index) => step.tokens[index]);
      const correct = buildCorrect(step);
      return (
        <article className="sentence-canvas">
          <div className="prompt-row">
            <p><span>Build</span>{step.prompt}</p>
            <button className="icon-button" onClick={() => playKorean(step.answer, 0.9)} aria-label="Listen to the target sentence">
              {SPEAKER_ICON}
            </button>
          </div>

          <div className="answer-zone">
            <div className={"answer-track" + (checked ? (correct ? " is-correct" : " has-error") : "")}>
              {assembled.length === 0
                ? <span className="answer-placeholder">Tap the words below in Korean order</span>
                : assembled.map((token, position) => (
                    <button
                      key={token + position}
                      className={"answer-token" + (checked && !correct ? " is-wrong" : "")}
                      lang="ko"
                      onClick={() => !checked && setBuildTokens(buildTokens.filter((_, i) => i !== position))}
                    >{token}</button>
                  ))}
            </div>
            {buildTokens.length > 0 && !checked && (
              <button className="undo-button" onClick={() => setBuildTokens(buildTokens.slice(0, -1))} aria-label="Undo last word">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10H9" /></svg>
                Undo
              </button>
            )}
          </div>

          <div className={"word-bank" + (checked && correct ? " is-hidden" : "")}>
            {step.tokens.map((token, index) => (
              <button
                key={token + index}
                lang="ko"
                className={"word-chip" + (buildTokens.includes(index) ? " is-used" : "")}
                disabled={buildTokens.includes(index) || checked}
                onClick={() => setBuildTokens([...buildTokens, index])}
              >
                <span>{token}</span>
              </button>
            ))}
          </div>

          {checked && (
            <div className={"inline-feedback is-visible " + (correct ? "success" : "error")}>
              <strong>{correct ? "Correct." : "Try the order again."}</strong> {correct ? step.answer : "Target: " + step.answer}
            </div>
          )}
        </article>
      );
    }

    if (step.kind === "choice") {
      return (
        <article className="sentence-canvas review-card">
          <div className="review-kind">
            <span>{step.label || "Apply the pattern"}</span>
            <strong>Step {stepIndex + 1} of {currentLesson.steps.length}</strong>
          </div>
          <h3>{step.prompt}</h3>
          <div className="review-options">
            {step.options.map((option, index) => (
              <button
                key={option}
                disabled={checked}
                lang="ko"
                className={checked ? (index === step.answer ? "is-correct" : index === choiceIndex ? "is-wrong" : "") : choiceIndex === index ? "is-correct" : ""}
                onClick={() => setChoiceIndex(index)}
              >{option}</button>
            ))}
          </div>
          {checked && (
            <div className={"inline-feedback is-visible " + (choiceIndex === step.answer ? "success" : "error")}>
              <strong>{choiceIndex === step.answer ? "Correct." : "Not quite."}</strong> {step.explanation}
            </div>
          )}
        </article>
      );
    }

    if (step.kind === "finish") {
      const learned = currentLesson.steps.filter((item) => item.kind === "word").length;
      const practised = currentLesson.steps.filter((item) => ["choice", "build", "dictation", "reading", "listening"].includes(item.kind)).length;
      const followOn = pathLessons[pathLessons.findIndex((l) => l.id === currentLesson.id) + 1];
      return (
        <div className="lesson-complete-card">
          <div className="complete-mark">✓</div>
          <span className="section-label">{currentLesson.type === "checkpoint" ? "Unit checkpoint complete" : "Lesson complete"}</span>
          <h2>{currentLesson.title}</h2>
          <p>You can now <strong>{(step.canDo || []).join(", ")}</strong>.</p>

          <div className="evidence-grid">
            <div><strong>{learned}</strong><span>NEW WORDS</span></div>
            <div><strong>{practised}</strong><span>PRACTISED</span></div>
            <div><strong>{currentLesson.steps.length}</strong><span>STEPS</span></div>
          </div>

          {followOn && (
            <div className="completion-preview">
              <span>Up next</span>
              <strong>{followOn.title}</strong>
              <small>{followOn.subtitle}</small>
            </div>
          )}

          <div className="completion-actions">
            <button className="quiet-button" onClick={() => navigate("companion")}>Browse lesson catalog</button>
            <button className="check-button" onClick={completeLesson}>
              {currentLesson.type === "checkpoint" ? "Finish Unit " + currentLesson.unitNumber : "Complete lesson"} →
            </button>
          </div>
        </div>
      );
    }

    return null;
  }

  function Lesson() {
    if (!currentLesson || !currentStep) return null;
    const isChoice = ["choice", "listening", "reading"].includes(currentStep.kind);
    const isBuild = currentStep.kind === "build";
    const isDictation = currentStep.kind === "dictation";
    const isShadowing = currentStep.kind === "shadowing";
    const passed =
      (isChoice && checked && choiceIndex === currentStep.answer) ||
      (isBuild && checked && buildCorrect(currentStep)) ||
      (isDictation && dictationChecked && dictationCorrect(currentStep)) ||
      (isShadowing && shadowDone);
    const selfPaced = ["word", "explain"].includes(currentStep.kind);
    const [stageName] = STAGE_NAMES[currentStep.kind] || ["Practice", ""];

    return (
      <>
        <div className="lab-topline">
          <div>
            <span className="section-label">{stageName}</span>
            <h2>{stepHeadline(currentStep)}</h2>
          </div>
          <span className="lesson-count">Step {stepIndex + 1} of {currentLesson.steps.length}</span>
        </div>

        {currentStep.kind !== "finish" && (currentLesson.canDo || []).length > 0 && (
          <section className="lesson-goal">
            <div>
              <span className="section-label">Your outcome</span>
              <h3>By the end you can {(currentLesson.canDo || []).join(", ")}.</h3>
            </div>
            <span>Unit {currentLesson.unitNumber}</span>
          </section>
        )}

        <StepBody step={currentStep} />

        {currentStep.kind !== "finish" && !selfPaced && (
          <div className="lab-actions" style={{ border: 0, paddingInline: 0 }}>
            <button className="quiet-button" onClick={goBack}>Leave lesson</button>
            <div style={{ display: "flex", gap: 8 }}>
              {isChoice && !checked && (
                <button className="check-button" disabled={choiceIndex === null} onClick={() => setChecked(true)}>Check answer</button>
              )}
              {isChoice && checked && choiceIndex !== currentStep.answer && (
                <button className="quiet-button" onClick={() => { setChecked(false); setChoiceIndex(null); }}>Try again</button>
              )}
              {isBuild && !checked && (
                <button className="check-button" disabled={!buildTokens.length} onClick={() => setChecked(true)}>Check sentence</button>
              )}
              {isBuild && checked && !buildCorrect(currentStep) && (
                <button className="quiet-button" onClick={() => { setChecked(false); setBuildTokens([]); }}>Try again</button>
              )}
              {isDictation && !dictationChecked && (
                <button className="check-button" disabled={!dictationInput.trim()} onClick={() => setDictationChecked(true)}>Check dictation</button>
              )}
              {isDictation && dictationChecked && !dictationCorrect(currentStep) && (
                <button className="quiet-button" onClick={() => setDictationChecked(false)}>Try again</button>
              )}
              {isShadowing && !shadowDone && (
                <button className="check-button" onClick={() => setShadowDone(true)}>I repeated it aloud</button>
              )}
              {passed && (
                <button className="check-button is-correct" onClick={advance}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12 5 5L20 6" /></svg>
                  Continue
                </button>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  function WordCoach() {
    if (!activeWord) return <Coach />;
    const mastery = wordMastery(activeWord);
    return (
      <aside className="coach word-detail" aria-labelledby="wordTitle">
        <div className="coach-head">
          <div className="word-glyph" lang="ko">{activeWord.korean.slice(0, 1)}</div>
          <div>
            <span className="section-label">{activeWord.group}</span>
            <h2 id="wordTitle" lang="ko">{activeWord.korean}</h2>
          </div>
        </div>

        <p className="romanization">
          {activeWord.romanization}
          {activeWord.naturalPronunciation ? " · sounds like [" + activeWord.naturalPronunciation + "]" : ""}
        </p>
        <p className="word-meaning">{activeWord.meaning}</p>

        <button className="pronounce-word" onClick={() => playVocabKorean(activeWord.korean, 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9v6h4l5 4V5L9 9H5Z" /><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11" /></svg>
          Hear pronunciation
        </button>

        <div className="example-card">
          <span>In a sentence</span>
          <strong lang="ko">{activeWord.sentence}</strong>
          <button onClick={() => playKorean(activeWord.sentence, 0.9)}>Listen</button>
        </div>

        <div className="mastery-card">
          <div><span>Mastery</span><strong>{mastery}%</strong></div>
          <i><em style={{ width: mastery + "%" }} /></i>
          <button onClick={() => setSelectedVocab(activeWord)}>Open pronunciation card</button>
        </div>

        {relatedWords.length > 0 && (
          <div className="related-words">
            <span>Connected to</span>
            {relatedWords.map((word) => (
              <button key={word.korean} lang="ko" onClick={() => setFocusedWord(word)}>{word.korean}</button>
            ))}
          </div>
        )}
      </aside>
    );
  }

  function Vocabulary() {
    return (
      <section className="map-lab-body">
        <div className="lab-topline">
          <div>
            <span className="section-label">Your Korean world</span>
            <h2>Meaning lives between words.</h2>
          </div>
          <span className="lesson-count">{strongWords} strong {strongWords === 1 ? "word" : "words"}</span>
        </div>

        <div className="word-map-stage" aria-label="Interactive vocabulary map">
          {visibleDistricts.map((district) => (
            <section className={"map-district district-" + district.position} key={district.name}>
              <span>{district.name}</span>
              {district.words.map((word) => {
                const mastery = wordMastery(word);
                return (
                  <button
                    key={word.korean}
                    className={"map-node" + (activeWord?.korean === word.korean ? " is-focused" : "") + (mapMatches(word) ? "" : " is-dimmed")}
                    style={{ "--mastery": mastery + "%" }}
                    onClick={() => setFocusedWord(word)}
                  >
                    <strong lang="ko">{word.korean}</strong>
                    <small>{word.meaning}</small>
                  </button>
                );
              })}
            </section>
          ))}

          <svg className="map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M13 28 C30 14 35 24 48 38 S70 60 87 40" />
            <path d="M18 72 C36 55 50 75 78 68" />
            <path d="M25 25 C40 48 57 52 78 25" />
          </svg>
        </div>

        {selectedVocab && (
          <div className="vocabModalBackdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedVocab(null); }}>
            <section className="vocabDetailCard" role="dialog" aria-modal="true" aria-label={selectedVocab.korean + " pronunciation details"}>
              <button className="vocabModalClose" onClick={() => setSelectedVocab(null)}>×</button>
              <span className="eyebrow">Pronunciation card</span>
              <div className="vocabDetailTitle">
                <h2>{selectedVocab.korean}</h2>
                <div><b>{selectedVocab.romanization}</b><span>{selectedVocab.meaning}</span></div>
              </div>

              <div className="soundCue">
                <small>How it sounds</small>
                <strong>{selectedVocab.soundCue}</strong>
              </div>

              {selectedVocab.naturalPronunciation && (
                <div className="naturalPronunciation">
                  <small>Natural Korean pronunciation</small>
                  <strong>[{selectedVocab.naturalPronunciation}]</strong>
                  <span>This shows the sound change in Hangul. Romanization is only a learner guide.</span>
                </div>
              )}

              <div className="syllableStrip">
                <small>Syllable breakdown · tap to hear twice</small>
                <div>
                  {selectedVocab.syllables.map(([syllable, cue]) => (
                    <button key={syllable + cue} onClick={() => playSyllable(syllable)}>
                      <b>{syllable}</b><span>{cue}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="vocabPaceBlock">
                <small>Hear the word</small>
                <div className="wordAudioControls modalAudioControls">
                  <button type="button" onClick={() => playVocabKorean(selectedVocab.korean, 0.5)}>▶ 0.5×</button>
                  <button type="button" onClick={() => playVocabKorean(selectedVocab.korean, 0.75)}>▶ 0.75×</button>
                  <button type="button" onClick={() => playVocabKorean(selectedVocab.korean, 1)}>▶ 1×</button>
                </div>
              </div>

              <div className="sentenceAudioBlock">
                <small>Hear it in a sentence</small>
                <button onClick={() => playKorean(selectedVocab.sentence, 0.9)}>
                  <span>{selectedVocab.sentence}</span><b>▶ Sentence</b>
                </button>
              </div>

              <div className="ruleTags">
                <small>Sound rules</small>
                <div>
                  {selectedVocab.tags.map(([label,note]) => (
                    <button key={label} title={note}><b>{label}</b><span>{note}</span></button>
                  ))}
                </div>
              </div>

              {selectedVocab.contrast.length > 0 && (
                <div className="soundCompare">
                  <small>Compare nearby sounds · each plays 3×</small>
                  <div>
                    {selectedVocab.contrast.map(([sound,label]) => (
                      <button key={sound} onClick={() => playContrast(sound)}>
                        <b>{sound}</b><span>{label}</span><em>▶</em>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="commonMistake">
                <small>Common mistake</small>
                <p>{selectedVocab.mistake}</p>
              </div>

              <div className="pronunciationRules">
                <small>Pronunciation notes</small>
                <ul>
                  {selectedVocab.rules.map((rule) => <li key={rule}>{rule}</li>)}
                </ul>
              </div>
            </section>
          </div>
        )}
      </section>
    );
  }

  function Grammar() {
    return (
      <>
        <div className="lab-topline">
          <div>
            <span className="section-label">Korean field guide</span>
            <h2>Understand the patterns separately.</h2>
          </div>
          <span className="lesson-count">{activeStudy.grammar.length} patterns</span>
        </div>

        <p className="pattern-copy" style={{ margin: "0 0 20px", color: "var(--muted)", maxWidth: 680 }}>
          {activeStudy.label} grammar is taught cleanly here, without mixing it into vocabulary cards or survival scenes.
        </p>

        <div className="grammar-grid">
          {activeStudy.grammar.map((item, index) => (
            <article className="grammar-card" key={item.pattern}>
              <div>
                <span>GRAMMAR {String(index + 1).padStart(2, "0")}</span>
                <h3 lang="ko">{item.pattern}</h3>
                <p>{item.meaning}</p>
              </div>
              <button onClick={() => playGrammarChunks(item.spokenChunks)} aria-label={"Pronounce " + item.pattern}>
                {SPEAKER_ICON}
              </button>
              <strong lang="ko">{item.examples[0]}</strong>
              <p>{item.rule}</p>
              <button onClick={() => setSelectedGrammar(item)}>Open grammar card →</button>
            </article>
          ))}
        </div>

        {selectedGrammar && (
          <div className="vocabModalBackdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedGrammar(null); }}>
            <section className="vocabDetailCard grammarDetailCard" role="dialog" aria-modal="true" aria-label={selectedGrammar.pattern + " grammar details"}>
              <button className="vocabModalClose" onClick={() => setSelectedGrammar(null)}>×</button>
              <span className="eyebrow">Grammar card</span>

              <div className="grammarDetailTitle">
                <h2>{selectedGrammar.pattern}</h2>
                <b>{selectedGrammar.romanization}</b>
                <span>{selectedGrammar.meaning}</span>
              </div>

              <div className="grammarDetailAudio">
                <small>Pronunciation</small>
                <button onClick={() => playGrammarChunks(selectedGrammar.spokenChunks)}>▶ Hear grammar form</button>
              </div>

              <div className="grammarDetailSection">
                <small>How to use it</small>
                <p>{selectedGrammar.usage}</p>
              </div>

              <div className="ruleTags grammarTagRow">
                <small>Grammar tags</small>
                <div>{selectedGrammar.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              </div>

              <div className="commonMistake">
                <small>Common mistake</small>
                <p>{selectedGrammar.mistake}</p>
              </div>

              <div className="grammarDetailSection">
                <small>Rule</small>
                <p>{selectedGrammar.rule}</p>
              </div>

              <div className="grammarDetailExamples">
                <small>Examples</small>
                {selectedGrammar.examples.map((example) => (
                  <button key={example} onClick={() => playKorean(example, 0.9)}>
                    <span>{example}</span><b>▶</b>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </>
    );
  }

  function StudyTest() {
    const q = activeStudy.test[studyTestIndex];
    const isLast = studyTestIndex === activeStudy.test.length - 1;
    function nextQuestion() {
      const wasCorrect = studyTestChoice === q.answer;
      recordQuestionOutcome(q, "study_test", studyTestChoice, wasCorrect, activeStudy.id);
      const nextScore = studyScore + (wasCorrect ? 1 : 0);
      setMistakeExplanation(null);
      if (isLast) {
        setStudyScore(nextScore);
        const result = { levelId: activeStudy.id, score: nextScore, total: activeStudy.test.length, completedAt: new Date().toISOString() };
        const nextResults = [result, ...studyResults].slice(0, 12);
        setStudyResults(nextResults);
        localStorage.setItem(studyResultsKey, JSON.stringify(nextResults));
        trackLearningEvent("study_test_completed", null, {
          level_id: activeStudy.id,
          score: nextScore,
          total: activeStudy.test.length,
          percent: Math.round((nextScore / activeStudy.test.length) * 100),
        });
        setView("testResult");
        refreshDifficulty(result, nextResults);
      } else {
        if (wasCorrect) setStudyScore(nextScore);
        setStudyTestIndex((index) => index + 1);
        setStudyTestChoice(null);
        setStudyTestChecked(false);
      }
    }
    return (
      <>
        <div className="lab-topline">
          <div>
            <span className="section-label">{activeStudy.label} study test</span>
            <h2>Vocabulary and grammar, measured.</h2>
          </div>
          <span className="lesson-count">{studyTestIndex + 1} / {activeStudy.test.length}</span>
        </div>

        <div className="test-meter" style={{ marginBottom: 14 }}>
          <i style={{ width: ((studyTestIndex + 1) / activeStudy.test.length * 100) + "%" }} />
        </div>

        <article className="sentence-canvas test-card">
          <div className="test-sentence">
            <strong>{q.prompt}</strong>
            <button onClick={() => playKorean(q.options[q.answer], 0.9)}>{SPEAKER_ICON} Listen</button>
          </div>

          <div className="review-options" style={{ marginInline: 28 }}>
            {q.options.map((option, index) => (
              <button
                key={option}
                lang="ko"
                disabled={studyTestChecked}
                className={studyTestChecked ? (index === q.answer ? "is-correct" : index === studyTestChoice ? "is-wrong" : "") : studyTestChoice === index ? "is-correct" : ""}
                onClick={() => { setStudyTestChoice(index); setMistakeExplanation(null); }}
              >{option}</button>
            ))}
          </div>

          {studyTestChecked && (
            <div className={"inline-feedback is-visible " + (studyTestChoice === q.answer ? "success" : "error")}>
              <strong>{studyTestChoice === q.answer ? "Correct." : "Review this one."}</strong> {q.explanation}
            </div>
          )}

          {studyTestChecked && studyTestChoice !== q.answer && (
            <div className="inline-feedback is-visible error" style={{ background: "var(--indigo-soft)", color: "#423a92" }}>
              <button
                className="quiet-button"
                style={{ paddingInline: 0 }}
                disabled={aiBusy === "mistake_explain"}
                onClick={() => explainStudyMistake(q)}
              >
                {aiBusy === "mistake_explain" ? "Explaining…" : mistakeExplanation ? "Explain again" : "Explain my mistake with AI"}
              </button>
              {mistakeExplanation && (
                <div style={{ marginTop: 10 }}>
                  <strong>{mistakeExplanation.headline}</strong>
                  <p style={{ margin: "6px 0" }}>{mistakeExplanation.whyWrong}</p>
                  <p style={{ margin: "6px 0" }}><strong>Rule:</strong> {mistakeExplanation.correctRule}</p>
                  <p style={{ margin: "6px 0" }} lang="ko"><strong>Example:</strong> {mistakeExplanation.microExample}</p>
                </div>
              )}
            </div>
          )}

          <div className="lab-actions">
            <button className="quiet-button" onClick={goBack}>Leave test</button>
            {!studyTestChecked
              ? <button className="check-button" disabled={studyTestChoice === null} onClick={() => setStudyTestChecked(true)}>Check answer</button>
              : <button className="check-button is-correct" onClick={nextQuestion}>{isLast ? "Finish test" : "Next question"} →</button>}
          </div>
        </article>
      </>
    );
  }

  function StudyTestResult() {
    const pct = Math.round((studyScore / activeStudy.test.length) * 100);
    function reset(next) {
      setStudyScore(0); setStudyTestIndex(0); setStudyTestChoice(null); setStudyTestChecked(false);
      if (next === "home") returnHome(); else setView(next);
    }
    return (
      <div className="test-result">
        <div className="complete-mark">✓</div>
        <span className="section-label">{activeStudy.label} study test complete</span>
        <h2>{studyScore} / {activeStudy.test.length}</h2>
        <p>
          {pct}% on your {activeStudy.label} vocabulary and grammar pack. This test only covers material those
          study sections actually teach.
        </p>

        <div className="evidence-grid" style={{ margin: "28px 0 4px" }}>
          <div><strong>{pct}%</strong><span>THIS ATTEMPT</span></div>
          <div><strong>{bestStudyScore == null ? "—" : bestStudyScore + "/" + activeStudy.test.length}</strong><span>BEST SO FAR</span></div>
          <div><strong>{aiBusy === "difficulty" ? "…" : (aiDifficultyRecord?.result?.level || "Balanced")}</strong><span>NEXT DIFFICULTY</span></div>
        </div>

        {aiDifficultyRecord?.result?.reason && (
          <div className="completion-preview">
            <span>Why this difficulty</span>
            <strong>{aiDifficultyRecord.result.level}</strong>
            <small>{aiDifficultyRecord.result.reason}</small>
          </div>
        )}

        <div className="test-result-actions">
          <button className="quiet-button" onClick={() => reset("vocab")}>Review vocabulary</button>
          <button className="quiet-button" onClick={() => reset("grammar")}>Review grammar</button>
          <button className="check-button" onClick={() => reset("home")}>Back to today →</button>
        </div>
      </div>
    );
  }

  function IntelligenceQuiz() {
    if (!aiQuiz) return null;

    if (aiQuiz.finished) {
      return (
        <section className="intelligenceQuizPanel finishedAiQuiz">
          <button className="quizClose" onClick={closeAiQuiz}>×</button>
          <span className="eyebrow">{aiQuiz.type === "checkpoint" ? "AI checkpoint complete" : "Adaptive review complete"}</span>
          <h2>{aiQuiz.finalScore} / {aiQuiz.questions.length}</h2>
          <p>Your result has been fed back into Hallim's auto-difficulty engine.</p>
          <button className="primaryWide" onClick={closeAiQuiz}>Return to Profile</button>
        </section>
      );
    }

    const question = aiQuiz.questions[aiQuizIndex];
    const isLast = aiQuizIndex === aiQuiz.questions.length - 1;

    function nextAiQuestion() {
      const correct = aiQuizChoice === question.answer;
      recordQuestionOutcome(question, aiQuiz.type === "checkpoint" ? "ai_checkpoint" : "adaptive_review", aiQuizChoice, correct, activeStudy.id);
      const nextScore = aiQuizScore + (correct ? 1 : 0);
      if (isLast) {
        setAiQuizScore(nextScore);
        completeAiQuiz(nextScore);
        return;
      }
      if (correct) setAiQuizScore(nextScore);
      setAiQuizIndex((index) => index + 1);
      setAiQuizChoice(null);
      setAiQuizChecked(false);
    }

    return (
      <section className="intelligenceQuizPanel">
        <button className="quizClose" onClick={closeAiQuiz}>×</button>
        <div className="intelligenceQuizHead">
          <div>
            <span className="eyebrow">{aiQuiz.type === "checkpoint" ? "AI checkpoint" : "Adaptive review"}</span>
            <h2>{aiQuiz.title}</h2>
            {aiQuiz.reason && <p>{aiQuiz.reason}</p>}
          </div>
          <div><b>{aiQuiz.difficulty}</b><span>{aiQuizIndex + 1} / {aiQuiz.questions.length}</span></div>
        </div>
        <div className="thinProgress"><i style={{width: ((aiQuizIndex + 1) / aiQuiz.questions.length * 100) + "%"}} /></div>

        <article className="aiQuizQuestion">
          <small>{question.skill}</small>
          <h3>{question.prompt}</h3>
          <div className="choiceGrid">
            {question.options.map((option,index) => (
              <button
                disabled={aiQuizChecked}
                className={aiQuizChoice === index ? "selected" : ""}
                key={option + index}
                onClick={() => setAiQuizChoice(index)}
              >
                <b>{String.fromCharCode(65 + index)}</b><span>{option}</span>
              </button>
            ))}
          </div>
          {aiQuizChecked && (
            <div className={aiQuizChoice === question.answer ? "feedbackV2 goodV2" : "feedbackV2 badV2"}>
              <b>{aiQuizChoice === question.answer ? "Correct" : "Review this one"}</b>
              <p>{question.explanation}</p>
            </div>
          )}
          {!aiQuizChecked ? (
            <button className="primaryWide" disabled={aiQuizChoice === null} onClick={() => setAiQuizChecked(true)}>Check answer</button>
          ) : (
            <button className="primaryWide" onClick={nextAiQuestion}>{isLast ? "Finish" : "Next question"} →</button>
          )}
        </article>
      </section>
    );
  }

  function Profile() {
    return (
      <section className="profilePage">
        <button className="textBack" onClick={goBack}>← Back</button>

        <header className="profileHero">
          <div>
            <span className="eyebrow">Hallim Profile</span>
            <h1>Your Korean, measured.</h1>
            <p>Progress, results, level direction, and a compact audit of what to improve next.</p>
          </div>
          <div className="profileHeroActions">
            <button onClick={shareProgress}>Share progress</button>
            <button onClick={openProfileEditor}>Edit levels</button>
          </div>
        </header>

        <section className="accountSyncPanel">
          <div className="accountSyncHead">
            <div>
              <span className="eyebrow">Google account & sync</span>
              <h2>Your Hallim progress travels with you.</h2>
              <p>Hallim uses Google sign-in for learner access, then keeps your learning state private behind per-user Supabase RLS.</p>
            </div>
            <span className={"syncPill " + syncStatus}>
              {syncStatus === "synced" ? "Synced" : syncStatus === "saving" ? "Saving…" : syncStatus === "syncing" ? "Syncing…" : syncStatus === "error" ? "Needs attention" : "Preparing sync"}
            </span>
          </div>

          <div className="signedInAccount">
            <div>
              <small>Signed in with Google</small>
              <b>{authUser?.email || "Google account"}</b>
              <span>{lastSyncedAt ? "Last synced " + new Date(lastSyncedAt).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}) : "Preparing first sync"}</span>
            </div>
            <div>
              <button disabled={authBusy || syncStatus === "saving" || syncStatus === "syncing"} onClick={manualCloudSync}>Sync now</button>
              <button className="quietButton" disabled={authBusy} onClick={signOutHallim}>Sign out</button>
            </div>
          </div>

          {authError && <div className="accountNotice error">{authError}</div>}
          {authMessage && <div className="accountNotice">{authMessage}</div>}
          {referralCode && <div className="referralAttribution">Joined through ambassador code <b>{referralCode}</b></div>}
        </section>

        {shareMessage && <div className="shareNotice">{shareMessage}</div>}

        <div className="profileStats">
          <article>
            <small>Lessons complete</small>
            <b>{completedPathCount} / {pathLessons.length}</b>
            <span>{unitCompletionPct}% of your active path</span>
          </article>
          <article>
            <small>Latest test</small>
            <b>{latestStudyResult ? latestStudyResult.score + " / " + latestStudyResult.total : "—"}</b>
            <span>{latestStudyPct !== null ? latestStudyPct + "% accuracy" : "No result yet"}</span>
          </article>
          <article>
            <small>Best test</small>
            <b>{bestStudyScore !== null ? bestStudyScore + " / " + activeStudy.test.length : "—"}</b>
            <span>{activeStudyResults.length ? activeStudyResults.length + (activeStudyResults.length === 1 ? " attempt" : " attempts") : "Take your first test"}</span>
          </article>
          <article>
            <small>Study material</small>
            <b>{activeStudy.vocabulary.length} + {activeStudy.grammar.length}</b>
            <span>vocab words + grammar patterns</span>
          </article>
        </div>

        <section className="weaknessMemoryPanel">
          <div>
            <span className="eyebrow">Adaptive Learning V3</span>
            <h2>Hallim remembers the mistakes worth revisiting.</h2>
            <p>Wrong answers are stored as review evidence, then rescheduled with expanding intervals after successful recall.</p>
          </div>
          <div className="weaknessMemoryStats">
            <article><small>Due now</small><b>{dueMistakes.length}</b><span>scheduled weaknesses</span></article>
            <article><small>Remembered</small><b>{relevantMistakes.length}</b><span>question-level records</span></article>
          </div>
          {topWeakSkills.length > 0 && (
            <div className="weaknessMemorySkills">
              {topWeakSkills.map((item) => <span key={item.skill}><b>{item.skill}</b><small>priority {item.weight}</small></span>)}
            </div>
          )}
          <button onClick={() => navigate("review")}>{dueMistakes.length ? "Review due weaknesses →" : "Open review →"}</button>
        </section>

        <section className="profilePathPanel">
          <div className="learnerPathHead">
            <div>
              <span className="eyebrow">Your level path</span>
              <h2>{currentLevel.label} → {targetLevel.label}</h2>
              <p>{currentLevel.canDo}</p>
            </div>
            <button onClick={openProfileEditor}>Change goal</button>
          </div>
          <div className="levelRoadmap">
            {learnerLevels.map((level) => {
              const isCurrent = level.id === currentLevel.id;
              const isTarget = level.id === targetLevel.id;
              const inPath = level.rank >= currentLevel.rank && level.rank <= targetLevel.rank;
              return (
                <div className={(inPath ? "inPath " : "") + (isCurrent ? "currentLevel " : "") + (isTarget ? "targetLevel" : "")} key={level.id}>
                  <i>{level.rank + 1}</i>
                  <span>{level.short}</span>
                  <small>{isCurrent ? "You are here" : isTarget ? "Your goal" : level.topik}</small>
                </div>
              );
            })}
          </div>
        </section>

        <section className="auditPanel">
          <div className="auditHeading">
            <div>
              <span className="eyebrow">Korean learning audit</span>
              <h2>{aiAuditRecord?.audit?.summary || audit.verdict}</h2>
            </div>
            <div className="auditActions">
              <span className="auditBasis">{aiAuditRecord ? "Groq + Hallim data" : "Hallim baseline"}</span>
              <button disabled={aiAuditLoading} onClick={runAiAudit}>
                {aiAuditLoading ? "Auditing…" : aiAuditRecord ? "Refresh AI audit" : "Run AI audit"}
              </button>
            </div>
          </div>

          {!aiAuditRecord && (
            <div className="auditGrid">
              <article><small>Strength</small><p>{audit.strength}</p></article>
              <article><small>Focus</small><p>{audit.focus}</p></article>
              <article className="auditNext"><small>Improve next</small><p>{audit.next}</p></article>
            </div>
          )}

          {aiAuditError && <div className="aiAuditError">{aiAuditError}</div>}

          {aiAuditRecord?.audit && (
            <div className="aiAuditBody">
              <div className="aiAuditColumns">
                <article>
                  <small>Strengths</small>
                  <ul>{aiAuditRecord.audit.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
                <article>
                  <small>Weaknesses</small>
                  <ul>{aiAuditRecord.audit.weaknesses.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
                <article>
                  <small>Priorities</small>
                  <ul>{aiAuditRecord.audit.priorities.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
              </div>

              <div className="aiNextActions">
                <small>What to do next</small>
                <ol>{aiAuditRecord.audit.nextActions.map((item) => <li key={item}>{item}</li>)}</ol>
              </div>

              <div className="aiLevelAssessment">
                <div>
                  <small>Level assessment</small>
                  <b>{aiAuditRecord.audit.levelAssessment.status.replaceAll("_"," ")}</b>
                  <p>{aiAuditRecord.audit.levelAssessment.note}</p>
                </div>
                <span>
                  Updated {new Date(aiAuditRecord.generatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </section>

        <section className="intelligenceLab">
          <div className="intelligenceLabHead">
            <div>
              <span className="eyebrow">Hallim Intelligence</span>
              <h2>Personalized practice from your actual results.</h2>
              <p>These tools use your Hallim progress, test history, selected level path, and AI audit. They do not assume skills you have not demonstrated.</p>
            </div>
            <span className="intelligenceBadge">Hallim Intelligence · Groq</span>
          </div>

          {aiFeatureError && <div className="aiAuditError">{aiFeatureError}</div>}

          <div className="intelligenceTools">
            <article>
              <small>Personal route</small>
              <h3>{learningRouteRecord?.result?.focus || "Today's path"}</h3>
              <p>{learningRouteRecord?.result?.reason || "Turn your current results and audit into three concrete Hallim actions."}</p>
              <button disabled={!!aiBusy} onClick={() => generateLearningRoute()}>
                {aiBusy === "learning_route" ? "Building route…" : learningRouteRecord ? "Refresh route" : "Build route"}
              </button>
            </article>

            <article>
              <small>Auto difficulty</small>
              <h3>{aiDifficultyRecord?.result?.level || "Balanced"}</h3>
              <p>{aiDifficultyRecord?.result?.reason || "Hallim will recalibrate after a completed test or AI practice session."}</p>
              {aiDifficultyRecord?.result?.behavior && <span>{aiDifficultyRecord.result.behavior}</span>}
              <button disabled={!!aiBusy} onClick={() => refreshDifficulty()}>
                {aiBusy === "difficulty" ? "Recalibrating…" : "Recalibrate"}
              </button>
            </article>

            <article>
              <small>Adaptive review</small>
              <h3>Target weak material</h3>
              <p>Generate a fresh review using only vocabulary and grammar already present in your Hallim course.</p>
              <button disabled={!!aiBusy} onClick={() => generateIntelligenceQuiz("review")}>
                {aiBusy === "adaptive_review" ? "Building review…" : "Generate review"}
              </button>
            </article>

            <article>
              <small>Study plan</small>
              <h3>5–7 day route</h3>
              <p>Turn your audit, test scores, and target level into a short realistic study schedule.</p>
              <button disabled={!!aiBusy} onClick={generateStudyPlan}>
                {aiBusy === "study_plan" ? "Planning…" : studyPlanRecord ? "Refresh plan" : "Build study plan"}
              </button>
            </article>

            <article>
              <small>AI checkpoint</small>
              <h3>Fresh mastery check</h3>
              <p>Create a new checkpoint from material you have already studied instead of repeating the same fixed questions.</p>
              <button disabled={!!aiBusy} onClick={() => generateIntelligenceQuiz("checkpoint")}>
                {aiBusy === "checkpoint" ? "Building checkpoint…" : "Generate checkpoint"}
              </button>
            </article>

            <article>
              <small>Level promotion audit</small>
              <h3>{promotionRecord?.result?.status ? promotionRecord.result.status.replaceAll("_"," ") : "Check readiness"}</h3>
              <p>{promotionRecord?.result?.recommendation || "Hallim checks whether your evidence supports moving beyond your selected current level. It does not claim official TOPIK readiness."}</p>
              <button disabled={!!aiBusy} onClick={runPromotionCheck}>
                {aiBusy === "promotion" ? "Checking…" : promotionRecord ? "Check again" : "Check readiness"}
              </button>
            </article>
          </div>
        </section>

        {studyPlanRecord?.result && (
          <section className="studyPlanPanel">
            <div className="studyPlanHead">
              <div>
                <span className="eyebrow">Personal study plan</span>
                <h2>{studyPlanRecord.result.title}</h2>
                <p>{studyPlanRecord.result.summary}</p>
              </div>
              <small>{new Date(studyPlanRecord.generatedAt).toLocaleDateString()}</small>
            </div>
            <div className="studyPlanDays">
              {studyPlanRecord.result.days.map((day,index) => (
                <article key={day.day + index}>
                  <div><b>{day.day}</b><span>{day.minutes} min</span></div>
                  <h3>{day.focus}</h3>
                  <ul>{day.tasks.map((task) => <li key={task}>{task}</li>)}</ul>
                </article>
              ))}
            </div>
          </section>
        )}

        {promotionRecord?.result && (
          <section className="promotionPanel">
            <div className="promotionScore">
              <span>{promotionRecord.result.confidence}%</span>
              <small>evidence confidence</small>
            </div>
            <div className="promotionCopy">
              <span className="eyebrow">Level promotion audit</span>
              <h2>{promotionRecord.result.status.replaceAll("_"," ")}</h2>
              <p>{promotionRecord.result.recommendation}</p>
              <div className="promotionLists">
                <article><small>Evidence</small><ul>{promotionRecord.result.evidence.map((item) => <li key={item}>{item}</li>)}</ul></article>
                <article><small>Gaps</small><ul>{promotionRecord.result.gaps.map((item) => <li key={item}>{item}</li>)}</ul></article>
              </div>
            </div>
          </section>
        )}

        {aiQuiz && <IntelligenceQuiz />}

        {activeStudyResults.length > 0 && (
          <section className="resultHistory">
            <div><span className="eyebrow">Recent results</span><h2>Study test history</h2></div>
            <div className="resultHistoryList">
              {activeStudyResults.slice(0,5).map((result,index) => (
                <article key={result.completedAt + index}>
                  <b>{result.score} / {result.total}</b>
                  <span>{Math.round((result.score / result.total) * 100)}%</span>
                  <small>{new Date(result.completedAt).toLocaleDateString()}</small>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    );
  }

  function Review() {
    const mastered = relevantMistakes.filter((item) => Number(item.successfulReviews || 0) > 0);
    const queue = reviewFilter === "mastered" ? mastered : reviewFilter === "mistakes" ? relevantMistakes : dueMistakes;
    const due = queue[0] || null;
    const reviewCorrect = !!due && mistakeReviewChoice === due.answer;
    const reviewed = lessons.filter((lesson) => progress[lesson.id]?.completed).slice(-4);

    if (reviewFilter === "mastered") {
      return (
        <>
          <div className="lab-topline">
            <div>
              <span className="section-label">Recovered items</span>
              <h2>Weaknesses you have turned around.</h2>
            </div>
            <span className="lesson-count">{mastered.length} recovered</span>
          </div>
          {mastered.length === 0 ? (
            <div className="review-empty">
              <div className="complete-mark">✓</div>
              <h3>Nothing recovered yet.</h3>
              <p>When you answer a remembered mistake correctly, Hallim pushes its interval out and it appears here.</p>
            </div>
          ) : (
            mastered.map((item) => (
              <div className="mastered-answer" key={item.id}>
                <span>{item.skill || "Review item"} · recovered {item.successfulReviews}×</span>
                <strong lang="ko">{(item.options || [])[item.answer]}</strong>
                <p>{item.prompt}</p>
              </div>
            ))
          )}
        </>
      );
    }

    if (!due) {
      return (
        <>
          <div className="lab-topline">
            <div>
              <span className="section-label">Focused session</span>
              <h2>Repair one weak link at a time.</h2>
            </div>
            <span className="lesson-count">0 due</span>
          </div>
          <div className="review-empty">
            <div className="complete-mark">✓</div>
            <h3>{relevantMistakes.length ? "Nothing is due right now." : "No weaknesses recorded yet."}</h3>
            <p>
              {relevantMistakes.length
                ? "Hallim brings remembered mistakes back when their next interval arrives. Keep moving through the path in the meantime."
                : "Complete a lesson or a study test first. Hallim builds review only from questions you have actually answered."}
            </p>
            <button className="check-button" onClick={() => openLesson(nextLesson.id)}>Continue {nextLesson.title} →</button>
          </div>

          {reviewed.length > 0 && (
            <section className="lesson-materials">
              <div className="material-heading">
                <div>
                  <span className="section-label">Revisit a completed lesson</span>
                  <h3>Lessons you have finished</h3>
                </div>
                <small>Reopening a lesson never resets its progress</small>
              </div>
              <div className="lesson-grid" style={{ gridColumn: "auto", marginTop: 16 }}>
                {reviewed.map((lesson) => (
                  <button className="lesson-pick is-complete" key={lesson.id} onClick={() => openLesson(lesson.id)}>
                    <span>✓</span>
                    <span><strong>{lesson.title}</strong><small>Unit {lesson.unitNumber} · Lesson {lesson.number}</small></span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      );
    }

    return (
      <>
        <div className="lab-topline">
          <div>
            <span className="section-label">Focused session</span>
            <h2>Repair one weak link at a time.</h2>
          </div>
          <span className="lesson-count">{queue.length} in queue</span>
        </div>

        <article className="sentence-canvas review-card">
          <div className="review-kind">
            <span>{due.skill || "Review item"}</span>
            <strong>Missed {due.misses || 1}× · last seen {new Date(due.lastSeenAt || due.createdAt).toLocaleDateString()}</strong>
          </div>
          <h3>{due.prompt}</h3>
          <div className="review-options">
            {(due.options || []).map((option, index) => (
              <button
                key={option + index}
                lang="ko"
                disabled={mistakeReviewChecked}
                className={mistakeReviewChecked ? (index === due.answer ? "is-correct" : index === mistakeReviewChoice ? "is-wrong" : "") : mistakeReviewChoice === index ? "is-correct" : ""}
                onClick={() => setMistakeReviewChoice(index)}
              >{option}</button>
            ))}
          </div>

          {mistakeReviewChecked && (
            <div className={"inline-feedback is-visible " + (reviewCorrect ? "success" : "error")}>
              <strong>{reviewCorrect ? "Recovered." : "Still needs reinforcement."}</strong>{" "}
              {due.explanation || (reviewCorrect ? "Hallim will push the review interval out." : "This item returns tomorrow.")}
            </div>
          )}

          <div className="lab-actions">
            <button className="quiet-button" onClick={goBack}>Leave review</button>
            {!mistakeReviewChecked ? (
              <button className="check-button" disabled={mistakeReviewChoice === null} onClick={() => setMistakeReviewChecked(true)}>Check recall</button>
            ) : (
              <button className="check-button" onClick={() => scheduleMistakeReview(due, mistakeReviewChoice, reviewCorrect)}>
                {reviewCorrect ? "Schedule farther out" : "Review again tomorrow"} →
              </button>
            )}
          </div>
        </article>

        {mistakeReviewChecked && !reviewCorrect && (
          <article className="sentence-canvas shift-canvas">
            <div className="shift-before">
              <span>WHAT YOU CHOSE</span>
              <strong lang="ko">{(due.options || [])[mistakeReviewChoice]}</strong>
              <small>{due.skill ? due.skill + " — this is the link that keeps breaking." : "This is the link that keeps breaking."}</small>
            </div>
            <div className="shift-bridge">
              <i />
              <span>shift the meaning</span>
              <i />
            </div>
            <div className="shift-target">
              <span>WHAT KOREAN NEEDS</span>
              <h3 lang="ko">{(due.options || [])[due.answer]}</h3>
              <p>{due.explanation || "Compare the two forms aloud before moving on."}</p>
            </div>
            <div className="lab-actions">
              <button className="quiet-button" onClick={() => playKorean((due.options || [])[mistakeReviewChoice], 0.85)}>Hear yours</button>
              <button className="check-button" onClick={() => playKorean((due.options || [])[due.answer], 0.85)}>Hear the correct form</button>
            </div>
          </article>
        )}
      </>
    );
  }

  function googleGateHref(destination = "/") {
    let next = destination;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const requestedLesson = params.get("lesson");
      // A bridge newcomer must return to their specific lesson after Google sign-in.
      if (destination === "/?view=companion" && params.get("view") === "lesson" &&
          requestedLesson && lessons.some(item => item.id === requestedLesson)) {
        next = "/?view=lesson&lesson=" + encodeURIComponent(requestedLesson);
      }
      const incomingRef = params.get("ref") || referralCode || "";
      if (/^[A-Za-z0-9_-]{2,48}$/.test(incomingRef)) {
        const url = new URL(next, window.location.origin);
        url.searchParams.set("ref", incomingRef);
        next = url.pathname + url.search;
      }
    }
    return "/auth/google?next=" + encodeURIComponent(next);
  }

  if (!authReady) {
    return (
      <main className="staticHallimGate staticGateLoading">
        <div className="staticLoadingMark">ㅎ</div>
        <span>Checking Hallim access…</span>
      </main>
    );
  }

  if (!authUser) {
    return <StaticHallimGate authHref={googleGateHref} authError={authError} />;
  }

  const learnerInitials = (() => {
    const source = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || authUser?.email || "Hallim";
    const parts = String(source).replace(/@.*$/, "").split(/[^A-Za-z0-9]+/).filter(Boolean);
    if (!parts.length) return "HL";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  })();

  const practiceViews = ["home", "companion", "lesson", "test", "testResult", "profile", "grammar"];
  const topView = view === "vocab" ? "words" : view === "review" ? "review" : "practice";

  const signalRows = [
    { label: "Path", score: unitProgress, note: unitProgress >= 70 ? "steady" : unitProgress >= 35 ? "growing" : "training" },
    { label: "Study test", score: latestStudyPct == null ? 0 : latestStudyPct, note: latestStudyPct == null ? "untested" : latestStudyPct + "%" },
    { label: "Retention", score: Math.max(0, 100 - Math.min(dueMistakes.length * 10, 100)), note: dueMistakes.length ? dueMistakes.length + " due" : "clear" },
    { label: "Lessons", score: Math.round((completedCount / Math.max(lessons.length, 1)) * 100), note: completedCount + "/" + lessons.length },
  ];

  function PracticeRail() {
    const inLesson = view === "lesson" && currentLesson;
    const railUnit = currentLessonUnit || nextLessonUnit;
    const railLesson = currentLesson || nextLesson;

    // During a lesson the rail is the lesson's own path, exactly as in V4.
    const entries = inLesson
      ? currentLesson.steps.map((step, index) => {
          const [name] = STAGE_NAMES[step.kind] || ["Practice", ""];
          return {
            key: step.kind + index,
            title: name,
            note: stepNote(step),
            done: index < stepIndex,
            active: index === stepIndex,
            reachable: index <= stepIndex,
            go: () => index <= stepIndex && setStepIndex(index),
            label: index + 1,
          };
        })
      : (railUnit?.lessons || []).map((lesson, index) => ({
          key: lesson.id,
          title: lesson.title,
          note: lesson.type === "checkpoint" ? "Checkpoint" : lesson.subtitle,
          done: !!progress[lesson.id]?.completed,
          active: lesson.id === railLesson?.id,
          reachable: true,
          go: () => openLesson(lesson.id),
          label: index + 1,
        }));

    return (
      <aside className="lesson-rail" aria-label={inLesson ? "Lesson path" : "Current learning path"}>
        <header>
          <span className="rail-kicker">Unit {railUnit?.number} · {railUnit?.levelLabel}</span>
          <h1>{inLesson ? currentLesson.title : railUnit?.title}</h1>
          <p>
            <strong className="current-lesson">
              {inLesson
                ? (currentLesson.type === "checkpoint" ? "Checkpoint" : "Lesson " + currentLesson.number)
                : railLesson?.number + ". " + railLesson?.title}
            </strong>
            {inLesson ? currentLesson.subtitle : railUnit?.subtitle}
          </p>
        </header>

        <ol className="path-list">
          {entries.map((entry) => (
            <li key={entry.key} className={(entry.done ? "is-done" : "") + (entry.active ? " is-active" : "")}>
              <button
                onClick={entry.go}
                disabled={!entry.reachable}
                aria-current={entry.active ? "step" : undefined}
              >
                <span className="path-number">{entry.done ? "✓" : entry.label}</span>
                <span>
                  <strong>{entry.title}</strong>
                  <small>{entry.note}</small>
                </span>
              </button>
            </li>
          ))}
        </ol>

        {!inLesson && (
          <button className="curriculum-button" onClick={() => navigate("companion")}>
            <span>Browse all {pathLessons.length} lessons</span>
            <strong>{completedPathCount}/{pathLessons.length}</strong>
          </button>
        )}

        {!inLesson && (
          <button className="field-guide-button" onClick={() => navigate("grammar")}>
            <span>Korean field guide</span>
            <small>grammar patterns · examples · audio</small>
          </button>
        )}

        {!inLesson && (
          <button className="field-guide-button test-launch" onClick={startStudyTest}>
            <span>{activeStudy.label} check</span>
            <small>vocabulary · grammar · evidence</small>
          </button>
        )}

        <div className="rail-insight">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3a7 7 0 0 0-4 12.74V19h8v-3.26A7 7 0 0 0 12 3Z" />
            <path d="M9 22h6M9 11h6" />
          </svg>
          <p><strong>Your pattern</strong>{activeLearningRoute.focus} is today&rsquo;s best focus.</p>
        </div>
      </aside>
    );
  }

  function PartnerRail() {
    return (
      <aside className="lesson-rail partner-rail" aria-label="Real Korean learning">
        <header>
          <span className="rail-kicker">Real Korean</span>
          <h1>Meaning between people.</h1>
          <p>Learn everyday messages in context, then compare casual and polite Korean.</p>
        </header>
        <button className="curriculum-button" onClick={() => navigate("companion")}>
          <span>Return to your learning path</span><strong>↗</strong>
        </button>
        <div className="rail-insight">
          <p><strong>Register matters</strong>반말 fits close friends. Use -요 or honorific expressions where respect is needed.</p>
        </div>
      </aside>
    );
  }

  function WordRail() {
    return (
      <aside className="lesson-rail word-rail" aria-label="Vocabulary map">
        <header>
          <span className="rail-kicker">Connected vocabulary</span>
          <h1>Word map</h1>
          <p>Explore {activeStudy.label} words by meaning, not alphabetical lists.</p>
        </header>

        <label className="map-search">
          <span>Find a word</span>
          <input
            type="search"
            placeholder="Korean, romanization or English"
            value={mapQuery}
            onChange={(event) => setMapQuery(event.target.value)}
          />
        </label>

        <div className="district-list">
          <button
            className={activeDistrict === "all" ? "is-active" : ""}
            onClick={() => setActiveDistrict("all")}
          >
            All groups <strong>{(activeStudy.vocabulary || []).length}</strong>
          </button>
          {vocabDistricts.map((district) => (
            <button
              key={district.name}
              className={activeDistrict === district.name ? "is-active" : ""}
              onClick={() => setActiveDistrict(district.name)}
            >
              {district.name}<strong>{district.words.length}</strong>
            </button>
          ))}
        </div>

        <div className="rail-insight">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="7" cy="7" r="3" /><circle cx="17" cy="17" r="3" /><path d="m9 9 6 6" />
          </svg>
          <p><strong>How it works</strong>Words sit in the group they are taught in. The bar is mastery from your lessons and review.</p>
        </div>
      </aside>
    );
  }

  function TestRail() {
    const total = activeStudy.test.length;
    const atResult = view === "testResult";
    return (
      <aside className="lesson-rail" aria-label="Study test progress">
        <header>
          <span className="rail-kicker">{activeStudy.label} check</span>
          <h1>Evidence before adaptation</h1>
          <p>
            <strong className="current-lesson">{atResult ? "Complete" : "Question " + (studyTestIndex + 1) + " of " + total}</strong>
            Vocabulary and grammar this pack has actually taught.
          </p>
        </header>

        <ol className="test-steps">
          {activeStudy.test.map((item, index) => (
            <li key={index} className={atResult || index < studyTestIndex ? "is-done" : index === studyTestIndex ? "is-active" : ""}>
              <span>{atResult || index < studyTestIndex ? "✓" : index + 1}</span>
              <div>
                <strong>Question {index + 1}</strong>
                <small>{item.skill || "Vocabulary + grammar"}</small>
              </div>
            </li>
          ))}
        </ol>

        <div className="rail-insight">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3a7 7 0 0 0-4 12.74V19h8v-3.26A7 7 0 0 0 12 3Z" />
            <path d="M9 22h6M9 11h6" />
          </svg>
          <p><strong>Why this matters</strong>Hallim only adapts difficulty from results you have actually produced.</p>
        </div>
      </aside>
    );
  }

  function ReviewRail() {
    const masteredCount = relevantMistakes.filter((item) => Number(item.successfulReviews || 0) > 0).length;
    const filters = [
      { id: "due", label: "Due now", count: dueMistakes.length },
      { id: "mistakes", label: "All mistakes", count: relevantMistakes.length },
      { id: "mastered", label: "Recovered", count: masteredCount },
    ];
    return (
      <aside className="lesson-rail review-rail" aria-label="Adaptive review">
        <header>
          <span className="rail-kicker">Adaptive review</span>
          <h1>{reviewLabel}</h1>
          <p>Short practice built from the exact questions that need another look.</p>
        </header>

        <div className="review-filters">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={reviewFilter === filter.id ? "is-active" : ""}
              onClick={() => { setReviewFilter(filter.id); setMistakeReviewChoice(null); setMistakeReviewChecked(false); }}
            >
              {filter.label} <strong>{filter.count}</strong>
            </button>
          ))}
        </div>

        {topWeakSkills.length > 0 && (
          <div className="signal-card" style={{ marginTop: 24, paddingTop: 22 }}>
            <div className="signal-title"><h3>Weakness memory</h3><span>by weight</span></div>
            {topWeakSkills.map((item) => (
              <div className="signal-row" key={item.skill}>
                <span>{item.skill}</span>
                <div><i style={{ "--score": Math.min(100, item.weight * 20) + "%" }} /></div>
                <strong>{item.weight}</strong>
              </div>
            ))}
          </div>
        )}

        <div className="rail-insight">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.7M4 4v4.7h4.7" />
          </svg>
          <p><strong>Review logic</strong>Missed ideas return sooner; confident answers push the interval out.</p>
        </div>
      </aside>
    );
  }

  function Coach({ variant = "" }) {
    return (
      <aside className={"coach " + variant} aria-labelledby="coach-title">
        <div className="coach-head">
          <div className="coach-orb" aria-hidden="true"><span /><span /><span /></div>
          <div>
            <span className="section-label">{variant === "home-coach" ? "04 · ADAPTIVE COACH" : "Adaptive coach"}</span>
            <h2 id="coach-title">Reading your pattern</h2>
          </div>
        </div>

        <div className="coach-note">
          <p className="coach-lead">{activeLearningRoute.reason}</p>
          <button
            className="why-button"
            disabled={aiBusy === "learning_route"}
            onClick={() => generateLearningRoute()}
          >
            {aiBusy === "learning_route" ? "Personalizing…" : learningRouteRecord ? "Refresh route" : "Personalize route"}
          </button>
          {aiFeatureError && (
            <div className="why-panel">
              {/AI_API|GROQ_API_KEY|Grok_API|not configured/i.test(aiFeatureError)
                ? "Adaptive routing is unavailable right now. Your lessons, review and progress are unaffected."
                : aiFeatureError}
            </div>
          )}
        </div>

        <div className="signal-card">
          <div className="signal-title">
            <h3>Your live signals</h3>
            <span>{syncStatus === "synced" ? "synced" : "saved locally"}</span>
          </div>
          {signalRows.map((row) => (
            <div className="signal-row" key={row.label}>
              <span>{row.label}</span>
              <div><i style={{ "--score": Math.max(2, Math.min(row.score, 100)) + "%" }} /></div>
              <strong>{row.note}</strong>
            </div>
          ))}
        </div>

        <div className="next-card">
          <span className="section-label">Current focus</span>
          <p><strong>{activeLearningRoute.focus}</strong><br />{activeLearningRoute.steps[0]?.title}</p>
          <button onClick={() => launchLearningRouteStep(activeLearningRoute.steps[0]?.kind)}>
            {activeLearningRoute.steps[0]?.title || "Continue"}
          </button>
        </div>
      </aside>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={returnHome} aria-label="Hallim home">
          <span className="brand-mark" aria-hidden="true">ㅎ</span>
          <span><strong>Hallim</strong><small>한림 · Structured Korean</small></span>
        </button>

        <nav className="primary-nav" aria-label="Primary navigation">
          <button
            className={"nav-tab" + (["home", "lesson", "test", "testResult"].includes(view) ? " is-active" : "")}
            aria-current={["home", "lesson", "test", "testResult"].includes(view) ? "page" : undefined}
            onClick={returnHome}
          >Practice</button>
          <button
            className={"nav-tab" + (view === "companion" ? " is-active" : "")}
            aria-current={view === "companion" ? "page" : undefined}
            onClick={() => navigate("companion")}
          >Korean Companion</button>
          <a className="nav-tab hangul-nav-tab" href="/hangul">Hangul Lab</a>
          <a className="nav-tab flashcards-main-nav-link" href="/flashcards">Flashcards</a>
          <a className="nav-tab topik-companion-nav-link" href="/topik-companion">TOPIK Companion</a>
          <a className="nav-tab sp-main-nav-link" href="/study-partners">Study Partners</a>
          <button
            className={"nav-tab" + (topView === "words" ? " is-active" : "")}
            aria-current={topView === "words" ? "page" : undefined}
            onClick={() => navigate("vocab")}
          >Word map</button>
          <button
            className={"nav-tab" + (topView === "review" ? " is-active" : "")}
            aria-current={topView === "review" ? "page" : undefined}
            onClick={() => navigate("review")}
          >Review</button>
        </nav>

        <div className="top-actions">
          <button className="lesson-count partner-v4-shortcut partner-top-link" onClick={() => navigate("partner")}>Real Korean ♡</button>
          <a className="lesson-count partnerLink" href="/ambassadors">Ambassadors</a>
          <button className="streak" onClick={() => navigate("profile")} aria-label="Learning progress">
            <span>{completedCount}</span><small>lessons done</small>
          </button>
          <button className="profile-button" onClick={() => navigate("profile")} aria-label="Open learner progress">
            {learnerInitials}
          </button>
        </div>
      </header>

      {notice && (
        <button className="toast is-visible" onClick={() => setNotice("")}>{notice}</button>
      )}
      {profileLoaded && !learnerProfile && <LearnerSetup />}
      {profileEditorOpen && <LearnerSetup editing />}

      <main id="workspace" className={"workspace view-" + topView + (view === "home" ? " workspace-home" : "")} tabIndex={-1}>
        {topView === "practice" && (
          view === "home" ? <HomeRail />
          : view === "companion" ? <CatalogRail />
          : view === "grammar" ? <GuideRail />
          : view === "profile" ? <ProgressRail />
          : view === "partner" ? <PartnerRail />
          : (view === "test" || view === "testResult") ? <TestRail />
          : <PracticeRail />
        )}
        {topView === "words" && <WordRail />}
        {topView === "review" && <ReviewRail />}

        <section className={
          "lab"
          + (view === "home" ? " home-dashboard" : "")
          + (view === "companion" ? " curriculum-lab" : "")
          + (view === "vocab" ? " map-lab" : "")
          + (view === "test" || view === "testResult" ? " test-card" : "")
        }>
          {view !== "home" && (
            <nav className="section-backbar" aria-label="Section navigation">
              <button className="section-back-button" onClick={goBack}>
                <span aria-hidden="true">←</span>
                Back to {viewTitles[navigationHistoryRef.current.at(-1) || "home"] || "Practice"}
              </button>
              <span className="section-back-current" aria-current="page">{viewTitles[view] || "Learning"}</span>
              <button className="section-home-button" onClick={returnHome}>Practice home ↗</button>
            </nav>
          )}
          {view === "home" && <Home />}
          {view === "companion" && <Companion />}
          {view === "lesson" && <Lesson />}
          {view === "review" && <Review />}
          {view === "vocab" && <Vocabulary />}
          {view === "grammar" && <Grammar />}
          {view === "test" && <StudyTest />}
          {view === "testResult" && <StudyTestResult />}
          {view === "profile" && <Profile />}
          {view === "partner" && <PartnerKorean goBack={goBack} playKorean={playKorean} callIntelligence={callIntelligence} aiBusy={aiBusy} />}
        </section>

        {view === "vocab"
          ? <WordCoach />
          : <Coach variant={
              view === "home" ? "home-coach"
              : view === "review" ? "review-coach"
              : (view === "test" || view === "testResult") ? "test-coach"
              : ""
            } />}
        {view === "home" && <HomeMomentum />}
        {view === "home" && <StructuredStudy />}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button
          className={["home", "lesson", "test", "testResult"].includes(view) ? "is-active" : ""}
          onClick={returnHome}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h6" /></svg>
          <span>Practice</span>
        </button>
        <button className={view === "companion" ? "is-active" : ""} onClick={() => navigate("companion")}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5C7 4 10 4 12 6v13c-2-2-5-2-8-.5zM12 6c2-2 5-2 8-.5v13c-3-1.5-6-1.5-8 .5z" /></svg>
          <span>Korean</span>
        </button>
        <button
          className={topView === "words" ? "is-active" : ""}
          onClick={() => navigate("vocab")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M4 12h16M12 4c2 2.2 3 4.8 3 8s-1 5.8-3 8c-2-2.2-3-4.8-3-8s1-5.8 3-8Z" /></svg>
          <span>Words</span>
        </button>
        <button
          className={topView === "review" ? "is-active" : ""}
          onClick={() => navigate("review")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.7M4 4v4.7h4.7" /></svg>
          <span>Review</span>
        </button>
        <button className={view === "partner" ? "is-active" : ""} onClick={() => navigate("partner")}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11Z" /></svg>
          <span>Real Korean</span>
        </button>
      </nav>
    </div>
  );
}
