const assert=require("node:assert/strict");
const {chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 try{
  let r=await page.goto("http://127.0.0.1:3000/companions",{waitUntil:"domcontentloaded"});
  assert.equal(r.status(),200);await page.getByRole("heading",{name:"Two companions. Your way forward."}).waitFor();
  assert.equal(await page.getByRole("link",{name:/Korean Companion.*Continue everyday Korean/i}).count(),1);
  await page.getByRole("link",{name:/TOPIK Companion.*Prepare for TOPIK/i}).click();
  await page.getByRole("heading",{name:/TOPIK Companion/i}).waitFor();
  assert.equal(await page.getByRole("button",{name:/TOPIK I.*12 lessons/i}).count(),1);
  assert.equal(await page.getByRole("button",{name:/TOPIK II.*10 lessons/i}).count(),1);
  await page.getByRole("tab",{name:/Mini check/i}).click();
  for(const q of await page.locator("fieldset").all())await q.locator("button").first().click();
  await page.getByRole("button",{name:/Finish mini check/i}).click();
  await page.getByText(/correct/).first().waitFor();
  await page.reload({waitUntil:"domcontentloaded"});
  await page.getByRole("tab",{name:/Mini check/i}).click();
  await page.getByText(/correct/).first().waitFor();
  await page.getByRole("button",{name:/TOPIK II.*10 lessons/i}).click();
  await page.getByRole("heading",{name:"Headlines & formal wording"}).waitFor();
  await page.getByRole("tab",{name:/Exam source trail/i}).click();
  assert.equal(await page.getByText(/Owner's exam compilation · text-reviewed/i).count(),7);
  await page.getByRole("button",{name:/TOPIK I.*12 lessons/i}).click();
  await page.getByRole("button",{name:/Food & ordering/i}).click();
  await page.getByRole("tab",{name:/Exam source trail/i}).click();
  assert.equal(await page.getByText(/Newer source · sampled topic/i).count(),2);
  const bounds=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
  assert.ok(bounds.scroll<=bounds.width+2,"TOPIK companion mobile overflow "+JSON.stringify(bounds));
  const kr=await page.goto("http://127.0.0.1:3000/korean-companion",{waitUntil:"domcontentloaded"});
  assert.equal(kr.status(),200);assert.ok(page.url().includes("/?view=companion"),"Korean companion redirects to retained course");
  assert.deepEqual(errors,[]);
  console.log("PASS: two companions, TOPIK I/II paths, seven checks, persistence, source trail and 390px responsiveness");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
