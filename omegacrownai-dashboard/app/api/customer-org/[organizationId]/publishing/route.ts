import { NextResponse } from "next/server";
import { getCustomerPublishingDashboard } from "@/lib/sugent/customer-publishing/customerPublishingEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const result = await getCustomerPublishingDashboard(organizationId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
