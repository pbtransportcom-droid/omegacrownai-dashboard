export type PortfolioPosition = {
  symbol: string;
  shares: number;
  averagePrice: number;
  currentPrice?: number;
  sector?: string;
};

export type PortfolioAgentInput = {
  accountSize?: number;
  cash?: number;
  positions?: PortfolioPosition[];
};

const defaultPositions: PortfolioPosition[] = [
  { symbol: "NVDA", shares: 10, averagePrice: 112, currentPrice: 120, sector: "AI Semiconductors" },
  { symbol: "MSFT", shares: 5, averagePrice: 400, currentPrice: 430, sector: "Cloud AI" },
];

export function runPortfolioAgent(input: PortfolioAgentInput = {}) {
  const accountSize = Number(input.accountSize || 10000);
  const cash = Number(input.cash ?? 5000);
  const positions = input.positions?.length ? input.positions : defaultPositions;

  const enriched = positions.map((position) => {
    const currentPrice = Number(position.currentPrice || position.averagePrice);
    const marketValue = position.shares * currentPrice;
    const costBasis = position.shares * position.averagePrice;
    const unrealizedPnL = marketValue - costBasis;
    const unrealizedPnLPercent = costBasis ? (unrealizedPnL / costBasis) * 100 : 0;

    return {
      ...position,
      currentPrice,
      marketValue: Number(marketValue.toFixed(2)),
      costBasis: Number(costBasis.toFixed(2)),
      unrealizedPnL: Number(unrealizedPnL.toFixed(2)),
      unrealizedPnLPercent: Number(unrealizedPnLPercent.toFixed(2)),
      exposurePercent: Number(((marketValue / accountSize) * 100).toFixed(2)),
    };
  });

  const investedValue = enriched.reduce((sum, p) => sum + p.marketValue, 0);
  const totalPnL = enriched.reduce((sum, p) => sum + p.unrealizedPnL, 0);

  const sectorExposure = enriched.reduce<Record<string, number>>((acc, p) => {
    const sector = p.sector || "Unknown";
    acc[sector] = Number(((acc[sector] || 0) + p.marketValue).toFixed(2));
    return acc;
  }, {});

  const concentrationRisk =
    enriched.length && Math.max(...enriched.map((p) => p.exposurePercent));

  return {
    ok: true,
    agent: "Portfolio Agent",
    accountSize,
    cash,
    investedValue: Number(investedValue.toFixed(2)),
    totalEquity: Number((cash + investedValue).toFixed(2)),
    totalPnL: Number(totalPnL.toFixed(2)),
    totalPnLPercent: Number(((totalPnL / Math.max(investedValue - totalPnL, 1)) * 100).toFixed(2)),
    concentrationRisk,
    riskLevel:
      concentrationRisk > 35 ? "high" : concentrationRisk > 20 ? "medium" : "controlled",
    sectorExposure,
    positions: enriched,
    recommendations: [
      concentrationRisk > 35
        ? "Reduce concentration risk before adding new trades."
        : "Concentration risk is acceptable for paper trading.",
      "Keep max risk per trade at or below configured risk limit.",
      "Use Trading Brain recommendations only in paper mode until broker controls are complete.",
    ],
  };
}
