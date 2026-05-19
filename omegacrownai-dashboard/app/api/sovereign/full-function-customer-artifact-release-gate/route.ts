import { NextRequest, NextResponse } from "next/server";
import {
  evaluateCustomerArtifactReleaseGate,
  getFullFunctionCustomerArtifactReleaseGate,
} from "@/lib/sovereign/full-function-customer-artifact-release-gate";

export async function GET() {
  const gate = getFullFunctionCustomerArtifactReleaseGate();

  return NextResponse.json({
    ok: true,
    phase: "v26.0 Phase 280",
    service: "Full-Function Customer Artifact Release Gate",
    gate,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const result = evaluateCustomerArtifactReleaseGate({
    projectId: body.projectId,
    requestedBy: body.requestedBy,
    artifactMode: body.artifactMode,
  });

  return NextResponse.json(result);
}
