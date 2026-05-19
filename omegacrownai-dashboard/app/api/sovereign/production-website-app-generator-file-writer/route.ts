import { NextRequest, NextResponse } from "next/server";
import {
  getProductionWebsiteAppGeneratorFileWriter,
  simulateProductionWebsiteAppFileWrite,
} from "@/lib/sovereign/production-website-app-generator-file-writer";

export async function GET() {
  const writer = getProductionWebsiteAppGeneratorFileWriter();

  return NextResponse.json({
    ok: true,
    phase: "v26.1 Phase 281",
    service: "Production Website/App Generator File Writer",
    writer,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  const result = simulateProductionWebsiteAppFileWrite({
    projectId: body.projectId,
    artifactId: body.artifactId,
    requestedBy: body.requestedBy,
    artifactMode: body.artifactMode,
  });

  return NextResponse.json(result);
}
