import { NextRequest, NextResponse } from "next/server";
import { runLatestAutomationWorkflow } from "@/lib/automation-workflows/automation-execution-engine";

export async function POST(request: NextRequest) {
  let projectId: string | null = null;

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      projectId = body?.projectId || null;
    } else {
      const formData = await request.formData().catch(() => null);
      projectId = formData?.get("projectId")?.toString() || null;
    }
  } catch {
    projectId = null;
  }

  const result = await runLatestAutomationWorkflow({ projectId });

  return NextResponse.json(result, {
    status: result.ok ? 200 : result.status === "no_workflow_found" ? 404 : 500,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
