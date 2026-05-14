import { NextResponse } from "next/server";
import { getPaymentProviderSummary } from "@/lib/payment-provider-cleanup/payment-provider-policy";

export async function GET() {
  return NextResponse.json(getPaymentProviderSummary(), {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
