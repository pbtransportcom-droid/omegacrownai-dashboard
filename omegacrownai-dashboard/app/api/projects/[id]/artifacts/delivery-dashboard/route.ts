import { NextRequest, NextResponse } from "next/server";
import { getCustomerArtifactDeliveryDashboardForProject } from "@/lib/sovereign/customer-artifact-delivery-dashboard";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const searchParams = request.nextUrl.searchParams;

  const artifactMode = searchParams.get("artifactMode") as "full_stack" | "homepage_only" | "missing_backend" | null;
  const entitlementMode = searchParams.get("entitlementMode") as "paid_active" | "owner_override" | "trial_preview" | "expired" | "blocked_draft" | null;

  const dashboard = getCustomerArtifactDeliveryDashboardForProject({
    projectId: id,
    artifactMode: artifactMode || "full_stack",
    entitlementMode: entitlementMode || "paid_active",
  });

  return NextResponse.json(dashboard);
}
