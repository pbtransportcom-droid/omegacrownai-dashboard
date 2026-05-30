export function summarizeTradingNews(symbol: string, newsScore = 50) {
  return {
    symbol,
    newsScore,
    sentiment: newsScore >= 80 ? "positive" : newsScore >= 65 ? "mixed-positive" : "neutral",
    summary:
      newsScore >= 80
        ? "Strong market attention and positive news momentum."
        : newsScore >= 65
          ? "Moderate positive signal; wait for technical confirmation."
          : "No strong news edge detected."
  };
}
