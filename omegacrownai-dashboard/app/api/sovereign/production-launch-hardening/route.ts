import { NextResponse } from "next/server";
import { getProductionLaunchHardening } from "@/lib/sovereign/production-launch-hardening";

export async function GET() {
  const hardening = getProductionLaunchHardening();

  return NextResponse.json({
    ok: true,
    phase: "v26.7 Phase 287",
    service: "Production Launch Hardening",
    hardening,
  });
}
