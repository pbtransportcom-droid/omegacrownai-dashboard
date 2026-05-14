import { NextRequest, NextResponse } from "next/server";
import { runSuperAgentTradingForecast } from "@/lib/trading/super-agent/super-agent-forecast";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const symbol = searchParams.get("symbol") || searchParams.get("q") || "BTCUSDT";
  const marketType = searchParams.get("marketType") || "auto";
  const timeframe = searchParams.get("timeframe") || "1h";

  const result = await runSuperAgentTradingForecast({
    symbol,
    marketType,
    timeframe,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 502,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
