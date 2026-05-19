import { NextRequest, NextResponse } from "next/server";
import {
  getWordPressBackupPublishingConnector,
  simulateWordPressArtifactPublish,
} from "@/lib/sovereign/wordpress-backup-publishing-connector";

export async function GET() {
  const connector = getWordPressBackupPublishingConnector();

  return NextResponse.json({
    ok: true,
    phase: "v26.4 Phase 284",
    service: "WordPress Backup + Publishing Connector",
    connector,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  const result = simulateWordPressArtifactPublish({
    projectId: body.projectId,
    requestedBy: body.requestedBy,
    artifactMode: body.artifactMode,
    entitlementMode: body.entitlementMode,
    publishTarget: body.publishTarget,
  });

  return NextResponse.json(result);
}
