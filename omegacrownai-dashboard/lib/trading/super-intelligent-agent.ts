export type TradingMode = "paper" | "live";

export type StockCandidate = {
  symbol: string;
  name: string;
  sector?: string;
  price?: number;
  momentum?: number;
  quality?: number;
  risk?: number;
  newsScore?: number;
};

export type TradingAgentInput = {
  message: string;
  mode?: TradingMode;
  accountSize?: number;
  maxRiskPercent?: number;
  watchlist?: StockCandidate[];
};

const defaultWatchlist: StockCandidate[] = [
  { symbol: "NVDA", name: "NVIDIA", sector: "AI Semiconductors", momentum: 92, quality: 90, risk: 42, newsScore: 88 },
  { symbol: "MSFT", name: "Microsoft", sector: "Cloud AI", momentum: 78, quality: 94, risk: 30, newsScore: 84 },
  { symbol: "AAPL", name: "Apple", sector: "Consumer Technology", momentum: 64, quality: 88, risk: 34, newsScore: 70 },
  { symbol: "AMZN", name: "Amazon", sector: "Cloud/Ecommerce", momentum: 74, quality: 86, risk: 38, newsScore: 78 },
  { symbol: "GOOGL", name: "Alphabet", sector: "AI/Search", momentum: 71, quality: 87, risk: 36, newsScore: 76 },
];

function scoreStock(stock: StockCandidate) {
  const momentum = stock.momentum ?? 50;
  const quality = stock.quality ?? 50;
  const news = stock.newsScore ?? 50;
  const risk = stock.risk ?? 50;

  return Math.round(momentum * 0.35 + quality * 0.35 + news * 0.2 - risk * 0.1);
}

export function runSuperTradingAgent(input: TradingAgentInput) {
  const mode: TradingMode = input.mode || "paper";
  const accountSize = input.accountSize || 10000;
  const maxRiskPercent = input.maxRiskPercent || 1;
  const watchlist = input.watchlist?.length ? input.watchlist : defaultWatchlist;

  const ranked = watchlist
    .map((stock) => ({
      ...stock,
      aiScore: scoreStock(stock),
    }))
    .sort((a, b) => b.aiScore - a.aiScore);

  const best = ranked[0];
  const maxRiskDollars = accountSize * (maxRiskPercent / 100);

  const action =
    best.aiScore >= 80 ? "paper-buy-watch" :
    best.aiScore >= 65 ? "watchlist-only" :
    "avoid-new-entry";

  return {
    ok: true,
    system: "King Trading System",
    mode,
    warning:
      mode === "live"
        ? "Live trading requires broker connection, verified risk limits, and user confirmation."
        : "Paper mode only. No real trade was placed.",
    userIntent: input.message,
    topPick: best,
    rankedStocks: ranked,
    riskPlan: {
      accountSize,
      maxRiskPercent,
      maxRiskDollars,
      rule: "Never risk more than configured max risk per trade.",
    },
    decision: {
      action,
      reason:
        action === "paper-buy-watch"
          ? "Highest AI score based on momentum, quality, news score, and risk adjustment."
          : "Signal is not strong enough for automatic entry.",
    },
    paperOrder:
      action === "paper-buy-watch"
        ? {
            symbol: best.symbol,
            side: "buy",
            orderType: "market-simulated",
            status: "paper-created",
            createdAt: new Date().toISOString(),
          }
        : null,
  };
}
