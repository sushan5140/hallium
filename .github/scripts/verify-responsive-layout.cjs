/* Browser regression test for the Word Map collision and responsive Hallium shell.
   Run by the existing Chromium CI step against the real served globals.css. */
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const vocab=[
 ["Greetings",["안녕하세요"]],
 ["Identity",["이름","학생","친구"]],
 ["Objects",["책","가방","물","커피"]],
 ["Places",["학교","집","도서관","카페"]]
];
const districts=vocab.map(([name,words],i)=>'<section class="map-district district-'+(i+1)+'"><span>'+name+'</span>'+words.map(w=>'<button class="map-node"><strong>'+w+'</strong><small>Everyday '+name.toLowerCase()+' meaning</small></button>').join("")+'</section>').join("");
const doc=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div class="app-shell"><header class="topbar"><a class="brand"><span class="brand-mark">ㅎ</span><span><strong>Hallim</strong><small>한림 · Structured Korean</small></span></a><nav class="primary-nav">${["Practice","Lessons","Hangul Lab","Flashcards","Study Partners","Word map","Review"].map(s=>'<button class="nav-tab'+(s==="Study Partners"?" sp-main-nav-link":s==="Flashcards"?" flashcards-main-nav-link":s==="Hangul Lab"?" hangul-nav-tab":"")+'">'+s+'</button>').join("")}</nav><div class="top-actions"><button class="lesson-count partner-v4-shortcut partner-top-link">Real Korean ♡</button><a class="lesson-count partnerLink">Ambassadors</a><button class="streak"><span>1</span><small>lesson done</small></button><button class="profile-button">SU</button></div></header><div class="workspace"><aside class="lesson-rail"><h1>Word map</h1></aside><main class="lab"><div class="lab-topline"><div><h2>Meaning lives between words.</h2></div><span class="lesson-count">0 strong words</span></div><div class="word-map-stage">${districts}<svg class="map-lines"></svg></div></main><aside class="coach word-detail"><div class="coach-head"><h2>안녕하세요</h2></div><div class="example-card"><strong>안녕하세요. 저는 민지예요.</strong></div></aside></div></div></body></html>`;
const near=(a,b)=>a<b+.75;
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage();
 try{
  await page.goto("http://127.0.0.1:3000/flashcards",{waitUntil:"domcontentloaded"});
  for(const width of [1440,1365,1280,1180,1024,820,768,620,390,320]){
   await page.setViewportSize({width,height:900});
   await page.setContent(doc,{waitUntil:"load"});
   await page.addStyleTag({path:"app/globals.css"});
   const metrics=await page.evaluate(()=>{
    const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
    const districts=[...document.querySelectorAll(".map-district")].map(el=>{let r=el.getBoundingClientRect();return{name:el.firstElementChild.textContent,x:r.x,y:r.y,right:r.right,bottom:r.bottom,nodes:[...el.querySelectorAll(".map-node")].map(n=>{let b=n.getBoundingClientRect();return{x:b.x,y:b.y,right:b.right,bottom:b.bottom}})}});
    return{width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,stage:rect(".word-map-stage"),districts,header:rect(".topbar"),brand:rect(".topbar .brand"),nav:rect(".topbar .primary-nav"),navDisplay:getComputedStyle(document.querySelector(".topbar .primary-nav")).display,actions:rect(".topbar .top-actions"),style:getComputedStyle(document.querySelector(".word-map-stage")).display};
   });
   assert.equal(metrics.style,"grid","map lost its layout at "+width);
   assert.ok(metrics.scroll<=metrics.width+1,"horizontal overflow at "+width+": "+JSON.stringify(metrics));
   for(let i=0;i<metrics.districts.length;i++){
    const a=metrics.districts[i];
    assert.ok(near(metrics.stage.x,a.x)&&near(a.right,metrics.stage.right)&&near(metrics.stage.y,a.y)&&near(a.bottom,metrics.stage.bottom),"district outside stage "+a.name+" at "+width);
    for(const b of a.nodes)assert.ok(near(a.x,b.x)&&near(b.right,a.right)&&near(a.y,b.y)&&near(b.bottom,a.bottom),"word outside district "+a.name+" at "+width);
    for(let j=i+1;j<metrics.districts.length;j++){
     const b=metrics.districts[j],overlap=a.x<b.right-.75&&a.right>b.x+.75&&a.y<b.bottom-.75&&a.bottom>b.y+.75;
     assert.equal(overlap,false,a.name+" overlaps "+b.name+" at "+width);
    }
   }
   if(metrics.navDisplay!=="none")assert.ok(near(metrics.brand.right,metrics.nav.x)&&near(metrics.nav.right,metrics.actions.x),"header elements overlap at "+width+": "+JSON.stringify(metrics));
  }
  console.log("PASS: no word collisions, clipped districts, page overflow or header overlap at 320–1440px");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
