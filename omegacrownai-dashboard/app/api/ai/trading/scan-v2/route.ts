import { NextResponse } from "next/server";
import { scanMarketV2 } from "@/lib/trading-v2/engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await scanMarketV2({
      marketType: body.marketType || "crypto",
      timeframe: body.timeframe || "90d",
      symbols: Array.isArray(body.symbols) ? body.symbols : undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Trading scan v2 failed.",
      },
      { status: 500 }
    );
  }
}
