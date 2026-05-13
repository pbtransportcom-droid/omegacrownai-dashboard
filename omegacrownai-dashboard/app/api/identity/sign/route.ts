import { NextResponse } from "next/server";
import {
  AgentProfile,
  sampleAgentProfile,
  signAgentIdentity
} from "@/lib/identity-kernel/sovereign-identity-kernel";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v6.3 Phase 84",
      service: "OmegaCrownAI identity signing",
      sample: signAgentIdentity(sampleAgentProfile)
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

export async function POST(request: Request) {
  let body: AgentProfile;

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

  if (!body.agentId || !body.role || !body.version || !body.constitutionVersion) {
    return NextResponse.json(
      {
        ok: false,
        error: "agentId, role, version, and constitutionVersion are required"
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      phase: "v6.3 Phase 84",
      signature: signAgentIdentity(body)
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
