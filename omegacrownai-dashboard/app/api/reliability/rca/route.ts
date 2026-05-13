import { NextResponse } from "next/server";
import { runRCA, sampleTrace } from "@/lib/reliability/reliability-engine";

export async function GET() {
  return NextResponse.json({
    phase: "v6.6 Phase 87",
    service: "Root cause analysis",
    result: runRCA(sampleTrace)
  }, { headers: { "Cache-Control": "no-store" } });
}
