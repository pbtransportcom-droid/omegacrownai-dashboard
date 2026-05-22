import { NextResponse } from "next/server";
import { getWorkflowExecutions } from "@/lib/workflow-engine/state/distributedWorkflowState";

export async function GET() {
  return NextResponse.json(getWorkflowExecutions());
}
