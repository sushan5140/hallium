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
  // Keep the original top-left plan and right-side adaptive progress dashboard;
  // only Structured Study is the full-width second row. Recheck the real CSS.
  const source=require("node:fs").readFileSync("app/page.js","utf8");
  assert.ok(source.includes('function HomeRail()'),"home study plan rail missing");
  assert.ok(source.includes('view === "home" ? "home-coach"'),"adaptive coach removed from home");
  assert.ok(source.includes('view === "home" && <StructuredStudy />'),"expanded study section not outside the top row");
  const middle=source.slice(source.indexOf('function Home()'),source.indexOf('function Companion()',source.indexOf('function Home()')));
  assert.ok(!middle.includes('className="study-hub"'),"duplicate middle Structured Study should be removed");
  const plan=source.slice(source.indexOf('function HomeRail()'),source.indexOf('function CatalogRail()',source.indexOf('function HomeRail()')));
  for(const token of ["rail-momentum","rail-momentum-track","rail-momentum-next","rail-momentum-review","completed","nextLesson.title","dueMistakes.length"])assert.ok(plan.includes(token),"missing real-time progress content: "+token);
  assert.equal((source.match(/<StructuredStudy \/>/g)||[]).length,1,"only one full-width Structured Study should render");

  const hub=source.slice(source.indexOf('function StructuredStudy()'),source.indexOf('function Home()',source.indexOf('function StructuredStudy()')));
  for(const title of ["Korean → TOPIK Bridge","Korean Companion","TOPIK Companion","Starter Flashcards","TOPIK Mock Tests","Study Partners","Hangul Lab","Vocabulary","Grammar","Test"])assert.ok(hub.includes(title),"missing Structured Study feature: "+title);
  const rail=source.slice(source.indexOf('function HomeRail()'),source.indexOf('function CatalogRail()',source.indexOf('function HomeRail()')));
  assert.ok(!rail.includes('rail-resources'),"duplicated shortcut resources still in left rail");
  const cardNames=[["topik-from-zero-hub-card","Korean → TOPIK Bridge"],["companion-hub-card","Korean Companion"],["topik-companion-hub-card","TOPIK Companion"],["flashcards-hub-card","Starter Flashcards"],["topik-hub-card","TOPIK Mock Tests"],["sp-hub-card","Study Partners"],["hangul-hub-card","Hangul Lab"]];
  const homeMarkup='<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div class="app-shell"><main class="workspace view-practice workspace-home"><aside class="lesson-rail home-rail"><h1>One step at a time.</h1><section class="rail-group rail-plan"><h2>Practice in order</h2><p>Daily actions</p></section><section class="rail-group rail-catalog"><h2>All lessons</h2><p>Open catalog</p></section><section class="rail-momentum"><div class="rail-momentum-head"><span class="rail-group-label">03 · YOUR MOMENTUM</span><span class="rail-momentum-spark">↗</span></div><h2>One chapter closer.</h2><p>Based on completed lessons.</p><div class="rail-momentum-chapter"><div class="rail-momentum-topline"><span>UNIT 2</span><strong>2<small> / 5</small></strong></div><strong class="rail-momentum-chapter-name">My everyday life</strong><div class="rail-momentum-track" role="progressbar" aria-label="Current chapter lessons completed" aria-valuenow="2" aria-valuemin="0" aria-valuemax="5"><i style="transform:scaleX(.4)"></i></div><div class="rail-momentum-markers"><span class="is-done"></span><span class="is-done"></span><span class="is-next"></span><span></span><span></span></div><span class="rail-momentum-counter">3 chapter steps to go</span></div><button class="rail-momentum-next"><span><small>UP NEXT · LESSON 3</small><strong>What I like</strong></span><span class="rail-momentum-arrow">↗</span></button><button class="rail-momentum-review"><span><strong>2 due for review</strong><small>Revisit missed words</small></span><span>→</span></button></section></aside><section class="lab home-dashboard"><h2>Welcome back.</h2><section class="continue-panel"><h3>Continue learning</h3></section><section class="real-korean"><h3>Real Korean</h3></section></section><aside class="coach home-coach"><h2>Your live signals</h2><div class="coach-note">Your progress</div><div class="signal-card">Progress</div><div class="next-card">Current focus</div></aside><section class="study-hub study-hub-wide"><div class="study-title"><h3>Study it directly, then test it.</h3></div><div class="study-cards">'+cardNames.map(([klass,label])=>'<a class="'+klass+'" href="/companions"><span class="study-glyph">가</span><span><strong>'+label+'</strong><small>Learn in a dedicated way.</small></span><em>Study now →</em></a>').join("")+["Vocabulary","Grammar","Test"].map(label=>'<button><span class="study-glyph">문</span><span><strong>'+label+'</strong><small>Study directly.</small></span><em>Open →</em></button>').join("")+'</div></section></main></div></body></html>';
  for(const width of [1440,1180,1024,820,620,390,320]){
    await page.setViewportSize({width,height:850});
    await page.setContent(homeMarkup);
    await page.addStyleTag({path:"app/globals.css"});
    const home=await page.evaluate(()=>{
      const box=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
      const cards=[...document.querySelectorAll(".study-cards>*")].map(x=>{let r=x.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom}});
      return {doc:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,main:box(".workspace-home"),rail:box(".home-rail"),momentum:box(".rail-momentum"),next:box(".rail-momentum-next"),review:box(".rail-momentum-review"),lab:box(".home-dashboard"),coach:box(".home-coach"),study:box(".study-hub-wide"),cards};
    });
    assert.equal(home.cards.length,10,"all ten previous study tools must return");
    assert.ok(home.momentum.y>=home.rail.y&&home.momentum.bottom<=home.rail.bottom+1,"momentum card escapes left rail at "+width);
    assert.ok(home.next.bottom<=home.review.y+1,"momentum controls overlap at "+width);

    assert.ok(home.scroll<=home.doc+2,"home horizontal overflow at "+width+": "+JSON.stringify(home));
    assert.ok(Math.abs(home.study.width-home.main.width)<=1,"structured study must span full width at "+width);
    assert.ok(home.study.y>=Math.max(home.coach.bottom,home.rail.bottom,home.lab.bottom)-2,"structured study must start beneath entire dashboard at "+width+": "+JSON.stringify(home));
    if(width>1180){
      assert.ok(home.rail.right<=home.lab.x+1&&home.lab.right<=home.coach.x+1,"original three-column dashboard not restored at "+width);
    }
    for(let a=0;a<home.cards.length;a++)for(let b=a+1;b<home.cards.length;b++){
      let x=home.cards[a],y=home.cards[b];
      assert.ok(!(x.x<y.right-.5&&x.right>y.x+.5&&x.y<y.bottom-.5&&x.bottom>y.y+.5),"study cards overlap at "+width);
    }
  }
  const kr=await page.goto("http://127.0.0.1:3000/korean-companion",{waitUntil:"domcontentloaded"});
  assert.equal(kr.status(),200);assert.ok(page.url().includes("/?view=companion"),"Korean companion redirects to retained course");
  assert.deepEqual(errors,[]);
  console.log("PASS: one lower Structured Study, live momentum in left rail and retained right coach across 320–1440px");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
