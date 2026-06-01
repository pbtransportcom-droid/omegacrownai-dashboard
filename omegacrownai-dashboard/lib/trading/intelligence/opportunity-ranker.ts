import { scanMarket } from "./market-scanner";

export async function rankOpportunities(query = "AI") {
  const opportunities = await scanMarket(query);

  return opportunities
    .sort(
      (a, b) =>
        (b.score + b.momentum + b.news) -
        (a.score + a.momentum + a.news)
    )
    .slice(0, 10);
}
