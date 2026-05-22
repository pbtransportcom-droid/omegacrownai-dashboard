import { NextResponse } from "next/server";
import { recordRuntimeHeartbeat } from "@/lib/runtime-orchestrator/autonomousRuntimeOrchestrator";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(recordRuntimeHeartbeat(body));
}
