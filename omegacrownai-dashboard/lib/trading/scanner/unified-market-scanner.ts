import { runMarketScanner } from "@/lib/trading/market-scanner";

export type UnifiedScannerInput = {
  query?: string;
  symbols?: string[];
  maxResults?: number;
};

export async function runUnifiedMarketScanner(input: UnifiedScannerInput = {}) {
  const query = input.query || "AI stocks";
  const maxResults = input.maxResults || 10;

  const scan = await runMarketScanner({
    query,
    maxResults: Math.max(maxResults, 10),
  });

  const symbols = Array.isArray(input.symbols)
    ? input.symbols.map((symbol) => symbol.toUpperCase())
    : [];

  const filtered = symbols.length
    ? scan.ranked.filter((item: any) => symbols.includes(item.symbol))
    : scan.ranked;

  const ranked = filtered.slice(0, maxResults).map((item: any) => ({
    symbol: item.symbol,
    name: item.name,
    sector: item.sector,
    price: item.price,
    momentum: item.momentum,
    volumeSurge: item.volumeSurge,
    relativeStrength: item.relativeStrength,
    volatilityRisk: item.volatilityRisk,
    newsScore: item.newsScore,
    aiScore: item.aiScore,
    trend: item.trend,
    provider: item.provider || "unified-scanner",
    signalQuality:
      item.aiScore >= 80
        ? "high"
        : item.aiScore >= 70
          ? "medium-high"
          : item.aiScore >= 60
            ? "medium"
            : "low",
  }));

  return {
    ok: true,
    system: "King Trading System Unified Market Scanner",
    query,
    providerMode: "hybrid",
    topOpportunity: ranked[0] || null,
    ranked,
    providerNotes: [
      "Uses existing King Trading market scanner/provider layer.",
      "Ready for deeper Finnhub, Twelve Data, Stooq, CoinGecko, and Binance enrichment.",
    ],
    warning: "Market intelligence is for paper trading and educational use only. Not financial advice.",
  };
}
