import { NextResponse } from "next/server";
import { getTradingRepoArtifact } from "@/lib/sovereign/trading-repo-artifact";

export async function GET() {
  const artifact = getTradingRepoArtifact();

  return NextResponse.json({
    ok: true,
    phase: "v13.9 Phase 159",
    service: "Trading Builder Code Repository Artifact Generator",
    artifact,
  });
}
