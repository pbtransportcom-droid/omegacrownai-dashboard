import { NextResponse } from "next/server";
import {
  AgentProfile,
  verifyAgentSignature
} from "@/lib/identity-kernel/sovereign-identity-kernel";

export async function POST(request: Request) {
  let body: {
    profile?: AgentProfile;
    expectedSignature?: string;
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

  if (!body.profile || !body.expectedSignature) {
    return NextResponse.json(
      {
        ok: false,
        error: "profile and expectedSignature are required"
      },
      { status: 400 }
    );
  }

  const verification = verifyAgentSignature({
    profile: body.profile,
    expectedSignature: body.expectedSignature
  });

  return NextResponse.json(
    {
      ok: true,
      phase: "v6.3 Phase 84",
      verification
    },
    {
      status: verification.valid ? 200 : 409,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
