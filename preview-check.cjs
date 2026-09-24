const assert=require("node:assert/strict");const {chromium}=require("playwright");const fs=require("node:fs");
(async()=>{
 new Function(fs.readFileSync("app.js","utf8"));
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  for(const width of [1440,1180,1024,820,720,390,320]){
   const page=await browser.newPage({viewport:{width,height:860},reducedMotion:"reduce"});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   const r=await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
   assert.equal(r.status(),200);
   await page.locator(".dashboard-grid").waitFor();
   let g=await page.evaluate(()=>{
    const b=s=>{let r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
    return {viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,left:b(".column.left"),center:b(".column.center"),right:b(".column.right"),momentum:b(".momentum"),study:b(".study")};
   });
   assert.ok(g.scroll<=g.viewport+2,"horizontal overflow at "+width+": "+JSON.stringify(g));
   if(width>1000){assert.ok(Math.abs(g.left.bottom-g.center.bottom)<2&&Math.abs(g.right.bottom-g.center.bottom)<2,"uneven column end at "+width+": "+JSON.stringify(g));}
   assert.ok(g.momentum.y>=Math.max(g.left.bottom,g.center.bottom,g.right.bottom)-2,"momentum overlaps top grid at "+width);
   assert.ok(g.study.y>=g.momentum.bottom-2,"study should follow momentum");
   await page.getByRole("button",{name:/Finish this sample lesson/i}).click();
   await page.getByText(/100% of your plan/i).count();
   assert.match(await page.locator("#daily-fraction").innerText(),/1\/3/);
   await page.getByRole("button",{name:/Review 3 words/i}).click();
   await page.getByRole("dialog").waitFor();
   await page.getByRole("button",{name:/Mark these words reviewed/i}).click();
   assert.match(await page.locator("#daily-fraction").innerText(),/2\/3/);
   await page.getByRole("button",{name:/Mini check/i}).first().click();
   await page.getByRole("dialog").waitFor();
   let answers=page.getByRole("dialog").locator(".answer-row");
   await answers.nth(1).click();await answers.nth(3).click();
   await page.getByRole("button",{name:/Check my answers/i}).click();
   await page.getByRole("button",{name:"Finish",exact:true}).click();
   assert.match(await page.locator("#daily-fraction").innerText(),/3\/3/);
   await page.reload({waitUntil:"domcontentloaded"});
   assert.match(await page.locator("#daily-fraction").innerText(),/3\/3/);
   await page.getByRole("button",{name:/Browse lesson catalog/i}).click();
   await page.getByRole("dialog").waitFor();
   await page.keyboard.press("Escape");
   assert.equal(await page.getByRole("dialog").count(),0);
   assert.deepEqual(errors,[],"browser errors at "+width);
   await page.close();
  }
  console.log("PASS: no-login dashboard, aligned desktop columns, responsive 320–1440px, interactive local progress, review, quiz and dialog");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
