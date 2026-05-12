import { NextResponse } from "next/server";
import { resetCustomerUsagePlaceholder } from "@/lib/sugent/customer-admin/customerAdminEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await resetCustomerUsagePlaceholder({
    organizationId,
    companyId: body.companyId ? String(body.companyId) : null,
    usageType: body.usageType ? String(body.usageType) : null,
    adminUserId: body.adminUserId ? String(body.adminUserId) : "system-admin",
    reason: body.reason ? String(body.reason) : null,
  });

  return NextResponse.json(result);
}
