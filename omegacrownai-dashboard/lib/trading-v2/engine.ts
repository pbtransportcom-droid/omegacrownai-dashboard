export type MarketType = "stock" | "crypto";
export type Timeframe = "24h" | "7d" | "30d" | "40d" | "90d" | "1y";

export const STOCK_UNIVERSE = [
  "AAPL","MSFT","NVDA","TSLA","META","AMZN","GOOGL","AMD","NFLX","PLTR",
  "COIN","MSTR","SMCI","SOFI","AVGO","ORCL","CRM","ADBE","UBER","SHOP",
  "JPM","BAC","V","MA","DIS","NKE","WMT","COST","XOM","CVX",
  "UNH","LLY","NVO","TSM","INTC","QCOM","PYPL","ROKU","POET","RIVN"
];

export const CRYPTO_UNIVERSE = [
  "BTC-USD","ETH-USD","SOL-USD","XRP-USD","DOGE-USD","ADA-USD","AVAX-USD","LINK-USD",
  "BNB-USD","DOT-USD","MATIC-USD","LTC-USD","BCH-USD","UNI-USD","ATOM-USD","FIL-USD",
  "APT-USD","ARB-USD","OP-USD","NEAR-USD","INJ-USD","RNDR-USD","HBAR-USD","ICP-USD",
  "ETC-USD","XLM-USD","VET-USD","ALGO-USD","SAND-USD","MANA-USD","AAVE-USD","GRT-USD",
  "FTM-USD","THETA-USD","AXS-USD","EGLD-USD","FLOW-USD","CHZ-USD","CRV-USD","KAVA-USD"
];

const PROFILE: Record<string, any> = {
  BTC: { name: "Bitcoin", type: "crypto", work: "Decentralized digital store of value and payment network.", sector: "Crypto / Layer 1" },
  ETH: { name: "Ethereum", type: "crypto", work: "Smart contract blockchain used for DeFi, NFTs, and decentralized apps.", sector: "Crypto / Smart Contracts" },
  SOL: { name: "Solana", type: "crypto", work: "High-speed blockchain for apps, payments, NFTs, and trading.", sector: "Crypto / Layer 1" },
  DOGE: { name: "Dogecoin", type: "crypto", work: "Meme-based cryptocurrency used for payments and speculation.", sector: "Crypto / Meme Coin" },
  XRP: { name: "XRP", type: "crypto", work: "Digital asset focused on payments and settlement networks.", sector: "Crypto / Payments" },
  AAPL: { name: "Apple Inc.", type: "stock", work: "Consumer technology company making iPhone, Mac, services, and wearables.", sector: "Technology" },
  MSFT: { name: "Microsoft", type: "stock", work: "Cloud, software, AI, Windows, Office, Azure, and enterprise tools.", sector: "Technology / Cloud" },
  NVDA: { name: "NVIDIA", type: "stock", work: "AI chips, GPUs, data center acceleration, gaming, and robotics platforms.", sector: "Semiconductors / AI" },
  TSLA: { name: "Tesla", type: "stock", work: "Electric vehicles, battery storage, energy, autonomous driving, and robotics.", sector: "EV / Energy" },
  META: { name: "Meta Platforms", type: "stock", work: "Social media, advertising, AI, Instagram, Facebook, WhatsApp, and metaverse products.", sector: "Communication Services" },
  AMD: { name: "Advanced Micro Devices", type: "stock", work: "CPUs, GPUs, AI accelerators, and data center chips.", sector: "Semiconductors" },
  POET: { name: "POET Technologies", type: "stock", work: "Optical interposer and photonics technology for AI/data center connectivity.", sector: "Semiconductors / Photonics" },
};

function normalizeSymbol(symbol: string, marketType?: MarketType) {
  let s = String(symbol || "").trim().toUpperCase();
  s = s.replace("USDT", "-USD");

  if (marketType === "crypto" && !s.includes("-USD")) {
    s = `${s}-USD`;
  }

  return s;
}

function profileFor(symbol: string, marketType: MarketType) {
  const base = normalizeSymbol(symbol, marketType).replace("-USD", "");
  return PROFILE[base] || {
    name: base,
    type: marketType,
    work: marketType === "crypto"
      ? "Cryptocurrency asset. Use market data, volume, and trend before making any decision."
      : "Publicly traded company or equity symbol. Review business fundamentals, trend, and risk before making any decision.",
    sector: marketType === "crypto" ? "Crypto Market" : "Stock Market",
  };
}


function toBinanceSymbol(symbol: string) {
  let s = String(symbol || "").trim().toUpperCase();

  s = s.replace("-USD", "USDT");
  s = s.replace("/USD", "USDT");
  s = s.replace("-USDT", "USDT");
  s = s.replace("/USDT", "USDT");

  if (!s.endsWith("USDT")) {
    s = `${s}USDT`;
  }

  return s;
}

function binanceIntervalAndLimit(timeframe: Timeframe) {
  if (timeframe === "24h") return { interval: "1h", limit: 24 };
  if (timeframe === "7d") return { interval: "4h", limit: 42 };
  if (timeframe === "30d") return { interval: "1d", limit: 30 };
  if (timeframe === "40d") return { interval: "1d", limit: 40 };
  if (timeframe === "90d") return { interval: "1d", limit: 90 };
  return { interval: "1d", limit: 365 };
}

async function fetchBinanceCandles(symbol: string, timeframe: Timeframe) {
  const binanceSymbol = toBinanceSymbol(symbol);
  const params = binanceIntervalAndLimit(timeframe);

  const url =
    `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(binanceSymbol)}` +
    `&interval=${params.interval}&limit=${params.limit}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Binance market data failed for ${binanceSymbol}`);
  }

  const rows = await res.json();

  const candles = rows
    .map((r: any[]) => ({
      time: Math.floor(Number(r[0]) / 1000),
      open: Number(r[1]),
      high: Number(r[2]),
      low: Number(r[3]),
      close: Number(r[4]),
      volume: Number(r[5]) || 0,
    }))
    .filter((c: any) =>
      [c.open, c.high, c.low, c.close].every((v) => typeof v === "number" && Number.isFinite(v))
    );

  if (candles.length < 5) {
    throw new Error(`Not enough Binance data for ${binanceSymbol}`);
  }

  return {
    yahooSymbol: binanceSymbol,
    candles,
    provider: "binance-public-market-data",
  };
}

function yahooParams(timeframe: Timeframe) {
  if (timeframe === "24h") return { range: "1d", interval: "5m" };
  if (timeframe === "7d") return { range: "7d", interval: "1h" };
  if (timeframe === "30d") return { range: "1mo", interval: "1d" };
  if (timeframe === "40d") return { range: "2mo", interval: "1d" };
  if (timeframe === "90d") return { range: "3mo", interval: "1d" };
  return { range: "1y", interval: "1d" };
}

function sma(values: number[], period: number) {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function rsi(values: number[], period = 14) {
  if (values.length <= period) return null;

  let gains = 0;
  let losses = 0;

  const recent = values.slice(-(period + 1));

  for (let i = 1; i < recent.length; i++) {
    const diff = recent[i] - recent[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

function round(n: number | null | undefined, d = 4) {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return Number(n.toFixed(d));
}

async function fetchYahooCandles(symbol: string, timeframe: Timeframe, marketType: MarketType) {
  const yahooSymbol = normalizeSymbol(symbol, marketType);
  const params = yahooParams(timeframe);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=${params.range}&interval=${params.interval}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Market data failed for ${yahooSymbol}`);
  }

  const data = await res.json();
  const result = data?.chart?.result?.[0];

  const timestamps = result?.timestamp || [];
  const quote = result?.indicators?.quote?.[0] || {};

  const candles = timestamps
    .map((t: number, i: number) => ({
      time: t,
      open: quote.open?.[i],
      high: quote.high?.[i],
      low: quote.low?.[i],
      close: quote.close?.[i],
      volume: quote.volume?.[i] || 0,
    }))
    .filter((c: any) =>
      [c.open, c.high, c.low, c.close].every((v) => typeof v === "number" && Number.isFinite(v))
    );

  if (candles.length < 5) {
    throw new Error(`Not enough market data for ${yahooSymbol}`);
  }

  return { yahooSymbol, candles, provider: "yahoo-chart-public-data" };
}

async function fetchCandles(symbol: string, timeframe: Timeframe, marketType: MarketType) {
  if (marketType === "crypto") {
    try {
      return await fetchBinanceCandles(symbol, timeframe);
    } catch (error) {
      return await fetchYahooCandles(symbol, timeframe, marketType);
    }
  }

  return fetchYahooCandles(symbol, timeframe, marketType);
}

export async function analyzeSymbolV2({
  symbol,
  marketType = "stock",
  timeframe = "90d",
}: {
  symbol: string;
  marketType?: MarketType;
  timeframe?: Timeframe;
}) {
  const { yahooSymbol, candles, provider } = await fetchCandles(symbol, timeframe, marketType);

  const closes = candles.map((c: any) => c.close);
  const highs = candles.map((c: any) => c.high);
  const lows = candles.map((c: any) => c.low);
  const volumes = candles.map((c: any) => c.volume || 0);

  const first = closes[0];
  const last = closes[closes.length - 1];

  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const sma200 = sma(closes, 200);
  const rsi14 = rsi(closes, 14);

  const momentum = ((last - first) / first) * 100;
  const volumeAvg = volumes.reduce((a: number, b: number) => a + b, 0) / Math.max(1, volumes.length);
  const lastVolume = volumes[volumes.length - 1] || 0;
  const volumePower = volumeAvg ? (lastVolume / volumeAvg) * 100 : 0;

  const powerCandles = candles.map((c: any) => {
    const direction = c.close >= c.open ? "buy" : "sell";
    const body = Math.abs(c.close - c.open);
    const range = Math.max(0.0000001, c.high - c.low);
    const bodyStrength = Math.min(100, (body / range) * 100);
    const volumeStrength = volumeAvg ? Math.min(200, ((c.volume || 0) / volumeAvg) * 100) : 0;
    const power = Math.round((bodyStrength * 0.55) + (volumeStrength * 0.45));
    return {
      time: c.time,
      direction,
      power,
      buyPower: direction === "buy" ? power : 0,
      sellPower: direction === "sell" ? power : 0,
      volume: c.volume || 0,
    };
  });

  const recentPower = powerCandles.slice(-40);
  const buyPowerTotal = recentPower.reduce((sum: number, c: any) => sum + Number(c.buyPower || 0), 0);
  const sellPowerTotal = recentPower.reduce((sum: number, c: any) => sum + Number(c.sellPower || 0), 0);
  const totalPower = Math.max(1, buyPowerTotal + sellPowerTotal);
  const buyPower = Math.round((buyPowerTotal / totalPower) * 100);
  const sellPower = Math.round((sellPowerTotal / totalPower) * 100);
  const netPower = buyPower - sellPower;
  const pressure =
    netPower >= 20 ? "BUYER PRESSURE" :
    netPower <= -20 ? "SELLER PRESSURE" :
    "BALANCED";

  const support = Math.min(...lows.slice(-30));
  const resistance = Math.max(...highs.slice(-30));

  let score = 35;

  if (sma20 && last > sma20) score += 12;
  if (sma50 && last > sma50) score += 12;
  if (sma20 && sma50 && sma20 > sma50) score += 10;
  if (sma200 && last > sma200) score += 10;
  if (rsi14 && rsi14 >= 45 && rsi14 <= 65) score += 10;
  if (rsi14 && rsi14 < 35) score += 6;
  if (momentum > 0) score += 8;
  if (momentum > 8) score += 8;
  if (volumePower > 120) score += 6;

  score = Math.max(5, Math.min(98, Math.round(score)));

  let signal = "WEAK / AVOID";
  if (score >= 82) signal = "BUY WATCH";
  else if (score >= 68) signal = "ACCUMULATE WATCH";
  else if (score >= 55) signal = "WATCH";
  else if (score >= 45) signal = "NEUTRAL";

  const risk =
    rsi14 && rsi14 > 72 ? "high" :
    rsi14 && rsi14 < 30 ? "high" :
    Math.abs(momentum) > 20 ? "high" :
    "medium";

  const stopLoss = last * 0.965;
  const takeProfit1 = last * 1.045;
  const takeProfit2 = last * 1.09;
  const entryLow = last * 0.992;
  const entryHigh = last * 1.006;

  const longTermPower =
    timeframe === "24h" || timeframe === "7d"
      ? Math.round(score * 0.7)
      : score;

  const verdict =
    signal === "BUY WATCH"
      ? "Strong watch setup. Price action, trend, and momentum are aligned, but confirm risk before entering."
      : signal === "ACCUMULATE WATCH"
      ? "Improving setup. Consider waiting for confirmation or a better entry zone."
      : signal === "WATCH"
      ? "Watchlist candidate. Conditions are mixed and need stronger confirmation."
      : "Not a strong setup right now. Avoid forcing the trade.";

  const bestTiming =
    signal === "BUY WATCH"
      ? "Best timing is near the entry zone with volume confirmation and price holding above support."
      : "Best timing is after a confirmed breakout above resistance or a pullback that holds support.";

  return {
    ok: true,
    provider: provider || "yahoo-chart-public-data",
    marketType,
    timeframe,
    symbol: yahooSymbol,
    profile: profileFor(yahooSymbol, marketType),
    price: round(last, 6),
    changePercent: round(momentum, 2),
    candles,
    indicators: {
      sma20: round(sma20, 6),
      sma50: round(sma50, 6),
      sma200: round(sma200, 6),
      rsi: round(rsi14, 2),
      volumePower: round(volumePower, 2),
      longTermPower,
      buyPower,
      sellPower,
      netPower,
      pressure,
      powerDays: Math.min(40, recentPower.length),
    },
    powerSummary: {
      buyPower,
      sellPower,
      netPower,
      pressure,
      volumePower: round(volumePower, 2),
      explanation:
        "Power compares recent bullish volume pressure versus bearish volume pressure. Buyer pressure means bullish candles are carrying stronger volume and body strength. Seller pressure means bearish candles are stronger.",
    },
    powerCandles: powerCandles.slice(-80),
    tradePlan: {
      entryZone: [round(entryLow, 6), round(entryHigh, 6)],
      stopLoss: round(stopLoss, 6),
      takeProfit: [round(takeProfit1, 6), round(takeProfit2, 6)],
      support: round(support, 6),
      resistance: round(resistance, 6),
    },
    signal,
    confidence: score,
    risk,
    verdict,
    bestTiming,
    disclaimer: "Educational market analysis only. Not financial advice. Signals are not guarantees.",
  };
}

export async function scanMarketV2({
  marketType,
  timeframe = "90d",
  symbols,
}: {
  marketType: MarketType;
  timeframe?: Timeframe;
  symbols?: string[];
}) {
  const universe = symbols?.length
    ? symbols
    : marketType === "crypto"
    ? CRYPTO_UNIVERSE
    : STOCK_UNIVERSE;

  const limited = universe.slice(0, 40);
  const results = [];

  for (const symbol of limited) {
    try {
      const analysis = await analyzeSymbolV2({ symbol, marketType, timeframe });
      results.push({
        symbol: analysis.symbol,
        profile: analysis.profile,
        signal: analysis.signal,
        confidence: analysis.confidence,
        risk: analysis.risk,
        price: analysis.price,
        changePercent: analysis.changePercent,
        rsi: analysis.indicators.rsi,
        sma20: analysis.indicators.sma20,
        sma50: analysis.indicators.sma50,
        longTermPower: analysis.indicators.longTermPower,
        volumePower: analysis.indicators.volumePower,
        buyPower: analysis.indicators.buyPower,
        sellPower: analysis.indicators.sellPower,
        netPower: analysis.indicators.netPower,
        pressure: analysis.indicators.pressure,
        powerDays: analysis.indicators.powerDays,
        entryZone: analysis.tradePlan.entryZone,
        stopLoss: analysis.tradePlan.stopLoss,
        takeProfit: analysis.tradePlan.takeProfit,
        support: analysis.tradePlan.support,
        resistance: analysis.tradePlan.resistance,
        verdict: analysis.verdict,
        bestTiming: analysis.bestTiming,
      });
    } catch (error: any) {
      results.push({
        symbol: normalizeSymbol(symbol, marketType),
        error: error?.message || "Scan failed",
        confidence: 0,
        signal: "NO DATA",
      });
    }
  }

  const ranked = results.sort((a: any, b: any) => Number(b.confidence || 0) - Number(a.confidence || 0));

  return {
    ok: true,
    provider: "yahoo-chart-public-data",
    marketType,
    timeframe,
    count: ranked.length,
    ranked,
    disclaimer: "Educational market analysis only. Not financial advice. Signals are not guarantees.",
  };
}
