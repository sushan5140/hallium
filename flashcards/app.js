/* Hallium Flashcard Studio · one genuine Korean word in a standalone, isolated Pages pilot.
   All actions affect only the local prototype. No writes to Hallium / Supabase. */
(() => {
  "use strict";
  const KEY = "hallium:flashcard-pilot:book:v1";
  const empty = () => ({ known: 0, learning: 0, saved: false, status: "new", dueAt: null, lastAt: null, listened: false, revealed: false });
  let state = read(), revealed = false, toastTimer = null;
  const $ = (id) => document.getElementById(id);
  const front = $("front"), back = $("back"), card = $("card");
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
  }
  function switchFace(next) {
    revealed = next;
    state.revealed ||= next;
    persist();
    card.classList.toggle("flipped", next);
    // Prevent hidden side's buttons from receiving keyboard focus.
    front.setAttribute("aria-hidden", String(next)); front.inert = next;
    back.setAttribute("aria-hidden", String(!next)); back.inert = !next;
    $("mode-caption").textContent = next ? "02 · Understand" : "01 · Observe";
    paint();
    requestAnimationFrame(() => (next ? $("back-audio") : $("reveal")).focus({ preventScroll: true }));
  }
  function getVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = speechSynthesis.getVoices();
    return voices.find(v => /^ko-KR$/i.test(v.lang) && /google|microsoft|korean/i.test(v.name))
      || voices.find(v => /^ko/i.test(v.lang))
      || null;
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
    utterance.onerror = () => toast("Could not play Korean audio. Check your device’s Korean voice settings.");
    try {
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
      state.listened = true; persist(); paint();
    } catch { toast("Audio could not start. Please tap Listen again."); }
  }
  function record(kind) {
    if (!revealed) { toast("Reveal the meaning before making your recall choice."); return; }
    if (kind === "know") state.known += 1; else state.learning += 1;
    const delta = kind === "know" ? 3 : 1;
    state.status = kind;
    state.lastAt = new Date().toISOString();
    state.dueAt = new Date(Date.now() + delta * 86400000).toISOString();
    persist(); paint();
    toast(kind === "know"
      ? "Nice! You reported remembering 책. Review again in about three days — it isn't a mastery score."
      : "Saved to your gentle review schedule. Come back tomorrow to practise 책 again.");
  }
  function toggleSave(forceAdd = false) {
    state.saved = forceAdd || !state.saved; persist(); paint();
    toast(state.saved ? "책 added to My first words. It stays in this browser for the prototype." : "책 removed from your preview collection.");
  }
  ["front-audio","inline-audio","back-audio"].forEach(id => $(id).addEventListener("click", () => play(AUDIO_TEXT)));
  $("sentence-audio").addEventListener("click", () => play(SENTENCE, true));
  $("reveal").addEventListener("click", () => switchFace(true));
  $("turn-back").addEventListener("click", () => switchFace(false));
  $("know").addEventListener("click", () => record("know"));
  $("learn").addEventListener("click", () => record("learn"));
  $("save").addEventListener("click", () => toggleSave());
  $("notebook-button").addEventListener("click", () => toggleSave(true));
  $("reset").addEventListener("click", () => {
    if (!window.confirm("Reset only this one-card GitHub Pages prototype? Your real Hallium learning progress will not change.")) return;
    state = empty(); revealed = false;
    try { localStorage.removeItem(KEY); } catch {}
    switchFace(false);
    toast("Prototype reset. The real Hallium app and its saved notes were not changed.");
  });
  // The two faces are in the DOM for the 3-D animation; only one can be accessed at a time.
  front.inert = false; front.setAttribute("aria-hidden", "false");
  back.inert = true; back.setAttribute("aria-hidden", "true");
  paint();
})();
