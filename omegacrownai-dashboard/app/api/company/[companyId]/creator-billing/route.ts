import { NextResponse } from "next/server";
import { getCreatorBillingDashboard } from "@/lib/sugent/billing/creatorBillingEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const result = await getCreatorBillingDashboard(companyId);

  return NextResponse.json(result);
}
