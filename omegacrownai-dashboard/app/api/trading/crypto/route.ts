import { NextRequest, NextResponse } from "next/server";
import { getCryptoMarketIntelligence } from "@/lib/trading/crypto-intelligence";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const symbol = searchParams.get("symbol") || searchParams.get("q") || "BTCUSDT";
  const timeframe = searchParams.get("timeframe") || "1h";

  const data = await getCryptoMarketIntelligence({
    symbol,
    timeframe,
  });

  return NextResponse.json(
    data,
    {
      status: data.ok ? 200 : 502,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
