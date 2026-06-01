export function runDecisionAgent(input: {
  symbol: string;
  technical: any;
  news: any;
  risk: any;
}) {
  const confidence = Math.round(
    input.technical.score * 0.45 +
    input.news.score * 0.25 +
    input.risk.score * 0.3
  );

  const recommendation =
    confidence >= 82 ? "PAPER_BUY_WATCH" :
    confidence >= 70 ? "WATCHLIST" :
    confidence >= 58 ? "WAIT" :
    "AVOID";

  return {
    agent: "Decision Agent",
    symbol: input.symbol,
    confidence,
    recommendation,
    action:
      recommendation === "PAPER_BUY_WATCH"
        ? "Create paper-trade plan only after confirmation."
        : recommendation === "WATCHLIST"
          ? "Watch for pullback or breakout confirmation."
          : recommendation === "WAIT"
            ? "Wait for stronger technical/news confirmation."
            : "Avoid new entry.",
    reasoning: [
      `Technical trend: ${input.technical.trend}`,
      `News sentiment: ${input.news.sentiment}`,
      `Risk level: ${input.risk.riskLevel}`,
    ],
  };
}
