import test from "node:test";
import assert from "node:assert/strict";
import {
  buildFlashcardCollections,
  lessonVocabularyCards,
  realKoreanFlashcards,
  savedFlashcardCollection,
  weakFlashcardCollection,
} from "../lib/flashcard-collections.js";

const NOW = Date.parse("2026-10-06T12:00:00Z");

const lessons = [
  {
    id:"unit-2-lesson-1",
    unitId:"unit-2",
    unitNumber:2,
    levelId:"foundation",
    title:"My morning",
    steps:[
      {kind:"word",korean:"아침",meaning:"morning"},
      {kind:"word",korean:"일어나요",meaning:"wake up"},
      {kind:"choice",prompt:"not a card"},
    ],
  },
  {
    id:"unit-2-lesson-2",
    unitId:"unit-2",
    unitNumber:2,
    levelId:"foundation",
    title:"What time is it?",
    steps:[
      {kind:"word",korean:"아침",meaning:"morning"},
      {kind:"word",korean:"지금",meaning:"now"},
    ],
  },
];

test("curriculum cards are derived from real lesson word steps", () => {
  const cards = lessonVocabularyCards(lessons);
  assert.equal(cards.length, 3);
  assert.deepEqual(cards.map((card) => card.korean), ["아침","일어나요","지금"]);
  assert.ok(cards.every((card) => card.source === "curriculum"));
  assert.ok(cards.every((card) => card.collectionId === "unit:unit-2"));
});

test("duplicate curriculum vocabulary is not copied into the same collection twice", () => {
  const cards = lessonVocabularyCards(lessons);
  assert.equal(cards.filter((card) => card.korean === "아침").length, 1);
});

test("Real Korean cards come from the authored Real Korean bank", () => {
  const cards = realKoreanFlashcards();
  const travel = cards.find((card) => card.id === "real-korean:travel-where");
  assert.equal(travel?.korean, "지하철역이 어디예요?");
  assert.equal(travel?.source, "real_korean");
  assert.equal(travel?.meta?.register, "polite");
});

test("weak collection uses evidence rather than a manually maintained weak list", () => {
  const cards = [
    {id:"a",korean:"물",meaning:"Water"},
    {id:"b",korean:"책",meaning:"Book"},
  ];
  const weak = weakFlashcardCollection(cards, {
    a:{stage:"recovering",misses:2,stability:30,nextReviewAt:"2026-10-05T12:00:00Z"},
    b:{stage:"strong",misses:0,stability:90,nextReviewAt:"2026-10-20T12:00:00Z"},
  }, NOW);
  assert.deepEqual(weak.map((card) => card.id), ["a"]);
  assert.equal(weak[0]?.meta?.due, true);
});

test("saved collection uses stable card ids", () => {
  const cards = [
    {id:"a",korean:"물",meaning:"Water"},
    {id:"b",korean:"책",meaning:"Book"},
  ];
  assert.deepEqual(savedFlashcardCollection(cards, ["b"]).map((card) => card.id), ["b"]);
});

test("collection registry combines starter, evidence, curriculum and Real Korean sources", () => {
  const collections = buildFlashcardCollections({
    lessons,
    starterCards:[{id:"starter:water",korean:"물",meaning:"Water",source:"starter"}],
    evidenceById:{
      "starter:water":{stage:"learning",misses:1,nextReviewAt:"2026-10-05T12:00:00Z"},
    },
    savedIds:["starter:water"],
    now:NOW,
  });

  assert.ok(collections.find((collection) => collection.id === "starter"));
  assert.ok(collections.find((collection) => collection.id === "weak"));
  assert.ok(collections.find((collection) => collection.id === "saved"));
  assert.ok(collections.find((collection) => collection.id === "unit:unit-2"));
  assert.ok(collections.some((collection) => collection.source === "real_korean"));
});
