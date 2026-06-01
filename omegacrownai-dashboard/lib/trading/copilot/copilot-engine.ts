import { detectTradingIntent } from "@/lib/trading/copilot/intent-engine";
import { runTradingBrain } from "@/lib/trading/brain/trading-brain";
import { runPortfolioAgent } from "@/lib/trading/portfolio/portfolio-agent";
import { runWatchlistAgent } from "@/lib/trading/watchlist/watchlist-agent";

export async function runTradingCopilot(input: {
  message: string;
  accountSize?: number;
  maxRiskPercent?: number;
  positions?: any[];
  symbols?: string[];
}) {
  const intent = detectTradingIntent(input.message);

  if (intent === "portfolio") {
    return {
      intent,
      ...(runPortfolioAgent({
        positions: Array.isArray(input.positions) ? input.positions : [],
      })),
    };
  }

  if (intent === "watchlist") {
    return {
      intent,
      ...(await runWatchlistAgent({
        symbols: Array.isArray(input.symbols) ? input.symbols : ["NVDA", "AVGO", "AMD", "PLTR", "MSFT"],
      })),
    };
  }

  return {
    intent,
    ...(await runTradingBrain({
      message: input.message,
      accountSize: input.accountSize,
      maxRiskPercent: input.maxRiskPercent,
    })),
  };
}
