import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerArtifactDeliveryDashboard,
  getCustomerArtifactDeliveryDashboardForProject,
} from "@/lib/sovereign/customer-artifact-delivery-dashboard";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get("projectId");
  const artifactMode = searchParams.get("artifactMode") as "full_stack" | "homepage_only" | "missing_backend" | null;
  const entitlementMode = searchParams.get("entitlementMode") as "paid_active" | "owner_override" | "trial_preview" | "expired" | "blocked_draft" | null;

  if (projectId) {
    return NextResponse.json(
      getCustomerArtifactDeliveryDashboardForProject({
        projectId,
        artifactMode: artifactMode || "full_stack",
        entitlementMode: entitlementMode || "paid_active",
      })
    );
  }

  const dashboard = getCustomerArtifactDeliveryDashboard();

  return NextResponse.json({
    ok: true,
    phase: "v26.5 Phase 285",
    service: "Customer Artifact Delivery Dashboard",
    dashboard,
  });
}
