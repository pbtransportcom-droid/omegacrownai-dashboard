export function runRiskAgent(input: any) {
  const accountSize = Number(input.accountSize || 10000);
  const maxRiskPercent = Number(input.maxRiskPercent || 1);
  const price = Number(input.price || 100);
  const volatilityRisk = Number(input.volatilityRisk || 50);

  const maxRiskDollars = accountSize * (maxRiskPercent / 100);
  const stopLossPercent = volatilityRisk > 65 ? 8 : volatilityRisk > 45 ? 5 : 3.5;
  const stopDistance = price * (stopLossPercent / 100);
  const shares = Math.max(1, Math.floor(maxRiskDollars / Math.max(stopDistance, 1)));
  const riskScore = Math.max(1, Math.round(100 - volatilityRisk));

  return {
    agent: "Risk Agent",
    score: riskScore,
    riskLevel: volatilityRisk > 65 ? "high" : volatilityRisk > 45 ? "medium" : "low",
    maxRiskDollars,
    stopLossPercent,
    estimatedStopPrice: Number((price - stopDistance).toFixed(2)),
    suggestedShares: shares,
    reasoning: [
      `Max risk allowed: $${maxRiskDollars.toFixed(2)}`,
      `Volatility risk: ${volatilityRisk}`,
      `Suggested position size: ${shares} shares`,
    ],
  };
}
