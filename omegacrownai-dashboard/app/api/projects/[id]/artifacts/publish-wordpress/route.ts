import { NextRequest, NextResponse } from "next/server";
import { simulateWordPressArtifactPublish } from "@/lib/sovereign/wordpress-backup-publishing-connector";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  const result = simulateWordPressArtifactPublish({
    projectId: id,
    requestedBy: body.requestedBy,
    artifactMode: body.artifactMode,
    entitlementMode: body.entitlementMode,
    publishTarget: body.publishTarget,
  });

  return NextResponse.json(result);
}
