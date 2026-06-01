export function runNewsAgent(input: any) {
  const newsScore = Number(input.newsScore || 50);

  return {
    agent: "News Agent",
    score: newsScore,
    sentiment: newsScore >= 80 ? "positive" : newsScore >= 65 ? "mixed-positive" : "neutral",
    reasoning: [
      newsScore >= 80
        ? "News and market attention are strongly supportive."
        : newsScore >= 65
          ? "News is supportive, but not strong enough alone."
          : "News does not currently provide a strong edge.",
    ],
  };
}
