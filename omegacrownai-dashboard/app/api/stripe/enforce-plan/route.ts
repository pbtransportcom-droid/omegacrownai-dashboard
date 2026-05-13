import { NextResponse } from "next/server";
import { enforceStripePlanAccess } from "@/lib/sugent/stripe-billing/stripeBillingEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.organizationId) {
    return NextResponse.json({ ok: false, error: "organizationId is required" }, { status: 400 });
  }

  const result = await enforceStripePlanAccess({
    organizationId: String(body.organizationId),
    requiredTier: body.requiredTier ? String(body.requiredTier) : "pro",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 402,
  });
}
