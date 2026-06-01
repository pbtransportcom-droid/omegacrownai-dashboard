import { runMarketScanner } from "@/lib/trading/market-scanner";
import { runTechnicalAgent } from "@/lib/trading/brain/technical-agent";
import { runNewsAgent } from "@/lib/trading/brain/news-agent";
import { runRiskAgent } from "@/lib/trading/brain/risk-agent";
import { runDecisionAgent } from "@/lib/trading/brain/decision-agent";

function extractTickers(message: string) {
  return Array.from(
    new Set(
      message
        .toUpperCase()
        .match(/\b[A-Z]{2,5}\b/g)
        ?.filter((word) => !["FIND", "BEST", "STOCK", "TRADE", "TODAY", "COMPARE", "VS", "VERSUS", "WITH", "AND"].includes(word)) || []
    )
  ).slice(0, 4);
}

export async function runCompareAgent(input: {
  message: string;
  accountSize?: number;
  maxRiskPercent?: number;
}) {
  const tickers = extractTickers(input.message);

  if (tickers.length < 2) return null;

  const scan = await runMarketScanner({ query: "AI stocks", maxResults: 20 });

  const compared = tickers.map((ticker) => {
    const candidate =
      scan.ranked.find((item: any) => item.symbol === ticker) || {
        symbol: ticker,
        name: ticker,
        sector: "Unknown",
        price: 100,
        momentum: 50,
        volumeSurge: 50,
        relativeStrength: 50,
        volatilityRisk: 50,
        newsScore: 50,
        aiScore: 50,
        trend: "unknown",
      };

    const technical = runTechnicalAgent(candidate);
    const news = runNewsAgent(candidate);
    const risk = runRiskAgent({
      ...candidate,
      accountSize: input.accountSize,
      maxRiskPercent: input.maxRiskPercent,
    });
    const decision = runDecisionAgent({
      symbol: candidate.symbol,
      technical,
      news,
      risk,
    });

    return {
      symbol: candidate.symbol,
      name: candidate.name,
      sector: candidate.sector,
      price: candidate.price,
      aiScore: candidate.aiScore,
      trend: candidate.trend,
      technical,
      news,
      risk,
      decision,
    };
  });

  const leader = [...compared].sort(
    (a, b) => b.decision.confidence - a.decision.confidence
  )[0];

  return {
    ok: true,
    system: "King Trading System Brain",
    mode: "paper",
    intent: "compare",
    message: input.message,
    answer: `${leader.symbol} currently leads this comparison with confidence ${leader.decision.confidence}.`,
    compared,
    leader,
    warning: "Paper trading only. Not financial advice. Live trading requires broker integration, risk controls, and explicit user approval.",
  };
}
