import { NextResponse } from "next/server";
import { evaluateTenantIsolation } from "@/lib/security/enterprise-tenant-policy";

export async function GET(request: Request) {
  const headers = request.headers;

  const evaluation = evaluateTenantIsolation({
    tenantId: headers.get("x-tenant-id"),
    organizationId: headers.get("x-organization-id"),
    userId: headers.get("x-user-id"),
    role: headers.get("x-user-role"),
    requestScope: headers.get("x-request-scope")
  });

  return NextResponse.json(
    {
      phase: "v6.0 Phase 81",
      service: "OmegaCrownAI tenant isolation evaluator",
      evaluatedAt: new Date().toISOString(),
      ...evaluation
    },
    {
      status: evaluation.status === "fail" ? 403 : 200,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

export async function POST(request: Request) {
  let body: {
    tenantId?: string;
    organizationId?: string;
    userId?: string;
    role?: string;
    requestScope?: string;
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

  const evaluation = evaluateTenantIsolation(body);

  return NextResponse.json(
    {
      ok: evaluation.status !== "fail",
      phase: "v6.0 Phase 81",
      evaluatedAt: new Date().toISOString(),
      ...evaluation
    },
    {
      status: evaluation.status === "fail" ? 403 : 200,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
