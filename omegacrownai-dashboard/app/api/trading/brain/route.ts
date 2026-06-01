import { NextResponse } from "next/server";
import { runTradingBrain } from "@/lib/trading/brain/trading-brain";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();

  const result = await runTradingBrain({
    message: String(body.message || "Find the best stock setup."),
    accountSize: Number(body.accountSize || 10000),
    maxRiskPercent: Number(body.maxRiskPercent || 1),
  });

  return NextResponse.json(result);
}
