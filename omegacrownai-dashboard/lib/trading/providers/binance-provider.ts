type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string
];

function normalizeSymbol(symbol: string) {
  return symbol
    .trim()
    .toUpperCase()
    .replace("-USD", "USDT")
    .replace("/USD", "USDT")
    .replace("-USDT", "USDT")
    .replace("/", "");
}

function normalizeInterval(timeframe: string) {
  const tf = timeframe.toLowerCase();
  if (["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"].includes(tf)) {
    return tf;
  }
  return "1h";
}

export async function fetchBinanceCryptoCandles({
  symbol,
  timeframe = "1h",
  limit = 300,
}: {
  symbol: string;
  timeframe?: string;
  limit?: number;
}) {
  const cleanSymbol = normalizeSymbol(symbol);
  const interval = normalizeInterval(timeframe);

  const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(cleanSymbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`;

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "OmegaCrownAI-Trading/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Binance provider failed: ${response.status}`);
  }

  const rows = (await response.json()) as BinanceKline[];

  return {
    provider: "binance-public-market-data",
    symbol: cleanSymbol,
    timeframe: interval,
    candles: rows.map((row) => ({
      time: Math.floor(row[0] / 1000),
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
      volume: Number(row[5]),
    })),
  };
}
