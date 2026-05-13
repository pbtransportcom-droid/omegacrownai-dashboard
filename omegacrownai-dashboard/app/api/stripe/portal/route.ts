import { NextResponse } from "next/server";
import { createStripeCustomerPortalSession } from "@/lib/sugent/stripe-billing/stripeBillingEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.organizationId) {
    return NextResponse.json(
      { ok: false, error: "organizationId is required" },
      { status: 400 }
    );
  }

  const result = await createStripeCustomerPortalSession({
    organizationId: String(body.organizationId),
    mode: body.mode ? String(body.mode) : "test",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
