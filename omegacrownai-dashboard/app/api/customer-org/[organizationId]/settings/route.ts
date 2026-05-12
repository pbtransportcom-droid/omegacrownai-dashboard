import { NextResponse } from "next/server";
import { updateCustomerOrganizationSettings } from "@/lib/sugent/customer-dashboard/customerDashboardEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await updateCustomerOrganizationSettings({
    organizationId,
    name: body.name ? String(body.name) : null,
    status: body.status ? String(body.status) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
