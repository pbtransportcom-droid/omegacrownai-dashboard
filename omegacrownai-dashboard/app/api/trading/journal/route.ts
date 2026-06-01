import { NextResponse } from "next/server";
import {
  closeTradeEntry,
  getJournalStats,
  getTradeJournal,
  saveTradeEntry,
} from "@/lib/trading/journal/trade-journal";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || "default";

  return NextResponse.json({
    ok: true,
    entries: getTradeJournal(userId),
    stats: getJournalStats(userId),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const userId = String(body.userId || "default");

  if (body.action === "close") {
    const entries = closeTradeEntry({
      userId,
      id: String(body.id),
      exitPrice: Number(body.exitPrice),
      notes: body.notes,
    });

    return NextResponse.json({
      ok: true,
      entries,
      stats: getJournalStats(userId),
    });
  }

  const result = saveTradeEntry({
    userId,
    symbol: String(body.symbol || "NVDA"),
    side: body.side === "short" ? "short" : "long",
    entryPrice: Number(body.entryPrice || 100),
    shares: Number(body.shares || 1),
    riskDollars: Number(body.riskDollars || 0),
    notes: body.notes,
  });

  return NextResponse.json({
    ok: true,
    entry: result.entry,
    entries: result.entries,
    stats: getJournalStats(userId),
  });
}
