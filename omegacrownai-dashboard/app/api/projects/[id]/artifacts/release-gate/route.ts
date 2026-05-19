import { NextRequest, NextResponse } from "next/server";
import { evaluateCustomerArtifactReleaseGate } from "@/lib/sovereign/full-function-customer-artifact-release-gate";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  const result = evaluateCustomerArtifactReleaseGate({
    projectId: id,
    requestedBy: body.requestedBy,
    artifactMode: body.artifactMode,
  });

  return NextResponse.json(result);
}
