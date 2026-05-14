import { getLiveMarketData } from "@/lib/trading/live-market-data";
import { getCryptoMarketIntelligence } from "@/lib/trading/crypto-intelligence";

type ForecastDirection =
  | "bullish"
  | "bearish"
  | "neutral"
  | "high_risk_unclear";

type AgentVote = {
  agent: string;
  vote: ForecastDirection;
  confidence: number;
  reason: string;
};

function average(values: number[]) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return 0;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function last<T>(items: T[]): T | null {
  return items.length ? items[items.length - 1] : null;
}

function inferTrend(candles: any[]): AgentVote {
  const recent = candles.slice(-50);
  const first = recent[0];
  const latest = last(recent);

  if (!first || !latest) {
    return {
      agent: "Trend Agent",
      vote: "high_risk_unclear",
      confidence: 20,
      reason: "Not enough candle data to establish a trend.",
    };
  }

  const change = ((Number(latest.close) - Number(first.close)) / Number(first.close)) * 100;

  if (change > 3) {
    return {
      agent: "Trend Agent",
      vote: "bullish",
      confidence: Math.min(85, 55 + Math.abs(change)),
      reason: `Recent trend is up about ${change.toFixed(2)}%.`,
    };
  }

  if (change < -3) {
    return {
      agent: "Trend Agent",
      vote: "bearish",
      confidence: Math.min(85, 55 + Math.abs(change)),
      reason: `Recent trend is down about ${change.toFixed(2)}%.`,
    };
  }

  return {
    agent: "Trend Agent",
    vote: "neutral",
    confidence: 55,
    reason: `Recent trend is mostly sideways at ${change.toFixed(2)}%.`,
  };
}

function inferMomentum(indicators: any, signal?: string | null): AgentVote {
  const rsi = Number(indicators?.rsi ?? indicators?.rsi14 ?? 0);
  const signalText = String(signal || "").toUpperCase();

  if (signalText.includes("BUY") || signalText.includes("ACCUMULATE")) {
    return {
      agent: "Momentum Agent",
      vote: "bullish",
      confidence: rsi && rsi < 72 ? 72 : 61,
      reason: `Signal is ${signalText || "bullish"} with RSI ${rsi || "unavailable"}.`,
    };
  }

  if (signalText.includes("SELL") || signalText.includes("AVOID") || signalText.includes("WEAK")) {
    return {
      agent: "Momentum Agent",
      vote: "bearish",
      confidence: rsi && rsi > 30 ? 68 : 58,
      reason: `Signal is ${signalText || "bearish"} with RSI ${rsi || "unavailable"}.`,
    };
  }

  if (rsi > 70) {
    return {
      agent: "Momentum Agent",
      vote: "bearish",
      confidence: 64,
      reason: `RSI ${rsi.toFixed(2)} may indicate overheated momentum.`,
    };
  }

  if (rsi > 50) {
    return {
      agent: "Momentum Agent",
      vote: "bullish",
      confidence: 60,
      reason: `RSI ${rsi.toFixed(2)} is above the midpoint.`,
    };
  }

  return {
    agent: "Momentum Agent",
    vote: "neutral",
    confidence: 52,
    reason: rsi ? `RSI ${rsi.toFixed(2)} is not giving a strong directional edge.` : "Momentum indicators are limited.",
  };
}

function inferVolatility(candles: any[]): AgentVote {
  const recent = candles.slice(-30);

  if (recent.length < 10) {
    return {
      agent: "Volatility Agent",
      vote: "high_risk_unclear",
      confidence: 25,
      reason: "Not enough recent candles to estimate volatility.",
    };
  }

  const ranges = recent.map((candle) => {
    const close = Number(candle.close || 1);
    return Math.abs(Number(candle.high) - Number(candle.low)) / close;
  });

  const avgRange = average(ranges) * 100;

  if (avgRange > 6) {
    return {
      agent: "Volatility Agent",
      vote: "high_risk_unclear",
      confidence: 78,
      reason: `Average recent candle range is high at ${avgRange.toFixed(2)}%.`,
    };
  }

  return {
    agent: "Volatility Agent",
    vote: "neutral",
    confidence: 58,
    reason: `Average recent candle range is ${avgRange.toFixed(2)}%.`,
  };
}

function inferVolumePower(indicators: any, powerSummary: any): AgentVote {
  const pressure = String(
    powerSummary?.pressure || indicators?.pressure || ""
  ).toUpperCase();

  const buyPower = Number(powerSummary?.buyPower ?? indicators?.buyPower ?? 0);
  const sellPower = Number(powerSummary?.sellPower ?? indicators?.sellPower ?? 0);

  if (pressure.includes("BUYER") || buyPower > sellPower) {
    return {
      agent: "Volume / Power Agent",
      vote: "bullish",
      confidence: Math.min(82, 55 + Math.abs(buyPower - sellPower)),
      reason: `Buyer pressure is stronger. Buy power ${buyPower}, sell power ${sellPower}.`,
    };
  }

  if (pressure.includes("SELLER") || sellPower > buyPower) {
    return {
      agent: "Volume / Power Agent",
      vote: "bearish",
      confidence: Math.min(82, 55 + Math.abs(sellPower - buyPower)),
      reason: `Seller pressure is stronger. Buy power ${buyPower}, sell power ${sellPower}.`,
    };
  }

  return {
    agent: "Volume / Power Agent",
    vote: "neutral",
    confidence: 50,
    reason: "Volume pressure is balanced or unavailable.",
  };
}

function inferSupportResistance(price: number | null, tradePlan: any): AgentVote {
  if (!price || !tradePlan) {
    return {
      agent: "Support / Resistance Agent",
      vote: "neutral",
      confidence: 35,
      reason: "Support/resistance levels are unavailable.",
    };
  }

  const support = Number(tradePlan.support || 0);
  const resistance = Number(tradePlan.resistance || 0);

  if (support && resistance) {
    const distanceToSupport = Math.abs(price - support) / price;
    const distanceToResistance = Math.abs(resistance - price) / price;

    if (distanceToSupport < distanceToResistance) {
      return {
        agent: "Support / Resistance Agent",
        vote: "bullish",
        confidence: 60,
        reason: "Price is closer to support than resistance, suggesting possible rebound setup.",
      };
    }

    return {
      agent: "Support / Resistance Agent",
      vote: "bearish",
      confidence: 60,
      reason: "Price is closer to resistance than support, suggesting upside may be limited.",
    };
  }

  return {
    agent: "Support / Resistance Agent",
    vote: "neutral",
    confidence: 40,
    reason: "Support/resistance levels are incomplete.",
  };
}

function inferFactualSource(sourceChain: string[], providerErrors: string[]): AgentVote {
  const hasErrors = providerErrors.length > 0;
  const hasMultipleSources = new Set(sourceChain).size >= 2;

  if (hasMultipleSources && !hasErrors) {
    return {
      agent: "Factual Source Agent",
      vote: "neutral",
      confidence: 80,
      reason: "Multiple factual sources are available with no provider errors.",
    };
  }

  if (hasMultipleSources && hasErrors) {
    return {
      agent: "Factual Source Agent",
      vote: "neutral",
      confidence: 62,
      reason: `Multiple sources are available, but provider fallback occurred: ${providerErrors.join("; ")}`,
    };
  }

  return {
    agent: "Factual Source Agent",
    vote: "high_risk_unclear",
    confidence: 45,
    reason: "Limited factual source diversity. Treat forecast with caution.",
  };
}

function inferRisk(risk: string | null, volatilityVote: AgentVote): AgentVote {
  const normalized = String(risk || "").toLowerCase();

  if (normalized.includes("high") || volatilityVote.vote === "high_risk_unclear") {
    return {
      agent: "Risk Agent",
      vote: "high_risk_unclear",
      confidence: 80,
      reason: "Risk level is high or volatility is elevated.",
    };
  }

  if (normalized.includes("medium")) {
    return {
      agent: "Risk Agent",
      vote: "neutral",
      confidence: 62,
      reason: "Risk is medium. Position sizing and confirmation are required.",
    };
  }

  return {
    agent: "Risk Agent",
    vote: "neutral",
    confidence: 55,
    reason: "Risk data does not show extreme warning conditions.",
  };
}

function consensus(votes: AgentVote[]) {
  const weighted = votes.reduce(
    (acc, vote) => {
      const weight = vote.confidence / 100;
      acc[vote.vote] = (acc[vote.vote] || 0) + weight;
      return acc;
    },
    {} as Record<ForecastDirection, number>
  );

  const sorted = Object.entries(weighted).sort((a, b) => b[1] - a[1]);
  const top = sorted[0]?.[0] as ForecastDirection | undefined;

  const direction = top || "high_risk_unclear";
  const confidence = Math.round(
    Math.min(95, Math.max(20, (sorted[0]?.[1] || 0) / Math.max(1, votes.length) * 100 + 35))
  );

  return {
    direction,
    confidence,
    scorecard: weighted,
  };
}

function makeOutlook(direction: ForecastDirection) {
  if (direction === "bullish") {
    return "Short-term forecast leans bullish, but confirmation and risk control are still required.";
  }

  if (direction === "bearish") {
    return "Short-term forecast leans bearish or weak. Avoid chasing entries without confirmation.";
  }

  if (direction === "neutral") {
    return "Short-term forecast is neutral. Market conditions do not show a strong directional edge.";
  }

  return "Forecast is unclear or high risk. Avoid treating this as a confident setup.";
}

export async function runSuperAgentTradingForecast({
  symbol,
  marketType,
  timeframe,
}: {
  symbol: string;
  marketType?: string;
  timeframe?: string;
}) {
  const cleanSymbol = String(symbol || "").trim().toUpperCase();
  const cleanMarketType = String(marketType || "auto");
  const cleanTimeframe = String(timeframe || "1h");

  const isCrypto =
    cleanMarketType === "crypto" ||
    cleanSymbol.includes("USDT") ||
    cleanSymbol.includes("-USD") ||
    cleanSymbol.includes("BTC") ||
    cleanSymbol.includes("ETH") ||
    cleanSymbol.includes("SOL");

  const data: any = isCrypto
    ? await getCryptoMarketIntelligence({
        symbol: cleanSymbol,
        timeframe: cleanTimeframe,
      })
    : await getLiveMarketData({
        symbol: cleanSymbol,
        marketType: cleanMarketType,
        timeframe: cleanTimeframe,
      });

  const candles = data.candles || data.liveData?.candles || [];
  const latest = last(candles) as any;
  const price =
    data.marketSnapshot?.price ||
    data.price ||
    data.liveData?.price ||
    latest?.close ||
    null;

  const technicals = data.technicals || {};
  const indicators =
    technicals.indicators ||
    data.indicators ||
    data.result?.indicators ||
    {};

  const powerSummary =
    technicals.powerSummary ||
    data.powerSummary ||
    data.result?.powerSummary ||
    {};

  const tradePlan =
    technicals.tradePlan ||
    data.tradePlan ||
    data.result?.tradePlan ||
    null;

  const signal =
    technicals.signal ||
    data.signal ||
    data.result?.signal ||
    null;

  const risk =
    technicals.risk ||
    data.risk ||
    data.result?.risk ||
    null;

  const providerChain = [
    ...(data.factualSources || []),
    ...(data.providerChain || []),
    data.provider,
  ].filter(Boolean);

  const providerErrors = data.providerErrors || [];

  const trendVote = inferTrend(candles);
  const momentumVote = inferMomentum(indicators, signal);
  const volatilityVote = inferVolatility(candles);
  const volumeVote = inferVolumePower(indicators, powerSummary);
  const srVote = inferSupportResistance(Number(price || 0), tradePlan);
  const sourceVote = inferFactualSource(providerChain, providerErrors);
  const riskVote = inferRisk(risk, volatilityVote);

  const votes = [
    trendVote,
    momentumVote,
    volatilityVote,
    volumeVote,
    srVote,
    sourceVote,
    riskVote,
  ];

  const final = consensus(votes);

  return {
    ok: Boolean(data.ok !== false),
    phase: "v9.5 Phase 115",
    service: "Super Agent Trading Forecast Engine",
    symbol: cleanSymbol,
    marketType: cleanMarketType,
    timeframe: cleanTimeframe,
    provider: data.provider,
    providerChain,
    providerErrors,
    price,
    forecast: {
      direction: final.direction,
      confidence: final.confidence,
      outlook: makeOutlook(final.direction),
      scorecard: final.scorecard,
    },
    agents: votes,
    bullishReasons: votes
      .filter((vote) => vote.vote === "bullish")
      .map((vote) => `${vote.agent}: ${vote.reason}`),
    bearishReasons: votes
      .filter((vote) => vote.vote === "bearish")
      .map((vote) => `${vote.agent}: ${vote.reason}`),
    riskWarnings: votes
      .filter((vote) => vote.vote === "high_risk_unclear")
      .map((vote) => `${vote.agent}: ${vote.reason}`),
    sourceData: {
      signal,
      risk,
      indicators,
      tradePlan,
      marketSnapshot: data.marketSnapshot || null,
      profile: data.profile || data.result?.profile || null,
    },
    disclaimer:
      "Educational market forecasting only. Not financial advice. Forecasts are probabilistic, can be wrong, and must not be used as guaranteed trading signals.",
  };
}
