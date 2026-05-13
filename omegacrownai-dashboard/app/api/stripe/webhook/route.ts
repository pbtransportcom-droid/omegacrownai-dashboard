import { NextResponse } from "next/server";
import { handleStripeWebhookEvent } from "@/lib/sugent/stripe-billing/stripeBillingEngine";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");
  const mode = req.headers.get("x-stripe-mode") || new URL(req.url).searchParams.get("mode") || "test";

  const result = await handleStripeWebhookEvent({
    rawBody,
    signature,
    mode,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
