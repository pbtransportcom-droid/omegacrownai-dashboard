import { NextRequest, NextResponse } from "next/server";
import { discoverTradingCandidates } from "@/lib/trading/discovery/market-discovery";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("query") || searchParams.get("q") || "";
  const maxPriceRaw = searchParams.get("maxPrice");
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : null;

  const result = await discoverTradingCandidates({
    query,
    maxPrice,
  });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
