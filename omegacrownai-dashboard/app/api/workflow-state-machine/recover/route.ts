import { NextResponse } from "next/server";
import { recoverWorkflowExecution } from "@/lib/workflow-state-machine/autonomousWorkflowStateMachine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(recoverWorkflowExecution(body.executionId));
}
