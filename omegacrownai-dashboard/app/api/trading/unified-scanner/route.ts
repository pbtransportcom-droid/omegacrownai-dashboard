import { NextResponse } from "next/server";
import { runUnifiedMarketScanner } from "@/lib/trading/scanner/unified-market-scanner";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  return NextResponse.json(
    await runUnifiedMarketScanner({
      query: body.query || body.theme || "AI stocks",
      symbols: Array.isArray(body.symbols) ? body.symbols : undefined,
      maxResults: Number(body.maxResults || 10),
    })
  );
}
