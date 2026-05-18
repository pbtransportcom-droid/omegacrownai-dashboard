import { NextResponse } from "next/server";
import { getProjectArtifactHistoryIntegration } from "@/lib/sovereign/project-artifact-history-integration";

export async function GET() {
  const history = getProjectArtifactHistoryIntegration();

  return NextResponse.json({
    ok: true,
    phase: "v23.8 Phase 258",
    service: "Project Artifact History Integration",
    history,
  });
}
