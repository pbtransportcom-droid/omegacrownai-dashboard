import { NextResponse } from "next/server";
import { sampleTrace, summarizeCost } from "@/lib/reliability/reliability-engine";

export async function GET() {
  return NextResponse.json({
    phase: "v6.6 Phase 87",
    service: "Cost observability",
    result: summarizeCost(sampleTrace)
  }, { headers: { "Cache-Control": "no-store" } });
}
