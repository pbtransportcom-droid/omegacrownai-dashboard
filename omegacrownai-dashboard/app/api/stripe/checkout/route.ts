import { NextResponse } from "next/server";
import { createStripeCheckoutSession } from "@/lib/sugent/stripe-billing/stripeBillingEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.organizationId) {
    return NextResponse.json({ ok: false, error: "organizationId is required" }, { status: 400 });
  }

  const result = await createStripeCheckoutSession({
    organizationId: String(body.organizationId),
    userId: body.userId ? String(body.userId) : null,
    companyId: body.companyId ? String(body.companyId) : null,
    email: body.email ? String(body.email) : null,
    name: body.name ? String(body.name) : null,
    planTier: body.planTier ? String(body.planTier) : "pro",
    mode: body.mode ? String(body.mode) : "test",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
