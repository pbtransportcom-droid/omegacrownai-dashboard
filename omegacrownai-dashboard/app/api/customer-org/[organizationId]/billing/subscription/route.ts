import { NextResponse } from "next/server";
import { upsertCustomerSubscription } from "@/lib/sugent/customer-billing/customerPaymentProviderEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await upsertCustomerSubscription({
    organizationId,
    companyId: body.companyId ? String(body.companyId) : null,
    paymentProviderId: body.paymentProviderId ? String(body.paymentProviderId) : null,
    provider: body.provider ? String(body.provider) : "manual",
    planTier: body.planTier ? String(body.planTier) : "starter",
    billingCycle: body.billingCycle ? String(body.billingCycle) : "monthly",
    status: body.status ? String(body.status) : undefined,
    actorId: body.actorId ? String(body.actorId) : "system-owner",
    actorType: body.actorType ? String(body.actorType) : "system",
  });

  return NextResponse.json(result);
}
