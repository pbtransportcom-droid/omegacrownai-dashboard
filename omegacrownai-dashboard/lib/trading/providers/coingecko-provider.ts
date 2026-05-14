const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  BTC: "bitcoin",
  BTCUSDT: "bitcoin",
  "BTC-USD": "bitcoin",
  ETH: "ethereum",
  ETHUSDT: "ethereum",
  "ETH-USD": "ethereum",
  SOL: "solana",
  SOLUSDT: "solana",
  "SOL-USD": "solana",
  DOGE: "dogecoin",
  DOGEUSDT: "dogecoin",
  "DOGE-USD": "dogecoin",
  KAVA: "kava",
  KAVAUSDT: "kava",
  "KAVA-USD": "kava",
};

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

export function resolveCoinGeckoId(symbol: string) {
  const clean = normalizeSymbol(symbol);
  const base = clean
    .replace("-USD", "")
    .replace("USDT", "")
    .replace("USD", "")
    .replace("/", "");

  return SYMBOL_TO_COINGECKO_ID[clean] || SYMBOL_TO_COINGECKO_ID[base] || null;
}

export async function fetchCoinGeckoCryptoProfile(symbol: string) {
  const id = resolveCoinGeckoId(symbol);

  if (!id) {
    throw new Error(`CoinGecko id not mapped for ${symbol}`);
  }

  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;

  const headers: Record<string, string> = {
    "User-Agent": "OmegaCrownAI-Trading/1.0",
  };

  if (process.env.COINGECKO_API_KEY) {
    headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
  }

  const response = await fetch(url, {
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    throw new Error(`CoinGecko provider failed: ${response.status}`);
  }

  const data = await response.json();

  return {
    provider: "coingecko",
    id: data.id,
    symbol: String(data.symbol || "").toUpperCase(),
    name: data.name,
    categories: data.categories || [],
    description: data.description?.en
      ? String(data.description.en).replace(/<[^>]*>/g, "").slice(0, 900)
      : null,
    homepage: data.links?.homepage?.filter(Boolean)?.[0] || null,
    marketCapRank: data.market_cap_rank || null,
    marketData: {
      currentPriceUsd: data.market_data?.current_price?.usd || null,
      marketCapUsd: data.market_data?.market_cap?.usd || null,
      fullyDilutedValuationUsd: data.market_data?.fully_diluted_valuation?.usd || null,
      totalVolumeUsd: data.market_data?.total_volume?.usd || null,
      circulatingSupply: data.market_data?.circulating_supply || null,
      totalSupply: data.market_data?.total_supply || null,
      maxSupply: data.market_data?.max_supply || null,
      priceChange24hPercent: data.market_data?.price_change_percentage_24h || null,
      priceChange7dPercent: data.market_data?.price_change_percentage_7d || null,
      priceChange30dPercent: data.market_data?.price_change_percentage_30d || null,
    },
  };
}
