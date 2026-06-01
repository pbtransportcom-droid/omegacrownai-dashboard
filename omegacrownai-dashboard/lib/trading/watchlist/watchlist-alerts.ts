export function buildWatchlistAlerts(ranked: any[]) {
  const alerts: string[] = [];

  for (const item of ranked) {
    if (Number(item.watchlistScore) >= 80) {
      alerts.push(`${item.symbol} is a high-conviction watchlist setup.`);
    }

    if (Number(item.volumeSurge) >= 85) {
      alerts.push(`${item.symbol} has elevated volume activity.`);
    }

    if (Number(item.volatilityRisk) >= 65) {
      alerts.push(`${item.symbol} has elevated volatility risk.`);
    }
  }

  if (!alerts.length) {
    alerts.push("No urgent watchlist alerts detected.");
  }

  return alerts;
}
