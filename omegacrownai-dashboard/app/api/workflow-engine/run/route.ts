import { NextResponse } from "next/server";
import { runWorkflow } from "@/lib/workflow-engine/autonomousWorkflowEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  return NextResponse.json(
    await runWorkflow(body.workflowId || "launch-campaign"),
  );
}
