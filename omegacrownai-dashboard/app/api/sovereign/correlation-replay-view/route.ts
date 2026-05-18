import { NextResponse } from "next/server";
import { getCorrelationReplayViewBlueprint } from "@/lib/sovereign/correlation-replay-view";

export async function GET() {
  const replay = getCorrelationReplayViewBlueprint();

  return NextResponse.json({
    ok: true,
    phase: "v18.8 Phase 208",
    service: "Correlation Replay View Blueprint",
    replay,
  });
}
