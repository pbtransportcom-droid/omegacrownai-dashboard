import { NextResponse } from "next/server";
import { getTradingFileContentArtifact } from "@/lib/sovereign/trading-file-content";

export async function GET() {
  const artifact = getTradingFileContentArtifact();

  return NextResponse.json({
    ok: true,
    phase: "v14.0 Phase 160",
    service: "Trading Builder Actual File Content Generator",
    artifact,
  });
}
