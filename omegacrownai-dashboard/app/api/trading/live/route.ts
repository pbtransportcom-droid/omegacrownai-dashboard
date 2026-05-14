import { NextRequest, NextResponse } from "next/server";
import { getLiveMarketData } from "@/lib/trading/live-market-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const symbol = searchParams.get("symbol") || searchParams.get("q") || "";
  const timeframe = searchParams.get("timeframe") || "1h";
  const marketType = searchParams.get("marketType") || "auto";

  const data = await getLiveMarketData({
    symbol,
    timeframe,
    marketType,
  });

  return NextResponse.json(
    {
      phase: "v8.9 Phase 109",
      service: "Trading live market data",
      ...data,
    },
    {
      status: data.ok ? 200 : 502,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
