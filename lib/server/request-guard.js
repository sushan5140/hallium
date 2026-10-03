export async function readBoundedJson(request, maxBytes = 32000) {
  const type = String(request.headers.get("content-type") || "").toLowerCase();
  if (!type.includes("application/json")) {
    return { ok: false, status: 415, error: "Send JSON with Content-Type application/json." };
  }

  const raw = await request.text();
  if (raw.length > maxBytes) {
    return { ok: false, status: 413, error: "Request payload is too large." };
  }

  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON request." };
  }
}
