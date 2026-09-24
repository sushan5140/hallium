const assert=require("node:assert/strict");
const {chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 try{
  let r=await page.goto("http://127.0.0.1:3000/companions",{waitUntil:"domcontentloaded"});
  assert.equal(r.status(),200);await page.getByRole("heading",{name:"One language. Three learning routes."}).waitFor();
  assert.equal(await page.getByRole("link",{name:/Korean → TOPIK Bridge.*Start from zero/i}).count(),1);
  assert.equal(await page.getByRole("link",{name:/Korean Companion.*Continue everyday Korean/i}).count(),1);
  await page.getByRole("link",{name:/TOPIK Companion.*Target the weak spots/i}).click();
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
  await page.goto("http://127.0.0.1:3000/topik-from-zero",{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:/TOPIK Bridge/i}).waitFor();
  await page.getByText("43", {exact:false}).first().waitFor();
  assert.equal(await page.getByRole("button",{name:/Level 1/i}).count(),1);
  await page.getByRole("button",{name:/Level 2/i}).click();
  assert.equal(await page.getByRole("button",{name:/Level 2/i}).getAttribute("aria-pressed"),"true");
  await page.evaluate(()=>{
    localStorage.setItem("hallim:vercel:lessons:v2",JSON.stringify({"unit-1-lesson-1":{completed:true,stepIndex:8}}));
    const current=JSON.parse(localStorage.getItem("hallium:topik-companion:v1")||"{}");
    current.results={...(current.results||{}),i01:{done:true,score:7,total:7,wrong:[],at:"2026-09-24T00:00:00Z"}};
    localStorage.setItem("hallium:topik-companion:v1",JSON.stringify(current));
  });
  await page.reload({waitUntil:"domcontentloaded"});
  await page.getByText("2 / 43").first().waitFor();
  await page.getByRole("link",{name:/Identity & people/i}).first().click();
  await page.getByRole("heading",{name:"Identity & people"}).waitFor();
  assert.ok(page.url().includes("unit=i01"),"TOPIK bridge must link exact revision chapter");
  await page.goto("http://127.0.0.1:3000/topik-from-zero",{waitUntil:"domcontentloaded"});
  const widthCheck=await page.evaluate(()=>[document.documentElement.scrollWidth,document.documentElement.clientWidth]);
  assert.ok(widthCheck[0]<=widthCheck[1]+2,"bridge overflow "+JSON.stringify(widthCheck));
  // Homepage needs auth in production: use its actual CSS with a minimal markup
  // fixture to prevent the three Companion cards being squeezed between rails.
  const source=require("node:fs").readFileSync("app/page.js","utf8");
  assert.ok(source.includes('className={"workspace view-" + topView + (view === "home" ? " workspace-home" : "")}'),"home full-width class missing");
  assert.ok(!source.includes('function HomeRail()'),"duplicate home shortcut rail still present");
  const homeMarkup='<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div class="app-shell"><main class="workspace view-practice workspace-home"><section class="lab home-dashboard"><section class="study-hub"><div class="study-title"><h3>Study it directly, then test it.</h3></div><div class="study-cards">'+[["topik-from-zero-hub-card","Korean → TOPIK Bridge"],["companion-hub-card","Korean Companion"],["topik-companion-hub-card","TOPIK Companion"]].map(([klass,label])=>'<a class="'+klass+'" href="/companions"><span class="study-glyph">가</span><span><strong>'+label+'</strong><small>Learn Korean in a dedicated way for your needs.</small></span><em>Start learning →</em></a>').join("")+'</div></section></section></main></div></body></html>';
  for(const width of [1440,1024,820,620,390,320]){
    await page.setViewportSize({width,height:850});
    await page.setContent(homeMarkup);
    await page.addStyleTag({path:"app/globals.css"});
    const home=await page.evaluate(()=>{
      const r=selector=>{const b=document.querySelector(selector).getBoundingClientRect();return{x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height}};
      const cards=[...document.querySelectorAll(".workspace-home .study-cards>a")].map(x=>{const b=x.getBoundingClientRect();return{x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width}});
      return {doc:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,main:r(".workspace-home"),lab:r(".home-dashboard"),grid:r(".study-cards"),cards,columnCount:getComputedStyle(document.querySelector(".study-cards")).gridTemplateColumns.split(" ").length,rail:document.querySelectorAll(".home-rail,.home-coach").length};
    });
    const expected=width<=620?1:width<=920?2:3;
    assert.equal(home.cards.length,3,"three main Companion cards required");
    assert.equal(home.rail,0,"home should not reserve side rails");
    assert.equal(home.columnCount,expected,"incorrect grid columns at "+width+": "+JSON.stringify(home));
    assert.ok(home.scroll<=home.doc+2,"home horizontal overflow at "+width+": "+JSON.stringify(home));
    assert.ok(Math.abs(home.main.width-home.lab.width)<=1,"home canvas not fully occupied at "+width);
    for(let i=0;i<home.cards.length;i++)for(let j=i+1;j<home.cards.length;j++){
      const a=home.cards[i],b=home.cards[j];assert.ok(!(a.x<b.right-.5&&a.right>b.x+.5&&a.y<b.bottom-.5&&a.bottom>b.y+.5),"home Companion cards overlap at "+width);
    }
  }
  const kr=await page.goto("http://127.0.0.1:3000/korean-companion",{waitUntil:"domcontentloaded"});
  assert.equal(kr.status(),200);assert.ok(page.url().includes("/?view=companion"),"Korean companion redirects to retained course");
  assert.deepEqual(errors,[]);
  console.log("PASS: full-width home 320–1440px, three Companion cards, bridge, revision deep links, preserved progress and mobile");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
