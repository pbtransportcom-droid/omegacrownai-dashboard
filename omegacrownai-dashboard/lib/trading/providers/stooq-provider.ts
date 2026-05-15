function normalizeStooqSymbol(symbol: string) {
  const clean = String(symbol || "").trim().toLowerCase();

  if (clean.includes(".")) {
    return clean;
  }

  return `${clean}.us`;
}

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0] || "";
  const rows = lines.slice(1);

  if (!header.toLowerCase().includes("date") || !header.toLowerCase().includes("close")) {
    throw new Error(`Stooq CSV header not recognized: ${header.slice(0, 120)}`);
  }

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

async function fetchStooqCsv(stooqSymbol: string) {
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(stooqSymbol)}&i=d`;

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0 OmegaCrownAI-Trading/1.0",
      "Accept": "text/csv,text/plain,*/*",
    },
  });

  if (!response.ok) {
    throw new Error(`Stooq provider failed: ${response.status}`);
  }

  return response.text();
}

export async function fetchStooqStockCandles({
  symbol,
}: {
  symbol: string;
}) {
  const primary = normalizeStooqSymbol(symbol);
  const alternatives = Array.from(
    new Set([
      primary,
      String(symbol || "").trim().toLowerCase(),
    ])
  ).filter(Boolean);

  const errors: string[] = [];

  for (const stooqSymbol of alternatives) {
    try {
      const text = await fetchStooqCsv(stooqSymbol);
      const preview = text.trim().slice(0, 160);

      if (!text.trim()) {
        throw new Error("Stooq returned empty response.");
      }

      if (preview.toLowerCase().includes("no data")) {
        throw new Error(`Stooq returned no data for ${stooqSymbol}.`);
      }

      const candles = parseCsv(text).slice(-300);

      if (!candles.length) {
        throw new Error(`Stooq returned no candles. Preview: ${preview}`);
      }

      return {
        provider: "stooq-free-market-data",
        symbol: symbol.toUpperCase(),
        stooqSymbol,
        timeframe: "1d",
        candles,
      };
    } catch (error: any) {
      errors.push(`${stooqSymbol}: ${error?.message || "Stooq failed."}`);
    }
  }

  throw new Error(`Stooq provider failed for all symbol formats: ${errors.join(" | ")}`);
}
