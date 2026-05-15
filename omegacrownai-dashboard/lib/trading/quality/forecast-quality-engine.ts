import { runSuperAgentTradingForecast } from "@/lib/trading/super-agent/super-agent-forecast";
import { getLiveMarketData } from "@/lib/trading/live-market-data";

type QualityStatus =
  | "forecast_supported"
  | "needs_review"
  | "high_risk"
  | "insufficient_data";

function last<T>(items: T[]): T | null {
  return items.length ? items[items.length - 1] : null;
}

function pctChange(from: number, to: number) {
  if (!from || !to) return 0;
  return ((to - from) / from) * 100;
}

function average(values: number[]) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return 0;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function inferRealizedTrend(candles: any[]) {
  const recent = candles.slice(-30);
  const first = recent[0];
  const latest = last(recent);

  if (!first || !latest) {
    return {
      direction: "unknown",
      changePercent: 0,
    };
  }

  const changePercent = pctChange(Number(first.close), Number(latest.close));

  if (changePercent > 3) return { direction: "bullish", changePercent };
  if (changePercent < -3) return { direction: "bearish", changePercent };

  return { direction: "neutral", changePercent };
}

function inferVolatility(candles: any[]) {
  const recent = candles.slice(-30);

  if (recent.length < 10) return 0;

  return average(
    recent.map((candle) => {
      const close = Number(candle.close || 1);
      return Math.abs(Number(candle.high) - Number(candle.low)) / close;
    })
  ) * 100;
}

function qualityStatus({
  forecastDirection,
  realizedDirection,
  confidence,
  volatility,
  candleCount,
  riskWarnings,
}: {
  forecastDirection: string;
  realizedDirection: string;
  confidence: number;
  volatility: number;
  candleCount: number;
  riskWarnings: string[];
}): QualityStatus {
  if (candleCount < 50) return "insufficient_data";
  if (riskWarnings.length >= 2 || volatility > 6) return "high_risk";

  if (
    forecastDirection === realizedDirection ||
    forecastDirection === "neutral" ||
    realizedDirection === "neutral"
  ) {
    return confidence >= 60 ? "forecast_supported" : "needs_review";
  }

  return "needs_review";
}

export async function getForecastQualitySnapshot({
  symbol,
  marketType,
  timeframe,
}: {
  symbol: string;
  marketType?: string;
  timeframe?: string;
}) {
  const forecast: any = await runSuperAgentTradingForecast({
    symbol,
    marketType,
    timeframe,
  });

  const live = await getLiveMarketData({
    symbol,
    marketType,
    timeframe,
  });

  const candles =
    live?.candles ||
    forecast?.sourceData?.candles ||
    forecast?.candles ||
    [];

  const sourceCandles = Array.isArray(candles) ? candles : [];
  const candleCount = sourceCandles.length;

  const realized = inferRealizedTrend(sourceCandles);
  const volatility = inferVolatility(sourceCandles);

  const direction = forecast?.forecast?.direction || "high_risk_unclear";
  const confidence = Number(forecast?.forecast?.confidence || 0);
  const riskWarnings = forecast?.riskWarnings || [];

  const status = qualityStatus({
    forecastDirection: direction,
    realizedDirection: realized.direction,
    confidence,
    volatility,
    candleCount,
    riskWarnings,
  });

  return {
    ok: Boolean(forecast.ok),
    phase: "v9.9 Phase 119",
    service: "Trading Forecast Quality Controls + Backtest Snapshot",
    symbol: forecast.symbol,
    marketType: forecast.marketType,
    timeframe: forecast.timeframe,
    provider: forecast.provider,
    providerChain: Array.from(new Set([...(forecast.providerChain || []), ...(live.providerChain || [])])),
    providerErrors: Array.from(new Set([...(forecast.providerErrors || []), ...(live.providerErrors || [])])),
    forecast: forecast.forecast,
    quality: {
      status,
      backtestWindow: "last_30_candles",
      candleCount,
      realizedTrendDirection: realized.direction,
      realizedTrendChangePercent: Number(realized.changePercent.toFixed(2)),
      averageRecentVolatilityPercent: Number(volatility.toFixed(2)),
      confidenceDiscipline:
        confidence >= 75
          ? "high_confidence"
          : confidence >= 60
            ? "moderate_confidence"
            : "low_confidence",
      reviewRequired:
        status === "high_risk" ||
        status === "needs_review" ||
        status === "insufficient_data",
    },
    checks: [
      {
        name: "Data sufficiency",
        passed: candleCount >= 50,
        detail:
          candleCount >= 50
            ? `Enough candle data available: ${candleCount}.`
            : `Insufficient candle data: ${candleCount}.`,
      },
      {
        name: "Volatility control",
        passed: volatility <= 6,
        detail:
          volatility <= 6
            ? `Recent volatility is controlled at ${volatility.toFixed(2)}%.`
            : `Recent volatility is elevated at ${volatility.toFixed(2)}%.`,
      },
      {
        name: "Risk warning control",
        passed: riskWarnings.length < 2,
        detail:
          riskWarnings.length < 2
            ? "Risk warning count is controlled."
            : `Multiple risk warnings present: ${riskWarnings.length}.`,
      },
      {
        name: "Forecast/trend alignment",
        passed:
          direction === realized.direction ||
          direction === "neutral" ||
          realized.direction === "neutral",
        detail: `Forecast direction is ${direction}; recent realized trend is ${realized.direction}.`,
      },
    ],
    agents: forecast.agents || [],
    bullishReasons: forecast.bullishReasons || [],
    bearishReasons: forecast.bearishReasons || [],
    riskWarnings,
    disclaimer:
      "Forecast quality controls are educational and diagnostic only. They are not financial advice and do not guarantee future performance.",
  };
}
