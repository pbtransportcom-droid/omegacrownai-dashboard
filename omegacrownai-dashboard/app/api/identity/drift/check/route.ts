import { NextResponse } from "next/server";
import {
  checkDrift,
  sampleAgentProfile,
  signAgentIdentity
} from "@/lib/identity-kernel/sovereign-identity-kernel";

export async function GET() {
  const signature = signAgentIdentity(sampleAgentProfile);

  return NextResponse.json(
    {
      phase: "v6.3 Phase 84",
      service: "OmegaCrownAI identity drift check",
      sample: checkDrift({
        agentId: sampleAgentProfile.agentId,
        baselineFingerprint: signature.behavioralFingerprint,
        currentFingerprint: signature.behavioralFingerprint
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
    agentId?: string;
    baselineFingerprint?: string;
    currentFingerprint?: string;
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

  if (!body.agentId || !body.baselineFingerprint || !body.currentFingerprint) {
    return NextResponse.json(
      {
        ok: false,
        error: "agentId, baselineFingerprint, and currentFingerprint are required"
      },
      { status: 400 }
    );
  }

  const result = checkDrift({
    agentId: body.agentId,
    baselineFingerprint: body.baselineFingerprint,
    currentFingerprint: body.currentFingerprint
  });

  return NextResponse.json(
    {
      ok: true,
      phase: "v6.3 Phase 84",
      result
    },
    {
      status: result.driftDetected ? 409 : 200,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
