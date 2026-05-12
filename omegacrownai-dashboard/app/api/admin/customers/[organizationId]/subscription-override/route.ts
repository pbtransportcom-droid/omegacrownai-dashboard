import { NextResponse } from "next/server";
import { adminOverrideCustomerSubscription } from "@/lib/sugent/customer-admin/customerAdminEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.planTier) {
    return NextResponse.json({ ok: false, error: "planTier is required" }, { status: 400 });
  }

  const result = await adminOverrideCustomerSubscription({
    organizationId,
    companyId: body.companyId ? String(body.companyId) : null,
    planTier: String(body.planTier),
    provider: body.provider ? String(body.provider) : "manual",
    billingCycle: body.billingCycle ? String(body.billingCycle) : "manual",
    status: body.status ? String(body.status) : "manual",
    adminUserId: body.adminUserId ? String(body.adminUserId) : "system-admin",
    reason: body.reason ? String(body.reason) : null,
  });

  return NextResponse.json(result);
}
