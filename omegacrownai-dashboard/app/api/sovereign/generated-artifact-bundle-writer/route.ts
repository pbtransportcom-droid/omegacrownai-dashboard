import { NextResponse } from "next/server";
import { getGeneratedArtifactBundleWriter } from "@/lib/sovereign/generated-artifact-bundle-writer";

export async function GET() {
  const writer = getGeneratedArtifactBundleWriter();

  return NextResponse.json({
    ok: true,
    phase: "v23.7 Phase 257",
    service: "Generated Artifact Bundle Writer",
    writer,
  });
}
