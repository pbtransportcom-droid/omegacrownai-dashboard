import { runMarketScanner } from "@/lib/trading/market-scanner";

export async function rankWatchlist(symbols: string[]) {
  const scan = await runMarketScanner({ query: "AI stocks", maxResults: 50 });

  const ranked = symbols.map((symbol) => {
    const clean = symbol.toUpperCase();
    const match = scan.ranked.find((item: any) => item.symbol === clean);

    const item =
      match || {
        symbol: clean,
        name: clean,
        sector: "Unknown",
        price: 0,
        momentum: 50,
        volumeSurge: 50,
        relativeStrength: 50,
        volatilityRisk: 50,
        newsScore: 50,
        aiScore: 50,
        trend: "unknown",
      };

    return {
      ...item,
      watchlistScore: Math.round(
        Number(item.aiScore || 50) * 0.55 +
          Number(item.relativeStrength || 50) * 0.25 +
          Number(item.newsScore || 50) * 0.2
      ),
    };
  });

  return ranked.sort((a, b) => b.watchlistScore - a.watchlistScore);
}
