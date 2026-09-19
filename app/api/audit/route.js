export const runtime = "nodejs";

let groqModel = null;

async function getGroqModel(apiKey) {
  if (groqModel) return groqModel;
  const response = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: "Bearer " + apiKey },
  });
  if (!response.ok) throw new Error("Groq model lookup failed (" + response.status + ").");
  const data = await response.json();
  const ids = (data?.data || []).map((item) => String(item?.id || "")).filter(Boolean);
  groqModel =
    ids.find((id) => /gpt-oss-20b/i.test(id)) ||
    ids.find((id) => /llama.*instant/i.test(id)) ||
    ids.find((id) => /llama/i.test(id)) ||
    ids[0] ||
    null;
  if (!groqModel) throw new Error("No Groq chat model is available.");
  return groqModel;
}

function stripFence(value = "") {
  return String(value).trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
}

function parseJsonObject(raw) {
  const cleaned = stripFence(raw);
  try { return JSON.parse(cleaned); } catch {}
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
  }
  return null;
}

export async function GET() {
  const apiKey = process.env.Grok_API;
  if (!apiKey) return Response.json({ ok: false, provider: "groq", configured: false }, { status: 503 });
  try {
    const model = await getGroqModel(apiKey);
    return Response.json({ ok: true, provider: "groq", configured: true, model });
  } catch (error) {
    return Response.json({
      ok: false,
      provider: "groq",
      configured: true,
      error: error instanceof Error ? error.message : "Groq health check failed.",
    }, { status: 502 });
  }
}

export async function POST(request) {
  try {
    const apiKey = process.env.Grok_API;
    if (!apiKey) {
      return Response.json({ error: "Grok_API is not configured on the server." }, { status: 503 });
    }

    const learner = await request.json();
    const model = await getGroqModel(apiKey);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 1800,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are Hallim's Korean-learning auditor. Evaluate only from supplied learning evidence. Never invent ability, pronunciation quality, TOPIK readiness, or unseen mistakes. Return one valid JSON object only. Keep feedback concise and practical.",
          },
          {
            role: "user",
            content: JSON.stringify({
              task: "Audit this Hallim learner snapshot",
              outputSchema: {
                summary: "",
                strengths: [""],
                weaknesses: [""],
                priorities: [""],
                nextActions: [""],
                levelAssessment: {
                  status: "below_selected_level|aligned_with_selected_level|approaching_next_level|insufficient_data",
                  note: "",
                },
              },
              rules: [
                "strengths, weaknesses, and priorities should contain 1-4 concise items",
                "nextActions should contain 2-5 concrete actions",
                "use insufficient_data when evidence is too sparse",
                "do not claim official TOPIK readiness",
              ],
              learner,
            }),
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return Response.json(
        { error: String(data?.error?.message || data?.error || "Groq audit request failed.") },
        { status: response.status },
      );
    }

    const audit = parseJsonObject(data?.choices?.[0]?.message?.content || "");
    if (!audit) return Response.json({ error: "Groq returned invalid audit JSON." }, { status: 502 });

    return Response.json({ audit, model, provider: "groq" });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Audit failed." },
      { status: 500 },
    );
  }
}
