import { NextResponse } from "next/server";
import { runPortfolioAgent } from "@/lib/trading/portfolio/portfolio-agent";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();

  return NextResponse.json(
    runPortfolioAgent({
      positions: Array.isArray(body.positions) ? body.positions : [],
      maxSinglePositionPercent: Number(body.maxSinglePositionPercent || 35),
      maxSectorPercent: Number(body.maxSectorPercent || 55),
    })
  );
}
