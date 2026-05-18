import { NextRequest, NextResponse } from "next/server";
import {
  createGeneratedArtifactFileSystemWritePlan,
  getGeneratedArtifactFileSystemWriter,
} from "@/lib/sovereign/generated-artifact-file-system-writer";

export async function GET() {
  const writer = getGeneratedArtifactFileSystemWriter();

  return NextResponse.json({
    ok: true,
    phase: "v24.4 Phase 264",
    service: "Generated Artifact File System Writer",
    writer,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const plan = createGeneratedArtifactFileSystemWritePlan({
    projectId: body.projectId,
    artifactId: body.artifactId,
    baseDir: body.baseDir,
  });

  return NextResponse.json({
    ok: true,
    phase: "v24.4 Phase 264",
    service: "Generated Artifact File System Write Plan",
    plan,
  });
}
