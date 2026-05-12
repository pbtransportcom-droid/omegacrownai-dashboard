import { NextResponse } from "next/server";
import { getOrganizationBillingDashboard } from "@/lib/sugent/customer-billing/customerPaymentProviderEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const result = await getOrganizationBillingDashboard(organizationId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
