import { NextRequest, NextResponse } from "next/server";
import { simulateRealPrismaArtifactStorageWrite } from "@/lib/sovereign/artifact-storage-real-prisma-write-implementation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  const result = simulateRealPrismaArtifactStorageWrite({
    projectId: id,
    artifactId: body.artifactId,
    requestedBy: body.requestedBy,
    writeMode: body.writeMode,
  });

  return NextResponse.json(result);
}
