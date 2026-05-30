import { NextResponse } from "next/server";
import { runMarketScanner } from "@/lib/trading/market-scanner";
import { buildTradingRiskPlan } from "@/lib/trading/agents/risk-agent";
import { summarizeTradingNews } from "@/lib/trading/agents/news-agent";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();
  const message = String(body.message || "Find the best stock setup.");
  const accountSize = Number(body.accountSize || 10000);
  const maxRiskPercent = Number(body.maxRiskPercent || 1);

  const query = message.toLowerCase().includes("ai") ? "AI stocks" : message;
  const scan = await runMarketScanner({ query, maxResults: 5 });
  const topPick = scan.topPick;

  if (!topPick) {
    return NextResponse.json({
      ok: true,
      system: "King Trading System",
      answer: "No strong setup found for that request.",
      scan
    });
  }

  const riskPlan = buildTradingRiskPlan({
    symbol: topPick.symbol,
    accountSize,
    maxRiskPercent,
    price: topPick.price,
    volatilityRisk: topPick.volatilityRisk
  });

  const news = summarizeTradingNews(topPick.symbol, topPick.newsScore);

  return NextResponse.json({
    ok: true,
    system: "King Trading System",
    mode: "paper",
    message,
    answer: `${topPick.symbol} is the current top-ranked paper-trade candidate. Score: ${topPick.aiScore}. Trend: ${topPick.trend}.`,
    topPick,
    riskPlan,
    news,
    ranked: scan.ranked,
    tradePlan: {
      action: topPick.aiScore >= 80 ? "paper-buy-watch" : "watchlist",
      entryStyle: "Wait for confirmation or pullback before entry.",
      stopLoss: riskPlan.estimatedStopPrice,
      positionSize: riskPlan.suggestedShares
    },
    warning: "Paper trading only. Not financial advice. Live trading requires broker integration and explicit approval."
  });
}
