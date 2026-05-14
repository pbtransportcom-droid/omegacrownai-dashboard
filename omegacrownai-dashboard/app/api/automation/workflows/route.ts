import { NextRequest, NextResponse } from "next/server";
import { getAutomationWorkflowView } from "@/lib/automation-workflows/automation-workflow-engine";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const demo = searchParams.get("demo") !== "false";

  const workflow = await getAutomationWorkflowView({
    projectId,
    allowDemoFallback: demo
  });

  return NextResponse.json(
    {
      phase: "v8.6 Phase 106",
      service: "Automation workflow data",
      workflow
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
