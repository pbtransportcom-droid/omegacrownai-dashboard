import { NextResponse } from "next/server";
import { protectPublicRoute } from "@/lib/security/protectedRoute";
import { runCompanyOrchestrator } from "@/lib/sugent/company/orchestrator";

export async function POST(req: Request) {
  const publicProtection = protectPublicRoute(req, {
    rateLimitPrefix: "company-run",
    limit: 40,
  });
  if (!publicProtection.ok) return publicProtection.response;


  try {
    const body = await req.json();

    const result = await runCompanyOrchestrator({
      companyId: String(body.companyId || ""),
      projectId: String(body.projectId || ""),
      sessionId: String(body.sessionId || `company-${Date.now()}`),
      runtimeSessionId: String(body.runtimeSessionId || body.sessionId || `company-runtime-${Date.now()}`),
      message: String(body.message || ""),
    });

    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Company run failed.",
      },
      { status: 500 }
    );
  }
}
