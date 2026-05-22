import { NextResponse } from "next/server";
import { getWorkflowTemplates } from "@/lib/workflow-engine/autonomousWorkflowEngine";

export async function GET() {
  return NextResponse.json(getWorkflowTemplates());
}
