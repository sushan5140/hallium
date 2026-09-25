const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const {chromium}=require("playwright");

(async()=>{
 const src=fs.readFileSync("lib/owner-korean/course.js","utf8");
 const course=vm.runInNewContext(src.replace("export const ownerCourse =","const ownerCourse =")+"\nownerCourse");
 assert.equal(course.length,10,"Exactly ten PDF lessons must be included");
 let vocab=0,grammar=0;
 for(let n=0;n<course.length;n++){
  const lesson=course[n];
  assert.equal(lesson.id,n+1,"Lesson order must match the source PDFs");
  assert.equal(lesson.vocabulary.length,15,"PDF vocabulary shortfall in "+lesson.id);
  assert.equal(lesson.grammar.length,2,"PDF grammar shortfall in "+lesson.id);
  assert.equal(lesson.checks.length,3,"Missing original source check in "+lesson.id);
  assert.equal(lesson.readingQuestions.length,2,"Missing reading question in "+lesson.id);
  assert.equal(lesson.listeningQuestions.length,2,"Missing listening question in "+lesson.id);
  assert.ok(lesson.reading&&lesson.listening&&lesson.writing&&lesson.note,"Incomplete lesson "+lesson.id);
  vocab+=lesson.vocabulary.length;grammar+=lesson.grammar.length;
 }
 assert.equal(vocab,150);assert.equal(grammar,20);
 const client=fs.readFileSync("app/my-korean/studio-client.jsx","utf8");
 const body=client.slice(client.indexOf("function buildQuiz("),client.indexOf("\nfunction SpeakButton"));
 const make=vm.runInNewContext(body+"\nbuildQuiz");
 for(const lesson of course){
  const all=new Set();
  for(const attempt of [0,1,2]){
   const quiz=make(lesson,attempt);
   assert.equal(quiz.length,8,"Each test requires 3 original grammar and 5 target vocabulary questions");
   assert.equal(quiz.filter(x=>x.type==="grammar").length,3);
   const questions=quiz.filter(x=>x.type==="vocabulary");
   assert.equal(questions.length,5);
   questions.forEach(q=>{
    const selected=lesson.vocabulary.find(w=>q.prompt==="What does "+w.ko+" mean?");
    assert.ok(selected&&q.answer===selected.meaning&&q.choices.includes(q.answer),
      "Quiz invented an answer for "+lesson.id);
    all.add(selected.ko);
   });
  }
  assert.equal(all.size,15,"Three quiz rounds must review all 15 lesson words");
 }
 const server=fs.readFileSync("app/my-korean/page.js","utf8");
 assert.ok(server.includes('dynamic = "force-dynamic"'),"No static caching for owner content");
 assert.ok(server.includes('supabase.auth.getUser()'),"Auth must be verified by server");
 assert.ok(server.includes('supabase.from("admin_users")'),"Admin role check must be server-side");
 assert.ok(server.includes('user.email?.trim().toLowerCase() !== "sushan5140s@gmail.com"'),"Owner email must be verified");
 assert.ok(server.includes("notFound()"),"Unauthorized route must not expose course");
 assert.ok(server.includes("robots: { index: false"),"Private content should be noindex");
 assert.ok(!fs.readFileSync("app/sitemap.js","utf8").includes("/my-korean"),"Private page listed in sitemap");
 const app=fs.readFileSync("app/page.js","utf8");
 assert.ok(app.includes('adminAccess && authUser?.email?.trim().toLowerCase() === "sushan5140s@gmail.com"'),
   "Private menu must be hidden for non-owner accounts");
 assert.ok(client.includes('from("owner_korean_study")'),"No private synced notes storage");
 assert.ok(client.includes('quizRound'),"Quiz must remain stable while checking answers");
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  for(const width of [320,390,820,1360]){
   const page=await browser.newPage({viewport:{width,height:850}});
   const resp=await page.goto("http://127.0.0.1:3000/my-korean",{waitUntil:"domcontentloaded"});
   assert.equal(resp.status(),404,"Anonymous owner-only route must deny access at "+width);
   const bodyText=await page.locator("body").innerText();
   assert.ok(!bodyText.includes("15 TARGET ITEMS")&&!bodyText.includes("YOUR PRIVATE COLLECTION"),
    "Anonymous visitor could see owner study UI");
   const html=await page.content();
   assert.ok(!html.includes("샤워해요. 그리고 밥을 먹어요."),"Private course leaked in anonymous HTML");
   await page.close();
  }
 }finally{await browser.close()}
 console.log("PASS: owner-only study is anonymous-proof, source-grounded (10 lessons, 150 words, 20 grammar), 8-question per-lesson tests and 15-word rotation");
})().catch(e=>{console.error(e);process.exitCode=1});
