import { analyzePositions } from "@/lib/trading/portfolio/position-analyzer";

export async function buildPortfolioDashboard(input: {
  positions: any[];
  cash?: number;
}) {
  const positions = Array.isArray(input.positions)
    ? input.positions
    : [];

  const analyzed = analyzePositions(positions);

  const totalMarketValue = analyzed.reduce(
    (sum: number, p: any) => sum + Number(p.marketValue || 0),
    0
  );

  const totalPnL = analyzed.reduce(
    (sum: number, p: any) => sum + Number(p.unrealizedPnL || 0),
    0
  );

  const cash = Number(input.cash || 0);

  const aiRecommendations = analyzed
    .sort(
      (a: any, b: any) =>
        Number(b.unrealizedPnL || 0) - Number(a.unrealizedPnL || 0)
    )
    .slice(0, 3)
    .map((p: any) => ({
      symbol: p.symbol,
      recommendation:
        Number(p.unrealizedPnL || 0) >= 0
          ? "Hold / Let Winners Run"
          : "Review Risk Exposure",
    }));

  return {
    ok: true,
    totalMarketValue: Number(totalMarketValue.toFixed(2)),
    totalPnL: Number(totalPnL.toFixed(2)),
    cash,
    totalPortfolioValue: Number((cash + totalMarketValue).toFixed(2)),
    positions: analyzed,
    aiRecommendations,
  };
}
