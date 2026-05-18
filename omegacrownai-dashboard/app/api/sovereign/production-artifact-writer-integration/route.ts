import { NextResponse } from "next/server";
import { getProductionArtifactWriterIntegration } from "@/lib/sovereign/production-artifact-writer-integration";

export async function GET() {
  const integration = getProductionArtifactWriterIntegration();

  return NextResponse.json({
    ok: true,
    phase: "v25.0 Phase 270",
    service: "Production Artifact Writer Integration",
    integration,
  });
}
