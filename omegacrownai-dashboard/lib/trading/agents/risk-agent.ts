export function buildTradingRiskPlan(input: {
  symbol: string;
  accountSize?: number;
  maxRiskPercent?: number;
  price?: number;
  volatilityRisk?: number;
}) {
  const accountSize = input.accountSize || 10000;
  const maxRiskPercent = input.maxRiskPercent || 1;
  const maxRiskDollars = accountSize * (maxRiskPercent / 100);
  const price = input.price || 100;
  const stopLossPercent = input.volatilityRisk && input.volatilityRisk > 60 ? 8 : 5;
  const stopDistance = price * (stopLossPercent / 100);
  const suggestedShares = Math.max(1, Math.floor(maxRiskDollars / Math.max(stopDistance, 1)));

  return {
    symbol: input.symbol,
    accountSize,
    maxRiskPercent,
    maxRiskDollars,
    stopLossPercent,
    estimatedStopPrice: Number((price - stopDistance).toFixed(2)),
    suggestedShares,
    rule: "Paper trade first. Never exceed max risk per trade."
  };
}
