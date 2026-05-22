import { NextResponse } from "next/server";
import { getWorkflowEngineStatus } from "@/lib/workflow-engine/autonomousWorkflowEngine";

export async function GET() {
  return NextResponse.json(getWorkflowEngineStatus());
}
