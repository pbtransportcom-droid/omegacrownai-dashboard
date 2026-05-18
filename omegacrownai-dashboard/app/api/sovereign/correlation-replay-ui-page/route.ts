import { NextResponse } from "next/server";
import { getCorrelationReplayUiPage } from "@/lib/sovereign/correlation-replay-ui-page";

export async function GET() {
  const page = getCorrelationReplayUiPage();

  return NextResponse.json({
    ok: true,
    phase: "v19.5 Phase 215",
    service: "Correlation Replay UI Page",
    page,
  });
}
