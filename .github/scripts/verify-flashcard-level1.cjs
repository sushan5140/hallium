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
  assert.equal(await page.locator('#art-sprite .semantic-wave').count(),2);
  const wave=await page.locator('#art-sprite .semantic-wave').first().evaluate(el=>getComputedStyle(el).animationName);
  assert.match(wave,/starterWave/);
  await page.locator('.deck-item[aria-label="Open 물 in Objects"]').click();
  assert.equal(await page.locator('#art-sprite .semantic-ripple').count(),1);
  assert.match(await page.locator('#art-sprite .semantic-ripple').evaluate(el=>getComputedStyle(el).animationName),/starterWater/);
  await page.locator('.deck-item[aria-label="Open 커피 in Objects"]').click();
  assert.equal(await page.locator('#art-sprite .coffee-steam').count(),1);
  assert.match(await page.locator('#art-sprite .coffee-steam').evaluate(el=>getComputedStyle(el).animationName),/starterSteam/);
  assert.equal(await page.locator('#card-fx span').count(),0);
  console.log("PASS: semantic wave, water ripple and coffee steam without decorative particles");

  await page.locator('.deck-item[aria-label="Open 책 in Objects"]').click();
  assert.equal(await page.locator("#front-word").innerText(),"책");
  assert.equal(await page.locator("#art-sprite .book-illustration-v2").count(),1);
  assert.equal(await page.locator("#back").getAttribute("aria-hidden"),"true");
  assert.equal(await page.locator("#reveal").isVisible(),false);
  assert.equal(await page.locator("#reference-meaning").innerText(),"Book");
  assert.equal(await page.locator("#reference-pair").innerText(),"책을 읽어요");
  assert.equal(await page.locator("#hero-save").getAttribute("aria-pressed"),"false");
  assert.match(await page.locator("#reference-contrast").textContent(),/공책/);
  assert.match(await page.locator("#reference-description").innerText(),/printed book/);
  assert.equal(await page.locator("#reference-actions").isVisible(),true);
  await page.locator("#reference-know").click();
  assert.equal(await page.locator("#known-count").innerText(),"1");
  assert.equal(await page.locator("#card-fx span").count(),0,"No generic confetti on review");
  await page.locator("#hero-save").click();
  assert.equal(await page.locator("#save").getAttribute("aria-pressed"),"true");
  assert.equal(await page.locator("#hero-save").getAttribute("aria-pressed"),"true");
  assert.ok((await page.locator("#saved-list").innerText()).includes("책"));
  await page.locator("#reference-continue").click();
  assert.equal(await page.locator("#front-word").innerText(),"가방");
  assert.equal(await page.locator("#art-sprite .book-illustration-v2").count(),0);
  assert.match(await page.locator("#art-sprite svg").getAttribute("aria-label"),/backpack/);
  console.log("PASS: reference-inspired Learn layout, book/notebook distinction, instant meaning, saved collection, next word and semantic art");

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
  assert.equal(await page.locator("#reference-meaning").isVisible(),true);
  assert.equal(await page.locator("#reference-actions").isVisible(),true);
  const view=await page.evaluate(()=>{
   const know=document.getElementById("reference-know").getBoundingClientRect();
   const learn=document.getElementById("reference-learn").getBoundingClientRect();
   return {top:Math.min(know.top,learn.top),bottom:Math.max(know.bottom,learn.bottom),h:innerHeight};
  });
  assert.ok(view.top>=0 && view.bottom<=view.h+2,"mobile fixed review actions clipped "+JSON.stringify(view));
  await page.locator("#reference-learn").click();
  assert.equal(await page.locator("#reference-finish").isVisible(),true);
  await page.locator('[data-mode="recall"]').click();
  assert.equal(await page.locator("#reveal").isVisible(),true);
  await page.locator("#reveal").click();
  await page.waitForTimeout(850);
  assert.equal(await page.locator("#back").getAttribute("aria-hidden"),"false");
  const backDims=await page.evaluate(()=>{
   const f=document.getElementById("back").getBoundingClientRect(),b=document.getElementById("know").getBoundingClientRect();
   return {fb:f.bottom,bb:b.bottom};
  });
  assert.ok(backDims.bb<backDims.fb-2,"mobile recall controls clipped "+JSON.stringify(backDims));
  console.log("PASS: 390px reference-style mobile study flow and separate recall-mode flip");

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
  await reduced.locator('.deck-item[aria-label="Open 물 in Objects"]').click();
  assert.equal(await reduced.locator('#art-sprite .semantic-ripple').evaluate(el=>getComputedStyle(el).animationDuration),"0s");
  await reduced.locator('[data-mode="recall"]').click();
  await reduced.locator("#reveal").click();
  assert.equal(await reduced.locator("#back").getAttribute("aria-hidden"),"false");
  await reduced.close();
  assert.deepEqual(errors,[],"browser JavaScript errors");
  console.log("PASS: reduced motion, accessible flip and no JavaScript errors");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
