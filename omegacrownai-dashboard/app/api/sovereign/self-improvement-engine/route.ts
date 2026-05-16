import { NextResponse } from "next/server";
import { getSovereignSelfImprovementEngine } from "@/lib/sovereign/self-improvement-engine";

export async function GET() {
  const engine = getSovereignSelfImprovementEngine();

  return NextResponse.json({
    ok: true,
    phase: "v15.6 Phase 176",
    service: "Sovereign Self-Improvement, Syntax Repair & Evaluation Engine",
    engine,
  });
}
