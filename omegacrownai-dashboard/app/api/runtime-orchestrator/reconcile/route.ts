import { NextResponse } from "next/server";
import { reconcileRuntimeOrchestration } from "@/lib/runtime-orchestrator/autonomousRuntimeOrchestrator";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(reconcileRuntimeOrchestration(body));
}
