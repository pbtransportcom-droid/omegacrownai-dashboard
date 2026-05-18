import { NextResponse } from "next/server";
import { getArtifactRebuildRollbackControls } from "@/lib/sovereign/artifact-rebuild-rollback-controls";

export async function GET() {
  const controls = getArtifactRebuildRollbackControls();

  return NextResponse.json({
    ok: true,
    phase: "v24.9 Phase 269",
    service: "Artifact Rebuild/Rollback Controls",
    controls,
  });
}
