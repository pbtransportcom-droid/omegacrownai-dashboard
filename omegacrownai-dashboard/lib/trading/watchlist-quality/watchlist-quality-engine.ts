import { getForecastQualitySnapshot } from "@/lib/trading/quality/forecast-quality-engine";

export type WatchlistQualityItem = {
  symbol: string;
  ok: boolean;
  qualityStatus: string;
  reviewRequired: boolean;
  forecastDirection: string;
  forecastConfidence: number;
  realizedTrendDirection: string;
  realizedTrendChangePercent: number;
  averageRecentVolatilityPercent: number;
  candleCount: number;
  providerChain: string[];
  providerErrors: string[];
  score: number;
  notes: string[];
};

function normalizeSymbols(symbols: string[]) {
  return Array.from(
    new Set(
      symbols
        .map((symbol) => String(symbol || "").trim().toUpperCase())
        .filter(Boolean)
    )
  ).slice(0, 25);
}

function scoreQuality(item: Partial<WatchlistQualityItem>) {
  let score = 0;

  if (item.ok) score += 10;
  if (item.qualityStatus === "forecast_supported") score += 35;
  if (item.qualityStatus === "needs_review") score += 10;
  if (item.qualityStatus === "high_risk") score -= 20;
  if (item.qualityStatus === "insufficient_data") score -= 25;

  if (!item.reviewRequired) score += 15;

  score += Math.min(25, Math.max(0, Number(item.forecastConfidence || 0) / 4));

  if (item.forecastDirection === item.realizedTrendDirection) score += 15;
  if (item.averageRecentVolatilityPercent && item.averageRecentVolatilityPercent > 6) score -= 15;
  if ((item.providerErrors || []).length) score -= 10;

  return Math.round(score);
}

export async function runWatchlistForecastQualityBatch({
  symbols,
  marketType,
  timeframe,
}: {
  symbols: string[];
  marketType?: string;
  timeframe?: string;
}) {
  const cleanSymbols = normalizeSymbols(symbols);
  const cleanMarketType = String(marketType || "auto");
  const cleanTimeframe = String(timeframe || "1h");

  if (!cleanSymbols.length) {
    return {
      ok: false,
      phase: "v10.1 Phase 121",
      service: "Trading Watchlist Forecast Quality Batch Scan",
      status: "empty_watchlist",
      symbols: [],
      ranked: [],
      summary: {
        total: 0,
        forecastSupported: 0,
        reviewRequired: 0,
        highRisk: 0,
        providerErrors: 0,
      },
      notes: ["No watchlist symbols were provided."],
    };
  }

  const ranked: WatchlistQualityItem[] = [];

  for (const symbol of cleanSymbols) {
    try {
      const result: any = await getForecastQualitySnapshot({
        symbol,
        marketType: cleanMarketType,
        timeframe: cleanTimeframe,
      });

      const item: Partial<WatchlistQualityItem> = {
        symbol,
        ok: Boolean(result.ok),
        qualityStatus: result.quality?.status || "needs_review",
        reviewRequired: Boolean(result.quality?.reviewRequired),
        forecastDirection: result.forecast?.direction || "unknown",
        forecastConfidence: Number(result.forecast?.confidence || 0),
        realizedTrendDirection: result.quality?.realizedTrendDirection || "unknown",
        realizedTrendChangePercent: Number(result.quality?.realizedTrendChangePercent || 0),
        averageRecentVolatilityPercent: Number(result.quality?.averageRecentVolatilityPercent || 0),
        candleCount: Number(result.quality?.candleCount || 0),
        providerChain: result.providerChain || [],
        providerErrors: result.providerErrors || [],
        notes: result.checks?.map((check: any) => `${check.name}: ${check.detail}`) || [],
      };

      ranked.push({
        ...(item as WatchlistQualityItem),
        score: scoreQuality(item),
      });
    } catch (error: any) {
      const item: WatchlistQualityItem = {
        symbol,
        ok: false,
        qualityStatus: "error",
        reviewRequired: true,
        forecastDirection: "unknown",
        forecastConfidence: 0,
        realizedTrendDirection: "unknown",
        realizedTrendChangePercent: 0,
        averageRecentVolatilityPercent: 0,
        candleCount: 0,
        providerChain: [],
        providerErrors: [error?.message || "Watchlist quality scan failed."],
        score: -50,
        notes: [error?.message || "Watchlist quality scan failed."],
      };

      ranked.push(item);
    }
  }

  ranked.sort((a, b) => b.score - a.score);

  return {
    ok: true,
    phase: "v10.1 Phase 121",
    service: "Trading Watchlist Forecast Quality Batch Scan",
    status: "completed",
    marketType: cleanMarketType,
    timeframe: cleanTimeframe,
    symbols: cleanSymbols,
    ranked,
    summary: {
      total: ranked.length,
      forecastSupported: ranked.filter((item) => item.qualityStatus === "forecast_supported").length,
      reviewRequired: ranked.filter((item) => item.reviewRequired).length,
      highRisk: ranked.filter((item) => item.qualityStatus === "high_risk").length,
      providerErrors: ranked.filter((item) => item.providerErrors.length).length,
    },
    notes: [
      "Batch scan uses forecast-quality snapshots for each watchlist symbol.",
      "Scores are diagnostic only and are not financial advice.",
      "Symbols with reviewRequired=true should not be treated as clean setups.",
    ],
  };
}
