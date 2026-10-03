import { createHallimServerSupabase } from "../supabase/server";

function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function requireHalliumAiUser(request) {
  if (!sameOrigin(request)) {
    return {
      ok: false,
      response: Response.json({ error: "Cross-origin requests are not allowed." }, {
        status: 403,
        headers: { "Cache-Control": "no-store" },
      }),
    };
  }

  const supabase = await createHallimServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return {
      ok: false,
      response: Response.json({ error: "Sign in to Hallium to use AI learning tools." }, {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      }),
    };
  }

  return { ok: true, supabase, user };
}

export async function consumeHalliumAiQuota(supabase, userId, bucket, {
  daily = 30,
  perMinute = 6,
} = {}) {
  const allowedBuckets = new Set(["audit", "intelligence"]);
  if (!allowedBuckets.has(bucket)) {
    return { ok: false, status: 500, error: "Invalid AI quota bucket." };
  }

  const { error: insertError } = await supabase
    .from("hallium_ai_request_events")
    .insert({ user_id: userId, bucket });

  if (insertError) {
    return { ok: false, status: 503, error: "Could not verify AI request quota." };
  }

  const now = Date.now();
  const dayStart = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const minuteStart = new Date(now - 60 * 1000).toISOString();

  const [day, minute] = await Promise.all([
    supabase.from("hallium_ai_request_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("bucket", bucket)
      .gte("occurred_at", dayStart),
    supabase.from("hallium_ai_request_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("bucket", bucket)
      .gte("occurred_at", minuteStart),
  ]);

  if (day.error || minute.error) {
    return { ok: false, status: 503, error: "Could not verify AI request quota." };
  }

  if ((minute.count || 0) > perMinute) {
    return {
      ok: false,
      status: 429,
      error: `Too many ${bucket} requests in one minute. Try again shortly.`,
    };
  }

  if ((day.count || 0) > daily) {
    return {
      ok: false,
      status: 429,
      error: `Daily ${bucket} request limit reached. Try again later.`,
    };
  }

  return { ok: true, dailyCount: day.count || 0, minuteCount: minute.count || 0 };
}

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
