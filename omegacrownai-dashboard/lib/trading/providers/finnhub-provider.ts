export async function fetchFinnhubStockQuote(symbol: string) {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    throw new Error("Finnhub API key is not configured.");
  }

  const cleanSymbol = String(symbol || "").trim().toUpperCase();

  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(cleanSymbol)}&token=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "OmegaCrownAI-Trading/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Finnhub provider failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data || typeof data.c !== "number" || data.c <= 0) {
    throw new Error("Finnhub returned no usable quote.");
  }

  return {
    provider: "finnhub",
    symbol: cleanSymbol,
    price: data.c,
    change: data.d,
    changePercent: data.dp,
    high: data.h,
    low: data.l,
    open: data.o,
    previousClose: data.pc,
  };
}
