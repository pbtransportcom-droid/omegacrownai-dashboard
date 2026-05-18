import { NextRequest, NextResponse } from "next/server";
import { simulateArtifactRebuild } from "@/lib/sovereign/rebuild-rollback-api-implementation";

type RouteContext = {
  params: Promise<{
    id: string;
    artifactId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id, artifactId } = await context.params;
  const body = await request.json().catch(() => ({}));

  const result = simulateArtifactRebuild({
    projectId: id,
    artifactId,
    rebuildPrompt: body.rebuildPrompt,
    requestedBy: body.requestedBy,
  });

  return NextResponse.json(result);
}
