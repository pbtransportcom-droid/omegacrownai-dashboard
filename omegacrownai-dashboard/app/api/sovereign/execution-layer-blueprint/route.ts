import { NextResponse } from "next/server";
import { getSovereignExecutionLayerBlueprint } from "@/lib/sovereign/execution-layer-blueprint";

export async function GET() {
  const blueprint = getSovereignExecutionLayerBlueprint();

  return NextResponse.json({
    ok: true,
    phase: "v16.9 Phase 189",
    service: "Sovereign Execution Layer Blueprint",
    blueprint,
  });
}
