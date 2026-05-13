import { NextResponse } from "next/server";
import {
  adminSecurityControls,
  evaluateAdminControlReadiness
} from "@/lib/security/enterprise-audit-policy";

export async function GET(request: Request) {
  const headers = request.headers;

  const evaluation = evaluateAdminControlReadiness({
    tenantId: headers.get("x-tenant-id"),
    organizationId: headers.get("x-organization-id"),
    adminUserId: headers.get("x-user-id"),
    role: headers.get("x-user-role")
  });

  return NextResponse.json(
    {
      phase: "v6.1 Phase 82",
      service: "OmegaCrownAI enterprise admin security controls",
      evaluatedAt: new Date().toISOString(),
      controls: adminSecurityControls,
      ...evaluation
    },
    {
      status: evaluation.status === "blocked" ? 403 : 200,
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
    adminUserId?: string;
    role?: string;
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

  const evaluation = evaluateAdminControlReadiness(body);

  return NextResponse.json(
    {
      ok: evaluation.status !== "blocked",
      phase: "v6.1 Phase 82",
      evaluatedAt: new Date().toISOString(),
      controls: adminSecurityControls,
      ...evaluation
    },
    {
      status: evaluation.status === "blocked" ? 403 : 200,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
