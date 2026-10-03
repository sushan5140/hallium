import { consumeHalliumAiQuota, readBoundedJson, requireHalliumAiUser } from "../../../lib/server/ai-guard";
export const runtime = "nodejs";

function clampRate(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(1.3, Math.max(0.7, n));
}

export async function POST(request) {
  const access = await requireHalliumAiUser(request);
  if (!access.ok) return access.response;

  const parsed = await readBoundedJson(request, 4000);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, {
      status: parsed.status,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const text = String(parsed.value?.text || "").trim();
  if (!text || text.length > 500) {
    return Response.json({ error: "Korean TTS text must be between 1 and 500 characters." }, {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const quota = await consumeHalliumAiQuota(access.supabase, access.user.id, "tts", {
    daily: 300,
    perMinute: 30,
  });
  if (!quota.ok) {
    return Response.json({ error: quota.error }, {
      status: quota.status,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const serviceUrl = String(process.env.MELOTTS_SERVICE_URL || "").replace(/\/$/, "");
  const serviceToken = process.env.MELOTTS_SERVICE_TOKEN || "";
  if (!serviceUrl) {
    return Response.json({ error: "High-quality Korean TTS is not configured." }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    const response = await fetch(serviceUrl + "/synthesize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(serviceToken ? { Authorization: "Bearer " + serviceToken } : {}),
      },
      body: JSON.stringify({
        text,
        language: "KR",
        speed: clampRate(parsed.value?.rate),
      }),
      signal: AbortSignal.timeout(7000),
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json({ error: "Korean TTS provider is temporarily unavailable." }, {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const contentType = String(response.headers.get("content-type") || "audio/wav");
    if (!contentType.startsWith("audio/")) {
      return Response.json({ error: "Korean TTS provider returned an invalid response." }, {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=0, no-store",
        "X-Hallium-TTS-Provider": "melotts",
      },
    });
  } catch {
    return Response.json({ error: "Korean TTS provider is temporarily unavailable." }, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
