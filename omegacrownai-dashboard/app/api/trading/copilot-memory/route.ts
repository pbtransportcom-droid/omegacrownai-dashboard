import { NextResponse } from "next/server";
import {
  getTradingMemory,
  updateTradingMemory,
} from "@/lib/trading/copilot/conversation-memory";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || "default";

  return NextResponse.json({
    ok: true,
    memory: getTradingMemory(userId),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const userId = String(body.userId || "default");

  return NextResponse.json({
    ok: true,
    memory: updateTradingMemory(userId, {
      accountSize: Number(body.accountSize || 10000),
      maxRiskPercent: Number(body.maxRiskPercent || 1),
      watchlist: Array.isArray(body.watchlist) ? body.watchlist : undefined,
      portfolio: Array.isArray(body.portfolio) ? body.portfolio : undefined,
      favoriteSectors: Array.isArray(body.favoriteSectors)
        ? body.favoriteSectors
        : undefined,
    }),
  });
}
