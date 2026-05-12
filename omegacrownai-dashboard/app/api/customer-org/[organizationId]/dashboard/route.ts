import { NextResponse } from "next/server";
import { getCustomerDashboardByOrganization } from "@/lib/sugent/customer-dashboard/customerDashboardEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const result = await getCustomerDashboardByOrganization(organizationId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
