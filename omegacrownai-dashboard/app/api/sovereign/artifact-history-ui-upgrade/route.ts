import { NextResponse } from "next/server";
import { getArtifactHistoryUiUpgrade } from "@/lib/sovereign/artifact-history-ui-upgrade";

export async function GET() {
  const ui = getArtifactHistoryUiUpgrade();

  return NextResponse.json({
    ok: true,
    phase: "v24.5 Phase 265",
    service: "Artifact History UI Upgrade",
    ui,
  });
}
