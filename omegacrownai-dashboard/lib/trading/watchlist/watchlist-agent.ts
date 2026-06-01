import { rankWatchlist } from "@/lib/trading/watchlist/watchlist-ranker";
import { buildWatchlistAlerts } from "@/lib/trading/watchlist/watchlist-alerts";

export async function runWatchlistAgent(input: { symbols: string[] }) {
  const symbols = Array.from(
    new Set((input.symbols || []).map((symbol) => String(symbol).toUpperCase()).filter(Boolean))
  );

  const ranked = await rankWatchlist(symbols.length ? symbols : ["NVDA", "AVGO", "AMD", "PLTR", "MSFT"]);
  const alerts = buildWatchlistAlerts(ranked);
  const topOpportunity = ranked[0] || null;

  const watchlistScore = ranked.length
    ? Math.round(ranked.reduce((sum, item) => sum + Number(item.watchlistScore || 0), 0) / ranked.length)
    : 0;

  return {
    ok: true,
    system: "King Trading System Watchlist Agent",
    watchlistScore,
    topOpportunity,
    ranked,
    alerts,
    warning: "Watchlist intelligence is for paper-trading and educational use only. Not financial advice.",
  };
}
