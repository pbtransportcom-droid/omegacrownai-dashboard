import { NextRequest, NextResponse } from "next/server";
import { evaluateCustomerArtifactBillingEntitlementGate } from "@/lib/sovereign/customer-artifact-billing-entitlement-gate";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  const result = evaluateCustomerArtifactBillingEntitlementGate({
    projectId: id,
    artifactId: body.artifactId,
    requestedBy: body.requestedBy,
    artifactMode: body.artifactMode,
    entitlementMode: body.entitlementMode,
  });

  return NextResponse.json(result);
}
