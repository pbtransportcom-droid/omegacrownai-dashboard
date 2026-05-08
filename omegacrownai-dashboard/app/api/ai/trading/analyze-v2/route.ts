import { NextResponse } from "next/server";
import { analyzeSymbolV2 } from "@/lib/trading-v2/engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await analyzeSymbolV2({
      symbol: body.symbol || "BTC-USD",
      marketType: body.marketType || "stock",
      timeframe: body.timeframe || "90d",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Trading analyze v2 failed.",
      },
      { status: 500 }
    );
  }
}
