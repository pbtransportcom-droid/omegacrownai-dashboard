export type MarketAssetType = "crypto" | "stock" | "forex" | "index" | "unknown";

export type MarketSearchStatus =
  | "crypto_ready"
  | "stocks_provider_required"
  | "global_provider_required"
  | "provider_error"
  | "unsupported_symbol";

export type MarketSearchResult = {
  symbol: string;
  name: string;
  assetType: MarketAssetType;
  exchange?: string;
  region?: string;
  status: MarketSearchStatus;
  provider: string;
  message: string;
};

const cryptoSymbols: MarketSearchResult[] = [
  {
    symbol: "BTCUSDT",
    name: "Bitcoin / Tether",
    assetType: "crypto",
    exchange: "Binance-compatible",
    region: "global",
    status: "crypto_ready",
    provider: "crypto_registry",
    message: "Crypto symbol recognized. Live candles require exchange/provider fetch wiring."
  },
  {
    symbol: "ETHUSDT",
    name: "Ethereum / Tether",
    assetType: "crypto",
    exchange: "Binance-compatible",
    region: "global",
    status: "crypto_ready",
    provider: "crypto_registry",
    message: "Crypto symbol recognized. Live candles require exchange/provider fetch wiring."
  },
  {
    symbol: "SOLUSDT",
    name: "Solana / Tether",
    assetType: "crypto",
    exchange: "Binance-compatible",
    region: "global",
    status: "crypto_ready",
    provider: "crypto_registry",
    message: "Crypto symbol recognized. Live candles require exchange/provider fetch wiring."
  }
];

const knownStocks: MarketSearchResult[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    assetType: "stock",
    exchange: "NASDAQ",
    region: "US",
    status: "stocks_provider_required",
    provider: "market_data_provider_required",
    message: "Stock recognized. Live stock search/quotes require a configured market-data provider."
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    assetType: "stock",
    exchange: "NASDAQ",
    region: "US",
    status: "stocks_provider_required",
    provider: "market_data_provider_required",
    message: "Stock recognized. Live stock search/quotes require a configured market-data provider."
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    assetType: "stock",
    exchange: "NASDAQ",
    region: "US",
    status: "stocks_provider_required",
    provider: "market_data_provider_required",
    message: "Stock recognized. Live stock search/quotes require a configured market-data provider."
  }
];

function inferAssetType(query: string): MarketAssetType {
  const q = query.toUpperCase();

  if (
    q.includes("USDT") ||
    q.includes("BTC") ||
    q.includes("ETH") ||
    q.includes("SOL") ||
    q.includes("XRP") ||
    q.includes("BNB")
  ) {
    return "crypto";
  }

  if (/^[A-Z]{1,6}$/.test(q)) {
    return "stock";
  }

  if (q.includes("USD") || q.includes("EUR") || q.includes("JPY")) {
    return "forex";
  }

  return "unknown";
}

export async function searchGlobalMarkets(query: string): Promise<{
  ok: boolean;
  query: string;
  status: MarketSearchStatus;
  results: MarketSearchResult[];
  notes: string[];
}> {
  const normalized = query.trim().toUpperCase();

  if (!normalized) {
    return {
      ok: false,
      query,
      status: "unsupported_symbol",
      results: [],
      notes: ["Enter a crypto pair, stock ticker, forex pair, index, or company name."]
    };
  }

  const cryptoMatches = cryptoSymbols.filter(
    (item) =>
      item.symbol.includes(normalized) ||
      item.name.toUpperCase().includes(normalized)
  );

  if (cryptoMatches.length) {
    return {
      ok: true,
      query,
      status: "crypto_ready",
      results: cryptoMatches,
      notes: [
        "Crypto registry search is available.",
        "Next step is wiring live exchange candles and quotes for recognized crypto symbols."
      ]
    };
  }

  const stockMatches = knownStocks.filter(
    (item) =>
      item.symbol.includes(normalized) ||
      item.name.toUpperCase().includes(normalized)
  );

  if (stockMatches.length) {
    return {
      ok: true,
      query,
      status: "stocks_provider_required",
      results: stockMatches,
      notes: [
        "Stock symbol recognized.",
        "Live quotes, fundamentals, and global exchange search require a configured market-data provider key."
      ]
    };
  }

  const inferred = inferAssetType(normalized);

  if (inferred === "crypto") {
    return {
      ok: true,
      query,
      status: "crypto_ready",
      results: [
        {
          symbol: normalized,
          name: normalized,
          assetType: "crypto",
          exchange: "provider_required",
          region: "global",
          status: "crypto_ready",
          provider: "crypto_provider_required",
          message: "Crypto-like symbol detected. Live validation requires exchange/provider lookup."
        }
      ],
      notes: ["Crypto-like symbol detected. Add exchange/provider lookup for full verification."]
    };
  }

  if (inferred === "stock") {
    return {
      ok: true,
      query,
      status: "stocks_provider_required",
      results: [
        {
          symbol: normalized,
          name: normalized,
          assetType: "stock",
          exchange: "provider_required",
          region: "provider_required",
          status: "stocks_provider_required",
          provider: "market_data_provider_required",
          message: "Stock-like symbol detected. Global stock coverage requires a configured market-data provider."
        }
      ],
      notes: [
        "Stock-like symbol detected.",
        "To search all world stock markets, configure a provider such as a global equities data API."
      ]
    };
  }

  return {
    ok: false,
    query,
    status: "global_provider_required",
    results: [],
    notes: [
      "No local registry match.",
      "Global multi-asset search requires connected market-data providers for stocks, crypto, forex, and indexes."
    ]
  };
}
