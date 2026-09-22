/* Real Chromium audit: full 12-card starter batch on GitHub Pages. */
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 try{
  await page.goto("http://127.0.0.1:4173/flashcards-level1/",{waitUntil:"domcontentloaded"});
  await page.locator(".deck-tile").first().waitFor();
  const initial=await page.evaluate(()=>({words:window.HALLIUM_STARTER_WORDS,art:window.HALLIUM_STARTER_ART,content:document.documentElement.scrollWidth,width:innerWidth}));
  assert.equal(initial.words.length,12);
  assert.equal(new Set(initial.words.map(w=>w.id)).size,12);
  assert.equal(new Set(initial.words.map(w=>w.art)).size,12);
  assert.equal(await page.locator(".deck-tile").count(),12);
  const groups=Object.fromEntries(["Greetings","Identity","Objects","Places"].map(g=>[g,initial.words.filter(w=>w.group===g).length]));
  assert.deepEqual(groups,{Greetings:1,Identity:3,Objects:4,Places:4});
  for(const word of initial.words){
   assert.ok(initial.art[word.art]?.includes("<svg"),"missing semantic illustration "+word.ko);
   assert.ok(word.example.includes(word.ko),"example must include the target word "+word.ko);
   assert.ok(word.translation && word.tip && word.contrast,"missing explanation "+word.ko);
  }
  assert.ok(initial.art.book.includes("v2-story-picture"),"book must have printed story vignette to distinguish from notebook");
  console.log("PASS: 12 distinct illustrated scenes and correctly grouped original Hallium Starter words");

  await page.locator('.deck-item[aria-label="Open 책 in Objects"]').click();
  assert.equal(await page.locator("#front-word").innerText(),"책");
  assert.equal(await page.locator(".book-illustration-v2").count(),1);
  assert.equal(await page.locator("#back").getAttribute("aria-hidden"),"true");
  await page.locator("#reveal").click();
  await page.waitForTimeout(850);
  assert.equal(await page.locator("#back-meaning").innerText(),"Book");
  assert.match(await page.locator("#back-contrast").innerText(),/공책/);
  await page.locator("#know").click();
  assert.equal(await page.locator("#known-count").innerText(),"1");
  await page.locator("#save").click();
  assert.equal(await page.locator("#save").getAttribute("aria-pressed"),"true");
  assert.ok((await page.locator("#saved-list").innerText()).includes("책"));
  await page.locator("#continue-next").click();
  assert.equal(await page.locator("#front-word").innerText(),"가방");
  assert.equal(await page.locator(".book-illustration-v2").count(),0);
  assert.match(await page.locator("#art-sprite svg").getAttribute("aria-label"),/backpack/);
  console.log("PASS: book/notebook distinction, recalled status, saved collection, next word and meaningful art change");

  await page.locator('[data-mode="recall"]').click();
  assert.equal(await page.locator("#front-word").innerText(),"가방");
  assert.equal(await page.locator("#art-sprite svg").count(),0);
  await page.locator('[data-mode="listening"]').click();
  assert.equal(await page.locator("#art-sprite svg").count(),0);
  assert.notEqual(await page.locator("#front-word").innerText(),"가방");
  await page.locator('[data-mode="sentence"]').click();
  assert.match(await page.locator("#front-sentence").innerText(),/_____/);
  assert.equal(await page.locator("#sentence-answer").isVisible(),true);
  await page.locator("#sentence-answer").fill("가방");
  await page.locator("#reveal").click();
  await page.waitForTimeout(850);
  assert.match(await page.locator("#back-explanation").innerText(),/가방/);
  assert.equal(await page.locator("#back-meaning").innerText(),"Bag");
  console.log("PASS: four modes, no premature image or text spoilers, free-response sentence check");

  await page.locator("#learn").click();
  assert.equal(await page.locator("#learn-count").innerText(),"1");
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator(".deck-tile").first().waitFor();
  assert.equal(await page.locator("#front-word").innerText(),"_____");
  assert.equal(await page.locator("#known-count").innerText(),"1");
  assert.equal(await page.locator("#learn-count").innerText(),"1");
  assert.equal(await page.locator("#save").getAttribute("aria-pressed"),"false");
  await page.locator("#group-filter").getByRole("button",{name:/Places/}).click();
  assert.equal(await page.locator("#front-tag").innerText(),"PLACES · 09 / 12");
  assert.equal(await page.locator("#previous").isDisabled(),true);
  await page.locator("#next").click();
  assert.equal(await page.locator("#bar-lesson").innerText(),"집 · Places");
  console.log("PASS: per-word persistent recall, independent saved status and category navigation");

  await page.setViewportSize({width:390,height:844});
  await page.locator('[data-mode="visual"]').click();
  await page.waitForTimeout(1000);
  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
  assert.ok(width.scroll<=width.viewport+3,"mobile horizontal overflow "+JSON.stringify(width));
  const frontDims=await page.evaluate(()=>{
   const f=document.getElementById("front").getBoundingClientRect(),b=document.getElementById("reveal").getBoundingClientRect();
   return {fb:f.bottom,bb:b.bottom};
  });
  assert.ok(frontDims.bb<frontDims.fb-2,"mobile reveal clipped "+JSON.stringify(frontDims));
  await page.locator("#reveal").click();
  await page.waitForTimeout(900);
  const backDims=await page.evaluate(()=>{
   const f=document.getElementById("back").getBoundingClientRect(),b=document.getElementById("know").getBoundingClientRect();
   return {fb:f.bottom,bb:b.bottom};
  });
  assert.ok(backDims.bb<backDims.fb-2,"mobile review controls clipped "+JSON.stringify(backDims));
  console.log("PASS: 390px mobile deck, card flip and controls");

  const old=await page.evaluate(()=>{
   localStorage.setItem("hallium:flashcard-pilot:book:v1","LOCKED_V1_TEST");
   localStorage.setItem("hallium:flashcard-pilot:book:v2","LOCKED_V2_TEST");
   return localStorage.getItem("hallium:starter-level1:flashcards:v1");
  });
  assert.ok(old);
  page.once("dialog",dialog=>dialog.accept());
  await page.locator("#reset").click();
  const after=await page.evaluate(()=>({
   v1:localStorage.getItem("hallium:flashcard-pilot:book:v1"),
   v2:localStorage.getItem("hallium:flashcard-pilot:book:v2"),
   deck:localStorage.getItem("hallium:starter-level1:flashcards:v1")
  }));
  assert.equal(after.v1,"LOCKED_V1_TEST");assert.equal(after.v2,"LOCKED_V2_TEST");
  assert.equal(await page.locator("#known-count").innerText(),"0");
  assert.equal(await page.locator("#learn-count").innerText(),"0");
  console.log("PASS: batch reset preserves locked V1/V2 storage keys");

  const reduced=await browser.newPage({reducedMotion:"reduce"});
  reduced.on("pageerror",e=>errors.push(e.message));
  await reduced.goto("http://127.0.0.1:4173/flashcards-level1/",{waitUntil:"domcontentloaded"});
  await reduced.locator(".deck-tile").first().waitFor();
  const duration=await reduced.locator("#art-sprite svg").evaluate(el=>getComputedStyle(el).animationDuration);
  assert.equal(duration,"0s");
  await reduced.locator("#reveal").click();
  assert.equal(await reduced.locator("#back").getAttribute("aria-hidden"),"false");
  await reduced.close();
  assert.deepEqual(errors,[],"browser JavaScript errors");
  console.log("PASS: reduced motion, accessible flip and no JavaScript errors");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
