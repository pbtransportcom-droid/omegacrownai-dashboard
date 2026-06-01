export function calculateExposure(positions: any[]) {
  const totalValue = positions.reduce((sum, item) => sum + Number(item.marketValue || 0), 0);

  const sectorExposure: Record<string, number> = {};
  const positionExposure: Record<string, number> = {};

  for (const position of positions) {
    const weight = totalValue > 0 ? (Number(position.marketValue || 0) / totalValue) * 100 : 0;

    sectorExposure[position.sector] = Number(
      ((sectorExposure[position.sector] || 0) + weight).toFixed(2)
    );

    positionExposure[position.symbol] = Number(weight.toFixed(2));
  }

  const largestPosition = [...positions].sort(
    (a, b) => Number(b.marketValue || 0) - Number(a.marketValue || 0)
  )[0];

  const largestSector = Object.entries(sectorExposure).sort((a, b) => b[1] - a[1])[0];

  return {
    totalValue: Number(totalValue.toFixed(2)),
    sectorExposure,
    positionExposure,
    largestPosition: largestPosition?.symbol || null,
    largestPositionWeight: largestPosition ? positionExposure[largestPosition.symbol] : 0,
    largestSector: largestSector?.[0] || null,
    largestSectorWeight: largestSector?.[1] || 0,
  };
}
