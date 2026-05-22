import { NextResponse } from "next/server";
import { getWorkflowStateMachineStatus } from "@/lib/workflow-state-machine/autonomousWorkflowStateMachine";

export async function GET() {
  return NextResponse.json(getWorkflowStateMachineStatus());
}
