import { NextResponse } from "next/server";
import { buildPortfolioDashboard } from "@/lib/trading/portfolio/portfolio-dashboard";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  return NextResponse.json(
    await buildPortfolioDashboard({
      positions: body.positions || [],
      cash: Number(body.cash || 0),
    })
  );
}
