import { NextResponse } from "next/server";
import { getCreatorDistributionDashboard } from "@/lib/sugent/distribution/creatorDistributionEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const result = await getCreatorDistributionDashboard(companyId);

  return NextResponse.json(result);
}
