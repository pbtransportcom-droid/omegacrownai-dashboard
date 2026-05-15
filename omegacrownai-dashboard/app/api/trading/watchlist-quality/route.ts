import { NextRequest, NextResponse } from "next/server";
import { runWatchlistForecastQualityBatch } from "@/lib/trading/watchlist-quality/watchlist-quality-engine";

function parseSymbols(input: string | null) {
  return String(input || "")
    .split(",")
    .map((symbol) => symbol.trim())
    .filter(Boolean);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const symbols = parseSymbols(
    searchParams.get("symbols") || searchParams.get("watchlist") || "AAPL,MSFT,TSLA,BTCUSDT,ETHUSDT"
  );

  const marketType = searchParams.get("marketType") || "auto";
  const timeframe = searchParams.get("timeframe") || "1d";

  const result = await runWatchlistForecastQualityBatch({
    symbols,
    marketType,
    timeframe,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  const symbols = Array.isArray(body.symbols)
    ? body.symbols
    : parseSymbols(body.symbols || body.watchlist || "");

  const result = await runWatchlistForecastQualityBatch({
    symbols,
    marketType: body.marketType || "auto",
    timeframe: body.timeframe || "1d",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
