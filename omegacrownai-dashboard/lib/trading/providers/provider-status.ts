export function getTradingProviderStatus() {
  return {
    phase: "v9.2 Phase 112",
    service: "Trading multi-source factual providers",
    providers: [
      {
        id: "binance-public",
        name: "Binance Public Market Data",
        type: "crypto_exchange",
        configured: true,
        role: "Crypto exchange candles, ticker, and market data when supported.",
        priority: 1,
      },
      {
        id: "coingecko",
        name: "CoinGecko",
        type: "crypto_aggregator",
        configured: Boolean(process.env.COINGECKO_API_KEY),
        role: "Crypto profile, market cap, circulating supply, categories, exchange aggregation, and metadata.",
        priority: 2,
      },
      {
        id: "twelve-data",
        name: "Twelve Data",
        type: "multi_asset_market_data",
        configured: Boolean(process.env.TWELVE_DATA_API_KEY),
        role: "Global stocks, forex, ETFs, crypto, real-time, historical, EOD, and fundamentals.",
        priority: 3,
      },
      {
        id: "finnhub",
        name: "Finnhub",
        type: "market_data_fundamentals",
        configured: Boolean(process.env.FINNHUB_API_KEY),
        role: "Realtime market data, global fundamentals, economic data, and alternative data.",
        priority: 4,
      },
      {
        id: "yahoo-chart-public-data",
        name: "Yahoo Chart Public Data",
        type: "fallback_public_chart",
        configured: true,
        role: "Fallback chart/candle source only. Should not be the only factual source.",
        priority: 99,
      },
    ],
  };
}
