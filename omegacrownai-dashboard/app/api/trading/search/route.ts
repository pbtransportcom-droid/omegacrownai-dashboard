import { NextRequest, NextResponse } from "next/server";
import { searchGlobalMarkets } from "@/lib/trading/global-market-search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || searchParams.get("symbol") || "";

  const result = await searchGlobalMarkets(query);

  return NextResponse.json(
    {
      phase: "v8.8 Phase 108",
      service: "Trading global market search",
      ...result
    },
    {
      status: result.ok ? 200 : 400,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
