import { getLiveMarketData } from "@/lib/trading/live-market-data";
import { searchGlobalMarkets } from "@/lib/trading/global-market-search";

function formatPair(symbol: string) {
  const clean = symbol.trim().toUpperCase();
  if (clean.includes("-USD")) return clean.replace("-USD", "USDT");
  if (clean.endsWith("USD") && !clean.endsWith("USDT")) return `${clean.replace("USD", "")}USDT`;
  return clean;
}

function last<T>(items: T[]): T | null {
  return items.length ? items[items.length - 1] : null;
}

export async function getCryptoMarketIntelligence({
  symbol,
  timeframe,
}: {
  symbol: string;
  timeframe?: string;
}) {
  const cleanSymbol = formatPair(symbol || "BTCUSDT");
  const cleanTimeframe = timeframe || "1h";

  const search = await searchGlobalMarkets(cleanSymbol);
  const live = await getLiveMarketData({
    symbol: cleanSymbol,
    marketType: "crypto",
    timeframe: cleanTimeframe,
  });

  const candles = live.candles || [];
  const latest: any = last(candles);
  const first: any = candles[0];

  const latestClose = Number(latest?.close || live.price || 0);
  const firstClose = Number(first?.close || 0);
  const rangeChangePercent =
    firstClose && latestClose ? Number((((latestClose - firstClose) / firstClose) * 100).toFixed(2)) : null;

  const result: any = live.result || {};
  const indicators = live.indicators || result.indicators || {};
  const tradePlan = result.tradePlan || null;

  return {
    ok: live.ok,
    phase: "v9.0 Phase 110",
    service: "Crypto full market intelligence",
    symbol: cleanSymbol,
    timeframe: cleanTimeframe,
    status: live.status,
    provider: live.provider,
    profile: live.profile || result.profile || search.results?.[0] || null,
    marketSnapshot: {
      price: live.price || result.price || latestClose || null,
      changePercent: live.changePercent || result.changePercent || null,
      rangeChangePercent,
      candleCount: candles.length,
      latestVolume: latest?.volume || null,
      latestHigh: latest?.high || null,
      latestLow: latest?.low || null,
    },
    technicals: {
      signal: live.signal || result.signal || null,
      confidence: live.confidence || result.confidence || null,
      risk: result.risk || null,
      verdict: result.verdict || null,
      bestTiming: result.bestTiming || null,
      indicators,
      tradePlan,
      powerSummary: result.powerSummary || null,
    },
    explanation: {
      plainEnglish:
        live.ok && candles.length
          ? "OmegaCrownAI loaded live/public-provider crypto candles and generated a technical market snapshot."
          : "OmegaCrownAI could not fully load live crypto data for this symbol.",
      bullishFactors: [
        indicators?.pressure === "BUYER PRESSURE" ? "Buyer pressure is stronger than seller pressure." : null,
        indicators?.rsi && indicators.rsi < 70 ? "RSI is not yet in extreme overbought territory." : null,
        live.confidence ? `Current model confidence is ${live.confidence}.` : null,
      ].filter(Boolean),
      bearishFactors: [
        indicators?.pressure === "SELLER PRESSURE" ? "Seller pressure is stronger than buyer pressure." : null,
        indicators?.rsi && indicators.rsi > 70 ? "RSI may be overbought." : null,
        result.risk === "high" ? "Risk is marked high." : null,
      ].filter(Boolean),
      limitations: [
        "Educational market analysis only. Not financial advice.",
        "Crypto markets are highly volatile.",
        "Provider data can be delayed, incomplete, or temporarily unavailable.",
        "Use multiple timeframes and your own risk rules before taking action.",
      ],
    },
    candles,
    powerCandles: live.powerCandles || result.powerCandles || [],
  };
}
