/* Hangul Lab is served inside /hangul and must remain a complete independent
   learning studio on /hangul-lab/index.html. Regression-check the actual
   iframe geometry, interactive view routing and locally saved progress. */
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  for(const width of [1600,1440,1280,1100,1024,820,760,620,390,320]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   let response=await page.goto("http://127.0.0.1:3000/hangul",{waitUntil:"domcontentloaded"});
   assert.equal(response.status(),200,"/hangul route at "+width);
   const frame=page.frameLocator('iframe[title*="Hangul learning"]');
   await frame.locator("#letter-grid .letter-card").first().waitFor();
   assert.equal(await frame.locator("#letter-grid .letter-card").count(),40,"original alphabet data missing");
   const metrics=await frame.locator("html").evaluate(el=>{
    const box=q=>{let e=document.querySelector(q),r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height}};
    return {viewport:el.clientWidth,scroll:el.scrollWidth,
      sidebar:box(".sidebar"),footer:box(".sidebar-footer"),families:box("#family-shortcuts"),
      main:box(".main"),right:box(".rightbar"),hero:box(".hero"),
      categories:box(".category-grid"),pulse:box(".lab-pulse"),
      pulseVisible:getComputedStyle(document.querySelector(".lab-pulse")).display!=="none",
      sideVisible:getComputedStyle(document.querySelector(".sidebar")).display!=="none",
      rightVisible:getComputedStyle(document.querySelector(".rightbar")).display!=="none"
    };
   });
   assert.ok(metrics.scroll<=metrics.viewport+2,"Hangul horizontal overflow "+width+" "+JSON.stringify(metrics));
   assert.ok(metrics.main.width>0&&metrics.hero.width>0,"Hangul main lesson missing "+width);
   if(width>1090){
     assert.ok(metrics.sideVisible&&metrics.rightVisible&&!metrics.pulseVisible,"three real studio columns missing "+width);
     assert.ok(metrics.sidebar.right<=metrics.main.left+2&&metrics.main.right<=metrics.right.left+2,"studio columns overlap "+width);
     assert.ok(metrics.footer.top-metrics.families.bottom<43,"empty sidebar rail after letter families "+width);
   }else{
     assert.ok(metrics.pulseVisible&&!metrics.rightVisible,"responsive learning progress not carried from right rail "+width);
     if(width<=760)assert.ok(!metrics.sideVisible,"mobile sidebar still occupying space "+width);
   }
   if(width===390){
     await frame.locator("#letter-grid .letter-card").first().click();
     await frame.locator("#dialog-known").click();
     assert.equal(await frame.locator("#pulse-known").innerText(),"1","recognized letters not reflected in mobile progress");
     assert.equal(await frame.locator("#pulse-explored").innerText(),"1","explored letters not reflected in mobile progress");
     await frame.locator("#close-dialog").click();
     await page.reload({waitUntil:"domcontentloaded"});
     await frame.locator("#letter-grid .letter-card").first().waitFor();
     assert.equal(await frame.locator("#pulse-known").innerText(),"1","Hangul local progress not retained across reload");
   }
   const nav=width<=760?".mobile-nav":".desktop-nav";
   await frame.locator(nav+' [data-view="build"]').click();
   await frame.locator("#view-build").waitFor({state:"visible"});
   assert.equal(await frame.locator("#syllable-result").innerText(),"가","builder default should remain");
   if(width>1150){
     const dims=await frame.locator(".builder-workspace").evaluate(el=>[...el.children].map(v=>v.getBoundingClientRect().height));
     assert.ok(Math.abs(dims[0]-dims[1])<=3,"empty syllable builder column "+width+" "+JSON.stringify(dims));
   }
   await frame.locator(nav+' [data-view="write"]').click();
   await frame.locator("#writing-canvas").waitFor({state:"visible"});
   if(width>1150){
     const dims=await frame.locator(".writing-board").evaluate(el=>[...el.children].map(v=>v.getBoundingClientRect().height));
     assert.ok(Math.abs(dims[0]-dims[1])<=3,"unbalanced writing canvas and guidance "+width+" "+JSON.stringify(dims));
   }
   await frame.locator(nav+' [data-view="practice"]').click();
   await frame.locator("#quiz-start").waitFor({state:"visible"});
   await frame.locator(nav+' [data-view="cards"]').click();
   await frame.locator("#flashcard").waitFor({state:"visible"});
   assert.deepEqual(errors,[],"Hangul browser errors "+width);
   await page.close();
  }
  console.log("PASS: Hangul Lab balanced rails, responsive live progress, five interactive learning tools, alphabet and saved recognition across 320–1600px");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
