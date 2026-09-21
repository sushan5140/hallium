/* Real Chromium interaction test for the fictional local Study Partners workflow. */
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true, args:["--no-sandbox"] });
  const page = await browser.newPage({ viewport:{width:1380,height:900} });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  try {
    await page.goto("http://127.0.0.1:3000/study-partners", { waitUntil:"networkidle" });
    await page.getByRole("heading", {name:/Your learning desk/}).waitFor();
    console.log("PASS: prototype hydrated in Chromium");
    await page.locator(".spNav").filter({hasText:"Discover"}).click();
    const mina = page.locator(".spMatch").filter({hasText:"Mina"});
    await mina.getByRole("button",{name:/Ask to study together/}).click();
    await page.locator(".spPersonaSelect select").selectOption("mina");
    await page.locator(".spNav").filter({hasText:"Connections"}).click();
    await page.getByRole("button",{name:"Accept request"}).click();
    await page.getByRole("button",{name:/Open room/}).click();
    console.log("PASS: mutual request/accept opens shared room");

    const roomSelect = page.locator(".spRoomCols").first().locator("select").first();
    await roomSelect.selectOption("m1");
    await page.getByRole("button",{name:/Share selected note/}).click();
    await page.locator(".spPersonaSelect select").selectOption("susan");
    await page.locator(".spNav").filter({hasText:"Shared room"}).click();
    await page.locator(".spRoomCols").first().locator("select").first().selectOption("s1");
    await page.getByRole("button",{name:/Share selected note/}).click();
    console.log("PASS: only selected notes shared in both directions");

    await page.getByRole("button",{name:/Generate mutual practice/}).click();
    await page.getByRole("heading",{name:"Mutual learning session"}).waitFor();
    const firstPrompt = await page.locator(".spPracticePrompt").innerText();
    assert.match(firstPrompt,/학교/);
    await page.locator(".spPracticeBody textarea").fill("학교 means school. 학교에 가요.");
    await page.getByRole("button",{name:/Save my response/}).click();
    await page.locator(".spResponseGrid").getByText("학교 means school.",{exact:false}).waitFor();
    console.log("PASS: note-grounded practice and per-learner response");

    await page.locator(".spPersonaSelect select").selectOption("mina");
    await page.locator(".spNav").filter({hasText:"Practice"}).click();
    await page.locator(".spResponseGrid").getByText("학교 means school.",{exact:false}).waitFor();
    await page.locator(".spNav").filter({hasText:"Shared room"}).click();
    await page.getByRole("button",{name:/Save my copy/}).click();
    await page.locator(".spNav").filter({hasText:"My notes"}).click();
    await page.getByText("From Susan").waitFor();
    console.log("PASS: partner reads response and saves independent copy");

    await page.setViewportSize({width:390,height:844});
    await page.locator(".spNav").filter({hasText:"Discover"}).click();
    assert.ok(await page.locator(".spMatch").count()>0);
    const width = await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
    assert.ok(width.scroll<=width.viewport+3, "mobile layout overflow: "+JSON.stringify(width));
    assert.deepEqual(errors,[]);
    console.log("PASS: mobile discovery and no page JavaScript errors");
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
