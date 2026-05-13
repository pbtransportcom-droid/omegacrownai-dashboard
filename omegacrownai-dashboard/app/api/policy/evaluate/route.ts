import { NextResponse } from "next/server";
import {
  PolicyEvaluationContext,
  evaluatePolicies,
  sampleEvaluationContext,
  samplePolicies
} from "@/lib/global-policy-engine/global-policy-engine";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v6.4 Phase 85",
      service: "OmegaCrownAI Global Policy Engine evaluator",
      sample: evaluatePolicies({
        policies: samplePolicies,
        context: sampleEvaluationContext,
        payload: {
          prompt: "Run governed execution."
        }
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
    context?: PolicyEvaluationContext;
    payload?: Record<string, unknown>;
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

  if (!body.context?.region || !body.context?.agentId || !body.context?.channel || !body.context?.actionType) {
    return NextResponse.json(
      {
        ok: false,
        error: "context.region, context.agentId, context.channel, and context.actionType are required"
      },
      { status: 400 }
    );
  }

  const result = evaluatePolicies({
    policies: samplePolicies,
    context: body.context,
    payload: body.payload ?? {}
  });

  return NextResponse.json(
    {
      ok: true,
      phase: "v6.4 Phase 85",
      result
    },
    {
      status: result.allowed ? 200 : 403,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
