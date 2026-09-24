const assert=require("node:assert/strict");
const fs=require("node:fs");
const {chromium}=require("playwright");
const html=fs.readFileSync("index.html","utf8");
const theme=fs.readFileSync("dashboard-theme.css","utf8");
new Function(fs.readFileSync("dashboard-preview.js","utf8"));
assert.ok(html.includes('href="./dashboard-theme.css"'),"theme not linked in Pages entry");
assert.ok(["--paper:#F4F5F1","--surface:#FFFFFF","--ink:#17191F","--indigo:#5147E8","--jade:#087F69","--papaya:#E76F51","--sun:#E9C54F","--sun-soft:#FFF5C8"].every(token=>theme.includes(token)),"original Hallium V4 token system missing");
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  for(const width of [1600,1440,1180,1024,820,720,390,320]){
   const page=await browser.newPage({viewport:{width,height:850},reducedMotion:"reduce"});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   const resp=await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
   assert.equal(resp.status(),200);
   await page.locator(".lesson").waitFor();
   const dim=await page.evaluate(()=>{
    const box=s=>{const b=document.querySelector(s).getBoundingClientRect();return {x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width}};
    return {scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,
      left:box(".left"),center:box(".center"),right:box(".right"),momentum:box(".momentum"),study:box(".study"),
      curriculum:box("#curriculum"),plan:box("#plan"),checkpoint:box(".aside-fill"),
      route:box(".route-sequence"),momentumCard:box(".chapter-card"),
      leftPadding:parseFloat(getComputedStyle(document.querySelector(".left")).paddingBottom),
      lessonBackground:getComputedStyle(document.querySelector(".lesson")).backgroundColor,
      curriculumBackground:getComputedStyle(document.querySelector(".catalog-card")).backgroundColor,
      rightBackground:getComputedStyle(document.querySelector(".right")).backgroundColor,
      reviewBackground:getComputedStyle(document.querySelector(".momentum-action.review")).backgroundColor,
      chapterBackground:getComputedStyle(document.querySelector(".chapter-card")).backgroundColor,
      focusBackground:getComputedStyle(document.querySelector(".focus-card")).backgroundColor};
   });
   assert.ok(dim.scroll<=dim.viewport+2,"horizontal overflow "+width+": "+JSON.stringify(dim));
   assert.ok(dim.checkpoint.y>dim.plan.y&&dim.checkpoint.bottom<=dim.plan.bottom+1,"checkpoint should live inside today's plan "+width);
   assert.ok(dim.route.y>dim.curriculum.y&&dim.route.bottom<=dim.curriculum.bottom+1,"curriculum sequence should be in curriculum panel "+width);
   if(width>1080){
    const unused=Math.round(dim.left.bottom-dim.curriculum.bottom-dim.leftPadding);
    console.log("desktop rail "+width+": unused "+unused+"px; momentum card "+Math.round(dim.momentumCard.bottom-dim.momentumCard.y)+"px");
    assert.ok(unused<=42,"excess empty space under left learning rail "+width+": "+unused+"px");
    assert.ok(dim.momentumCard.bottom-dim.momentumCard.y<=225,"momentum cards too tall "+width);
   }
   if(width>1080)assert.ok(Math.abs(dim.left.bottom-dim.center.bottom)<2&&Math.abs(dim.right.bottom-dim.center.bottom)<2,"uneven panel depths "+width);
   assert.ok(dim.momentum.y>=Math.max(dim.left.bottom,dim.center.bottom,dim.right.bottom)-2,"momentum overlaps dashboard "+width);
   assert.ok(dim.study.y>=dim.momentum.bottom-2,"study should follow momentum");
   assert.equal(dim.lessonBackground,"rgb(245, 244, 255)","V4 indigo-soft lesson background absent");
   assert.equal(dim.curriculumBackground,"rgb(232, 231, 255)","V4 indigo curriculum absent");
   assert.equal(dim.rightBackground,"rgb(247, 248, 244)","neutral coach panel absent");
   assert.equal(dim.reviewBackground,"rgb(223, 242, 235)","V4 jade review panel absent");
   assert.equal(dim.chapterBackground,"rgb(23, 25, 31)","ink chapter absent");
   assert.equal(dim.focusBackground,"rgb(23, 25, 31)","ink focus card absent");

   const contrast=await page.evaluate(()=>{
    const luminance=rgb=>{
      const vals=(rgb.match(/[0-9.]+/g)||[]).slice(0,3).map(Number).map(v=>{
        v/=255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;
      });return vals[0]*0.2126+vals[1]*0.7152+vals[2]*0.0722;
    };
    const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
    return [
      [".pane-desc",".left"],[".lesson-title h3",".lesson"],
      [".catalog-card>strong",".catalog-card"],
      [".route-step.current .route-step-status",".route-sequence"],
      [".focus-card h3",".focus-card"],
      [".momentum-action.review>strong",".momentum-action.review"],
      [".chapter-card h3",".chapter-card"],
      [".coach-desc",".right"]
    ].map(([fg,bg])=>({fg,bg,ratio:ratio(getComputedStyle(document.querySelector(fg)).color,getComputedStyle(document.querySelector(bg)).backgroundColor)}));
   });
   for(const item of contrast)assert.ok(item.ratio>=4.5,"low contrast at "+width+": "+JSON.stringify(item));
   assert.equal(await page.locator("input[type=password], form[action*=login]").count(),0,"preview should not ask for sign-in");
   await page.locator("#complete-lesson").click();
   assert.match(await page.locator("#daily-fraction").innerText(),/1\/3/);
   assert.match(await page.locator("#unit-fraction").innerText(),/1 \/ 5/);
   await page.locator("#open-words").click();
   await page.getByRole("dialog").waitFor();
   await page.getByRole("button",{name:/Mark these words reviewed/i}).click();
   assert.match(await page.locator("#daily-fraction").innerText(),/2\/3/);
   await page.locator("#open-check").click();
   await page.getByRole("dialog").waitFor();
   const choices=page.getByRole("dialog").locator(".answer-row");
   await choices.nth(1).click();
   await choices.nth(3).click();
   await page.getByRole("button",{name:/Check my answers/}).click();
   await page.getByRole("button",{name:"Finish",exact:true}).click();
   assert.match(await page.locator("#daily-fraction").innerText(),/3\/3/);
   await page.reload({waitUntil:"domcontentloaded"});
   assert.match(await page.locator("#daily-fraction").innerText(),/3\/3/);
   assert.deepEqual(errors,[],"browser errors "+width);
   await page.close();
  }
  console.log("PASS: original Hallium V4 multi-accent palette, compact no-gap rail, 320–1600 responsive, lesson/review/quiz persistence, no login");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
