import { NextResponse } from "next/server";
import { runSuperTradingAgent } from "@/lib/trading/super-intelligent-agent";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();

  const result = runSuperTradingAgent({
    message: body.message || "Find the best stock setup.",
    mode: body.mode || "paper",
    accountSize: Number(body.accountSize || 10000),
    maxRiskPercent: Number(body.maxRiskPercent || 1),
    watchlist: body.watchlist,
  });

  return NextResponse.json(result);
}
