import { NextResponse } from "next/server";
import { createWorkflowExecution } from "@/lib/workflow-state-machine/autonomousWorkflowStateMachine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(createWorkflowExecution(body));
}
