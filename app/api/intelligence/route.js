export const runtime = "nodejs";

let groqModel = null;

const prompts = {
  mistake_explain:
    "Explain one Korean-learning mistake to a beginner. Use only the supplied question, selected answer, correct answer, and Hallim material. Be concise. Do not invent pronunciation assessment.",
  adaptive_review:
    "Create a targeted Korean review using only material explicitly present in the learner snapshot. If mistakeMemory has due or recent weaknesses, prioritize those skills first. Never introduce grammar or vocabulary outside supplied material. Reuse studied words/examples when necessary rather than inventing new Korean. Questions must have exactly four options and one unambiguous correct answer.",
  study_plan:
    "Create a compact 5-7 day Korean study plan from the learner evidence and target level. Use only Hallim activities/material actually available in the supplied snapshot. Keep daily work realistic and short.",
  checkpoint:
    "Create a fresh Korean checkpoint using only vocabulary, grammar, sentences, and skills already present in the supplied learner snapshot. Use mistakeMemory as secondary evidence but keep the checkpoint broad. Do not introduce unseen Korean; reuse studied examples if needed. Exactly four options per question and one unambiguous answer.",
  difficulty:
    "Choose the learner's next Hallim difficulty. reinforce means more direct recall and support; balanced means normal mixed practice; stretch means harder transfer/application using only learned material. Base the choice only on supplied evidence.",
  promotion:
    "Judge whether there is enough evidence to consider moving the learner beyond their selected current level. Completion alone is not proof. Do not claim official TOPIK readiness. If evidence is sparse, return insufficient_data.",
  learning_route:
    "Choose the learner's next 3 Hallim actions from the supported action kinds only. Use audit findings, recent scores, current adaptive difficulty, current-to-target path, available study material, and mistakeMemory. If mistakeMemory.dueCount is greater than zero, review_queue should normally be the first action. Then prioritize transfer practice and reassessment. Never recommend content outside Hallim.",
};

const outputShapes = {
  mistake_explain: {
    headline: "",
    whyWrong: "",
    correctRule: "",
    microExample: "",
  },
  adaptive_review: {
    title: "",
    difficulty: "reinforce|balanced|stretch",
    reason: "",
    questions: [{ prompt: "", options: ["", "", "", ""], answer: 0, explanation: "", skill: "" }],
  },
  study_plan: {
    title: "",
    summary: "",
    days: [{ day: "", focus: "", minutes: 15, tasks: ["", ""] }],
  },
  checkpoint: {
    title: "",
    difficulty: "reinforce|balanced|stretch",
    questions: [{ prompt: "", options: ["", "", "", ""], answer: 0, explanation: "", skill: "" }],
  },
  difficulty: {
    level: "reinforce|balanced|stretch",
    reason: "",
    behavior: "",
  },
  promotion: {
    status: "not_ready|almost_ready|ready_for_level_check|insufficient_data",
    confidence: 0,
    evidence: [""],
    gaps: [""],
    recommendation: "",
  },
  learning_route: {
    headline: "",
    focus: "",
    reason: "",
    steps: [
      {
        kind: "companion|vocab|grammar|test|review_queue|adaptive_review|checkpoint",
        title: "",
        why: "",
      },
    ],
  },
};

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

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateQuizResult(action, result) {
  if (!result || !Array.isArray(result.questions)) return false;
  const [min, max] = action === "checkpoint" ? [6, 8] : [5, 7];
  if (result.questions.length < min || result.questions.length > max) return false;
  if (!["reinforce","balanced","stretch"].includes(result.difficulty)) return false;

  return result.questions.every((question) =>
    isNonEmptyString(question?.prompt) &&
    Array.isArray(question?.options) &&
    question.options.length === 4 &&
    question.options.every(isNonEmptyString) &&
    Number.isInteger(question?.answer) &&
    question.answer >= 0 &&
    question.answer <= 3 &&
    isNonEmptyString(question?.explanation) &&
    isNonEmptyString(question?.skill)
  );
}

function validateLearningRoute(result, payload) {
  if (!result || !Array.isArray(result.steps) || result.steps.length < 1 || result.steps.length > 3) return false;
  const supported = new Set(
    Array.isArray(payload?.supportedActions)
      ? payload.supportedActions
      : ["companion","vocab","grammar","test","review_queue","adaptive_review","checkpoint"]
  );
  return (
    isNonEmptyString(result.headline) &&
    isNonEmptyString(result.focus) &&
    isNonEmptyString(result.reason) &&
    result.steps.every((step) =>
      supported.has(step?.kind) &&
      isNonEmptyString(step?.title) &&
      isNonEmptyString(step?.why)
    )
  );
}

function validateStructuredResult(action, result, payload) {
  if (action === "adaptive_review" || action === "checkpoint") return validateQuizResult(action, result);
  if (action === "learning_route") return validateLearningRoute(result, payload);
  if (action === "mistake_explain") {
    return ["headline","whyWrong","correctRule","microExample"].every((key) => isNonEmptyString(result?.[key]));
  }
  if (action === "difficulty") {
    return ["reinforce","balanced","stretch"].includes(result?.level) && isNonEmptyString(result?.reason) && isNonEmptyString(result?.behavior);
  }
  if (action === "study_plan") {
    return isNonEmptyString(result?.title) && isNonEmptyString(result?.summary) &&
      Array.isArray(result?.days) && result.days.length >= 5 && result.days.length <= 7 &&
      result.days.every((day) =>
        isNonEmptyString(day?.day) &&
        isNonEmptyString(day?.focus) &&
        Number.isFinite(day?.minutes) &&
        day.minutes >= 5 &&
        day.minutes <= 45 &&
        Array.isArray(day?.tasks) &&
        day.tasks.length >= 2 &&
        day.tasks.length <= 4 &&
        day.tasks.every(isNonEmptyString)
      );
  }
  if (action === "promotion") {
    return ["not_ready","almost_ready","ready_for_level_check","insufficient_data"].includes(result?.status) &&
      Number.isFinite(result?.confidence) && result.confidence >= 0 && result.confidence <= 100 &&
      Array.isArray(result?.evidence) && Array.isArray(result?.gaps) && isNonEmptyString(result?.recommendation);
  }
  return true;
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
    if (!apiKey) return Response.json({ error: "Grok_API is not configured." }, { status: 503 });

    const body = await request.json();
    const action = body?.action;
    const payload = body?.payload;

    if (!prompts[action] || !outputShapes[action]) {
      return Response.json({ error: "Unsupported Hallim Intelligence action." }, { status: 400 });
    }

    const serialized = JSON.stringify(payload || {});
    if (serialized.length > 30000) {
      return Response.json({ error: "Learner snapshot is too large." }, { status: 413 });
    }

    const model = await getGroqModel(apiKey);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model,
        temperature: action === "promotion" ? 0.1 : 0.2,
        max_tokens: action === "study_plan" ? 2200 : 1800,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are Hallim Intelligence, a Korean-learning support engine. Ground every judgment in supplied evidence. Never invent scores, studied content, speaking ability, pronunciation quality, or official TOPIK readiness. Return one valid JSON object only.",
          },
          {
            role: "user",
            content: JSON.stringify({
              task: prompts[action],
              outputSchema: outputShapes[action],
              learnerData: payload || {},
            }),
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return Response.json(
        { error: String(data?.error?.message || data?.error || "Groq request failed.") },
        { status: response.status },
      );
    }

    const result = parseJsonObject(data?.choices?.[0]?.message?.content || "");
    if (!result) return Response.json({ error: "Groq returned invalid JSON." }, { status: 502 });
    if (!validateStructuredResult(action, result, payload)) {
      return Response.json({ error: "Groq returned output that failed Hallim's server-side validation." }, { status: 502 });
    }

    return Response.json({ result, action, model, provider: "groq" });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Hallim Intelligence failed." },
      { status: 500 },
    );
  }
}
