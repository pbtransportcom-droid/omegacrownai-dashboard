import { NextResponse } from "next/server";
import { getWebsiteBuilderArtifact } from "@/lib/sovereign/website-builder-artifact";

export async function GET() {
  const artifact = getWebsiteBuilderArtifact();

  return NextResponse.json({
    ok: true,
    phase: "v14.9 Phase 169",
    service: "Website Builder Artifact Depth Upgrade",
    artifact,
  });
}
