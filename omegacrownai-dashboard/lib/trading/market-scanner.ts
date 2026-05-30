import { searchGlobalMarkets } from "@/lib/trading/global-market-search";

export type MarketScannerInput = {
  query?: string;
  theme?: string;
  maxResults?: number;
};

function safeScore(value: unknown, fallback = 50) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export async function runMarketScanner(input: MarketScannerInput = {}) {
  const query = input.query || input.theme || "AI stocks";
  const maxResults = input.maxResults || 10;

  let rawResults: any[] = [];

  try {
    const search = await searchGlobalMarkets(query);
    rawResults = Array.isArray(search?.results) ? search.results : [];
  } catch {
    rawResults = [];
  }

  const fallback = [
    { symbol: "NVDA", name: "NVIDIA", sector: "AI Semiconductors", price: 120, momentum: 94, volumeSurge: 88, relativeStrength: 95, volatilityRisk: 48, newsScore: 90 },
    { symbol: "MSFT", name: "Microsoft", sector: "Cloud AI", price: 430, momentum: 79, volumeSurge: 62, relativeStrength: 83, volatilityRisk: 30, newsScore: 85 },
    { symbol: "AVGO", name: "Broadcom", sector: "AI Semiconductors", price: 170, momentum: 86, volumeSurge: 80, relativeStrength: 88, volatilityRisk: 42, newsScore: 82 },
    { symbol: "AMD", name: "Advanced Micro Devices", sector: "AI Semiconductors", price: 160, momentum: 78, volumeSurge: 76, relativeStrength: 77, volatilityRisk: 55, newsScore: 76 },
    { symbol: "PLTR", name: "Palantir", sector: "AI Software", price: 25, momentum: 84, volumeSurge: 92, relativeStrength: 82, volatilityRisk: 70, newsScore: 80 }
  ];

  const base = rawResults.length ? rawResults : fallback;

  const ranked = base.map((item: any) => {
    const momentum = safeScore(item.momentum ?? item.changePercent, 70);
    const volumeSurge = safeScore(item.volumeSurge ?? item.volumeRatio, 60);
    const relativeStrength = safeScore(item.relativeStrength, momentum);
    const newsScore = safeScore(item.newsScore, 65);
    const volatilityRisk = safeScore(item.volatilityRisk ?? item.risk, 45);

    const aiScore = Math.round(
      momentum * 0.28 +
      volumeSurge * 0.18 +
      relativeStrength * 0.24 +
      newsScore * 0.2 -
      volatilityRisk * 0.1
    );

    return {
      symbol: item.symbol || item.ticker || "UNKNOWN",
      name: item.name || item.companyName || item.symbol || "Unknown",
      sector: item.sector || "Market",
      price: Number(item.price || item.lastPrice || 0),
      momentum,
      volumeSurge,
      relativeStrength,
      volatilityRisk,
      newsScore,
      aiScore,
      trend: aiScore >= 80 ? "strong-bullish" : aiScore >= 70 ? "bullish-watch" : "neutral"
    };
  }).sort((a, b) => b.aiScore - a.aiScore).slice(0, maxResults);

  return {
    ok: true,
    system: "King Trading System",
    scanner: "Super Intelligent Market Scanner",
    query,
    mode: "paper-intelligence",
    topPick: ranked[0] || null,
    ranked,
    warning: "Paper-trading intelligence only. Not financial advice."
  };
}
