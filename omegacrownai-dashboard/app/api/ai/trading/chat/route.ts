import { NextResponse } from "next/server";

function safeText(value: any, fallback = "N/A") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function safeNumber(value: any, digits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "N/A";
  return n.toFixed(digits);
}

function detectQuestionIntent(question: string) {
  const q = question.toLowerCase();

  if (q.includes("compare") || q.includes("vs") || q.includes("better")) {
    return "compare";
  }

  if (q.includes("power") || q.includes("buy power") || q.includes("sell power")) {
    return "power";
  }

  if (q.includes("provider") || q.includes("yahoo") || q.includes("binance")) {
    return "provider";
  }

  if (q.includes("risk") || q.includes("safe") || q.includes("danger")) {
    return "risk";
  }

  if (q.includes("entry") || q.includes("stop") || q.includes("take profit")) {
    return "trade_plan";
  }

  if (q.includes("best") || q.includes("strongest") || q.includes("top")) {
    return "best_setup";
  }

  if (q.includes("avoid") || q.includes("weak") || q.includes("sell")) {
    return "avoid";
  }

  return "general";
}

function summarizeAnalysis(analysis: any) {
  if (!analysis || !analysis.ok) {
    return "No active symbol analysis is available yet. Run an analysis first, then ask me again.";
  }

  const profile = analysis.profile || {};
  const power = analysis.powerSummary || {};
  const plan = analysis.tradePlan || {};

  return [
    `Symbol: ${safeText(analysis.symbol)}`,
    `Name: ${safeText(profile.name, "Unknown")}`,
    `Sector: ${safeText(profile.sector, "Unknown")}`,
    `Price: ${safeNumber(analysis.price, 6)}`,
    `Signal: ${safeText(analysis.signal)}`,
    `Confidence: ${safeNumber(analysis.confidence, 0)}%`,
    `Risk: ${safeText(analysis.risk)}`,
    `Change: ${safeNumber(analysis.changePercent, 2)}%`,
    `Provider: ${safeText(analysis.provider)}`,
    `Buy Power: ${safeNumber(power.buyPower ?? analysis.indicators?.buyPower, 0)}%`,
    `Sell Power: ${safeNumber(power.sellPower ?? analysis.indicators?.sellPower, 0)}%`,
    `Net Power: ${safeNumber(power.netPower ?? analysis.indicators?.netPower, 0)}`,
    `Pressure: ${safeText(power.pressure ?? analysis.indicators?.pressure, "BALANCED")}`,
    `Entry Zone: ${Array.isArray(plan.entryZone) ? plan.entryZone.join(" - ") : "N/A"}`,
    `Stop Loss: ${safeText(plan.stopLoss)}`,
    `Take Profit: ${Array.isArray(plan.takeProfit) ? plan.takeProfit.join(" / ") : "N/A"}`,
    `Support: ${safeText(plan.support)}`,
    `Resistance: ${safeText(plan.resistance)}`,
    `Summary: ${safeText(profile.summary, profile.work || "")}`,
    `Risk Note: ${safeText(profile.riskNote, "Always manage risk.")}`,
  ].join("\n");
}

function getBestRanked(ranking: any[]) {
  if (!Array.isArray(ranking) || ranking.length === 0) return null;

  return [...ranking].sort(
    (a, b) => Number(b.confidence || 0) - Number(a.confidence || 0)
  )[0];
}

function getWeakRanked(ranking: any[]) {
  if (!Array.isArray(ranking) || ranking.length === 0) return [];

  return ranking.filter((item) =>
    ["WEAK / AVOID", "SELL WATCH", "NO DATA"].includes(String(item.signal || ""))
  );
}

function answerTradingQuestion({
  question,
  analysis,
  ranking,
}: {
  question: string;
  analysis: any;
  ranking: any[];
}) {
  const intent = detectQuestionIntent(question);
  const activeSummary = summarizeAnalysis(analysis);
  const best = getBestRanked(ranking);
  const weak = getWeakRanked(ranking);

  if (intent === "provider") {
    return `The current market data provider is ${safeText(analysis?.provider, "unknown")}.

If you see "yahoo-chart-public-data", it means the scanner used Yahoo public chart candles. For crypto, Omega Crown first tries Binance public market data. If Binance blocks the server or does not respond, the system falls back to Yahoo so the scanner does not break.

This is good because the user still receives chart, power, trend, and signal data even when one provider fails.`;
  }

  if (intent === "power") {
    return `Power Information:

${activeSummary}

How to read it:
- Buy Power shows how much recent bullish candle strength and volume are dominating.
- Sell Power shows how much recent bearish candle strength and volume are dominating.
- Net Power is Buy Power minus Sell Power.
- Positive Net Power suggests buyer pressure.
- Negative Net Power suggests seller pressure.
- Balanced means neither side is clearly dominating.

Educational only — not financial advice.`;
  }

  if (intent === "trade_plan") {
    return `Trade Plan View:

${activeSummary}

How to use this:
- Entry Zone is the area to watch, not a guaranteed buy point.
- Stop Loss is the invalidation/risk level.
- Take Profit levels are possible upside targets.
- Support is where buyers may defend.
- Resistance is where sellers may appear.

Wait for confirmation from price action and volume before making any decision.`;
  }

  if (intent === "risk") {
    return `Risk Review:

${activeSummary}

Main risk reading:
- High RSI can mean overbought risk.
- Weak power can mean the move is losing strength.
- Strong seller pressure can mean downside risk.
- Crypto assets can move sharply even when the signal looks strong.

Use position sizing and never treat this as guaranteed financial advice.`;
  }

  if (intent === "best_setup") {
    if (!best) {
      return "I do not see ranked scan results yet. Run Scan Crypto Market V2 or Scan Stock Market V2 first.";
    }

    return `Best ranked setup right now:

Symbol: ${safeText(best.symbol)}
Signal: ${safeText(best.signal)}
Confidence: ${safeNumber(best.confidence, 0)}%
Risk: ${safeText(best.risk)}
Price: ${safeText(best.price)}
Change: ${safeNumber(best.changePercent, 2)}%
Buy Power: ${safeNumber(best.buyPower ?? best.indicators?.buyPower, 0)}%
Sell Power: ${safeNumber(best.sellPower ?? best.indicators?.sellPower, 0)}%
Pressure: ${safeText(best.pressure ?? best.indicators?.pressure, "N/A")}

Verdict:
${safeText(best.verdict, "Review setup before acting.")}

Best timing:
${safeText(best.bestTiming, "Wait for confirmation near support, resistance, or entry zone.")}

Educational only — not financial advice.`;
  }

  if (intent === "avoid") {
    if (!weak.length) {
      return "I do not see weak or avoid symbols in the current scan. Run a fresh market scan to confirm.";
    }

    return `Weak / Avoid list:

${weak
  .slice(0, 8)
  .map(
    (item) =>
      `- ${safeText(item.symbol)}: ${safeText(item.signal)} · Confidence ${safeNumber(item.confidence, 0)}% · Risk ${safeText(item.risk)}`
  )
  .join("\n")}

These are not automatic sells. It means the scanner does not currently see a strong setup based on trend, momentum, power, and risk.`;
  }

  if (intent === "compare") {
    if (!Array.isArray(ranking) || ranking.length < 2) {
      return `To compare symbols, run a ranking scan first with at least two symbols.

Current active analysis:
${activeSummary}`;
    }

    const top = ranking.slice(0, 5);

    return `Comparison from current ranking:

${top
  .map(
    (item, index) =>
      `${index + 1}. ${safeText(item.symbol)} — ${safeText(item.signal)} · Confidence ${safeNumber(item.confidence, 0)}% · Risk ${safeText(item.risk)} · Change ${safeNumber(item.changePercent, 2)}%`
  )
  .join("\n")}

The strongest candidate is usually the one with higher confidence, healthier risk, positive trend, and stronger buyer power.`;
  }

  return `King Trading AI Bot analysis:

${activeSummary}

Simple interpretation:
The scanner combines trend, RSI, moving averages, momentum, volume power, buy/sell pressure, support, resistance, and risk. A high confidence score means the setup is stronger, but it is not a guarantee.

Ask me things like:
- Why is this signal strong?
- What does the power mean?
- What is the safest entry?
- Which ranked symbol should I avoid?
- Compare BTC and LINK

Educational only — not financial advice.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const question = String(body.question || "").trim();
    const ranking = Array.isArray(body.ranking) ? body.ranking : [];
    const analysis = body.analysis || null;

    if (!question) {
      return NextResponse.json(
        {
          ok: false,
          error: "Question is required.",
        },
        { status: 400 }
      );
    }

    const reply = answerTradingQuestion({
      question,
      analysis,
      ranking,
    });

    return NextResponse.json({
      ok: true,
      system: "King Trading AI Bot",
      reply,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Trading AI bot failed.",
      },
      { status: 500 }
    );
  }
}
