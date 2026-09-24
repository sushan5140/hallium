import { createHallimServerSupabase } from "../../../../../lib/supabase/server";
import { getAiGuide, guideSystemPrompt, cleanChatText } from "../../../../../lib/ai-twins/guides.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 40;

const TABLE = "hallium_ai_guide_turns";
let cachedModel = "";

async function pickModel(key) {
  if (process.env.GROQ_MODEL) return process.env.GROQ_MODEL;
  if (cachedModel) return cachedModel;
  const r = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: "Bearer " + key },
    cache: "no-store", signal: AbortSignal.timeout(10000)
  });
  if (!r.ok) throw new Error("MODEL_DISCOVERY");
  const j = await r.json();
  const ids = (j.data || []).map(m => m.id);
  cachedModel = ids.find(x => /gpt-oss-20b/i.test(x)) ||
    ids.find(x => /llama-3.3-70b-versatile/i.test(x)) ||
    ids.find(x => /llama.*instant/i.test(x)) || "";
  if (!cachedModel) throw new Error("MODEL_UNAVAILABLE");
  return cachedModel;
}

export async function POST(request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  }
  const sb = await createHallimServerSupabase();
  const { data: { user }, error: authError } = await sb.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "Sign in with Google to talk to an AI guide." }, { status: 401 });
  }

  let guideId, message;
  try {
    const raw = await request.text();
    if (raw.length > 2400) return Response.json({ error: "Message is too large." }, { status: 413 });
    const body = JSON.parse(raw);
    guideId = body.guideId;
    message = cleanChatText(body.message, 750);
    if (typeof body.message !== "string" || body.message.length > 800) {
      return Response.json({ error: "Keep your message under 750 characters." }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Invalid chat request." }, { status: 400 });
  }
  const guide = getAiGuide(guideId);
  if (!guide || !message) {
    return Response.json({ error: "Choose an AI guide and write a message." }, { status: 400 });
  }
  // The human-first milestone is permanent. A saved AI chat stays readable/deletable,
  // but a retired guide must never issue another paid/generated reply.
  const { data: phase, error: phaseError } = await sb.rpc("hallium_twinverse_status");
  if (phaseError || !phase) {
    return Response.json({ error: "Twinverse availability could not be verified. Please retry." }, { status: 503 });
  }
  if (phase.mode === "human") {
    return Response.json({ error: "The first 12 real learners have arrived! AI guide chat is retired; explore the human Twinverse. Your prior chat history is still available to view or delete." }, { status: 410 });
  }

  const key = process.env.AI_API || process.env.GROQ_API_KEY;
  if (!key) {
    return Response.json({ error: "AI chat is not configured for this deployment." }, { status: 503 });
  }

  const dayStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const minuteStart = new Date(Date.now() - 60 * 1000).toISOString();
  const [daily, recent, history] = await Promise.all([
    sb.from(TABLE).select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", dayStart),
    sb.from(TABLE).select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", minuteStart),
    sb.from(TABLE).select("user_message,assistant_message").eq("user_id", user.id)
      .eq("guide_id", guide.id).order("created_at", { ascending: false }).limit(10)
  ]);
  if (daily.error || recent.error || history.error) {
    return Response.json({ error: "Could not read your private conversation. Please try again." }, { status: 503 });
  }
  if ((daily.count || 0) >= 40) {
    return Response.json({ error: "You've reached 40 AI teaching replies in the past 24 hours. Your saved chats are still available." }, { status: 429 });
  }
  if ((recent.count || 0) >= 4) {
    return Response.json({ error: "You've sent four tutor messages within a minute. Continue after a short break." }, { status: 429 });
  }

  const turns = [...(history.data || [])].reverse().flatMap(row => [
    { role: "user", content: cleanChatText(row.user_message, 750) },
    { role: "assistant", content: cleanChatText(row.assistant_message, 2600) }
  ]);
  let assistant;
  try {
    const model = await pickModel(key);
    const result = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(25000),
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({
        model, temperature: 0.6, max_tokens: 700,
        messages: [
          { role: "system", content: guideSystemPrompt(guide) },
          ...turns,
          { role: "user", content: message }
        ]
      })
    });
    if (result.status === 429) {
      return Response.json({ error: "The AI provider is currently rate-limited. No reply was saved." }, { status: 429 });
    }
    if (!result.ok) throw new Error("PROVIDER_" + result.status);
    const json = await result.json();
    assistant = cleanChatText(json.choices?.[0]?.message?.content, 2600);
    if (!assistant) throw new Error("EMPTY_REPLY");
  } catch {
    return Response.json({ error: "The AI tutor couldn't respond this time. No fake or scripted answer was inserted; please retry." }, { status: 503 });
  }

  // Recheck after the provider call: another signed-in learner may have just
  // become the 12th founder while the LLM was responding.
  const { data: finalPhase, error: finalPhaseError } = await sb.rpc("hallium_twinverse_status");
  if (finalPhaseError || !finalPhase) {
    return Response.json({ error: "Twinverse availability could not be verified. No reply was saved." }, { status: 503 });
  }
  if (finalPhase.mode === "human") {
    return Response.json({ error: "The human Twinverse opened during this chat. Your conversation history was preserved; no new AI reply was saved." }, { status: 410 });
  }

  const { data: saved, error: saveError } = await sb.from(TABLE)
    .insert({ user_id: user.id, guide_id: guide.id, user_message: message, assistant_message: assistant })
    .select("id,guide_id,user_message,assistant_message,created_at").single();
  if (saveError) {
    return Response.json({ error: "The tutor responded, but the conversation could not be saved. Please retry." }, { status: 503 });
  }
  return Response.json({ turn: saved, generated_by: "groq" }, {
    headers: { "Cache-Control": "private, no-store" }
  });
}
