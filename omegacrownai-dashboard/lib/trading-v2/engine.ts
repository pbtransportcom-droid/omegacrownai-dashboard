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
  BTC: {
    name: "Bitcoin",
    type: "crypto",
    work: "Bitcoin is a decentralized digital asset used as a store of value and peer-to-peer payment network.",
    sector: "Crypto / Store of Value",
    summary: "Bitcoin is the largest cryptocurrency by market recognition. Traders often watch BTC as the main direction leader for the crypto market.",
    riskNote: "High volatility. Moves can be affected by macro news, ETF flows, regulation, and crypto market sentiment.",
  },
  ETH: {
    name: "Ethereum",
    type: "crypto",
    work: "Ethereum is a smart contract blockchain used for decentralized apps, DeFi, NFTs, stablecoins, and tokenized assets.",
    sector: "Crypto / Smart Contracts",
    summary: "Ethereum is a major Layer 1 blockchain. It is often watched for DeFi activity, gas fees, staking, and institutional adoption.",
    riskNote: "High volatility. Watch network activity, competition from other Layer 1 chains, and regulatory news.",
  },
  SOL: {
    name: "Solana",
    type: "crypto",
    work: "Solana is a high-speed blockchain designed for fast transactions, apps, NFTs, payments, and trading activity.",
    sector: "Crypto / Layer 1",
    summary: "Solana is known for speed and low transaction costs. Traders often watch SOL for momentum during strong crypto risk-on periods.",
    riskNote: "High volatility. Watch network reliability, ecosystem activity, and competition.",
  },
  LINK: {
    name: "Chainlink",
    type: "crypto",
    work: "Chainlink provides decentralized oracle networks that connect smart contracts with real-world data, APIs, prices, and cross-chain services.",
    sector: "Crypto / Oracle Network",
    summary: "LINK is the token associated with Chainlink. The project is important because many DeFi and blockchain apps need reliable external data such as asset prices and proof-of-reserve feeds.",
    riskNote: "High volatility. Watch oracle adoption, DeFi demand, token unlocks, and broad crypto market direction.",
  },
  XRP: {
    name: "XRP",
    type: "crypto",
    work: "XRP is a digital asset focused on payments, settlement, and cross-border transfer use cases.",
    sector: "Crypto / Payments",
    summary: "XRP is often watched for payment-network news, legal/regulatory developments, and exchange liquidity.",
    riskNote: "High volatility. Legal and regulatory headlines can strongly affect price.",
  },
  DOGE: {
    name: "Dogecoin",
    type: "crypto",
    work: "Dogecoin is a meme-origin cryptocurrency used for payments, speculation, and community-driven market cycles.",
    sector: "Crypto / Meme Coin",
    summary: "DOGE often moves on sentiment, social attention, and broader crypto momentum.",
    riskNote: "Very sentiment-driven. Price can move sharply without fundamental news.",
  },
  ADA: {
    name: "Cardano",
    type: "crypto",
    work: "Cardano is a proof-of-stake blockchain focused on smart contracts, scalability, and research-driven development.",
    sector: "Crypto / Layer 1",
    summary: "ADA is watched for ecosystem growth, staking activity, and Layer 1 competition.",
    riskNote: "High volatility. Watch development progress and adoption compared with faster-growing ecosystems.",
  },
  AVAX: {
    name: "Avalanche",
    type: "crypto",
    work: "Avalanche is a Layer 1 blockchain platform for decentralized apps, subnets, DeFi, and enterprise blockchain use cases.",
    sector: "Crypto / Layer 1",
    summary: "AVAX is watched for subnet adoption, DeFi activity, gaming, and institutional blockchain projects.",
    riskNote: "High volatility. Ecosystem growth and competition are important.",
  },
  BNB: {
    name: "BNB",
    type: "crypto",
    work: "BNB is the native asset used across the BNB Chain ecosystem and Binance-related services.",
    sector: "Crypto / Exchange Ecosystem",
    summary: "BNB is tied to exchange ecosystem activity, BNB Chain usage, and crypto market liquidity.",
    riskNote: "High volatility. Watch exchange-related regulatory and market structure risk.",
  },
  LTC: {
    name: "Litecoin",
    type: "crypto",
    work: "Litecoin is a peer-to-peer cryptocurrency designed for fast and low-cost payments.",
    sector: "Crypto / Payments",
    summary: "LTC is one of the older crypto assets and is often watched as a payment-style coin.",
    riskNote: "High volatility. It may lag stronger ecosystems during innovation-led market cycles.",
  },
  DOT: {
    name: "Polkadot",
    type: "crypto",
    work: "Polkadot is a blockchain network focused on interoperability between specialized blockchains.",
    sector: "Crypto / Interoperability",
    summary: "DOT is watched for parachain activity, interoperability adoption, and developer ecosystem strength.",
    riskNote: "High volatility. Adoption and ecosystem activity are key.",
  },
  MATIC: {
    name: "Polygon",
    type: "crypto",
    work: "Polygon provides Ethereum scaling infrastructure and blockchain solutions for apps, DeFi, NFTs, and enterprises.",
    sector: "Crypto / Ethereum Scaling",
    summary: "MATIC/POL is watched for Ethereum scaling demand, partnerships, and network usage.",
    riskNote: "High volatility. Token migration, competition, and Ethereum roadmap changes matter.",
  },

  AAPL: {
    name: "Apple Inc.",
    type: "stock",
    work: "Apple makes iPhone, Mac, iPad, wearables, services, and consumer technology products.",
    sector: "Technology / Consumer Electronics",
    summary: "Apple is a mega-cap technology company. Traders watch iPhone demand, services growth, margins, buybacks, and product launches.",
    riskNote: "Watch earnings, China demand, regulation, and product cycle risk.",
  },
  MSFT: {
    name: "Microsoft",
    type: "stock",
    work: "Microsoft provides cloud computing, Windows, Office, Azure, AI infrastructure, gaming, and enterprise software.",
    sector: "Technology / Cloud / AI",
    summary: "Microsoft is watched for Azure growth, AI monetization, enterprise software strength, and margins.",
    riskNote: "Watch cloud growth, AI spending, regulation, and valuation risk.",
  },
  NVDA: {
    name: "NVIDIA",
    type: "stock",
    work: "NVIDIA designs GPUs, AI chips, data center accelerators, networking platforms, and gaming graphics technology.",
    sector: "Semiconductors / AI",
    summary: "NVIDIA is a leading AI infrastructure company. Traders watch data center revenue, GPU demand, margins, and AI capex trends.",
    riskNote: "High valuation sensitivity. Watch export controls, supply constraints, and AI demand cycles.",
  },
  TSLA: {
    name: "Tesla",
    type: "stock",
    work: "Tesla builds electric vehicles, battery storage, solar products, autonomous driving technology, and robotics projects.",
    sector: "EV / Energy / AI",
    summary: "Tesla is watched for EV deliveries, margins, autonomy progress, energy storage growth, and CEO/news sentiment.",
    riskNote: "Very volatile. Watch price cuts, competition, regulatory risk, and execution risk.",
  },
  META: {
    name: "Meta Platforms",
    type: "stock",
    work: "Meta operates Facebook, Instagram, WhatsApp, Threads, advertising platforms, AI systems, and metaverse products.",
    sector: "Communication Services / AI",
    summary: "Meta is watched for ad revenue growth, AI engagement, margins, Reality Labs spending, and user growth.",
    riskNote: "Watch regulation, ad market cycles, AI spending, and platform competition.",
  },
  AMD: {
    name: "Advanced Micro Devices",
    type: "stock",
    work: "AMD designs CPUs, GPUs, AI accelerators, embedded chips, and data center processors.",
    sector: "Semiconductors",
    summary: "AMD is watched for AI accelerator demand, data center CPU share, margins, and competition with NVIDIA and Intel.",
    riskNote: "Semiconductor cycles and AI execution are major risks.",
  },
  POET: {
    name: "POET Technologies",
    type: "stock",
    work: "POET develops optical interposer and photonics technology for AI, data center, and high-speed connectivity markets.",
    sector: "Semiconductors / Photonics",
    summary: "POET is a smaller photonics-focused company. Traders watch customer adoption, production progress, partnerships, and funding.",
    riskNote: "Small-cap risk. Higher volatility, execution risk, and liquidity risk.",
  },
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
      ? "Cryptocurrency asset. Use market data, volume, trend, liquidity, and project fundamentals before making any decision."
      : "Publicly traded company or equity symbol. Review business fundamentals, earnings, trend, volume, and risk before making any decision.",
    sector: marketType === "crypto" ? "Crypto Market" : "Stock Market",
    summary: marketType === "crypto"
      ? "This crypto symbol is not yet in the detailed Omega Crown profile database, so the scanner is showing a general crypto-market summary."
      : "This stock ticker is not yet in the detailed Omega Crown profile database, so the scanner is showing a general equity-market summary.",
    riskNote: "Educational analysis only. Always review current news, liquidity, volatility, and risk before acting.",
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
