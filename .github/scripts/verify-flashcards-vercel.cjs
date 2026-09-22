const assert=require("node:assert/strict");
const {chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 try{
  const response=await page.goto("http://127.0.0.1:3000/flashcards",{waitUntil:"domcontentloaded"});
  assert.equal(response.status(),200);
  const frame=page.frameLocator('iframe[title*="Starter Unit 1"]');
  await frame.locator(".deck-tile").first().waitFor();
  assert.equal(await frame.locator(".deck-tile").count(),12);
  await frame.locator('.deck-item[aria-label="Open 책 in Objects"]').click();
  assert.equal(await frame.locator("#front-word").innerText(),"책");
  assert.equal(await frame.locator("#art-sprite .book-illustration-v2").count(),1);
  const picture=await frame.locator("#art-sprite .book-illustration-v2").getAttribute("aria-label");
  assert.match(picture,/open book/i);
  const privacy=await page.request.get("http://127.0.0.1:3000/flashcards-level1/index.html");
  assert.equal(privacy.status(),200);
  const asset=await page.request.get("http://127.0.0.1:3000/flashcards-level1/art-book.js");
  assert.equal(asset.status(),200);
  const legacy=await page.request.get("http://127.0.0.1:3000/hangul");
  assert.equal(legacy.status(),200);
  await page.setViewportSize({width:390,height:844});
  await frame.locator(".deck-tile").nth(6).click();
  assert.equal(await frame.locator("#front-word").innerText(),"물");
  const width=await frame.locator("html").evaluate(el=>({scroll:el.scrollWidth,viewport:el.clientWidth}));
  assert.ok(width.scroll<=width.viewport+3,"mobile overflow "+JSON.stringify(width));
  assert.deepEqual(errors,[]);
  console.log("PASS: Vercel-style Next build, /flashcards, all 12 cards, printed 책 art, /hangul and mobile");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
