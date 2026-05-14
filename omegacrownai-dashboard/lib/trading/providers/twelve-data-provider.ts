function normalizeTimeframe(timeframe: string) {
  const tf = String(timeframe || "1day").toLowerCase();

  const map: Record<string, string> = {
    "1m": "1min",
    "5m": "5min",
    "15m": "15min",
    "30m": "30min",
    "1h": "1h",
    "4h": "4h",
    "1d": "1day",
    "1day": "1day",
    "1w": "1week",
    "1week": "1week",
  };

  return map[tf] || "1day";
}

export async function fetchTwelveDataStockCandles({
  symbol,
  timeframe = "1day",
  outputsize = 300,
}: {
  symbol: string;
  timeframe?: string;
  outputsize?: number;
}) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (!apiKey) {
    throw new Error("Twelve Data API key is not configured.");
  }

  const cleanSymbol = String(symbol || "").trim().toUpperCase();
  const interval = normalizeTimeframe(timeframe);

  const url =
    `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(cleanSymbol)}` +
    `&interval=${encodeURIComponent(interval)}` +
    `&outputsize=${outputsize}` +
    `&apikey=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "OmegaCrownAI-Trading/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Twelve Data provider failed: ${response.status}`);
  }

  const data = await response.json();

  if (data?.status === "error") {
    throw new Error(data?.message || "Twelve Data provider returned an error.");
  }

  const values = Array.isArray(data?.values) ? data.values : [];

  if (!values.length) {
    throw new Error("Twelve Data returned no candles.");
  }

  const candles = values
    .map((row: any) => ({
      time: Math.floor(new Date(row.datetime).getTime() / 1000),
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
      volume: Number(row.volume || 0),
    }))
    .filter((row: any) => Number.isFinite(row.time) && Number.isFinite(row.close))
    .reverse();

  return {
    provider: "twelve-data",
    symbol: data?.meta?.symbol || cleanSymbol,
    exchange: data?.meta?.exchange || null,
    currency: data?.meta?.currency || null,
    timeframe: interval,
    candles,
  };
}
