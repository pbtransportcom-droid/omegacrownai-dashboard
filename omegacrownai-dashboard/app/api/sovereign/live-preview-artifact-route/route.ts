import { NextResponse } from "next/server";
import { getLivePreviewArtifactRoute } from "@/lib/sovereign/live-preview-artifact-route";

export async function GET() {
  const livePreview = getLivePreviewArtifactRoute();

  return NextResponse.json({
    ok: true,
    phase: "v23.9 Phase 259",
    service: "Live Preview Artifact Route",
    livePreview,
  });
}
