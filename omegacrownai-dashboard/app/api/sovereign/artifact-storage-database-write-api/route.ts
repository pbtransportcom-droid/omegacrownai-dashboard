import { NextRequest, NextResponse } from "next/server";
import {
  getArtifactStorageDatabaseWriteApi,
  simulateArtifactStorageDatabaseWrite,
} from "@/lib/sovereign/artifact-storage-database-write-api";

export async function GET() {
  const api = getArtifactStorageDatabaseWriteApi();

  return NextResponse.json({
    ok: true,
    phase: "v25.8 Phase 278",
    service: "Artifact Storage Database Write API",
    api,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const result = simulateArtifactStorageDatabaseWrite({
    projectId: body.projectId,
    artifactId: body.artifactId,
    requestedBy: body.requestedBy,
  });

  return NextResponse.json(result);
}
