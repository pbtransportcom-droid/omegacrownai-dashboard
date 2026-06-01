import { detectTradingIntent } from "@/lib/trading/copilot/intent-engine";
import { runTradingBrain } from "@/lib/trading/brain/trading-brain";
import { runPortfolioAgent } from "@/lib/trading/portfolio/portfolio-agent";
import { runWatchlistAgent } from "@/lib/trading/watchlist/watchlist-agent";
import { getTradingMemory, rememberConversation } from "@/lib/trading/copilot/conversation-memory";

function withMemory(userId: string, message: string, result: any) {
  rememberConversation({
    userId,
    message,
    intent: result?.intent,
    answer: result?.answer || result?.system,
  });

  return {
    ...result,
    memory: getTradingMemory(userId),
  };
}

export async function runTradingCopilot(input: {
  message: string;
  userId?: string;
  accountSize?: number;
  maxRiskPercent?: number;
  positions?: any[];
  symbols?: string[];
}) {
  const userId = input.userId || "default";
  const memory = getTradingMemory(userId);
  const intent = detectTradingIntent(input.message);
  const accountSize = input.accountSize || memory.accountSize;
  const maxRiskPercent = input.maxRiskPercent || memory.maxRiskPercent;
  const positions = Array.isArray(input.positions) && input.positions.length ? input.positions : memory.portfolio;
  const symbols = Array.isArray(input.symbols) && input.symbols.length ? input.symbols : memory.watchlist;

  if (intent === "portfolio") {
    return withMemory(userId, input.message, {
      intent,
      ...(runPortfolioAgent({
        positions,
      })),
    });
  }

  if (intent === "watchlist") {
    return withMemory(userId, input.message, {
      intent,
      ...(await runWatchlistAgent({
        symbols,
      })),
    });
  }

  return withMemory(userId, input.message, {
    intent,
    ...(await runTradingBrain({
      message: input.message,
      accountSize,
      maxRiskPercent,
    })),
  });
}
