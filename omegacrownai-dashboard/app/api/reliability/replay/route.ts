import { NextResponse } from "next/server";
import { replayTrace, sampleTrace } from "@/lib/reliability/reliability-engine";

export async function GET() {
  return NextResponse.json({
    phase: "v6.6 Phase 87",
    service: "Reliability replay",
    result: replayTrace({ trace: sampleTrace })
  }, { headers: { "Cache-Control": "no-store" } });
}
