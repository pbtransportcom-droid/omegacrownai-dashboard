import { NextResponse } from "next/server";
import { runOrchestration } from "@/lib/multi-agent-spine/multi-agent-spine";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v6.5 Phase 86",
      service: "OmegaCrownAI Multi-Agent Orchestration Spine",
      sample: runOrchestration({
        prompt: "Prepare OmegaCrownAI for the next governed enterprise subsystem."
      })
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

export async function POST(request: Request) {
  let body: {
    prompt?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid JSON payload"
      },
      { status: 400 }
    );
  }

  if (!body.prompt) {
    return NextResponse.json(
      {
        ok: false,
        error: "prompt is required"
      },
      { status: 400 }
    );
  }

  const result = runOrchestration({
    prompt: body.prompt
  });

  return NextResponse.json(
    {
      ok: true,
      phase: "v6.5 Phase 86",
      result
    },
    {
      status: result.policyAllowed ? 200 : 403,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
