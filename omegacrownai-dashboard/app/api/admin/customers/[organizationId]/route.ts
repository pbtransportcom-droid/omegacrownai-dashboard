import { NextResponse } from "next/server";
import { getCustomerAdminOrganizationDetail } from "@/lib/sugent/customer-admin/customerAdminEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const result = await getCustomerAdminOrganizationDetail(organizationId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
