/* Browser-level smoke checks for the one-card GitHub Pages experience. */
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.on("pageerror", error => errors.push(error.message));
  try {
    await page.goto("http://127.0.0.1:4173/flashcards/", { waitUntil: "domcontentloaded" });
    await page.locator("#card").waitFor();
    const initial = await page.locator("#progress-number").innerText();
    assert.equal(initial, "1 / 4");
    await page.locator("#reveal").click();
    await page.waitForTimeout(850);
    assert.ok(await page.locator("#card").evaluate(el => el.classList.contains("flipped")));
    assert.equal(await page.locator("#front").getAttribute("aria-hidden"),"true");
    assert.equal(await page.locator("#back").getAttribute("aria-hidden"),"false");
    await page.locator("#know").click();
    assert.equal(await page.locator("#known-count").innerText(),"1");
    assert.ok(await page.locator("#card").evaluate(el=>el.classList.contains("has-choice")));
    assert.equal(await page.locator("#card-finish").isVisible(),true);
    await page.locator("#save").click();
    assert.equal(await page.locator("#save").getAttribute("aria-pressed"),"true");
    console.log("PASS: 3D reveal, successful recall feedback and notebook save");
    await page.reload({waitUntil:"domcontentloaded"});
    assert.equal(await page.locator("#known-count").innerText(),"1");
    assert.equal(await page.locator("#save").getAttribute("aria-pressed"),"true");
    await page.locator("#reveal").click();
    await page.waitForTimeout(850);
    await page.locator("#learn").click();
    assert.equal(await page.locator("#learn-count").innerText(),"1");
    await page.locator("#practice-again").click();
    assert.equal(await page.locator("#front").getAttribute("aria-hidden"),"false");
    console.log("PASS: persistent learning choice and replay");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(850);
    let dims=await page.evaluate(()=>{
      const front=document.querySelector("#front"),card=document.querySelector("#card"),button=document.querySelector("#reveal"),page=document.documentElement;
      const f=front.getBoundingClientRect(),b=button.getBoundingClientRect();
      return {scroll:page.scrollWidth,viewport:innerWidth,frontBottom:f.bottom,buttonBottom:b.bottom,cardHeight:card.getBoundingClientRect().height};
    });
    assert.ok(dims.scroll <= dims.viewport + 3,"horizontal overflow "+JSON.stringify(dims));
    assert.ok(dims.buttonBottom < dims.frontBottom - 5,"reveal button clipped "+JSON.stringify(dims));
    await page.locator("#reveal").click();
    await page.waitForTimeout(850);
    await page.locator("#know").click();
    const rect=await page.evaluate(()=>{
      const face=document.querySelector("#back").getBoundingClientRect();
      const finish=document.querySelector("#card-finish").getBoundingClientRect();
      return {faceBottom:face.bottom,finishBottom:finish.bottom};
    });
    assert.ok(rect.finishBottom<rect.faceBottom-2,"success response clipped "+JSON.stringify(rect));
    console.log("PASS: 390px mobile layout without horizontal scroll or clipped controls");
    const reduced=await browser.newPage({reducedMotion:"reduce"});
    reduced.on("pageerror",error=>errors.push(error.message));
    await reduced.goto("http://127.0.0.1:4173/flashcards/",{waitUntil:"domcontentloaded"});
    const duration=await reduced.locator(".illustration svg").evaluate(el=>getComputedStyle(el).animationDuration);
    assert.equal(duration,"0s");
    await reduced.locator("#reveal").click();
    assert.equal(await reduced.locator("#back").getAttribute("aria-hidden"),"false");
    await reduced.close();
    console.log("PASS: reduced-motion preference still permits card reveal");
    assert.deepEqual(errors,[],"Browser JavaScript errors");
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
