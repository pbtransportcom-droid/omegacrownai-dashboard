import { NextResponse } from "next/server";
import { getTradingProviderStatus } from "@/lib/trading/providers/provider-status";

export async function GET() {
  return NextResponse.json(getTradingProviderStatus(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
