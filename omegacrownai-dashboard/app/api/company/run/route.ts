import { NextResponse } from "next/server";
import { runCompanyOrchestrator } from "@/lib/sugent/company/orchestrator";

export async function POST(req: Request) {
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
