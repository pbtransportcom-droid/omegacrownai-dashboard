import { searchGlobalMarkets } from "@/lib/trading/global-market-search";

export type MarketOpportunity = {
  symbol: string;
  score: number;
  momentum: number;
  news: number;
  sector: string;
};

export async function scanMarket(query = "AI") {
  try {
    const search = await searchGlobalMarkets(query);
    const results = Array.isArray(search?.results) ? search.results : [];

    return results.slice(0, 50).map((item: any, index: number) => ({
      symbol: item.symbol || item.ticker || `SYM${index}`,
      score: Number(item.score || 50),
      momentum: Number(item.momentum || 50),
      news: Number(item.newsScore || 50),
      sector: item.sector || "Unknown",
    }));
  } catch {
    return [];
  }
}
