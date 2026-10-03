export async function playServerKoreanTts(text, {
  rate = 1,
  signal,
  timeoutMs = 8000,
} = {}) {
  if (typeof window === "undefined" || typeof fetch !== "function" || typeof Audio === "undefined") return false;
  const value = String(text || "").trim();
  if (!value) return false;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  const abort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", abort, { once: true });
  }

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      signal: controller.signal,
      body: JSON.stringify({
        text: value.slice(0, 500),
        rate: Number.isFinite(Number(rate)) ? Number(rate) : 1,
      }),
    });
    if (!response.ok) return false;

    const blob = await response.blob();
    if (!blob.size || !String(blob.type || "").startsWith("audio/")) return false;

    const url = URL.createObjectURL(blob);
    try {
      const audio = new Audio(url);
      audio.preload = "auto";
      await audio.play();
      audio.addEventListener("ended", () => URL.revokeObjectURL(url), { once: true });
      audio.addEventListener("error", () => URL.revokeObjectURL(url), { once: true });
      return true;
    } catch {
      URL.revokeObjectURL(url);
      return false;
    }
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", abort);
  }
}
