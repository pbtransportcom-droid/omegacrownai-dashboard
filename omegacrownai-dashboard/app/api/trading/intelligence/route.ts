import { NextResponse } from "next/server";
import { rankOpportunities } from "@/lib/trading/intelligence/opportunity-ranker";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const query =
    url.searchParams.get("query") ||
    "AI";

  const opportunities =
    await rankOpportunities(query);

  return NextResponse.json({
    ok: true,
    query,
    count: opportunities.length,
    opportunities,
  });
}
