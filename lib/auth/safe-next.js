export const DEFAULT_NEXT = "/";

export function isSafeNext(value) {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) return false;
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  if (value.includes("\\")) return false;
  if (/[\u0000-\u001f\u007f]/.test(value)) return false;

  const firstSegment = value.slice(1).split(/[/?#]/, 1)[0];
  if (firstSegment.includes(":")) return false;

  try {
    const probe = new URL(value, "https://hallim.invalid");
    return probe.origin === "https://hallim.invalid";
  } catch {
    return false;
  }
}

export function sanitizeNext(value) {
  return isSafeNext(value) ? value : DEFAULT_NEXT;
}
