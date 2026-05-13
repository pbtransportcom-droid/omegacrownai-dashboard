import { NextResponse } from "next/server";
import { getExternalPaymentsDashboard, seedExternalPaymentLinks, upsertExternalPaymentLink } from "@/lib/sugent/external-payments/externalPaymentEngine";

export async function GET() {
  const result = await getExternalPaymentsDashboard();
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.provider || !body.label || !body.paymentUrl) {
    return NextResponse.json(
      { ok: false, error: "provider, label, and paymentUrl are required" },
      { status: 400 }
    );
  }

  const result = await upsertExternalPaymentLink({
    provider: String(body.provider),
    planTier: body.planTier ? String(body.planTier) : "pro",
    mode: body.mode ? String(body.mode) : "live",
    label: String(body.label),
    paymentUrl: String(body.paymentUrl),
    amountCents: body.amountCents ? Number(body.amountCents) : 0,
    currency: body.currency ? String(body.currency) : "usd",
    billingCycle: body.billingCycle ? String(body.billingCycle) : "manual",
    description: body.description ? String(body.description) : null,
  });

  return NextResponse.json(result);
}
