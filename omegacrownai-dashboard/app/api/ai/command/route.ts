type Intent =
  | "chat"
  | "research"
  | "build"
  | "trade"
  | "automation"
  | "project"
  | "support";

function detectIntent(message: string): Intent {
  const text = message.toLowerCase();

  if (text.includes("build") || text.includes("website") || text.includes("app") || text.includes("landing page")) {
    return "build";
  }

  if (text.includes("trade") || text.includes("btc") || text.includes("stock") || text.includes("market") || text.includes("crypto")) {
    return "trade";
  }

  if (text.includes("workflow") || text.includes("automate") || text.includes("automation") || text.includes("trigger")) {
    return "automation";
  }

  if (text.includes("research") || text.includes("latest") || text.includes("news") || text.includes("fact") || text.includes("verify")) {
    return "research";
  }

  if (text.includes("project") || text.includes("workspace")) {
    return "project";
  }

  if (text.includes("help") || text.includes("support") || text.includes("error")) {
    return "support";
  }

  return "chat";
}

function needsVerification(intent: Intent, message: string) {
  const text = message.toLowerCase();

  return (
    intent === "research" ||
    intent === "trade" ||
    text.includes("latest") ||
    text.includes("today") ||
    text.includes("price") ||
    text.includes("law") ||
    text.includes("medical") ||
    text.includes("financial")
  );
}

function buildReply(intent: Intent, message: string) {
  if (intent === "build") {
    return "I detected a build request. I can help turn this into a website, app, page structure, or project workspace.";
  }

  if (intent === "trade") {
    return "I detected a trading or market request. This should be routed through the King Trading System with verification before final output.";
  }

  if (intent === "automation") {
    return "I detected an automation request. I can help define triggers, actions, and workflow logic.";
  }

  if (intent === "research") {
    return "I detected a research request. This requires verification from trusted sources before final answer.";
  }

  if (intent === "project") {
    return "I detected a project/workspace request. I can attach this prompt to a project and continue from project context.";
  }

  if (intent === "support") {
    return "I detected a support request. I can help diagnose the issue step by step.";
  }

  return `I understand your request: "${message}". I can route this through the correct OmegaCrownAI agent.`;
}

function buildActions(intent: Intent) {
  if (intent === "build") {
    return [{ type: "open_project", label: "Open builder", project_id: "web-001" }];
  }

  if (intent === "trade") {
    return [{ type: "run_analysis", label: "Run King Trading analysis", symbol: "BTCUSDT" }];
  }

  if (intent === "automation") {
    return [{ type: "open_project", label: "Open workflow builder", project_id: "wrk-005" }];
  }

  return [];
}

export async function POST(req: Request) {
  const body = await req.json();
  const message = String(body.message || "");

  const intent = detectIntent(message);
  const verification = needsVerification(intent, message);

  return Response.json({
    ok: true,
    engine: "OmegaCrownAI Multi-Task Router",
    intent,
    confidence: 0.9,
    needs_verification: verification,
    reply: buildReply(intent, message),
    actions: buildActions(intent),
  });
}
