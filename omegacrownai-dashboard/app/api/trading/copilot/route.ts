import { NextResponse } from "next/server";
import { runTradingCopilot } from "@/lib/trading/copilot/copilot-engine";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const result = await runTradingCopilot({
    message: String(body.message || "Find the best setup."),
    accountSize: Number(body.accountSize || 10000),
    maxRiskPercent: Number(body.maxRiskPercent || 1),
    positions: body.positions,
    symbols: body.symbols,
  });

  return NextResponse.json(result);
}
