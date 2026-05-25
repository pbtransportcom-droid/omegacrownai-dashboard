import { NextResponse } from "next/server";

function detectIntent(prompt: string) {
  const value = prompt.toLowerCase();

  if (value.includes("podcast")) return "podcast";
  if (value.includes("video")) return "video";
  if (value.includes("music")) return "music";
  if (value.includes("marketing")) return "marketing";
  if (value.includes("trading")) return "trading";
  if (value.includes("website")) return "website";
  if (value.includes("app")) return "app";

  return "workspace";
}

function workspaceRoute(intent: string) {
  switch (intent) {
    case "video":
      return "/video-studio";

    case "podcast":
      return "/studio";

    case "music":
      return "/studio";

    case "marketing":
      return "/studio";

    case "trading":
      return "/trade";

    case "website":
      return "/create?type=website";

    case "app":
      return "/create?type=app";

    default:
      return "/projects";
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const prompt = String(body?.prompt || "");
    const intent = detectIntent(prompt);

    const projectId =
      "OC-" + Math.random().toString(36).slice(2, 10).toUpperCase();

    const runtimeId =
      "RT-" + Math.random().toString(36).slice(2, 10).toUpperCase();

    const workspace = workspaceRoute(intent);

    return NextResponse.json({
      ok: true,
      sovereign: true,
      intent,
      projectId,
      runtimeId,
      workspace,
      status: "initializing",
      runtime: {
        queue: "active",
        orchestration: "running",
        agents: "deploying",
      },
      message:
        "OmegaCrownAI sovereign execution pipeline initialized.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to initialize sovereign create engine.",
      },
      { status: 500 }
    );
  }
}
