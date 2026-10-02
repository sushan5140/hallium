export const KOREAN_VOICE_STORAGE_KEY = "hallium:korean-voice:v1";

export const DEFAULT_KOREAN_VOICE_PREFERENCE = Object.freeze({
  voiceUri: "",
  voiceName: "",
  rate: 0.95,
  updatedAt: "",
});

export function clampKoreanRate(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return DEFAULT_KOREAN_VOICE_PREFERENCE.rate;
  return Math.max(0.55, Math.min(1.15, Math.round(number * 100) / 100));
}

export function normalizeVoicePreference(value) {
  const input = value && typeof value === "object" ? value : {};
  return {
    voiceUri: typeof input.voiceUri === "string" ? input.voiceUri : "",
    voiceName: typeof input.voiceName === "string" ? input.voiceName : "",
    rate: clampKoreanRate(input.rate),
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : "",
  };
}

export function readLocalVoicePreference() {
  if (typeof window === "undefined") return DEFAULT_KOREAN_VOICE_PREFERENCE;
  try {
    return normalizeVoicePreference(
      JSON.parse(localStorage.getItem(KOREAN_VOICE_STORAGE_KEY) || "null")
    );
  } catch {
    return DEFAULT_KOREAN_VOICE_PREFERENCE;
  }
}

export function writeLocalVoicePreference(preference) {
  const normalized = normalizeVoicePreference(preference);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KOREAN_VOICE_STORAGE_KEY, JSON.stringify(normalized));
    } catch {}
  }
  return normalized;
}

export function koreanVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang?.toLowerCase().startsWith("ko"))
    .sort((a, b) => {
      const preferred = /google|microsoft|samsung|siri/i;
      const aScore = preferred.test(a.name || "") ? 2 : a.localService ? 1 : 0;
      const bScore = preferred.test(b.name || "") ? 2 : b.localService ? 1 : 0;
      return bScore - aScore || String(a.name).localeCompare(String(b.name));
    });
}

export function resolveKoreanVoice(preference, voices = koreanVoices()) {
  const normalized = normalizeVoicePreference(preference);
  return (
    voices.find((voice) => voice.voiceURI === normalized.voiceUri) ||
    voices.find((voice) => voice.name === normalized.voiceName) ||
    voices.find((voice) => /google|microsoft|samsung|siri/i.test(voice.name || "")) ||
    voices.find((voice) => voice.localService) ||
    voices[0] ||
    null
  );
}

export function speakKoreanText(text, preference, options = {}) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return false;
  }

  try {
    const normalized = normalizeVoicePreference(preference);
    const utterance = new SpeechSynthesisUtterance(String(text || ""));
    const multiplier = Number.isFinite(Number(options.rateMultiplier))
      ? Number(options.rateMultiplier)
      : 1;
    utterance.lang = "ko-KR";
    utterance.rate = clampKoreanRate(normalized.rate * multiplier);
    utterance.pitch = Number.isFinite(Number(options.pitch))
      ? Number(options.pitch)
      : 1;
    utterance.volume = Number.isFinite(Number(options.volume))
      ? Number(options.volume)
      : 1;

    const voice = resolveKoreanVoice(normalized);
    if (voice) utterance.voice = voice;

    window.speechSynthesis.cancel();
    window.setTimeout(() => window.speechSynthesis.speak(utterance), 45);
    return true;
  } catch {
    return false;
  }
}

export function newerVoicePreference(localValue, remoteValue) {
  const local = normalizeVoicePreference(localValue);
  const remote = normalizeVoicePreference(remoteValue);
  const localTime = new Date(local.updatedAt || 0).getTime();
  const remoteTime = new Date(remote.updatedAt || 0).getTime();
  if (!remote.voiceUri && !remote.voiceName && !remote.updatedAt) return local;
  if (!local.voiceUri && !local.voiceName && !local.updatedAt) return remote;
  return localTime > remoteTime ? local : remote;
}
