import type { MarketType, Timeframe } from "@/lib/trading-v2/engine";

export function buildTradingStrategyDraft({
  message,
  marketType,
  timeframe,
  symbol,
  analysis,
  scan,
}: {
  message: string;
  marketType: MarketType;
  timeframe: Timeframe;
  symbol?: string;
  analysis?: any;
  scan?: any;
}) {
  const ranked = Array.isArray(scan?.ranked) ? scan.ranked : [];
  const top = ranked[0] || analysis || {};
  const power = top.powerSummary || analysis?.powerSummary || {};
  const plan = top.tradePlan || analysis?.tradePlan || {};

  return {
    version: "strategy_draft_v1",
    status: "draft",
    name: `King Trading Strategy - ${symbol || top.symbol || marketType.toUpperCase()}`,
    source: "king_trading_system",
    educationalOnly: true,
    request: message,
    marketType,
    timeframe,
    symbol: symbol || analysis?.symbol || top.symbol || "",
    provider: analysis?.provider || scan?.provider || "king-trading-engine",
    summary: {
      signal: analysis?.signal || top.signal || "WATCH",
      confidence: analysis?.confidence || top.confidence || 0,
      risk: analysis?.risk || top.risk || "medium",
      verdict: analysis?.verdict || top.verdict || "",
      bestTiming: analysis?.bestTiming || top.bestTiming || "",
    },
    power: {
      buyPower: power.buyPower ?? 0,
      sellPower: power.sellPower ?? 0,
      netPower: power.netPower ?? 0,
      pressure: power.pressure || "BALANCED",
    },
    tradePlan: {
      entryZone: plan.entryZone || [],
      stopLoss: plan.stopLoss ?? null,
      takeProfit: plan.takeProfit || [],
      support: plan.support ?? null,
      resistance: plan.resistance ?? null,
    },
    profile: analysis?.profile || top.profile || null,
    indicators: analysis?.indicators || top.indicators || {},
    rules: [
      {
        id: "confirm_trend",
        title: "Confirm trend",
        condition: "Only consider the setup when trend and power agree.",
        action: "watch",
      },
      {
        id: "entry_zone",
        title: "Use entry zone",
        condition: "Wait for price near the entry zone with confirmation.",
        action: "buy_watch",
      },
      {
        id: "risk_stop",
        title: "Respect stop loss",
        condition: "If price breaks stop loss, setup is invalidated.",
        action: "risk_control",
      },
      {
        id: "take_profit",
        title: "Use staged take-profit",
        condition: "Consider taking profit near TP1 and TP2 levels.",
        action: "profit_plan",
      },
    ],
    ranked: ranked.slice(0, 40),
    raw: {
      analysis: analysis || null,
      scan: scan || null,
    },
    disclaimer:
      "Educational market analysis only. Not financial advice. Signals are not guarantees.",
  };
}
