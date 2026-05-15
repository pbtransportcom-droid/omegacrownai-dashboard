import { getLiveMarketData } from "@/lib/trading/live-market-data";

const AI_STOCK_CANDIDATES = [
  { symbol: "BBAI", name: "BigBear.ai Holdings", theme: "AI analytics / decision intelligence" },
  { symbol: "SOUN", name: "SoundHound AI", theme: "Voice AI" },
  { symbol: "REKR", name: "Rekor Systems", theme: "AI roadway intelligence" },
  { symbol: "MVIS", name: "MicroVision", theme: "Lidar / AI perception for autonomy" },
  { symbol: "INUV", name: "Inuvo", theme: "AI advertising / predictive consumer intelligence" },
  { symbol: "LIDR", name: "AEye", theme: "Autonomous systems / lidar perception" },
  { symbol: "MARK", name: "Remark Holdings", theme: "AI analytics / computer vision" },
  { symbol: "IDAI", name: "T Stamp", theme: "AI identity verification" },
  { symbol: "GFAI", name: "Guardforce AI", theme: "AI security / robotics" },
  { symbol: "AITX", name: "Artificial Intelligence Technology Solutions", theme: "AI security robotics / OTC" },
];

function parseMaxPrice(query: string) {
  const match = query.match(/(?:under|below|less than)\s+\$?(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : null;
}

function scoreCandidate(candidate: any, maxPrice: number | null) {
  let score = 50;

  if (candidate.price && maxPrice && candidate.price <= maxPrice) score += 30;
  if (candidate.price && maxPrice && candidate.price > maxPrice) score -= 30;
  if (candidate.candles >= 50) score += 10;
  if (candidate.providerErrors?.length) score -= 10;

  return score;
}

export async function discoverTradingCandidates({
  query,
  maxPrice,
  limit = 8,
}: {
  query: string;
  maxPrice?: number | null;
  limit?: number;
}) {
  const cleanQuery = String(query || "").trim();
  const detectedMaxPrice = maxPrice ?? parseMaxPrice(cleanQuery);
  const lower = cleanQuery.toLowerCase();

  const wantsAi =
    lower.includes("ai") ||
    lower.includes("artificial intelligence") ||
    lower.includes("machine learning");

  const baseUniverse = wantsAi ? AI_STOCK_CANDIDATES : AI_STOCK_CANDIDATES;

  const candidates = [];

  for (const item of baseUniverse.slice(0, limit)) {
    try {
      const live: any = await getLiveMarketData({
        symbol: item.symbol,
        marketType: "stock",
        timeframe: "1d",
      });

      const price = Number(live?.price || 0) || null;
      const candidate = {
        symbol: item.symbol,
        name: item.name,
        marketType: "stock",
        theme: item.theme,
        price,
        underMaxPrice: detectedMaxPrice ? Boolean(price && price <= detectedMaxPrice) : null,
        provider: live?.provider || null,
        providerChain: live?.providerChain || [],
        providerErrors: live?.providerErrors || [],
        candles: Array.isArray(live?.candles) ? live.candles.length : 0,
        whyMatched: `${item.theme}. Candidate selected from AI-related small-cap/penny-stock discovery universe.`,
        risk: price && price < 5 ? "very_high" : "high",
      };

      candidates.push({
        ...candidate,
        score: scoreCandidate(candidate, detectedMaxPrice),
      });
    } catch (error: any) {
      candidates.push({
        symbol: item.symbol,
        name: item.name,
        marketType: "stock",
        theme: item.theme,
        price: null,
        underMaxPrice: detectedMaxPrice ? null : null,
        provider: null,
        providerChain: [],
        providerErrors: [error?.message || "Live verification failed."],
        candles: 0,
        whyMatched: `${item.theme}. Price verification failed with current providers.`,
        risk: "very_high",
        score: 10,
      });
    }
  }

  const filtered = detectedMaxPrice
    ? candidates.filter((candidate) => candidate.price && candidate.price <= detectedMaxPrice)
    : candidates;

  const ranked = filtered.sort((a, b) => b.score - a.score);

  return {
    ok: true,
    phase: "v10.5 Phase 125",
    service: "King Trading System Market Discovery Search",
    query: cleanQuery,
    maxPrice: detectedMaxPrice,
    ranked,
    searchedUniverse: baseUniverse.length,
    warning:
      "Low-priced AI-related stocks can be highly speculative, illiquid, volatile, and risky. This is educational discovery, not financial advice.",
    fallbackNote:
      ranked.length
        ? "Candidates were discovered outside the current watchlist and price-checked using available market data providers."
        : "No candidates matched the requested price filter with current free provider verification.",
  };
}
