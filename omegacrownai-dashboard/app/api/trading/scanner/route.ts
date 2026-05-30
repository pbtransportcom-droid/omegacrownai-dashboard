import { NextResponse } from "next/server";
import { runMarketScanner } from "@/lib/trading/market-scanner";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const result = await runMarketScanner({
    query: body.query || body.theme || "AI stocks",
    maxResults: Number(body.maxResults || 10)
  });

  return NextResponse.json(result);
}
