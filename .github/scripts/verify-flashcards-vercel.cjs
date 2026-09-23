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
  await frame.locator(".word-item").first().waitFor();
  assert.equal(await frame.locator(".word-item").count(),12);
  assert.equal(await frame.locator(".flip-card").count(),0,"old animated flip-card must not be present");
  await frame.locator('.word-item[aria-label="Study 책 Book"]').click();
  assert.equal(await frame.locator("#word").innerText(),"책");
  assert.equal(await frame.locator("#art .book-illustration-v2").count(),1);
  const picture=await frame.locator("#art .book-illustration-v2").getAttribute("aria-label");
  assert.match(picture,/open book/i);
  await frame.locator("#bookmark").click();
  assert.equal(await frame.locator("#bookmark").getAttribute("aria-pressed"),"true");
  await frame.locator("#learn").click();
  assert.equal(await frame.locator("#learning-count").innerText(),"1");
  await frame.locator("#know").click();
  assert.equal(await frame.locator("#known-count").innerText(),"1");
  assert.equal(await frame.locator("#learning-count").innerText(),"0");
  const refreshed=await page.request.get("http://127.0.0.1:3000/flashcards-level1/index.html");
  assert.equal(refreshed.status(),200);
  for(const file of ["study.js","study.css","data.js","art-book.js"]){
   const asset=await page.request.get("http://127.0.0.1:3000/flashcards-level1/"+file);
   assert.equal(asset.status(),200,file+" not served");
  }
  const legacy=await page.request.get("http://127.0.0.1:3000/hangul");
  assert.equal(legacy.status(),200);
  await page.setViewportSize({width:390,height:844});
  await frame.locator('.word-item[aria-label="Study 물 Water"]').click();
  assert.equal(await frame.locator("#word").innerText(),"물");
  const width=await frame.locator("html").evaluate(el=>({scroll:el.scrollWidth,viewport:el.clientWidth}));
  assert.ok(width.scroll<=width.viewport+3,"mobile overflow "+JSON.stringify(width));
  await page.reload({waitUntil:"domcontentloaded"});
  assert.equal(await frame.locator("#word").innerText(),"물");
  assert.deepEqual(errors,[]);
  console.log("PASS: image-first /flashcards, all 12 words, no flip, saved progress, /hangul and mobile");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
