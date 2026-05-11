import { NextResponse } from "next/server";
import { getDistributionDashboard } from "@/lib/sugent/distribution/distributionEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const dashboard = await getDistributionDashboard(companyId);

  return NextResponse.json(dashboard);
}
