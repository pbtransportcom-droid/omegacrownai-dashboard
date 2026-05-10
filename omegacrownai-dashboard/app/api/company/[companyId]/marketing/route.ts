import { NextResponse } from "next/server";
import { getMarketingDashboard } from "@/lib/sugent/marketing/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const dashboard = await getMarketingDashboard(companyId);

  return NextResponse.json(dashboard);
}
