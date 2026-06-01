import { NextResponse } from "next/server";
import { runPortfolioAgent } from "@/lib/trading/portfolio/portfolio-agent";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  return NextResponse.json(
    runPortfolioAgent({
      accountSize: Number(body.accountSize || 10000),
      cash: Number(body.cash ?? 5000),
      positions: body.positions,
    })
  );
}
