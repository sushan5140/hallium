const assert=require("node:assert/strict");
const {chromium}=require("playwright");

async function noOverflow(page,label){
  const bounds=await page.evaluate(()=>({
    scroll:document.documentElement.scrollWidth,
    width:document.documentElement.clientWidth
  }));
  assert.ok(bounds.scroll<=bounds.width+2,label+" horizontal overflow "+JSON.stringify(bounds));
}

(async()=>{
  const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const errors=[];
  try{
    for(const viewport of [{width:390,height:844},{width:820,height:1180},{width:1440,height:1000}]){
      const page=await browser.newPage({viewport});
      page.on("pageerror",e=>errors.push(viewport.width+": "+e.message));

      // Guest entry must create only guest-scoped browser state.
      let r=await page.goto("http://127.0.0.1:3000/?guest=1",{waitUntil:"domcontentloaded"});
      assert.equal(r.status(),200);
      await page.waitForFunction(()=>sessionStorage.getItem("hallim:guest-active:v1")==="1");
      await page.waitForTimeout(300);
      const guestState=await page.evaluate(()=>{
        const local=Object.keys(localStorage);
        return {
          local,
          hasCanonicalProfile:local.includes("hallim:learner-profile:v1"),
          hasGuestProfile:local.some(k=>k==="hallim:learner-profile:v1:guest"),
          authKeys:local.filter(k=>/^sb-.*-auth-token$/.test(k))
        };
      });
      assert.equal(guestState.hasCanonicalProfile,false,"guest must not write canonical signed-in profile");
      assert.equal(guestState.hasGuestProfile,true,"guest must use guest-scoped profile");
      assert.equal(guestState.authKeys.length,0,"guest mode must not manufacture a signed-in Supabase session");
      await noOverflow(page,"Hallium guest "+viewport.width);

      // Direct admin bootstrapping must fail closed for guests/non-admins.
      r=await page.goto("http://127.0.0.1:3000/?guest=1&view=admin",{waitUntil:"domcontentloaded"});
      assert.equal(r.status(),200);
      await page.waitForFunction(()=>sessionStorage.getItem("hallim:guest-active:v1")==="1");
      const adminText=await page.locator("body").innerText();
      assert.doesNotMatch(adminText,/PRIVATE CURRICULUM OPERATIONS/i);
      assert.doesNotMatch(adminText,/Curriculum Studio\s*$/im);
      await noOverflow(page,"Hallium admin denial "+viewport.width);

      // Public companion surfaces must remain reachable/responsive.
      for(const path of ["/hangul","/topik-mocks","/study-partners"]){
        r=await page.goto("http://127.0.0.1:3000"+path,{waitUntil:"domcontentloaded"});
        assert.equal(r.status(),200,path+" status");
        await noOverflow(page,path+" "+viewport.width);
      }
      await page.close();
    }

    assert.deepEqual(errors,[]);
    console.log("PASS: H-P5 guest isolation, admin denial, responsive core/TOPIK/Hangul/Study Partners");
  } finally {
    await browser.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1});