import { NextRequest, NextResponse } from "next/server";
import { simulateArtifactStorageDatabaseWrite } from "@/lib/sovereign/artifact-storage-database-write-api";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  const result = simulateArtifactStorageDatabaseWrite({
    projectId: id,
    artifactId: body.artifactId,
    requestedBy: body.requestedBy,
  });

  return NextResponse.json(result);
}
