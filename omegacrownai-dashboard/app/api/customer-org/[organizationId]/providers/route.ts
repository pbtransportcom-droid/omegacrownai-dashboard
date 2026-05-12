import { NextResponse } from "next/server";
import { getPremiumProviderDashboard } from "@/lib/sugent/customer-providers/customerPremiumProviderEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const result = await getPremiumProviderDashboard(organizationId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
