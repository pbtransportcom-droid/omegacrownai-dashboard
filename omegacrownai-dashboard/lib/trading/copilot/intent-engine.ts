export type TradingIntent =
  | "compare"
  | "portfolio"
  | "watchlist"
  | "brain";

export function detectTradingIntent(message: string): TradingIntent {
  const text = message.toLowerCase();

  if (text.includes("compare") || text.includes(" vs ") || text.includes("versus")) {
    return "compare";
  }

  if (text.includes("portfolio") || text.includes("position") || text.includes("risk exposure")) {
    return "portfolio";
  }

  if (text.includes("watchlist") || text.includes("alert") || text.includes("opportunity")) {
    return "watchlist";
  }

  return "brain";
}
