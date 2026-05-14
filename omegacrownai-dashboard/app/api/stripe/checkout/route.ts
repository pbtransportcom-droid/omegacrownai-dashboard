import { NextResponse } from "next/server";
import { getStripeDisabledResponse } from "@/lib/payment-provider-cleanup/payment-provider-policy";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v7.8 Phase 99",
      service: "Stripe checkout",
      ...getStripeDisabledResponse()
    },
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      phase: "v7.8 Phase 99",
      service: "Stripe checkout",
      ...getStripeDisabledResponse()
    },
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
