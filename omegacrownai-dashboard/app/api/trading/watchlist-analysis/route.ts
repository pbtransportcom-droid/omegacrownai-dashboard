import { NextResponse } from "next/server";
import { runWatchlistAgent } from "@/lib/trading/watchlist/watchlist-agent";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  return NextResponse.json(
    await runWatchlistAgent({
      symbols: Array.isArray(body.symbols) ? body.symbols : [],
    })
  );
}
