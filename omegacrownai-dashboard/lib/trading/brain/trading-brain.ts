import { runMarketScanner } from "@/lib/trading/market-scanner";
import { runTechnicalAgent } from "@/lib/trading/brain/technical-agent";
import { runNewsAgent } from "@/lib/trading/brain/news-agent";
import { runRiskAgent } from "@/lib/trading/brain/risk-agent";
import { runDecisionAgent } from "@/lib/trading/brain/decision-agent";

export async function runTradingBrain(input: {
  message: string;
  accountSize?: number;
  maxRiskPercent?: number;
}) {
  const message = input.message || "Find the best stock setup.";
  const query = message.toLowerCase().includes("ai") ? "AI stocks" : message;

  const scan = await runMarketScanner({ query, maxResults: 5 });
  const topPick = scan.topPick;

  if (!topPick) {
    return {
      ok: true,
      system: "King Trading System Brain",
      answer: "No strong candidate was found.",
      scan,
    };
  }

  const technical = runTechnicalAgent(topPick);
  const news = runNewsAgent(topPick);
  const risk = runRiskAgent({
    ...topPick,
    accountSize: input.accountSize,
    maxRiskPercent: input.maxRiskPercent,
  });
  const decision = runDecisionAgent({
    symbol: topPick.symbol,
    technical,
    news,
    risk,
  });

  return {
    ok: true,
    system: "King Trading System Brain",
    mode: "paper",
    message,
    answer: `${topPick.symbol} is the top-ranked candidate. Recommendation: ${decision.recommendation}. Confidence: ${decision.confidence}.`,
    topPick,
    agents: {
      technical,
      news,
      risk,
      decision,
    },
    ranked: scan.ranked,
    tradePlan: {
      symbol: topPick.symbol,
      recommendation: decision.recommendation,
      confidence: decision.confidence,
      entryStyle: "Wait for confirmation or pullback before paper entry.",
      stopLoss: risk.estimatedStopPrice,
      positionSize: risk.suggestedShares,
      maxRiskDollars: risk.maxRiskDollars,
    },
    warning: "Paper trading only. Not financial advice. Live trading requires broker integration, risk controls, and explicit user approval.",
  };
}
