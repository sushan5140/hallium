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
  // Verified-owner QA bypass must come from the RLS-protected admin_users
  // table. Non-admin learners still use sequential lessons and answer checks.
  assert.ok(source.includes('.from("admin_users")')&&source.includes('.eq("user_id", authUser.id)'),
    "Admin privileges must come from the authenticated account's admin row");
  assert.ok(source.includes('adminUserId === authUser.id'),
    "Admin status must be bound to the exact signed-in user");
  assert.ok(source.includes('if (adminAccess) return index >= 0 && index < lessons.length;'),
    "Admin should be able to open published lessons");
  assert.ok(source.includes('return !!progress[previous.id]?.completed;'),
    "Ordinary learner sequencing must remain intact");
  assert.ok(source.includes('reachable: adminAccess || index <= stepIndex'),
    "Admin must be able to jump directly to Build and Complete");
  assert.ok(source.includes('adminAccess || showOtherLevels ? units : pathUnits'),
    "Admin must be able to see all published units");
  assert.ok(source.includes('admin-tools-actions')&&source.includes('Jump to completion ↗'),
    "Missing owner-only preview controls");
  assert.ok(source.includes('stepIndex: Math.max(Number(progress[currentLesson.id]?.stepIndex || 0), nextIndex)'),
    "Admin preview must not mark lesson complete automatically");
  assert.ok(source.includes('(isShadowing && shadowDone)'),
    "Ordinary shadowing steps must still require real practice");
  const adminStyles=require("node:fs").readFileSync("app/globals.css","utf8");
  assert.ok(adminStyles.includes(".admin-lesson-tools")&&adminStyles.includes(".admin-access-badge"),
    "Missing visible V4 owner preview controls");

  assert.ok(source.includes('function HomeRail()'),"home study plan rail missing");
  assert.ok(source.includes('home-session-checkpoint'),"Live learning-path checkpoint missing");
  assert.ok(source.includes('rail-catalog-track')&&source.includes('home-route-sequence'),"Curriculum progress or roadmap missing");
  assert.ok(source.includes('04 · ADAPTIVE COACH'),"Adaptive Coach visual section label missing");
  assert.ok(source.includes('home-momentum-path'),"Momentum path count missing");

  assert.ok(source.includes('view === "home" ? "home-coach"'),"adaptive coach removed from home");
  assert.ok(source.includes('view === "home" && <StructuredStudy />'),"expanded study section not outside the top row");
  const middle=source.slice(source.indexOf('function Home()'),source.indexOf('function Companion()',source.indexOf('function Home()')));
  assert.ok(!middle.includes('className="study-hub"'),"duplicate middle Structured Study should be removed");
  const plan=source.slice(source.indexOf('function HomeRail()'),source.indexOf('function CatalogRail()',source.indexOf('function HomeRail()')));
  assert.ok(!plan.includes('className="rail-momentum"')&&!plan.includes('home-route-sequence'),"momentum and unit roadmap must not be squeezed into the left rail");
  const wideMomentum=source.slice(source.indexOf('function HomeMomentum()'),source.indexOf('function StructuredStudy()',source.indexOf('function HomeMomentum()')));
  for(const token of ["home-momentum","rail-momentum-track","rail-momentum-next","rail-momentum-review","home-momentum-route","visibleUnits.map","completedPathCount","nextLesson.title","dueMistakes.length"])assert.ok(wideMomentum.includes(token),"wide panel lost real progress content: "+token);
  assert.equal(source.split('<HomeMomentum />').length-1,1,"momentum must render once");
  assert.ok(source.includes('view === "home" && <HomeMomentum />'),"wide momentum section must render on practice home");
  assert.equal((source.match(/<StructuredStudy \/>/g)||[]).length,1,"only one full-width Structured Study should render");

  const hub=source.slice(source.indexOf('function StructuredStudy()'),source.indexOf('function Home()',source.indexOf('function StructuredStudy()')));
  for(const title of ["Korean → TOPIK Bridge","Korean Companion","TOPIK Companion","Starter Flashcards","TOPIK Mock Tests","Study Partners","Hangul Lab","Vocabulary","Grammar","Test"])assert.ok(hub.includes(title),"missing Structured Study feature: "+title);
  const rail=source.slice(source.indexOf('function HomeRail()'),source.indexOf('function CatalogRail()',source.indexOf('function HomeRail()')));
  assert.ok(!rail.includes('rail-resources'),"duplicated shortcut resources still in left rail");
  const cardNames=[["topik-from-zero-hub-card","Korean → TOPIK Bridge"],["companion-hub-card","Korean Companion"],["topik-companion-hub-card","TOPIK Companion"],["flashcards-hub-card","Starter Flashcards"],["topik-hub-card","TOPIK Mock Tests"],["sp-hub-card","Study Partners"],["hangul-hub-card","Hangul Lab"]];
  const homeMarkup="<!doctype html><html><head><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body><div class=\"app-shell\"><main class=\"workspace view-practice workspace-home\"><aside class=\"lesson-rail home-rail\"><h1>One step at a time.</h1><section class=\"rail-group rail-plan\"><div class=\"rail-group-heading\"><span class=\"rail-group-label\">01 · TODAY&#39;S PLAN</span><h2>Practice in order</h2><p>Daily actions</p></div><ol class=\"today-route\"><li class=\"is-current\"><button><span>1</span><div class=\"route-task-copy\"><strong>Continue lesson</strong><small>Keep learning Korean today</small><em>Open lesson →</em></div></button></li><li><button><span>2</span><div class=\"route-task-copy\"><strong>Vocabulary</strong><small>Practice new words</small><em>Open vocabulary →</em></div></button></li><li><button><span>3</span><div class=\"route-task-copy\"><strong>Grammar</strong><small>Review patterns</small><em>Open grammar →</em></div></button></li></ol><div class=\"home-session-checkpoint\"><span class=\"home-session-orbit\"><i>한</i></span><span>Course progress</span></div></section><section class=\"rail-group rail-catalog\"><div class=\"rail-group-heading\"><span class=\"rail-group-label\">02 · YOUR CURRICULUM</span><span class=\"rail-catalog-kicker\">YOUR LEARNING LIBRARY</span><h2>All lessons</h2><p>Open catalog</p></div><button class=\"curriculum-button rail-destination\"><span>Browse lesson catalog<small>2 of 40 completed</small><span class=\"rail-catalog-track\" role=\"progressbar\" aria-valuenow=\"2\" aria-valuemin=\"0\" aria-valuemax=\"40\"><i style=\"width:5%\"></i></span></span><strong>↗</strong></button></section></aside><section class=\"lab home-dashboard\"><h2>Welcome back.</h2><article class=\"home-feature-lesson\"><h3>My morning</h3><div class=\"home-feature-dialogue\"><div class=\"home-feature-bubble\"><strong lang=\"ko\">아침에 일어나요.</strong></div></div><button class=\"home-feature-cta\">Continue</button></article><section class=\"home-practice-bar\"><button>Vocabulary</button></section></section><aside class=\"coach home-coach\"><div class=\"coach-head\"><div class=\"coach-orb\"><span></span><span></span><span></span></div><div><span class=\"section-label\">04 · ADAPTIVE COACH</span><h2>Reading your pattern</h2></div></div><div class=\"coach-note\"><p class=\"coach-lead\">Your route today</p><button class=\"why-button\">Personalize route</button></div><div class=\"signal-card\"><div class=\"signal-title\"><h3>Your live signals</h3><span>saved locally</span></div><div class=\"signal-row\"><span>Vocabulary</span><div><i style=\"--score:40%\"></i></div><strong>Growing</strong></div><div class=\"signal-row\"><span>Grammar</span><div><i style=\"--score:30%\"></i></div><strong>Building</strong></div></div><div class=\"next-card\"><span class=\"section-label\">Current focus</span><p><strong>Grammar</strong><br>Practice a pattern</p><button>Practice grammar</button></div></aside><section class=\"home-momentum rail-momentum\"><div class=\"home-momentum-header\"><div class=\"home-momentum-intro\"><div class=\"rail-momentum-head\"><span class=\"rail-group-label\">03 · YOUR MOMENTUM</span><span class=\"rail-momentum-spark\">↗</span></div><h2>One chapter closer.</h2><p>Based on completed lessons.</p></div><div class=\"home-momentum-path\"><strong>2 / 40</strong><span>YOUR LEARNING PATH</span></div></div><div class=\"home-momentum-grid\"><div class=\"rail-momentum-chapter\"><div class=\"rail-momentum-topline\"><span>UNIT 2 · CURRENT CHAPTER</span><strong>2<small> / 5</small></strong></div><strong class=\"rail-momentum-chapter-name\">My everyday life</strong><div class=\"rail-momentum-track\" role=\"progressbar\" aria-label=\"Current chapter lessons completed\" aria-valuenow=\"2\" aria-valuemin=\"0\" aria-valuemax=\"5\"><i style=\"transform:scaleX(.4)\"></i></div><div class=\"rail-momentum-markers\"><span class=\"is-done\"></span><span class=\"is-done\"></span><span class=\"is-next\"></span><span></span><span></span></div><span class=\"rail-momentum-counter\">3 chapter steps to go</span></div><div class=\"home-momentum-actions\"><button class=\"rail-momentum-next\"><span><small>UP NEXT · LESSON 3</small><strong>What I like</strong><em>Continue learning →</em></span><span class=\"rail-momentum-arrow\">↗</span></button><button class=\"rail-momentum-review\"><span><strong>2 due for review</strong><small>Revisit missed words</small></span><span>→</span></button></div><div class=\"home-route-sequence home-momentum-route\"><span class=\"home-route-sequence-label\">THE ROAD AHEAD</span><button class=\"home-route-unit\"><span>01</span><strong>First words</strong></button><button class=\"home-route-unit\"><span>02</span><strong>My everyday life</strong></button><button class=\"home-route-unit\"><span>03</span><strong>Food</strong></button></div></div></section><section class=\"study-hub study-hub-wide\"><div class=\"study-title\"><h3>Study it directly, then test it.</h3></div><div class=\"study-cards\">"+cardNames.map(([klass,label])=>'<a class="'+klass+'" href="/companions"><span class="study-glyph">가</span><span><strong>'+label+'</strong><small>Learn in a dedicated way.</small></span><em>Study now →</em></a>').join("")+["Vocabulary","Grammar","Test"].map(label=>'<button><span class="study-glyph">문</span><span><strong>'+label+'</strong><small>Study directly.</small></span><em>Open →</em></button>').join("")+"</div></section></main></div></body></html>";
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
    const dashboard=await page.evaluate(()=>{
      const x=q=>{let el=document.querySelector(q);let r=el.getBoundingClientRect();let cs=getComputedStyle(el);return {width:r.width,right:r.right,left:r.left,height:r.height,background:cs.backgroundColor,border:cs.borderTopWidth,radius:cs.borderTopLeftRadius}};
      return {plan:x(".rail-plan"),catalog:x(".rail-catalog .curriculum-button"),track:x(".rail-catalog-track"),momentum:x(".home-momentum-path"),coach:x(".home-coach"),coachNote:x(".home-coach .coach-note"),signals:x(".home-coach .signal-card"),focus:x(".home-coach .next-card")};
    });
    assert.ok(dashboard.catalog.width>0&&dashboard.track.width>0,"Curriculum card and progress missing at "+width);
    assert.ok(dashboard.coachNote.width>0&&dashboard.signals.width>0&&dashboard.focus.width>0,"Coach component card missing at "+width);
    assert.ok(dashboard.momentum.width>0,"Momentum path indicator missing at "+width);
    const roadmap=await page.locator(".home-momentum-grid .home-momentum-route").boundingBox();
    assert.ok(roadmap?.height>=160,"real unit roadmap must fill its Momentum card at "+width);
    if(width>1180){
      const fill=await page.evaluate(()=>{
        const b=q=>document.querySelector(q).getBoundingClientRect();
        const rail=b(".home-rail"),coach=b(".home-coach"),lab=b(".home-dashboard");
        const task=b(".rail-plan .today-route"), focus=b(".home-coach .next-card");
        return {railBottom:rail.bottom,coachBottom:coach.bottom,labBottom:lab.bottom,planBottom:task.bottom,focusBottom:focus.bottom,cardWidths:[...document.querySelectorAll(".home-momentum-grid>*")].flatMap(el=>el.classList.contains("home-momentum-actions")?[...el.children].map(c=>c.getBoundingClientRect().width):[el.getBoundingClientRect().width])};
      });
      assert.ok(fill.cardWidths.length===4&&fill.cardWidths.every(w=>w>160),"all four Momentum cards should fill the width at "+width+": "+JSON.stringify(fill));
      assert.ok(Math.abs(fill.railBottom-fill.labBottom)<2&&Math.abs(fill.coachBottom-fill.labBottom)<2,"dashboard columns should reach the same depth at "+width);
    }
    assert.ok(home.momentum.width>0&&home.momentum.height>0,"full-width Momentum section missing at "+width);

    assert.ok(Math.abs(home.momentum.x-home.main.x)<=1,"momentum should start at the full dashboard left edge "+width);
    assert.ok(home.momentum.right<=home.main.right+1,"momentum exceeds dashboard at "+width);
    if(width>1180){
      assert.ok(Math.abs(home.momentum.x-home.rail.x)<=1&&Math.abs(home.momentum.right-home.coach.right)<=1,"momentum should span all three columns at "+width);
      assert.ok(home.momentum.y>=Math.max(home.lab.bottom,home.coach.bottom,home.rail.bottom)-2,"momentum must follow all three columns at "+width);
    }
    assert.ok(!(home.next.x<home.review.right-.5&&home.next.right>home.review.x+.5&&home.next.y<home.review.bottom-.5&&home.next.bottom>home.review.y+.5),"momentum controls overlap at "+width);

    assert.ok(home.scroll<=home.doc+2,"home horizontal overflow at "+width+": "+JSON.stringify(home));
    assert.ok(Math.abs(home.study.width-home.main.width)<=1,"structured study must span full width at "+width);
    assert.ok(home.study.y>=Math.max(home.momentum.bottom,home.coach.bottom,home.rail.bottom,home.lab.bottom)-2,"structured study must follow the momentum dashboard at "+width+": "+JSON.stringify(home));
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
  console.log("PASS: unified four-section dashboard, responsive wide momentum and 10 study tools across 320–1440px");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
