import { NextResponse } from "next/server";
import { getEnterpriseReliabilityObservabilityLayer } from "@/lib/sovereign/enterprise-reliability-observability";

export async function GET() {
  const reliability = getEnterpriseReliabilityObservabilityLayer();

  return NextResponse.json({
    ok: true,
    phase: "v17.3 Phase 193",
    service: "Enterprise Reliability & Observability Layer",
    reliability,
  });
}
