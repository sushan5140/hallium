const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const {chromium}=require("playwright");

(async()=>{
 const src=fs.readFileSync("lib/owner-korean/course.js","utf8");
 const sourceCourse=vm.runInNewContext(src.replace("export const ownerCourse =","const ownerCourse =")+"\nownerCourse");
 const batch=fs.readFileSync("lib/owner-korean/batch03.js","utf8");
 const nextCourse=vm.runInNewContext(batch.replace("export const ownerBatch03 =","const ownerBatch03 =")+"\nownerBatch03");
 assert.equal(sourceCourse.length,10,"The original two PDFs must remain intact");
 assert.equal(nextCourse.length,5,"Batch 03 must contain precisely Lessons 11–15");
 const course=[...sourceCourse,...nextCourse];
 assert.equal(course.length,15,"Fifteen lessons must be available for owner");
 const existingWords=new Set(sourceCourse.flatMap(l=>l.vocabulary.map(w=>w.ko)));
 const batchWords=nextCourse.flatMap(l=>l.vocabulary.map(w=>w.ko));
 const originalGrammar=new Set(sourceCourse.flatMap(l=>l.grammar.map(g=>g.name)));
 const batchGrammar=nextCourse.flatMap(l=>l.grammar.map(g=>g.name));
 assert.equal(existingWords.size,150,"Original target word ledger unexpectedly overlaps");
 assert.equal(new Set(batchWords).size,75,"Repeated new vocabulary within Batch 03");
 assert.ok(batchWords.every(w=>!existingWords.has(w)),"Batch 03 reused an earlier new-target vocabulary word");
 assert.equal(originalGrammar.size,20,"Original grammar ledger unexpectedly overlaps");
 assert.equal(new Set(batchGrammar).size,10,"Repeated new grammar within Batch 03");
 assert.ok(batchGrammar.every(g=>!originalGrammar.has(g)),"Batch 03 reused an earlier primary grammar target");
 let vocab=0,grammar=0;
 for(let n=0;n<course.length;n++){
  const lesson=course[n];
  assert.equal(lesson.id,n+1,"Lesson order must match the source PDFs");
  assert.equal(lesson.vocabulary.length,15,"Lesson vocabulary shortfall in "+lesson.id);
  assert.equal(lesson.grammar.length,2,"Lesson grammar shortfall in "+lesson.id);
  assert.equal(lesson.checks.length,3,"Missing lesson grammar check in "+lesson.id);
  assert.equal(lesson.readingQuestions.length,2,"Missing reading question in "+lesson.id);
  assert.equal(lesson.listeningQuestions.length,2,"Missing listening question in "+lesson.id);
  assert.ok(lesson.reading&&lesson.listening&&lesson.writing&&lesson.note,"Incomplete lesson "+lesson.id);
  vocab+=lesson.vocabulary.length;grammar+=lesson.grammar.length;
 }
 assert.equal(vocab,225);assert.equal(grammar,30);
 const ledger=fs.readFileSync("lib/owner-korean/cumulative-ledger-01-15.csv","utf8").trim().split("\n");
 assert.equal(ledger.length,256,"Cumulative ledger must hold the header and all 255 grammar/vocabulary targets");
 assert.equal(ledger.filter(x=>x.includes('"NEW authored Batch 03"')).length,85,
   "Cumulative ledger must mark 75 new vocabulary and 10 new grammar in Batch 03");
 assert.ok(ledger.includes('"255","15","Trips and experiences","Grammar","V-아/어 보다","try doing / experience doing","NEW authored Batch 03"'),
   "Cumulative ledger must end with the final new grammar target");
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
 assert.ok(server.includes("course={[...ownerCourse,...ownerBatch03]}"),"New batch must be available only after server owner verification");
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
 console.log("PASS: owner-only course stays private with 15 lessons, 225 non-overlapping words, 30 non-overlapping grammar, lesson tests and three-round word coverage");
})().catch(e=>{console.error(e);process.exitCode=1});
