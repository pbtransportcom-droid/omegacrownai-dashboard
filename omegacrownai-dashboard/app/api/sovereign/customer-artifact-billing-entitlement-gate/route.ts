import { NextRequest, NextResponse } from "next/server";
import {
  evaluateCustomerArtifactBillingEntitlementGate,
  getCustomerArtifactBillingEntitlementGate,
} from "@/lib/sovereign/customer-artifact-billing-entitlement-gate";

export async function GET() {
  const gate = getCustomerArtifactBillingEntitlementGate();

  return NextResponse.json({
    ok: true,
    phase: "v26.2 Phase 282",
    service: "Customer Artifact Billing/Entitlement Gate",
    gate,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  const result = evaluateCustomerArtifactBillingEntitlementGate({
    projectId: body.projectId,
    artifactId: body.artifactId,
    requestedBy: body.requestedBy,
    artifactMode: body.artifactMode,
    entitlementMode: body.entitlementMode,
  });

  return NextResponse.json(result);
}
