const assert=require("node:assert/strict");
const fs=require("node:fs");
const {chromium}=require("playwright");
const html=fs.readFileSync("index.html","utf8");
const theme=fs.readFileSync("dashboard-theme.css","utf8");
new Function(fs.readFileSync("dashboard-preview.js","utf8"));
assert.ok(html.includes('href="./dashboard-theme.css"'),"theme not linked in Pages entry");
assert.ok(theme.includes("--pine:#254a3b")&&theme.includes("--terra:#b8573b"),"new palette missing");
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
      lessonBackground:getComputedStyle(document.querySelector(".lesson")).backgroundColor,
      focusBackground:getComputedStyle(document.querySelector(".focus-card")).backgroundColor};
   });
   assert.ok(dim.scroll<=dim.viewport+2,"horizontal overflow "+width+": "+JSON.stringify(dim));
   if(width>1080)assert.ok(Math.abs(dim.left.bottom-dim.center.bottom)<2&&Math.abs(dim.right.bottom-dim.center.bottom)<2,"uneven panel depths "+width);
   assert.ok(dim.momentum.y>=Math.max(dim.left.bottom,dim.center.bottom,dim.right.bottom)-2,"momentum overlaps dashboard "+width);
   assert.ok(dim.study.y>=dim.momentum.bottom-2,"study should follow momentum");
   assert.equal(dim.lessonBackground,"rgb(233, 240, 230)","new sage lesson background absent");
   assert.equal(dim.focusBackground,"rgb(37, 74, 59)","forest-green focus card absent");
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
  console.log("PASS: field-notes palette, equal-depth desktop cards, 320–1600 responsive, lesson/review/quiz persistence, no login");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
