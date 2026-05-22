import { NextResponse } from "next/server";
import { getRuntimeOrchestratorStatus } from "@/lib/runtime-orchestrator/autonomousRuntimeOrchestrator";

export async function GET() {
  return NextResponse.json(getRuntimeOrchestratorStatus());
}
