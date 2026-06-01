export type PortfolioPosition = {
  symbol: string;
  shares: number;
  costBasis: number;
  currentPrice?: number;
  sector?: string;
};

const sectorMap: Record<string, string> = {
  NVDA: "AI Semiconductors",
  AVGO: "AI Semiconductors",
  AMD: "AI Semiconductors",
  MSFT: "Cloud AI",
  GOOGL: "AI/Search",
  AMZN: "Cloud/Ecommerce",
  PLTR: "AI Software",
  AAPL: "Consumer Technology",
};

export function analyzePositions(positions: PortfolioPosition[]) {
  return positions.map((position) => {
    const currentPrice = Number(position.currentPrice || position.costBasis);
    const marketValue = Number((position.shares * currentPrice).toFixed(2));
    const costValue = Number((position.shares * position.costBasis).toFixed(2));
    const unrealizedPnL = Number((marketValue - costValue).toFixed(2));
    const unrealizedPnLPercent =
      costValue > 0 ? Number(((unrealizedPnL / costValue) * 100).toFixed(2)) : 0;

    return {
      ...position,
      currentPrice,
      sector: position.sector || sectorMap[position.symbol.toUpperCase()] || "Other",
      marketValue,
      costValue,
      unrealizedPnL,
      unrealizedPnLPercent,
    };
  });
}
