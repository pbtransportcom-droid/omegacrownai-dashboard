import { NextRequest, NextResponse } from "next/server";
import {
  generateRealFullStackArtifact,
  getRealFullStackArtifactGenerator,
} from "@/lib/sovereign/real-full-stack-artifact-generator";

export async function GET() {
  const generator = getRealFullStackArtifactGenerator();

  return NextResponse.json({
    ok: true,
    phase: "v24.1 Phase 261",
    service: "Real Full-Stack Artifact Generator",
    generator,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const result = generateRealFullStackArtifact({
    projectId: body.projectId,
    prompt: body.prompt,
    requestedType: body.requestedType,
  });

  return NextResponse.json({
    ok: true,
    phase: "v24.1 Phase 261",
    service: "Generated Full-Stack Artifact Preview",
    result,
  });
}
