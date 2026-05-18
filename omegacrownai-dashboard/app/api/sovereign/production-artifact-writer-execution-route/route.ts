import { NextRequest, NextResponse } from "next/server";
import {
  executeProductionArtifactWriter,
  getProductionArtifactWriterExecutionRoute,
} from "@/lib/sovereign/production-artifact-writer-execution-route";

export async function GET() {
  const execution = getProductionArtifactWriterExecutionRoute();

  return NextResponse.json({
    ok: true,
    phase: "v25.5 Phase 275",
    service: "Production Artifact Writer Execution Route",
    execution,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const result = executeProductionArtifactWriter({
    projectId: body.projectId,
    prompt: body.prompt,
    requestedBy: body.requestedBy,
    requestedType: body.requestedType,
  });

  return NextResponse.json(result);
}
