import { NextResponse } from "next/server";
import { replayExecution } from "@/lib/identity-kernel/sovereign-identity-kernel";

export async function POST(request: Request) {
  let body: {
    executionId?: string;
    agentId?: string;
    originalOutput?: unknown;
    replayOutput?: unknown;
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

  if (!body.executionId || !body.agentId) {
    return NextResponse.json(
      {
        ok: false,
        error: "executionId and agentId are required"
      },
      { status: 400 }
    );
  }

  const result = replayExecution({
    executionId: body.executionId,
    agentId: body.agentId,
    originalOutput: body.originalOutput ?? null,
    replayOutput: body.replayOutput ?? null
  });

  return NextResponse.json(
    {
      ok: true,
      phase: "v6.3 Phase 84",
      result
    },
    {
      status: result.driftAlert ? 409 : 200,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

export async function GET() {
  const result = replayExecution({
    executionId: "exec_demo_identity_replay",
    agentId: "omega_agent_foundation",
    originalOutput: {
      result: "Identity replay matched."
    },
    replayOutput: {
      result: "Identity replay matched."
    }
  });

  return NextResponse.json(
    {
      phase: "v6.3 Phase 84",
      service: "OmegaCrownAI identity replay",
      sample: result
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
