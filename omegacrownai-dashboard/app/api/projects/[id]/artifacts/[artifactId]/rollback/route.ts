import { NextRequest, NextResponse } from "next/server";
import { simulateArtifactRollback } from "@/lib/sovereign/rebuild-rollback-api-implementation";

type RouteContext = {
  params: Promise<{
    id: string;
    artifactId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id, artifactId } = await context.params;
  const body = await request.json().catch(() => ({}));

  const result = simulateArtifactRollback({
    projectId: id,
    artifactId,
    targetArtifactId: body.targetArtifactId,
    rollbackReason: body.rollbackReason,
    requestedBy: body.requestedBy,
  });

  return NextResponse.json(result);
}
