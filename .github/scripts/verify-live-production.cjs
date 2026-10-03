const assert=require("node:assert/strict");
const {chromium}=require("playwright");

const BASE="https://hallium.vercel.app";

async function noOverflow(page,label){
  const bounds=await page.evaluate(()=>({
    scroll:document.documentElement.scrollWidth,
    width:document.documentElement.clientWidth
  }));
  assert.ok(bounds.scroll<=bounds.width+3,label+" horizontal overflow "+JSON.stringify(bounds));
}

(async()=>{
  const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const errors=[];
  try{
    const context=await browser.newContext({viewport:{width:390,height:844}});
    const page=await context.newPage();
    page.on("pageerror",e=>errors.push("pageerror: "+e.message));
    page.on("console",m=>{
      if(m.type()==="error") errors.push("console: "+m.text());
    });

    // Landing CTAs.
    let r=await page.goto(BASE+"/",{waitUntil:"domcontentloaded"});
    assert.equal(r.status(),200);
    const google=page.locator('a[href^="/auth/google?next="]').first();
    const guest=page.locator('a[href="/?guest=1"]').first();
    await google.waitFor();
    await guest.waitFor();
    assert.ok(await google.isVisible(),"Google entry must be visible");
    assert.ok(await guest.isVisible(),"Guest entry must be visible");
    await noOverflow(page,"landing mobile");

    // Enter through the actual Guest CTA.
    await guest.click();
    await page.waitForFunction(()=>sessionStorage.getItem("hallim:guest-active:v1")==="1");
    await page.waitForTimeout(500);
    const firstGuest=await page.evaluate(()=>({
      identity:JSON.parse(sessionStorage.getItem("hallim:guest-review:v1")||"null"),
      sessionId:sessionStorage.getItem("hallim:guest-session-id:v1"),
      canonical:localStorage.getItem("hallim:learner-profile:v1"),
      guestProfile:localStorage.getItem("hallim:learner-profile:v1:guest"),
      authKeys:Object.keys(localStorage).filter(k=>/^sb-.*-auth-token$/.test(k))
    }));
    assert.ok(firstGuest.identity?.name);
    assert.match(firstGuest.sessionId||"",/^[0-9a-f-]{36}$/i);
    assert.equal(firstGuest.canonical,null,"Guest must not seed canonical learner profile");
    assert.ok(firstGuest.guestProfile,"Guest profile must be guest-scoped");
    assert.equal(firstGuest.authKeys.length,0,"Guest must not manufacture Supabase auth state");
    await noOverflow(page,"guest dashboard mobile");

    // Direct admin boot must fail closed for a guest.
    r=await page.goto(BASE+"/?guest=1&view=admin",{waitUntil:"domcontentloaded"});
    assert.equal(r.status(),200);
    await page.waitForFunction(()=>sessionStorage.getItem("hallim:guest-active:v1")==="1");
    const body=await page.locator("body").innerText();
    assert.doesNotMatch(body,/PRIVATE CURRICULUM OPERATIONS/i);
    assert.doesNotMatch(body,/Curriculum Studio\s*$/im);

    // A new browser session gets a different guest session.
    const context2=await browser.newContext({viewport:{width:390,height:844}});
    const page2=await context2.newPage();
    await page2.goto(BASE+"/?guest=1",{waitUntil:"domcontentloaded"});
    await page2.waitForFunction(()=>sessionStorage.getItem("hallim:guest-active:v1")==="1");
    const secondSession=await page2.evaluate(()=>sessionStorage.getItem("hallim:guest-session-id:v1"));
    assert.ok(secondSession);
    assert.notEqual(secondSession,firstGuest.sessionId,"Fresh browser session must get a fresh guest session ID");
    await context2.close();

    // Public learning surfaces.
    for(const path of ["/hangul","/topik-mocks","/study-partners","/flashcards"]){
      r=await page.goto(BASE+path,{waitUntil:"domcontentloaded"});
      assert.equal(r.status(),200,path+" status");
      await noOverflow(page,path+" mobile");
    }

    // Back-navigation contract on the dedicated labs.
    await page.goto(BASE+"/hangul",{waitUntil:"domcontentloaded"});
    const hangulBack=page.getByRole("link",{name:/Back to the Hallium learning dashboard/i});
    await hangulBack.waitFor();
    assert.equal(await hangulBack.getAttribute("href"),"/");

    await page.goto(BASE+"/flashcards",{waitUntil:"domcontentloaded"});
    const flashBack=page.getByRole("link",{name:/Back to the Hallium learning dashboard/i});
    await flashBack.waitFor();
    assert.equal(await flashBack.getAttribute("href"),"/");

    // Real flashcard interaction in production.
    const frame=page.frameLocator('iframe[title*="Starter Unit 1"]');
    await frame.locator(".word-item").first().waitFor();
    assert.ok((await frame.locator(".word-item").count())>=12);
    await frame.locator('.word-item[aria-label="Study 책 Book"]').click();
    assert.equal(await frame.locator("#word").innerText(),"책");
    await frame.locator("#bookmark").click();
    assert.equal(await frame.locator("#bookmark").getAttribute("aria-pressed"),"true");
    await frame.locator("#learn").click();
    assert.equal(await frame.locator("#learning-count").innerText(),"1");
    await noOverflow(page,"flashcards interactive mobile");

    // Desktop pass.
    await page.setViewportSize({width:1440,height:1000});
    for(const path of ["/","/hangul","/topik-mocks","/study-partners","/flashcards"]){
      r=await page.goto(BASE+path,{waitUntil:"domcontentloaded"});
      assert.equal(r.status(),200,path+" desktop status");
      await noOverflow(page,path+" desktop");
    }

    assert.deepEqual(errors,[],"Production browser console/page errors detected");
    console.log("PASS: live Hallium production interaction, guest isolation, admin denial, routes, back-nav, flashcards and responsive layouts");
    await context.close();
  }finally{
    await browser.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1});