/* Hallium Flashcard Studio · one genuine Korean word in a standalone, isolated Pages pilot.
   All actions affect only the local prototype. No writes to Hallium / Supabase. */
(() => {
  "use strict";
  const KEY = "hallium:flashcard-pilot:book:v2";
  const empty = () => ({ known: 0, learning: 0, saved: false, status: "new", dueAt: null, lastAt: null, listened: false, revealed: false });
  let state = read(), revealed = false, toastTimer = null, answeredThisTurn = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const $ = (id) => document.getElementById(id);
  const front = $("front"), back = $("back"), card = $("card"), scene = $("flip-scene");
  let effectTimer = null;
  let audioTimer = null;
  const AUDIO_TEXT = "책", SENTENCE = "이것은 책이에요.";
  function read() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY));
      if (!parsed || typeof parsed !== "object") return empty();
      return {
        known: Number.isSafeInteger(parsed.known) ? Math.max(0, parsed.known) : 0,
        learning: Number.isSafeInteger(parsed.learning) ? Math.max(0, parsed.learning) : 0,
        saved: parsed.saved === true,
        status: ["new","know","learn"].includes(parsed.status) ? parsed.status : "new",
        dueAt: typeof parsed.dueAt === "string" ? parsed.dueAt : null,
        lastAt: typeof parsed.lastAt === "string" ? parsed.lastAt : null,
        listened: parsed.listened === true, revealed: parsed.revealed === true,
      };
    } catch { return empty(); }
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch { toast("This browser could not save your practice. Check private browsing or storage permissions."); return false; }
  }
  function toast(message) {
    const el = $("toast");
    el.textContent = message; el.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 4300);
  }
  function dateLabel(value) {
    if (!value) return "";
    const n = Date.parse(value);
    if (!Number.isFinite(n)) return "";
    return new Date(n).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  function paint() {
    $("known-count").textContent = String(state.known);
    const steps = 1 + Number(state.listened) + Number(state.revealed) + Number(state.status !== "new");
    $("activity-progress").setAttribute("aria-valuenow", String(steps));
    $("progress-fill").style.width = String(steps * 25) + "%";
    $("progress-number").textContent = steps + " / 4";
    $("learn-count").textContent = String(state.learning);
    const chip = $("status-chip");
    chip.className = "status-chip" + (state.status === "new" ? "" : " " + state.status);
    chip.textContent = state.status === "know" ? "✓ Recalled (self-check)" : state.status === "learn" ? "♡ In review" : "Not practised yet";
    $("review-state").textContent = state.dueAt && state.status !== "new"
      ? (state.status === "know" ? "Nice recall! Try again around " : "Keep it close. Try again around ") + dateLabel(state.dueAt) + "."
      : "Your first recall choice is waiting.";
    const save = $("save"), notebook = $("notebook-button");
    save.setAttribute("aria-pressed", String(state.saved));
    save.textContent = state.saved ? "♥ Saved to my collection" : "♡ Save to my collection";
    notebook.disabled = state.saved;
    notebook.innerHTML = state.saved ? "Saved in my first words <span>✓</span>" : "Add this card <span>↗</span>";
    $("collection-description").textContent = state.saved ? "책 · Book is tucked away here." : "Save 책 to keep it close.";
    $("audio-mark").classList.toggle("completed", state.listened);
    $("audio-mark").textContent = state.listened ? "✓ Done" : "Try it";
    $("reveal-mark").classList.toggle("completed", state.revealed);
    $("reveal-mark").textContent = state.revealed ? "✓ Done" : "Try it";
    $("recall-mark").classList.toggle("completed", state.status !== "new");
    $("recall-mark").textContent = state.status !== "new" ? "✓ Done" : "Try it";
    $("know").disabled = answeredThisTurn;
    $("learn").disabled = answeredThisTurn;
  }
  function switchFace(next) {
    if (!next) { answeredThisTurn = false; card.classList.remove("has-choice"); $("card-finish").hidden = true; }
    revealed = next;
    state.revealed ||= next;
    persist();
    card.classList.toggle("flipped", next);
    scene.classList.toggle("is-revealed", next);
    if (next) {
      burst("reveal", 9);
    }
    // Prevent hidden side's buttons from receiving keyboard focus.
    front.setAttribute("aria-hidden", String(next)); front.inert = next;
    back.setAttribute("aria-hidden", String(!next)); back.inert = !next;
    $("mode-caption").textContent = next ? "02 · Understand" : "01 · Observe";
    paint();
    const focus = () => (next ? $("back-audio") : $("reveal")).focus({ preventScroll: true });
    if (reducedMotion.matches) requestAnimationFrame(focus);
    else window.setTimeout(focus, 600);
  }
  function getVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = speechSynthesis.getVoices();
    return voices.find(v => /^ko-KR$/i.test(v.lang) && /google|microsoft|korean/i.test(v.name))
      || voices.find(v => /^ko/i.test(v.lang))
      || null;
  }
  function animateAudio(active) {
    ["front-audio","inline-audio","back-audio","sentence-audio"].forEach(id => {
      const control = $(id);
      control.classList.toggle("is-speaking", active);
    });
    if (audioTimer) clearTimeout(audioTimer);
    if (active) audioTimer = window.setTimeout(() => animateAudio(false), 4600);
  }
  function burst(kind, amount = 12) {
    if (reducedMotion.matches) return;
    const layer = $("card-fx");
    layer.replaceChildren();
    if (effectTimer) clearTimeout(effectTimer);
    for (let i = 0; i < amount; i++) {
      const dot = document.createElement("span");
      dot.className = "fx-particle fx-" + kind;
      dot.textContent = kind === "know" ? (i % 4 === 0 ? "✦" : "●") : kind === "learn" ? (i % 3 === 0 ? "♡" : "●") : "✳";
      const angle = (Math.PI * 2 * i / amount) - Math.PI / 2;
      const distance = kind === "reveal" ? 70 + (i % 3) * 19 : 94 + (i % 4) * 23;
      dot.style.setProperty("--dx", Math.cos(angle) * distance + "px");
      dot.style.setProperty("--dy", Math.sin(angle) * distance + "px");
      dot.style.setProperty("--spin", ((i % 2 ? -1 : 1) * (80 + 35 * i)) + "deg");
      dot.style.setProperty("--delay", (i % 3) * 28 + "ms");
      layer.appendChild(dot);
    }
    effectTimer = window.setTimeout(() => layer.replaceChildren(), 1300);
  }
  function play(text, slowly = false) {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      toast("Audio is unavailable in this browser. You can still reveal and practise this card.");
      return;
    }
    const voice = getVoice(), utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    if (voice) utterance.voice = voice;
    utterance.rate = slowly ? 0.78 : 0.94;
    utterance.pitch = 1; utterance.volume = 1;
    utterance.onstart = () => animateAudio(true);
    utterance.onend = () => animateAudio(false);
    utterance.onerror = () => {
      animateAudio(false);
      toast("Could not play Korean audio. Check your device’s Korean voice settings.");
    };
    try {
      animateAudio(false);
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
      state.listened = true; persist(); paint();
    } catch {
      animateAudio(false);
      toast("Audio could not start. Please tap Listen again.");
    }
  }
  function record(kind) {
    if (!revealed) { toast("Reveal the meaning before making your recall choice."); return; }
    if (answeredThisTurn) return;
    answeredThisTurn = true;
    if (kind === "know") state.known += 1; else state.learning += 1;
    const delta = kind === "know" ? 3 : 1;
    state.status = kind;
    state.lastAt = new Date().toISOString();
    state.dueAt = new Date(Date.now() + delta * 86400000).toISOString();
    persist(); paint();
    const box = $("card-finish");
    $("finish-icon").textContent = kind === "know" ? "✦" : "♡";
    $("finish-title").textContent = kind === "know" ? "That felt familiar!" : "Now it has a place to grow.";
    $("finish-detail").textContent = kind === "know" ? "You self-reported remembering 책. Return in about three days." : "책 is scheduled for another look tomorrow. You can practise it again now.";
    box.hidden = false;
    card.classList.add("has-choice");
    burst(kind, 16);
    toast(kind === "know"
      ? "Nice! You reported remembering 책. Review again in about three days — it isn't a mastery score."
      : "Saved to your gentle review schedule. Come back tomorrow to practise 책 again.");
  }
  function toggleSave(forceAdd = false) {
    state.saved = forceAdd || !state.saved; persist(); paint();
    if (state.saved) {
      $("notebook").classList.remove("just-saved");
      void $("notebook").offsetWidth;
      $("notebook").classList.add("just-saved");
      burst("learn", 8);
    }
    toast(state.saved ? "책 added to My first words. It stays in this browser for the prototype." : "책 removed from your preview collection.");
  }
  ["front-audio","inline-audio","back-audio"].forEach(id => $(id).addEventListener("click", () => play(AUDIO_TEXT)));
  $("sentence-audio").addEventListener("click", () => play(SENTENCE, true));
  $("reveal").addEventListener("click", () => switchFace(true));
  $("turn-back").addEventListener("click", () => switchFace(false));
  $("practice-again").addEventListener("click", () => { switchFace(false); toast("Try to recall 책 again before you reveal the meaning."); });
  $("know").addEventListener("click", () => record("know"));
  $("learn").addEventListener("click", () => record("learn"));
  $("save").addEventListener("click", () => toggleSave());
  $("notebook-button").addEventListener("click", () => toggleSave(true));
  $("reset").addEventListener("click", () => {
    if (!window.confirm("Reset only this one-card GitHub Pages prototype? Your real Hallium learning progress will not change.")) return;
    state = empty(); revealed = false; answeredThisTurn = false;
    $("card-fx").replaceChildren();
    $("notebook").classList.remove("just-saved");
    try { localStorage.removeItem(KEY); } catch {}
    switchFace(false);
    toast("Prototype reset. The real Hallium app and its saved notes were not changed.");
  });
  // Light pointer parallax lives on the scene wrapper; the inner card handles the face flip.
  // Touchscreens never tilt. Reduced-motion preference disables all decorative movement.
  if (finePointer.matches && !reducedMotion.matches) {
    let frame = null;
    scene.addEventListener("pointermove", event => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = scene.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
        scene.style.setProperty("--tilt-y", (x * 2.1).toFixed(2) + "deg");
        scene.style.setProperty("--tilt-x", (-y * 1.7).toFixed(2) + "deg");
        frame = null;
      });
    });
    scene.addEventListener("pointerleave", () => {
      if (frame !== null) cancelAnimationFrame(frame);
      scene.style.setProperty("--tilt-x", "0deg");
      scene.style.setProperty("--tilt-y", "0deg");
    });
  }
  // The two faces are in the DOM for the 3-D animation; only one can be accessed at a time.
  front.inert = false; front.setAttribute("aria-hidden", "false");
  back.inert = true; back.setAttribute("aria-hidden", "true");
  paint();
})();
