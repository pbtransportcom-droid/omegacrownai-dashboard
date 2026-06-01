import { analyzePositions, PortfolioPosition } from "@/lib/trading/portfolio/position-analyzer";
import { calculateExposure } from "@/lib/trading/portfolio/exposure-engine";

export function runPortfolioAgent(input: {
  positions: PortfolioPosition[];
  maxSinglePositionPercent?: number;
  maxSectorPercent?: number;
}) {
  const positions = analyzePositions(input.positions || []);
  const exposure = calculateExposure(positions);

  const maxSinglePositionPercent = input.maxSinglePositionPercent || 35;
  const maxSectorPercent = input.maxSectorPercent || 55;

  const totalPnL = Number(
    positions.reduce((sum, item) => sum + Number(item.unrealizedPnL || 0), 0).toFixed(2)
  );

  const concentrationRisk =
    exposure.largestPositionWeight > maxSinglePositionPercent ||
    exposure.largestSectorWeight > maxSectorPercent;

  const riskLevel =
    concentrationRisk && totalPnL < 0
      ? "high"
      : concentrationRisk
        ? "medium-high"
        : "controlled";

  const recommendations = [
    exposure.largestPositionWeight > maxSinglePositionPercent
      ? `Reduce single-position concentration in ${exposure.largestPosition}.`
      : "Single-position concentration is within configured limits.",
    exposure.largestSectorWeight > maxSectorPercent
      ? `Reduce sector concentration in ${exposure.largestSector}.`
      : "Sector exposure is within configured limits.",
    totalPnL < 0
      ? "Review losing positions and protect downside risk."
      : "Portfolio P/L is positive or flat; continue monitoring stops and exposure.",
  ];

  const concentrationPenalty =
    Math.max(0, exposure.largestPositionWeight - maxSinglePositionPercent) * 0.35 +
    Math.max(0, exposure.largestSectorWeight - maxSectorPercent) * 0.3;

  const portfolioScore = Math.max(
    1,
    Math.min(
      100,
      Math.round(85 - concentrationPenalty + (totalPnL >= 0 ? 5 : -10))
    )
  );

  return {
    ok: true,
    system: "King Trading System Portfolio Agent",
    portfolioScore,
    riskLevel,
    totalValue: exposure.totalValue,
    totalPnL,
    exposure,
    positions,
    recommendations,
    warning: "Portfolio analysis is for paper-trading and educational use only. Not financial advice.",
  };
}
