function normalizeStooqSymbol(symbol: string) {
  const clean = String(symbol || "").trim().toLowerCase();

  if (clean.includes(".")) {
    return clean;
  }

  // Stooq US stocks usually use .us suffix.
  return `${clean}.us`;
}

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/);
  const rows = lines.slice(1);

  return rows
    .map((line) => {
      const [date, open, high, low, close, volume] = line.split(",");

      return {
        time: Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000),
        open: Number(open),
        high: Number(high),
        low: Number(low),
        close: Number(close),
        volume: Number(volume || 0),
      };
    })
    .filter((row) => Number.isFinite(row.time) && Number.isFinite(row.close));
}

export async function fetchStooqStockCandles({
  symbol,
}: {
  symbol: string;
}) {
  const stooqSymbol = normalizeStooqSymbol(symbol);

  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(stooqSymbol)}&i=d`;

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "OmegaCrownAI-Trading/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Stooq provider failed: ${response.status}`);
  }

  const text = await response.text();

  if (!text.includes("Date,Open,High,Low,Close,Volume")) {
    throw new Error("Stooq returned no usable CSV candles.");
  }

  const candles = parseCsv(text).slice(-300);

  if (!candles.length) {
    throw new Error("Stooq returned no candles.");
  }

  return {
    provider: "stooq-free-market-data",
    symbol: symbol.toUpperCase(),
    stooqSymbol,
    timeframe: "1d",
    candles,
  };
}
