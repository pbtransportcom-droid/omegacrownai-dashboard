"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type TradePlan = {
  entryZone?: number[];
  stopLoss?: number;
  takeProfit?: number[];
  support?: number;
  resistance?: number;
};

type TradeResult = {
  ok: boolean;
  provider?: string;
  marketType?: string;
  symbol?: string;
  price?: number;
  changePercent?: number;
  signal?: string;
  confidence?: number;
  risk?: string;
  analysis?: string;
  disclaimer?: string;
  candles?: Candle[];
  indicators?: {
    sma20?: number;
    sma50?: number;
    rsi?: number;
    volumePower?: number;
    longTermPower?: number;
    buyPower?: number;
    sellPower?: number;
    netPower?: number;
    pressure?: string;
    powerDays?: number;
  };
  profile?: {
    name?: string;
    type?: string;
    work?: string;
    sector?: string;
    summary?: string;
    riskNote?: string;
  };
  powerSummary?: {
    buyPower?: number;
    sellPower?: number;
    netPower?: number;
    pressure?: string;
    volumePower?: number;
    explanation?: string;
  };
  powerCandles?: {
    time: number;
    direction: string;
    power: number;
    buyPower: number;
    sellPower: number;
    volume: number;
  }[];
  verdict?: string;
  bestTiming?: string;
  tradePlan?: TradePlan;
  error?: string;
};

type RankedTrade = {
  rank: number;
  symbol: string;
  type?: string;
  price: number;
  signal: string;
  verdict?: string;
  bestTiming?: string;
  confidence: number;
  risk: string;
  changePercent: number;
  indicators: {
    rsi14?: number;
    sma20?: number;
    sma50?: number;
  };
  tradePlan: TradePlan;
  reasons: string[];
};

type RankResult = {
  ok: boolean;
  system?: string;
  provider?: string;
  timeframe?: string;
  ranked?: RankedTrade[];
  failed?: any[];
  disclaimer?: string;
  error?: string;
};

function buildFallbackLevels(result: TradeResult | null): TradePlan | undefined {
  if (!result?.price) return undefined;

  const price = Number(result.price);

  return {
    entryZone: [
      Number((price * 0.992).toFixed(6)),
      Number((price * 1.006).toFixed(6)),
    ],
    stopLoss: Number((price * 0.965).toFixed(6)),
    takeProfit: [
      Number((price * 1.035).toFixed(6)),
      Number((price * 1.07).toFixed(6)),
    ],
    support:
      result.indicators?.sma50 ||
      Number((price * 0.97).toFixed(6)),
    resistance:
      result.indicators?.sma20 && result.indicators.sma20 > price
        ? result.indicators.sma20
        : Number((price * 1.035).toFixed(6)),
  };
}

function TradingChart({
  candles,
  levels,
  powerCandles = [],
}: {
  candles: Candle[];
  levels?: TradePlan;
  powerCandles?: {
    time: number;
    direction: string;
    power: number;
    buyPower: number;
    sellPower: number;
    volume: number;
  }[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles || candles.length < 2) return;

    const parent = canvas.parentElement;
    const width = parent?.clientWidth || 900;
    const height = 420;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const visible = candles.slice(-80);
    const padding = 46;
    const volumeHeight = 80;
    const chartBottom = height - volumeHeight - 24;

    const highs = visible.map((c) => c.high);
    const lows = visible.map((c) => c.low);
    const volumes = visible.map((c) => c.volume || 0);

    const levelValues = [
      levels?.support,
      levels?.resistance,
      levels?.stopLoss,
      ...(levels?.entryZone || []),
      ...(levels?.takeProfit || []),
    ].filter((value) => typeof value === "number" && Number.isFinite(value)) as number[];

    const minPrice = Math.min(...lows, ...levelValues);
    const maxPrice = Math.max(...highs, ...levelValues);
    const priceRange = maxPrice - minPrice || 1;
    const maxVolume = Math.max(...volumes, 1);

    const xAt = (index: number) =>
      padding + (index / Math.max(1, visible.length - 1)) * (width - padding * 2);

    const yPrice = (price: number) =>
      padding + ((maxPrice - price) / priceRange) * (chartBottom - padding);

    // Background
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, width, height);

    // Grid and price labels
    ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Arial";

    [0, 0.25, 0.5, 0.75, 1].forEach((ratio) => {
      const price = maxPrice - ratio * priceRange;
      const y = yPrice(price);

      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      ctx.fillText(price.toFixed(4), width - padding + 6, y + 4);
    });

    // Entry zone
    if (levels?.entryZone?.[0] && levels?.entryZone?.[1]) {
      const y1 = yPrice(levels.entryZone[0]);
      const y2 = yPrice(levels.entryZone[1]);
      ctx.fillStyle = "rgba(167, 139, 250, 0.12)";
      ctx.fillRect(padding, Math.min(y1, y2), width - padding * 2, Math.max(4, Math.abs(y1 - y2)));
    }

    const drawLevel = (label: string, value: number | undefined, color: string, dashed = false) => {
      if (!value || !Number.isFinite(value)) return;

      const y = yPrice(value);

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash(dashed ? [7, 7] : []);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "rgba(2, 6, 23, 0.88)";
      ctx.fillRect(padding + 6, y - 15, 150, 22);

      ctx.fillStyle = color;
      ctx.font = "bold 11px Arial";
      ctx.fillText(`${label}: ${value.toFixed(4)}`, padding + 12, y);
    };

    drawLevel("Support", levels?.support, "#38bdf8", true);
    drawLevel("Resistance", levels?.resistance, "#f59e0b", true);
    drawLevel("Entry Low", levels?.entryZone?.[0], "#a78bfa", true);
    drawLevel("Entry High", levels?.entryZone?.[1], "#a78bfa", true);
    drawLevel("Stop", levels?.stopLoss, "#ef4444", false);
    drawLevel("TP1", levels?.takeProfit?.[0], "#22c55e", false);
    drawLevel("TP2", levels?.takeProfit?.[1], "#16a34a", false);

    // Candles and volume
    const candleWidth = Math.max(3, (width - padding * 2) / visible.length - 3);

    visible.forEach((c, index) => {
      const x = xAt(index);
      const openY = yPrice(c.open);
      const closeY = yPrice(c.close);
      const highY = yPrice(c.high);
      const lowY = yPrice(c.low);
      const bullish = c.close >= c.open;
      const color = bullish ? "#22c55e" : "#ef4444";

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      ctx.fillStyle = color;
      const bodyY = Math.min(openY, closeY);
      const bodyH = Math.max(2, Math.abs(closeY - openY));
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyH);

      const volH = ((c.volume || 0) / maxVolume) * (volumeHeight - 14);
      ctx.globalAlpha = 0.28;
      ctx.fillRect(x - candleWidth / 2, height - volH - 8, candleWidth, volH);
      ctx.globalAlpha = 1;
    });

    // Volume divider
    ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
    ctx.beginPath();
    ctx.moveTo(padding, height - volumeHeight);
    ctx.lineTo(width - padding, height - volumeHeight);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Arial";
    ctx.fillText("Volume", padding, height - volumeHeight + 15);

    // Power bars
    const powerVisible = Array.isArray(powerCandles) && powerCandles.length
      ? powerCandles.slice(-visible.length)
      : visible.map((c) => {
          const bullish = c.close >= c.open;
          const body = Math.abs(c.close - c.open);
          const range = Math.max(0.0000001, c.high - c.low);
          const power = Math.round(Math.min(100, (body / range) * 100));
          return {
            direction: bullish ? "buy" : "sell",
            power,
          };
        });

    const powerTop = height - 34;
    const maxPower = Math.max(...powerVisible.map((p: any) => Number(p.power || 0)), 1);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Arial";
    ctx.fillText("Power", padding, powerTop - 18);

    powerVisible.forEach((p: any, index: number) => {
      const x = xAt(index);
      const power = Number(p.power || 0);
      const barH = Math.max(2, (power / maxPower) * 24);
      const isBuy = p.direction === "buy" || Number(p.buyPower || 0) > Number(p.sellPower || 0);

      ctx.globalAlpha = 0.75;
      ctx.fillStyle = isBuy ? "#22c55e" : "#ef4444";
      ctx.fillRect(x - candleWidth / 2, powerTop - barH, candleWidth, barH);
      ctx.globalAlpha = 1;
    });
  }, [candles, levels, powerCandles]);

  if (!candles || candles.length < 2) {
  return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-cyan-400/30 bg-slate-950 text-sm font-semibold text-cyan-200">
        No chart data yet.
      </div>
    );
  }

  const visible = candles.slice(-80);
  const first = visible[0];
  const last = visible[visible.length - 1];
  const trend = last.close >= first.close ? "UP" : "DOWN";

  return (
    <div className="rounded-xl border border-cyan-400/25 bg-slate-950 p-4 shadow-lg shadow-cyan-950/20">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Fast Canvas Chart
          </div>
          <div className="text-sm font-medium text-slate-300">
            Candles, volume, entry, stop, take-profit, support, and resistance
          </div>
        </div>

        <div
          className={`rounded-full border px-3 py-1 text-xs font-bold ${
            trend === "UP"
              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
              : "border-red-400/40 bg-red-500/10 text-red-300"
          }`}
        >
          Trend: {trend}
        </div>
      </div>

      <canvas ref={canvasRef} className="h-[420px] w-full rounded-xl" />

      {levels && (
        <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-200 md:grid-cols-4">
          {levels.entryZone?.length === 2 && (
            <div className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-2">
              Entry: <span className="text-violet-300">{levels.entryZone[0]} - {levels.entryZone[1]}</span>
            </div>
          )}

          {levels.stopLoss && (
            <div className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2">
              Stop: <span className="text-red-300">{levels.stopLoss}</span>
            </div>
          )}

          {levels.takeProfit?.[0] && (
            <div className="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2">
              TP1: <span className="text-emerald-300">{levels.takeProfit[0]}</span>
            </div>
          )}

          {levels.takeProfit?.[1] && (
            <div className="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2">
              TP2: <span className="text-emerald-300">{levels.takeProfit[1]}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-200 md:grid-cols-4">
        <div className="rounded-lg bg-slate-900 px-3 py-2">
          Open: <span className="text-slate-100">{last.open.toFixed(6)}</span>
        </div>
        <div className="rounded-lg bg-slate-900 px-3 py-2">
          High: <span className="text-emerald-300">{last.high.toFixed(6)}</span>
        </div>
        <div className="rounded-lg bg-slate-900 px-3 py-2">
          Low: <span className="text-red-300">{last.low.toFixed(6)}</span>
        </div>
        <div className="rounded-lg bg-slate-900 px-3 py-2">
          Last: <span className="text-cyan-300">{last.close.toFixed(6)}</span>
        </div>
      </div>
    </div>
  );
}



function safeNumber(value: any, digits = 4) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "N/A";
  return n.toFixed(digits);
}

function safeText(value: any, fallback = "N/A") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function safeArrayText(value: any, digits = 4) {
  if (!Array.isArray(value) || value.length === 0) return "N/A";
  return value
    .filter((item) => item !== null && item !== undefined)
    .map((item) => {
      const n = Number(item);
      return Number.isFinite(n) ? n.toFixed(digits) : String(item);
    })
    .join(" / ");
}


function normalizeRankRow(row: any) {
  return {
    ...row,
    symbol: row?.symbol || "N/A",
    signal: row?.signal || "NO DATA",
    confidence: Number(row?.confidence || 0),
    risk: row?.risk || "unknown",
    price: row?.price ?? null,
    rsi: row?.rsi ?? null,
    changePercent: row?.changePercent ?? null,
    entryZone: row?.tradePlan?.entryZone || row?.entryZone || [],
    stopLoss: row?.tradePlan?.stopLoss || row?.stopLoss || null,
    takeProfit: row?.tradePlan?.takeProfit || row?.takeProfit || [],
    profile: row?.profile || null,
    error: row?.error || null,
  };
}

function formatMaybeNumber(value: any, digits = 4) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "N/A";
  return n.toFixed(digits);
}

function formatMaybeArray(value: any, digits = 4) {
  if (!Array.isArray(value) || value.length === 0) return "N/A";
  return value.map((item) => formatMaybeNumber(item, digits)).join(" / ");
}

function buildAiAnalysisSummary(result: TradeResult | null) {
  if (!result || !result.ok) return "";

  const symbol = safeText(result.symbol, "This symbol");
  const profile = result.profile || {};
  const power = result.powerSummary || {};
  const plan = result.tradePlan || {};
  const buyPower = power.buyPower ?? result.indicators?.buyPower ?? 0;
  const sellPower = power.sellPower ?? result.indicators?.sellPower ?? 0;
  const netPower = power.netPower ?? result.indicators?.netPower ?? 0;
  const pressure = power.pressure || result.indicators?.pressure || "BALANCED";

  const lines = [
    `${symbol} is currently ${safeText(result.signal, "WAITING")} with ${safeNumber(result.confidence, 0)}% confidence.`,
    `${safeText(profile.name, symbol)} is in ${safeText(profile.sector, result.marketType || "market")}.`,
    `Power reading: Buy Power ${safeNumber(buyPower, 0)}%, Sell Power ${safeNumber(sellPower, 0)}%, Net Power ${safeNumber(netPower, 0)}. Pressure is ${pressure}.`,
    `Price is ${safeNumber(result.price, 6)} with ${safeNumber(result.changePercent, 2)}% movement over the selected timeframe.`,
    `Entry zone: ${formatMaybeArray(plan.entryZone)}. Stop: ${formatMaybeNumber(plan.stopLoss)}. Take profit: ${formatMaybeArray(plan.takeProfit)}.`,
    `Support: ${formatMaybeNumber(plan.support)}. Resistance: ${formatMaybeNumber(plan.resistance)}.`,
    result.bestTiming ? `Best timing: ${result.bestTiming}` : "",
    result.verdict ? `Verdict: ${result.verdict}` : "",
    profile.riskNote ? `Risk note: ${profile.riskNote}` : "Risk note: Manage position size and wait for confirmation.",
    "Educational only — not financial advice. Signals are not guarantees.",
  ];

  return lines.filter(Boolean).join("\n\n");
}


export default function TradeClient() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get("symbol") || "BTCUSDT";

  const [symbol, setSymbol] = useState(initialSymbol);
  const [marketType, setMarketType] = useState<"stock" | "crypto">("crypto");
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "40d" | "90d" | "1y">("40d");
  const [loading, setLoading] = useState(false);
  const [cryptoIntel, setCryptoIntel] = useState<any>(null);
  const [cryptoIntelLoading, setCryptoIntelLoading] = useState(false);
  const [superForecast, setSuperForecast] = useState<any>(null);
  const [superForecastLoading, setSuperForecastLoading] = useState(false);
  const [forecastQuality, setForecastQuality] = useState<any>(null);
  const [forecastQualityLoading, setForecastQualityLoading] = useState(false);
  const [watchlistQuality, setWatchlistQuality] = useState<any>(null);
  const [watchlistQualityLoading, setWatchlistQualityLoading] = useState(false);
  const [watchlistSymbols, setWatchlistSymbols] = useState("AAPL,MSFT,TSLA,BTCUSDT,ETHUSDT");
  const [watchlistSaveStatus, setWatchlistSaveStatus] = useState("");
  const [watchlistLoadStatus, setWatchlistLoadStatus] = useState("");
  const [rankingLoading, setRankingLoading] = useState(false);
  const [result, setResult] = useState<TradeResult | null>(null);
  const [rankResult, setRankResult] = useState<RankResult | null>(null);
  const [rankSymbols, setRankSymbols] = useState("BTC, ETH, SOL, DOGE, AAPL, TSLA, NVDA, POET");
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatAnswer, setChatAnswer] = useState("");
  const [watchlistStatus, setWatchlistStatus] = useState("");
  const [alertConfidence, setAlertConfidence] = useState("75");
  const [alertStatus, setAlertStatus] = useState("");
  const [signalAlerts, setSignalAlerts] = useState<RankedTrade[]>([]);

  useEffect(() => {
    const urlSymbol = searchParams.get("symbol");
    if (urlSymbol) {
      analyze(urlSymbol);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setChatAnswer("");
  }, [result?.symbol, result?.signal, result?.confidence]);


  async function loadSavedWatchlist() {
    setWatchlistLoadStatus("Loading saved watchlist...");

    try {
      const response = await fetch("/api/trading/watchlist", {
        cache: "no-store"
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setWatchlistLoadStatus("Using default watchlist. Sign in to save symbols.");
        return;
      }

      const savedSymbols = Array.isArray(data?.symbols)
        ? data.symbols.join(",")
        : "";

      if (savedSymbols) {
        setWatchlistSymbols(savedSymbols);
        setWatchlistLoadStatus("Saved watchlist loaded.");
        loadWatchlistQuality(savedSymbols);
      } else {
        setWatchlistLoadStatus("No saved watchlist yet. Using defaults.");
      }
    } catch {
      setWatchlistLoadStatus("Using default watchlist.");
    }
  }

  async function loadWatchlistQuality(symbolsOverride?: string) {
    setWatchlistQualityLoading(true);

    try {
      const symbols = String(symbolsOverride || watchlistSymbols || "AAPL,MSFT,TSLA,BTCUSDT,ETHUSDT")
        .split(",")
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, 25)
        .join(",");

      if (!symbols) {
        throw new Error("Enter at least one watchlist symbol.");
      }

      const response = await fetch(
        `/api/trading/watchlist-quality?symbols=${encodeURIComponent(symbols)}&timeframe=${encodeURIComponent(timeframe || "1d")}`,
        {
          cache: "no-store"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Watchlist quality scan failed.");
      }

      setWatchlistSymbols(symbols);
      setWatchlistQuality(data);
    } catch (error: any) {
      setWatchlistQuality({
        ok: false,
        status: "error",
        summary: {
          total: 0,
          forecastSupported: 0,
          reviewRequired: 0,
          highRisk: 0,
          providerErrors: 0
        },
        ranked: [],
        notes: [error?.message || "Watchlist quality scan unavailable."]
      });
    } finally {
      setWatchlistQualityLoading(false);
    }
  }

  async function saveWatchlistSymbols() {
    setWatchlistSaveStatus("Saving...");

    try {
      const symbols = String(watchlistSymbols || "")
        .split(",")
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, 25);

      if (!symbols.length) {
        throw new Error("Enter at least one symbol before saving.");
      }

      const response = await fetch("/api/trading/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ symbols })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Watchlist save requires sign in.");
      }

      setWatchlistSaveStatus("Saved");
      loadWatchlistQuality(symbols.join(","));
    } catch (error: any) {
      setWatchlistSaveStatus(error?.message || "Watchlist save failed.");
    }
  }

  useEffect(() => {
    loadSavedWatchlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadForecastQuality(symbolValue?: string) {
    const nextSymbol = String(symbolValue || symbol || "").trim();

    if (!nextSymbol) {
      setForecastQuality(null);
      return;
    }

    setForecastQualityLoading(true);

    try {
      const response = await fetch(
        `/api/trading/forecast-quality?symbol=${encodeURIComponent(nextSymbol.toUpperCase())}&marketType=${encodeURIComponent(marketType || "auto")}&timeframe=${encodeURIComponent(timeframe || "1h")}`,
        {
          cache: "no-store"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Forecast quality check failed.");
      }

      setForecastQuality(data);
    } catch (error: any) {
      setForecastQuality({
        ok: false,
        symbol: nextSymbol.toUpperCase(),
        quality: {
          status: "needs_review",
          reviewRequired: true,
          candleCount: 0,
          confidenceDiscipline: "unknown"
        },
        checks: [
          {
            name: "Forecast quality unavailable",
            passed: false,
            detail: error?.message || "Quality check unavailable."
          }
        ],
        providerChain: [],
        providerErrors: [error?.message || "Quality check unavailable."]
      });
    } finally {
      setForecastQualityLoading(false);
    }
  }

  async function loadSuperAgentForecast(symbolValue?: string) {
    const nextSymbol = String(symbolValue || symbol || "").trim();

    if (!nextSymbol) {
      setSuperForecast(null);
      return;
    }

    setSuperForecastLoading(true);

    try {
      const response = await fetch(
        `/api/trading/forecast?symbol=${encodeURIComponent(nextSymbol.toUpperCase())}&marketType=${encodeURIComponent(marketType || "auto")}&timeframe=${encodeURIComponent(timeframe || "1h")}`,
        {
          cache: "no-store"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Super Agent forecast failed.");
      }

      setSuperForecast(data);
    } catch (error: any) {
      setSuperForecast({
        ok: false,
        symbol: nextSymbol.toUpperCase(),
        forecast: {
          direction: "high_risk_unclear",
          confidence: 0,
          outlook: error?.message || "Super Agent forecast unavailable."
        },
        agents: [],
        riskWarnings: [error?.message || "Forecast unavailable."]
      });
    } finally {
      setSuperForecastLoading(false);
    }
  }

  async function loadCryptoIntelligence(symbolValue?: string) {
    const nextSymbol = String(symbolValue || symbol || "").trim();

    if (!nextSymbol) {
      setCryptoIntel(null);
      return;
    }

    const upperSymbol = nextSymbol.toUpperCase();
    const isCrypto =
      marketType === "crypto" ||
      upperSymbol.includes("-USD") ||
      upperSymbol.includes("USDT") ||
      upperSymbol.includes("BTC") ||
      upperSymbol.includes("ETH") ||
      upperSymbol.includes("SOL");

    if (!isCrypto) {
      setCryptoIntel(null);
      return;
    }

    setCryptoIntelLoading(true);

    try {
      const response = await fetch(
        `/api/trading/crypto?symbol=${encodeURIComponent(upperSymbol)}&timeframe=${encodeURIComponent(timeframe || "1h")}`,
        {
          cache: "no-store"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Crypto intelligence failed.");
      }

      setCryptoIntel(data);
    } catch (error: any) {
      setCryptoIntel({
        ok: false,
        symbol: upperSymbol,
        status: "error",
        explanation: {
          plainEnglish: error?.message || "Crypto intelligence unavailable."
        }
      });
    } finally {
      setCryptoIntelLoading(false);
    }
  }

  async function saveSignalAlert() {
    const confidence = Number(alertConfidence || 75);

    try {
      const res = await fetch("/api/trading/alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signal: "BUY WATCH",
          minConfidence: confidence,
          isEnabled: true,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        throw new Error("Please log in before saving alerts.");
      }

      if (res.status === 401) {
        throw new Error("Please log in before saving alerts.");
      }

      if (res.status === 401) {
        throw new Error("Please log in before saving alerts.");
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not save alert.");
      }

      setAlertStatus(`Signal alert saved to your account: BUY WATCH at ${confidence}%+ confidence.`);
    } catch (error: any) {
      setAlertStatus(error?.message || "Could not save alert.");
    }
  }

  async function loadSignalAlert() {
    try {
      const res = await fetch("/api/trading/alert", {
        method: "GET",
      });

      const data = await res.json();

      if (!res.ok || !data.ok || !data.alert) {
        return { signal: "BUY WATCH", minConfidence: 75, isEnabled: true };
      }

      return {
        signal: data.alert.signal || "BUY WATCH",
        minConfidence: Number(data.alert.minConfidence || 75),
        isEnabled: data.alert.isEnabled !== false,
      };
    } catch {
      return { signal: "BUY WATCH", minConfidence: 75, isEnabled: true };
    }
  }

  async function clearSignalAlert() {
    try {
      const res = await fetch("/api/trading/alert", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not clear alert.");
      }

      setSignalAlerts([]);
      setAlertStatus("Signal alert cleared from your account.");
    } catch (error: any) {
      setAlertStatus(error?.message || "Could not clear alert.");
    }
  }

  async function checkSignalAlerts(ranked: RankedTrade[]) {
    const alert = await loadSignalAlert();

    if (!alert.isEnabled) {
      setSignalAlerts([]);
      setAlertStatus("Signal alert is disabled.");
      return;
    }

    const matches = ranked.filter(
      (item) =>
        item.signal === alert.signal &&
        Number(item.confidence || 0) >= alert.minConfidence
    );

    setSignalAlerts(matches);

    if (matches.length > 0) {
      setAlertStatus(
        `${matches.length} alert match found: ${matches
          .map((item) => `${safeText(item.symbol)} ${safeNumber(item.confidence, 0)}%`)
          .join(", ")}`
      );
    } else {
      setAlertStatus("No BUY WATCH alerts matched this scan.");
    }
  }

  async function saveWatchlist() {
    const clean = rankSymbols
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
      .join(", ");

    if (!clean) {
      setWatchlistStatus("Add symbols before saving.");
      return;
    }

    try {
      const res = await fetch("/api/trading/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Default Watchlist",
          symbols: clean,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        throw new Error("Please log in before saving your watchlist.");
      }

      if (res.status === 401) {
        throw new Error("Please log in before saving your watchlist.");
      }

      if (res.status === 401) {
        throw new Error("Please log in before saving your watchlist.");
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not save watchlist.");
      }

      setRankSymbols(data.watchlist.symbols);
      setWatchlistStatus("Watchlist saved to your account.");
    } catch (error: any) {
      setWatchlistStatus(error?.message || "Could not save watchlist.");
    }
  }

  async function loadWatchlist() {
    try {
      const res = await fetch("/api/trading/watchlist", {
        method: "GET",
      });

      const data = await res.json();

      if (res.status === 401) {
        throw new Error("Please log in before loading your watchlist.");
      }

      if (res.status === 401) {
        throw new Error("Please log in before loading your watchlist.");
      }

      if (res.status === 401) {
        throw new Error("Please log in before loading your watchlist.");
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not load watchlist.");
      }

      if (!data.watchlist?.symbols) {
        setWatchlistStatus("No saved watchlist found.");
        return;
      }

      setRankSymbols(data.watchlist.symbols);
      setWatchlistStatus("Watchlist loaded from your account.");
    } catch (error: any) {
      setWatchlistStatus(error?.message || "Could not load watchlist.");
    }
  }

  async function clearWatchlist() {
    try {
      const res = await fetch("/api/trading/watchlist", {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.status === 401) {
        throw new Error("Please log in before clearing your watchlist.");
      }

      if (res.status === 401) {
        throw new Error("Please log in before clearing your watchlist.");
      }

      if (res.status === 401) {
        throw new Error("Please log in before clearing your watchlist.");
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not clear watchlist.");
      }

      setWatchlistStatus("Saved watchlist cleared from your account.");
    } catch (error: any) {
      setWatchlistStatus(error?.message || "Could not clear watchlist.");
    }
  }

  async function scanSavedWatchlist() {
    setRankingLoading(true);
    setWatchlistStatus("Loading saved watchlist...");

    try {
      const savedRes = await fetch("/api/trading/watchlist", {
        method: "GET",
      });

      const savedData = await savedRes.json();

      if (!savedRes.ok || !savedData.ok) {
        throw new Error(savedData.error || "Could not load saved watchlist.");
      }

      const saved = savedData.watchlist?.symbols;

      if (!saved) {
        setWatchlistStatus("No saved watchlist found.");
        setRankingLoading(false);
        return;
      }

      setRankSymbols(saved);
      setWatchlistStatus("Scanning saved watchlist...");

      const res = await fetch("/api/ai/trading/scan-v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          marketType,
          timeframe,
          symbols: saved
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      setRankResult(data);

      if (data?.ranked?.length) {
        await checkSignalAlerts(data.ranked);
      }

      setWatchlistStatus("Saved watchlist scanned.");
    } catch (error: any) {
      setRankResult({ ok: false, error: error?.message || "Watchlist scan failed." });
      setWatchlistStatus(error?.message || "Watchlist scan failed.");
    }

    setRankingLoading(false);
  }

  async function loadRankings() {
    setRankingLoading(true);

    try {
      const res = await fetch("/api/ai/trading/scan-v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          marketType,
          timeframe,
          symbols: rankSymbols
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      setRankResult(data);
    } catch (error: any) {
      setRankResult({ ok: false, error: error?.message || "Ranking failed." });
    }

    setRankingLoading(false);
  }

  async function scanBuySignals() {
    await scanMarketV2(marketType);
  }


  async function analyzeV2(symbolOverride?: string) {
    const activeSymbol = symbolOverride || symbol;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/trading/analyze-v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: activeSymbol,
          marketType,
          timeframe,
        }),
      });

      const data = await res.json();
      setResult(data);
      loadCryptoIntelligence(data?.symbol || symbol);
      loadSuperAgentForecast(data?.symbol || symbol);
      loadForecastQuality(data?.symbol || symbol);
      loadWatchlistQuality();
    } catch (error: any) {
      setResult({
        ok: false,
        error: error?.message || "Trading Engine v2 failed.",
      });
    }

    setLoading(false);
  }

  async function scanMarketV2(type: "stock" | "crypto") {
    setMarketType(type);
    setRankingLoading(true);
    setRankResult(null);

    try {
      const res = await fetch("/api/ai/trading/scan-v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          marketType: type,
          timeframe,
        }),
      });

      const data = await res.json();
      setRankResult(data);

      if (data?.ranked?.length) {
        await checkSignalAlerts(data.ranked);
      }
    } catch (error: any) {
      setRankResult({
        ok: false,
        error: error?.message || "Market scan v2 failed.",
      });
    }

    setRankingLoading(false);
  }

  async function analyze(symbolOverride?: string) {
    const activeSymbol = symbolOverride || symbol;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/trading/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol: activeSymbol }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error: any) {
      setResult({ ok: false, error: error?.message || "Trading analysis failed." });
    }

    setLoading(false);
  }

  async function askTradingChat(questionOverride?: string) {
    const questionToAsk = questionOverride || chatQuestion;

    if (!questionToAsk.trim()) return;

    setChatLoading(true);
    setChatAnswer("");

    try {
      const needsDiscovery =
        /under\s+\$?\d+|below\s+\$?\d+|less than\s+\$?\d+|cheap|penny|find|search|ai stock|ai stocks|artificial intelligence/i.test(
          questionToAsk
        );

      if (needsDiscovery) {
        const discoveryResponse = await fetch(
          `/api/trading/discovery?query=${encodeURIComponent(questionToAsk)}`,
          {
            cache: "no-store",
          }
        );

        const discovery = await discoveryResponse.json();

        if (discoveryResponse.ok && discovery?.ranked?.length) {
          const priceLabel = discovery.maxPrice
            ? `$${discovery.maxPrice}`
            : "the requested price";

          const rows = discovery.ranked
            .slice(0, Number(discovery.requestedCount || 4))
            .map(
              (item: any, index: number) =>
                `${index + 1}. ${item.symbol} — ${item.name}\n` +
                `Price: ${item.price ? `$${item.price}` : "unverified"}\n` +
                `Theme: ${item.theme || "sector-matched small-cap candidate"}\n` +
                `Risk: ${item.risk || "high"}\n` +
                `Source: ${item.provider || "provider unavailable"}\n` +
                `Why matched: ${item.whyMatched || "Matched discovery query."}`
            )
            .join("\n\n");

          setChatAnswer(
            `I expanded beyond the current watchlist and searched the market discovery layer for ${discovery.sector || "requested-sector"} candidates under ${priceLabel}. Requested count: ${discovery.requestedCount || 4}. Verified exact matches: ${discovery.exactMatchCount ?? discovery.ranked?.length ?? 0}.\n\n` +
              `${rows}\n\n` +
              `${discovery.warning || "Low-priced stocks can be highly speculative, illiquid, volatile, and risky."}\n\n` +
              "These are not buy recommendations. Before touching any penny stock, verify current price, volume, spread, dilution risk, filings, news, and trend confirmation."
          );
          return;
        }

        if (discoveryResponse.ok && !discovery?.ranked?.length) {
          if (discovery?.nearMisses?.length) {
            const priceLabel = discovery.maxPrice
              ? `$${discovery.maxPrice}`
              : "the requested price";

            const nearRows = discovery.nearMisses
              .slice(0, Number(discovery.requestedCount || 4))
              .map(
                (item: any, index: number) =>
                  `${index + 1}. ${item.symbol} — ${item.name}\n` +
                  `Price: ${item.price ? `$${item.price}` : "unverified"}\n` +
                  `Theme: ${item.theme || "sector-matched candidate"}\n` +
                  `Risk: ${item.risk || "high"}\n` +
                  `Source: ${item.provider || "provider unavailable"}`
              )
              .join("\n\n");

            setChatAnswer(
              `I expanded beyond the current watchlist and searched the ${discovery.sector || "requested"} sector.\n\n` +
                `I found 0 verified ${discovery.sector || "requested-sector"} candidates under ${priceLabel} with the current free data providers. Requested count: ${discovery.requestedCount || 4}.\n\n` +
                `Closest verified candidates above that price:\n\n${nearRows}\n\n` +
                `${discovery.warning || "Low-priced stocks can be highly speculative, illiquid, volatile, and risky."}\n\n` +
                "This is educational discovery only, not financial advice."
            );
            return;
          }

          setChatAnswer(
            `I expanded beyond the current watchlist, but I could not verify matching candidates with the current free provider data.\n\n` +
              `${discovery?.fallbackNote || "No verified candidates matched the requested filter."}\n\n` +
              "This is educational discovery only, not financial advice."
          );
          return;
        }
      }

      const res = await fetch("/api/trading/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: questionToAsk,
          rankings: (rankResult as any)?.rankings || (rankResult as any)?.ranked || (rankResult as any)?.items || [],
          marketType,
          timeframe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Trading chat failed.");
      }

      setChatAnswer(data.reply || "");
    } catch (error: any) {
      setChatAnswer(error?.message || "Trading chat failed.");
    } finally {
      setChatLoading(false);
    }
  }

  const signal = result?.signal || "WAITING";
  const chartLevels = result?.tradePlan || buildFallbackLevels(result);
  const safeRanked = Array.isArray(rankResult?.ranked)
    ? rankResult.ranked.map((row: any, index: number) => ({
        ...normalizeRankRow(row),
        rank: row?.rank || index + 1,
        verdict: row?.verdict || row?.error || "Review setup before acting.",
        bestTiming: row?.bestTiming || "Wait for confirmation near support, resistance, or entry zone.",
        tradePlan: {
          entryZone: row?.tradePlan?.entryZone || row?.entryZone || [],
          stopLoss: row?.tradePlan?.stopLoss || row?.stopLoss || null,
          takeProfit: row?.tradePlan?.takeProfit || row?.takeProfit || [],
          support: row?.tradePlan?.support || row?.support || null,
          resistance: row?.tradePlan?.resistance || row?.resistance || null,
        },
        indicators: {
          rsi14: row?.indicators?.rsi14 || row?.rsi || row?.indicators?.rsi || null,
          sma20: row?.indicators?.sma20 || row?.sma20 || null,
          sma50: row?.indicators?.sma50 || row?.sma50 || null,
          volumePower: row?.indicators?.volumePower || row?.volumePower || null,
          longTermPower: row?.indicators?.longTermPower || row?.longTermPower || null,
        },
      }))
    : [];

  const topBuyWatch = safeRanked.find((x: any) => x.signal === "BUY WATCH");
  const bestConfidence = safeRanked[0];
  const weakAvoidCount = safeRanked.filter(
    (x: any) => x.signal === "WEAK / AVOID" || x.signal === "SELL WATCH" || x.signal === "NO DATA"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          King Trading System
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-100">
          Real Trading AI Engine
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
          Live crypto and stock analysis with chart, RSI, SMA, signal, confidence, risk, ranking, chatbot verdict, and AI explanation.
          Educational only - not financial advice.
        </p>
      </div>


      <div className="rounded-xl border border-cyan-400/25 bg-slate-950 p-4 shadow-lg shadow-cyan-950/20">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              Trading Engine V2 Scanner
            </div>
            <p className="mt-1 text-sm text-slate-300">
              Choose stock or crypto market, select timeframe, then scan up to 40 symbols directly from market data.
            </p>
          </div>

          <div className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-200">
            Educational only — not financial advice
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-cyan-400/20 bg-slate-900 p-3">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              Market To Scan
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMarketType("crypto")}
                className={`rounded-lg px-3 py-2 text-xs font-bold ${
                  marketType === "crypto"
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                Crypto Market
              </button>

              <button
                onClick={() => setMarketType("stock")}
                className={`rounded-lg px-3 py-2 text-xs font-bold ${
                  marketType === "stock"
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                Stock Market
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-400/20 bg-slate-900 p-3">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              Timeframe
            </div>
            <div className="grid grid-cols-6 gap-2">
              {(["24h", "7d", "30d", "40d", "90d", "1y"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`rounded-lg px-2 py-2 text-xs font-bold ${
                    timeframe === tf
                      ? "bg-amber-500 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button
            onClick={() => analyzeV2()}
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
          >
            {loading ? "Analyzing..." : `Analyze ${marketType.toUpperCase()} V2`}
          </button>

          <button
            onClick={() => scanMarketV2("crypto")}
            disabled={rankingLoading}
            className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-200 disabled:opacity-60"
          >
            {rankingLoading ? "Scanning..." : "Scan Crypto Market V2"}
          </button>

          <button
            onClick={() => scanMarketV2("stock")}
            disabled={rankingLoading}
            className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200 disabled:opacity-60"
          >
            {rankingLoading ? "Scanning..." : "Scan Stock Market V2"}
          </button>
        </div>

        <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300">
          Current selection: <span className="font-bold text-white">{marketType.toUpperCase()}</span>
          {" "}· Timeframe: <span className="font-bold text-white">{timeframe.toUpperCase()}</span>
        </div>
      </div>


      <div className="rounded-xl border border-border bg-panel/60 p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            className="w-full rounded-xl border border-border bg-black/20 px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent md:max-w-xs"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="BTCUSDT"
          />

          <button
            onClick={() => analyzeV2()}
            disabled={loading}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze Market"}
          </button>
        </div>

        <p className="mt-3 text-xs text-muted">
          Examples: BTCUSDT, ETHUSDT, SOLUSDT, AAPL, TSLA, NVDA, POET.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-panel/60 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Top Ranked Predictions
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              King Trading System Rankings
            </h2>
            <p className="mt-1 text-xs text-muted">
              Type stocks or crypto symbols to rank. Uses Coinbase for crypto and Yahoo chart data for stocks.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 md:max-w-xl">
            <input
              className="w-full rounded-xl border border-border bg-black/20 px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent"
              value={rankSymbols}
              onChange={(e) => setRankSymbols(e.target.value.toUpperCase())}
              placeholder="BTC, ETH, DOGE, AAPL, TSLA, NVDA, POET"
            />

            <div className="grid gap-2 md:grid-cols-2">
              <button
                onClick={loadRankings}
                disabled={rankingLoading}
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
              >
                {rankingLoading ? "Ranking..." : "Rank These Symbols"}
              </button>

              <button
                onClick={scanBuySignals}
                disabled={rankingLoading}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {rankingLoading ? "Scanning..." : "Scan Buy Signals"}
              </button>
            </div>

            <div className="grid gap-2 md:grid-cols-4">
              <button
                onClick={saveWatchlist}
                className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200"
              >
                Save Watchlist
              </button>

              <button
                onClick={loadWatchlist}
                className="rounded-xl border border-slate-400/30 bg-slate-500/10 px-3 py-2 text-xs font-semibold text-slate-200"
              >
                Load
              </button>

              <button
                onClick={scanSavedWatchlist}
                disabled={rankingLoading}
                className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 disabled:opacity-60"
              >
                Scan Saved
              </button>

              <button
                onClick={clearWatchlist}
                className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200"
              >
                Clear
              </button>
            </div>

            {watchlistStatus && (
              <div className="rounded-lg border border-border bg-black/20 px-3 py-2 text-xs text-muted">
                {watchlistStatus}
              </div>
            )}

            <div className="rounded-xl border border-yellow-400/25 bg-yellow-500/10 p-3">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
                Signal Alerts
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto]">
                <input
                  className="rounded-xl border border-border bg-black/20 px-3 py-2 text-xs outline-none"
                  value={alertConfidence}
                  onChange={(e) => setAlertConfidence(e.target.value)}
                  placeholder="Minimum confidence, e.g. 75"
                />

                <button
                  onClick={saveSignalAlert}
                  className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-200"
                >
                  Save BUY Alert
                </button>

                <button
                  onClick={clearSignalAlert}
                  className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200"
                >
                  Clear Alert
                </button>
              </div>

              {alertStatus && (
                <div className="mt-2 rounded-lg border border-border bg-black/20 px-3 py-2 text-xs text-slate-200">
                  {alertStatus}
                </div>
              )}

              {signalAlerts.length > 0 && (
                <div className="mt-3 grid gap-2">
                  {signalAlerts.map((item) => (
                    <div
                      key={`alert-${safeText(item.symbol)}`}
                      className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs"
                    >
                      <span className="font-bold text-emerald-300">
                        ALERT: {safeText(item.symbol)}
                      </span>
                      <span className="text-slate-200">
                        {" "}is {safeText(item.signal)} with {safeNumber(item.confidence, 0)}% confidence.
                      </span>
                      <div className="mt-1 text-muted">
                        {item.bestTiming || item.verdict || "Review entry zone and risk before acting."}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-2 text-[11px] text-muted">
                Alerts appear after ranking or scanning. Educational only — not financial advice.
              </p>
            </div>
          </div>
        </div>

        {rankResult && !rankResult.ok && (
          <div className="mt-4 rounded-xl border border-red-700 bg-red-950/40 p-4 text-sm text-red-300">
            {rankResult.error || "Ranking failed."}
          </div>
        )}

        {rankResult?.ranked && rankResult.ranked.length > 0 && (
          <div className="mt-5 space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                  Top Buy Watch
                </div>
                <div className="mt-2 text-lg font-bold">
                  {topBuyWatch?.symbol || "None"}
                </div>
              </div>

              <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                  Best Confidence
                </div>
                <div className="mt-2 text-lg font-bold">
                  {bestConfidence ? `${bestConfidence.symbol} - ${safeNumber(bestConfidence.confidence, 0)}%` : "None - 0%"}
                </div>
              </div>

              <div className="rounded-xl border border-red-400/25 bg-red-500/10 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-red-300">
                  Avoid / Weak
                </div>
                <div className="mt-2 text-lg font-bold">
                  {weakAvoidCount}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] border-separate border-spacing-y-3 text-sm">
                <thead className="text-xs uppercase tracking-[0.15em] text-muted">
                  <tr>
                    <th className="px-3 text-left">Rank</th>
                    <th className="px-3 text-left">Symbol</th>
                    <th className="px-3 text-left">Signal</th>
                    <th className="px-3 text-left">Verdict</th>
                    <th className="px-3 text-left">Best Timing</th>
                    <th className="px-3 text-left">Confidence</th>
                    <th className="px-3 text-left">Entry</th>
                    <th className="px-3 text-left">Stop</th>
                    <th className="px-3 text-left">Take Profit</th>
                    <th className="px-3 text-left">RSI</th>
                  </tr>
                </thead>

                <tbody>
                  {safeRanked.map((item: any) => (
                    <tr key={safeText(item.symbol)} className="bg-black/20">
                      <td className="rounded-l-xl px-3 py-4 font-semibold">#{item.rank}</td>
                      <td className="px-3 py-4">
                        <button
                          onClick={() => {
                            setSymbol(item.symbol);
                            analyzeV2(item.symbol);
                          }}
                          className="font-semibold text-accent hover:underline"
                        >
                          {safeText(item.symbol)}
                        </button>
                        <div className="text-xs text-muted">{safeNumber(item.changePercent, 2)}% momentum</div>
                        {item.profile?.name && (
                          <div className="mt-1 max-w-[220px] text-[11px] leading-4 text-slate-400">
                            <span className="font-semibold text-slate-300">{item.profile.name}</span>
                            {item.profile.sector ? ` · ${item.profile.sector}` : ""}
                          </div>
                        )}
                        {item.profile?.summary && (
                          <div className="mt-1 max-w-[260px] text-[11px] leading-4 text-slate-500">
                            {item.profile.summary}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold">
                          {safeText(item.signal)}
                        </span>
                        <div className="mt-1 text-xs capitalize text-muted">Risk: {safeText(item.risk)}</div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="max-w-[190px] text-xs leading-5">{item.verdict || "--"}</div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="max-w-[270px] text-xs leading-5 text-muted">{item.bestTiming || "--"}</div>
                      </td>
                      <td className="px-3 py-4 font-semibold">{safeNumber(item.confidence, 0)}%</td>
                      <td className="px-3 py-4">{formatMaybeArray(item.tradePlan?.entryZone)}</td>
                      <td className="px-3 py-4 text-red-300">{formatMaybeNumber(item.tradePlan?.stopLoss)}</td>
                      <td className="px-3 py-4 text-emerald-300">{formatMaybeArray(item.tradePlan?.takeProfit)}</td>
                      <td className="rounded-r-xl px-3 py-4">{formatMaybeNumber(item.indicators?.rsi14, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted">{rankResult.disclaimer}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-panel/60 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Trading Chatbot
        </p>
        <h2 className="mt-1 text-xl font-semibold">
          Ask King Trading System
        </h2>

        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            className="w-full rounded-xl border border-border bg-black/20 px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent"
            value={chatQuestion}
            onChange={(e) => setChatQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") askTradingChat();
            }}
            placeholder="Example: Compare DOGE vs ETH"
          />

          <button
            onClick={() => askTradingChat()}
            disabled={chatLoading}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {chatLoading ? "Thinking..." : "Ask"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "What is the best ranked setup right now?",
            "Which symbol should I avoid?",
            "Compare DOGE vs ETH",
            "Give me the safest entry plan",
          ].map((q) => (
            <button
              key={q}
              onClick={() => {
                setChatQuestion(q);
                askTradingChat(q);
              }}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:border-accent hover:text-text"
            >
              {q}
            </button>
          ))}
        </div>

        {chatAnswer && (
          <div className="mt-4 rounded-xl border border-border bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">
              King Trading System Answer
            </div>
            <div className="mt-3 whitespace-pre-wrap text-sm leading-7">
              {chatAnswer}
            </div>
          </div>
        )}

        <p className="mt-3 text-xs text-muted">
          Educational market analysis only. Not financial advice. Signals are not guarantees.
        </p>
      </div>

      {result && !result.ok && (
        <div className="rounded-xl border border-red-700 bg-red-950/40 p-4 text-sm text-red-300">
          {result.error || "Trading analysis failed."}
        </div>
      )}

      {result && result.ok && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-cyan-400/25 bg-slate-950 p-5 shadow-lg shadow-cyan-950/20">
              
      {superForecast ? (
        <section className="rounded-2xl border border-purple-400/30 bg-purple-500/10 p-5 md:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
                Super Agent Forecast
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                {superForecast.symbol || result?.symbol}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {superForecast.forecast?.outlook || "Forecast generated by OmegaCrownAI Super Agent consensus."}
              </p>
            </div>
            <div className="rounded-xl border border-purple-400/30 bg-black/30 px-4 py-3 text-right">
              <p className="text-xs uppercase text-slate-400">Direction</p>
              <p className="text-xl font-black text-purple-100">
                {superForecast.forecast?.direction || "N/A"}
              </p>
              <p className="mt-1 text-xs text-slate-300">
                Confidence: {superForecast.forecast?.confidence ?? "N/A"}%
              </p>
            </div>
          </div>

          {superForecastLoading ? (
            <p className="mt-4 text-sm text-purple-200">Loading Super Agent forecast...</p>
          ) : null}

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Price</p>
              <p className="mt-1 text-xl font-black text-white">
                {superForecast.price ?? "N/A"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Forecast</p>
              <p className="mt-1 text-xl font-black text-white">
                {superForecast.forecast?.direction || "N/A"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Confidence</p>
              <p className="mt-1 text-xl font-black text-white">
                {superForecast.forecast?.confidence ?? "N/A"}%
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Agents</p>
              <p className="mt-1 text-xl font-black text-white">
                {superForecast.agents?.length || 0}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-purple-400/20 bg-black/30 p-4">
            <h3 className="text-sm font-black text-purple-100">Agent Votes</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {(superForecast.agents || []).map((agent: any) => (
                <div key={agent.agent} className="rounded-xl border border-border bg-slate-950/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-white">{agent.agent}</p>
                    <p className="rounded-full border border-purple-400/30 px-2 py-1 text-xs font-bold text-purple-100">
                      {agent.vote} · {agent.confidence}%
                    </p>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-300">{agent.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <h3 className="text-sm font-black text-emerald-200">Bullish Reasons</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-200">
                {(superForecast.bullishReasons?.length ? superForecast.bullishReasons : ["No bullish reasons returned."]).map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4">
              <h3 className="text-sm font-black text-red-200">Bearish Reasons</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-200">
                {(superForecast.bearishReasons?.length ? superForecast.bearishReasons : ["No bearish reasons returned."]).map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-yellow-400/20 bg-yellow-500/10 p-4">
              <h3 className="text-sm font-black text-yellow-100">Risk Warnings</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-200">
                {(superForecast.riskWarnings?.length ? superForecast.riskWarnings : ["No risk warnings returned."]).map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-black/30 p-4">
            <h3 className="text-sm font-black text-white">Provider Chain</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(superForecast.providerChain || [superForecast.provider || "provider unavailable"]).map((source: string) => (
                <span
                  key={source}
                  className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-100"
                >
                  {source}
                </span>
              ))}
            </div>
            {superForecast.providerErrors?.length ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-yellow-100">
                {superForecast.providerErrors.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-400">
            {superForecast.disclaimer || "Educational market forecasting only. Not financial advice."}
          </p>
        </section>
      ) : null}

      {watchlistQuality ? (
        <section className="rounded-2xl border border-lime-400/30 bg-lime-500/10 p-5 md:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-lime-300">
                Watchlist Quality Ranking
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Super Agent Batch Scan
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Ranked forecast quality across the active OmegaCrownAI watchlist.
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadWatchlistQuality()}
              className="rounded-xl border border-lime-400/30 bg-lime-500/10 px-4 py-2 text-sm font-black text-lime-100 hover:bg-lime-500/20"
            >
              {watchlistQualityLoading ? "Scanning..." : "Refresh Batch Scan"}
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-lime-400/20 bg-black/30 p-4">
            <label className="text-xs font-black uppercase tracking-wide text-lime-200">
              Custom Watchlist Symbols
            </label>
            <div className="mt-3 flex flex-col gap-3 md:flex-row">
              <input
                value={watchlistSymbols}
                onChange={(event) => setWatchlistSymbols(event.target.value)}
                placeholder="AAPL,MSFT,TSLA,BTCUSDT,ETHUSDT"
                className="min-w-0 flex-1 rounded-xl border border-lime-400/20 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-lime-300"
              />
              <button
                type="button"
                onClick={() => loadWatchlistQuality(watchlistSymbols)}
                className="rounded-xl bg-lime-500 px-4 py-3 text-sm font-black text-black hover:bg-lime-400"
              >
                Scan Symbols
              </button>
              <button
                type="button"
                onClick={saveWatchlistSymbols}
                className="rounded-xl border border-lime-400/30 bg-lime-500/10 px-4 py-3 text-sm font-black text-lime-100 hover:bg-lime-500/20"
              >
                Save Watchlist
              </button>
            </div>
            <div className="mt-3 space-y-1">
              {watchlistSaveStatus ? (
                <p className="text-xs text-slate-300">{watchlistSaveStatus}</p>
              ) : null}
              {watchlistLoadStatus ? (
                <p className="text-xs text-slate-400">{watchlistLoadStatus}</p>
              ) : null}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              Enter up to 25 comma-separated symbols. Examples: AAPL, TSLA, BTCUSDT, ETHUSDT.
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-5">
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Total</p>
              <p className="mt-1 text-xl font-black text-white">
                {watchlistQuality.summary?.total ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Supported</p>
              <p className="mt-1 text-xl font-black text-white">
                {watchlistQuality.summary?.forecastSupported ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Review Required</p>
              <p className="mt-1 text-xl font-black text-white">
                {watchlistQuality.summary?.reviewRequired ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">High Risk</p>
              <p className="mt-1 text-xl font-black text-white">
                {watchlistQuality.summary?.highRisk ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Provider Warnings</p>
              <p className="mt-1 text-xl font-black text-white">
                {watchlistQuality.summary?.providerErrors ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-lime-400/20 bg-black/30">
            <div className="grid grid-cols-8 gap-2 border-b border-border px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
              <span>Rank</span>
              <span>Symbol</span>
              <span>Score</span>
              <span>Status</span>
              <span>Forecast</span>
              <span>Confidence</span>
              <span>Trend</span>
              <span>Volatility</span>
            </div>

            {(watchlistQuality.ranked || []).map((item: any, index: number) => (
              <div
                key={item.symbol}
                className="grid grid-cols-8 gap-2 border-b border-border/60 px-4 py-3 text-sm text-slate-200 last:border-b-0"
              >
                <span className="font-black text-lime-200">#{index + 1}</span>
                <span className="font-black text-white">{item.symbol}</span>
                <span>{item.score}</span>
                <span className={item.reviewRequired ? "text-yellow-200" : "text-emerald-200"}>
                  {item.qualityStatus}
                </span>
                <span>{item.forecastDirection}</span>
                <span>{item.forecastConfidence}%</span>
                <span>{item.realizedTrendDirection}</span>
                <span>{item.averageRecentVolatilityPercent}%</span>
              </div>
            ))}
          </div>

          {(watchlistQuality.ranked || []).some((item: any) => item.providerErrors?.length) ? (
            <div className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-500/10 p-4">
              <h3 className="text-sm font-black text-yellow-100">Provider Warnings</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-yellow-50">
                {(watchlistQuality.ranked || [])
                  .filter((item: any) => item.providerErrors?.length)
                  .map((item: any) => (
                    <li key={item.symbol}>
                      <span className="font-black">{item.symbol}:</span>{" "}
                      {item.providerErrors.join("; ")}
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}

          <p className="mt-5 text-xs leading-5 text-slate-400">
            Watchlist ranking is educational and diagnostic only. It is not financial advice and does not guarantee future performance.
          </p>
        </section>
      ) : null}

      {forecastQuality ? (
        <section className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 md:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">
                Forecast Quality Controls
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                {forecastQuality.symbol || result?.symbol}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Quality status: {forecastQuality.quality?.status || "N/A"} · Backtest window: {forecastQuality.quality?.backtestWindow || "N/A"}
              </p>
            </div>
            <div className="rounded-xl border border-amber-400/30 bg-black/30 px-4 py-3 text-right">
              <p className="text-xs uppercase text-slate-400">Review Required</p>
              <p className="text-xl font-black text-amber-100">
                {forecastQuality.quality?.reviewRequired ? "YES" : "NO"}
              </p>
              <p className="mt-1 text-xs text-slate-300">
                Discipline: {forecastQuality.quality?.confidenceDiscipline || "N/A"}
              </p>
            </div>
          </div>

          {forecastQualityLoading ? (
            <p className="mt-4 text-sm text-amber-200">Loading forecast quality controls...</p>
          ) : null}

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Candle Count</p>
              <p className="mt-1 text-xl font-black text-white">
                {forecastQuality.quality?.candleCount ?? "N/A"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Realized Trend</p>
              <p className="mt-1 text-xl font-black text-white">
                {forecastQuality.quality?.realizedTrendDirection || "N/A"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Trend Change</p>
              <p className="mt-1 text-xl font-black text-white">
                {forecastQuality.quality?.realizedTrendChangePercent ?? "N/A"}%
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Recent Volatility</p>
              <p className="mt-1 text-xl font-black text-white">
                {forecastQuality.quality?.averageRecentVolatilityPercent ?? "N/A"}%
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-400/20 bg-black/30 p-4">
            <h3 className="text-sm font-black text-amber-100">Quality Checks</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {(forecastQuality.checks || []).map((check: any) => (
                <div key={check.name} className="rounded-xl border border-border bg-slate-950/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-white">{check.name}</p>
                    <p className={`rounded-full border px-2 py-1 text-xs font-bold ${
                      check.passed
                        ? "border-emerald-400/30 text-emerald-200"
                        : "border-red-400/30 text-red-200"
                    }`}>
                      {check.passed ? "PASS" : "REVIEW"}
                    </p>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-300">{check.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-black/30 p-4">
            <h3 className="text-sm font-black text-white">Quality Provider Chain</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(forecastQuality.providerChain || [forecastQuality.provider || "provider unavailable"]).map((source: string) => (
                <span
                  key={source}
                  className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-100"
                >
                  {source}
                </span>
              ))}
            </div>
            {forecastQuality.providerErrors?.length ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-yellow-100">
                {forecastQuality.providerErrors.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-400">
            {forecastQuality.disclaimer || "Forecast quality controls are educational and diagnostic only. Not financial advice."}
          </p>
        </section>
      ) : null}

      {cryptoIntel ? (
        <section className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                Crypto Intelligence
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                {cryptoIntel.symbol || result?.symbol}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {cryptoIntel.explanation?.plainEnglish || "Live crypto intelligence loaded."}
              </p>
            </div>
            <div className="rounded-xl border border-cyan-400/30 bg-black/30 px-4 py-3 text-right">
              <p className="text-xs uppercase text-slate-400">Provider</p>
              <p className="text-sm font-black text-cyan-100">
                {cryptoIntel.provider || "provider unavailable"}
              </p>
            </div>
          </div>

          {cryptoIntelLoading ? (
            <p className="mt-4 text-sm text-cyan-200">Loading crypto intelligence...</p>
          ) : null}

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Price</p>
              <p className="mt-1 text-xl font-black text-white">
                {cryptoIntel.marketSnapshot?.price ?? "N/A"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Signal</p>
              <p className="mt-1 text-xl font-black text-white">
                {cryptoIntel.technicals?.signal || "N/A"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Confidence</p>
              <p className="mt-1 text-xl font-black text-white">
                {cryptoIntel.technicals?.confidence ?? "N/A"}%
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Risk</p>
              <p className="mt-1 text-xl font-black text-white">
                {cryptoIntel.technicals?.risk || "N/A"}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-cyan-400/20 bg-black/30 p-4">
            <h3 className="text-sm font-black text-cyan-100">Factual Sources</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(cryptoIntel.factualSources || [cryptoIntel.provider || "provider unavailable"]).map((source: string) => (
                <span
                  key={source}
                  className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-100"
                >
                  {source}
                </span>
              ))}
            </div>

            {cryptoIntel.providerErrors?.length ? (
              <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-500/10 p-3">
                <p className="text-xs font-black uppercase tracking-wide text-yellow-100">
                  Provider fallback notes
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-yellow-50">
                  {cryptoIntel.providerErrors.map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Market Cap</p>
              <p className="mt-1 text-lg font-black text-white">
                {cryptoIntel.marketSnapshot?.marketCapUsd
                  ? `$${Number(cryptoIntel.marketSnapshot.marketCapUsd).toLocaleString()}`
                  : "N/A"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">24h Volume</p>
              <p className="mt-1 text-lg font-black text-white">
                {cryptoIntel.marketSnapshot?.totalVolumeUsd
                  ? `$${Number(cryptoIntel.marketSnapshot.totalVolumeUsd).toLocaleString()}`
                  : "N/A"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Circulating Supply</p>
              <p className="mt-1 text-lg font-black text-white">
                {cryptoIntel.marketSnapshot?.circulatingSupply
                  ? Number(cryptoIntel.marketSnapshot.circulatingSupply).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Market Rank</p>
              <p className="mt-1 text-lg font-black text-white">
                {cryptoIntel.marketSnapshot?.marketCapRank
                  ? `#${cryptoIntel.marketSnapshot.marketCapRank}`
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">24h Change</p>
              <p className="mt-1 text-lg font-black text-white">
                {cryptoIntel.marketSnapshot?.priceChange24hPercent ?? "N/A"}%
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">7d Change</p>
              <p className="mt-1 text-lg font-black text-white">
                {cryptoIntel.marketSnapshot?.priceChange7dPercent ?? "N/A"}%
              </p>
            </div>
            <div className="rounded-xl border border-border bg-black/30 p-4">
              <p className="text-xs uppercase text-slate-400">Official Site</p>
              {cryptoIntel.profile?.homepage ? (
                <a
                  href={cryptoIntel.profile.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block truncate text-lg font-black text-cyan-200 hover:underline"
                >
                  {cryptoIntel.profile.homepage}
                </a>
              ) : (
                <p className="mt-1 text-lg font-black text-white">N/A</p>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <h3 className="text-sm font-black text-emerald-200">Bullish Factors</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-200">
                {(cryptoIntel.explanation?.bullishFactors || ["No bullish factors available."]).map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4">
              <h3 className="text-sm font-black text-red-200">Bearish / Risk Factors</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-200">
                {(cryptoIntel.explanation?.bearishFactors?.length
                  ? cryptoIntel.explanation.bearishFactors
                  : ["No bearish factors returned by the model. Always review volatility and market news."]
                ).map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-black/30 p-4">
            <h3 className="text-sm font-black text-white">Trade Plan</h3>
            <div className="mt-3 grid gap-3 text-sm text-slate-200 md:grid-cols-5">
              <p>Entry: {cryptoIntel.technicals?.tradePlan?.entryZone?.join(" - ") || "N/A"}</p>
              <p>Stop: {cryptoIntel.technicals?.tradePlan?.stopLoss ?? "N/A"}</p>
              <p>TP: {cryptoIntel.technicals?.tradePlan?.takeProfit?.join(" / ") || "N/A"}</p>
              <p>Support: {cryptoIntel.technicals?.tradePlan?.support ?? "N/A"}</p>
              <p>Resistance: {cryptoIntel.technicals?.tradePlan?.resistance ?? "N/A"}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-500/10 p-4">
            <h3 className="text-sm font-black text-yellow-100">Limitations</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-200">
              {(cryptoIntel.explanation?.limitations || []).map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

<div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                Symbol Details
              </div>
              <div className="mt-2 text-2xl font-black text-white">
                {result.symbol}
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-200">
                {result.profile?.name || "Market Symbol"} · {result.profile?.sector || result.marketType}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {result.profile?.work ||
                  "This symbol represents a tradable market asset. Review trend, power, volume, support, and risk before acting."}
              </p>

              {result.profile?.summary && (
                <div className="mt-3 rounded-xl border border-cyan-400/15 bg-cyan-500/5 p-3 text-sm leading-6 text-slate-300">
                  <span className="font-bold text-cyan-300">Summary: </span>
                  {result.profile.summary}
                </div>
              )}

              {result.profile?.riskNote && (
                <div className="mt-3 rounded-xl border border-amber-400/15 bg-amber-500/5 p-3 text-xs leading-5 text-amber-100">
                  <span className="font-bold text-amber-300">Risk note: </span>
                  {result.profile.riskNote}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-amber-400/25 bg-slate-950 p-5 shadow-lg shadow-amber-950/20">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                Power Information
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-300">Buy Power</div>
                  <div className="mt-1 text-2xl font-black text-emerald-200">
                    {result.powerSummary?.buyPower ?? result.indicators?.buyPower ?? 0}%
                  </div>
                </div>
                <div className="rounded-xl border border-red-400/25 bg-red-500/10 p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-red-300">Sell Power</div>
                  <div className="mt-1 text-2xl font-black text-red-200">
                    {result.powerSummary?.sellPower ?? result.indicators?.sellPower ?? 0}%
                  </div>
                </div>
                <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-300">Net Power</div>
                  <div className="mt-1 text-2xl font-black text-cyan-200">
                    {result.powerSummary?.netPower ?? result.indicators?.netPower ?? 0}
                  </div>
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm font-semibold text-slate-200">
                Pressure: <span className="text-amber-300">{result.powerSummary?.pressure || result.indicators?.pressure || "BALANCED"}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">
                {result.powerSummary?.explanation ||
                  "Power measures recent bullish pressure versus bearish pressure using candle body strength and volume."}
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="rounded-xl border border-border bg-panel/60 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted">Symbol</div>
              <div className="mt-1 text-xl font-semibold">{result.symbol}</div>
            </div>

            <div className="rounded-xl border border-border bg-panel/60 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted">Price</div>
              <div className="mt-1 text-xl font-semibold">{result.price}</div>
            </div>

            <div className="rounded-xl border border-border bg-panel/60 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted">Signal</div>
              <div className="mt-1 text-xl font-semibold">{signal}</div>
            </div>

            <div className="rounded-xl border border-border bg-panel/60 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted">Confidence</div>
              <div className="mt-1 text-xl font-semibold">{result.confidence}%</div>
            </div>

            <div className="rounded-xl border border-border bg-panel/60 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted">Risk</div>
              <div className="mt-1 text-xl font-semibold capitalize">{result.risk}</div>
            </div>
          </div>

          <TradingChart candles={result.candles || []} levels={chartLevels} />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-panel/60 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted">RSI 14</div>
              <div className="mt-1 text-lg font-semibold">{result.indicators?.rsi?.toFixed?.(2) || "--"}</div>
            </div>

            <div className="rounded-xl border border-border bg-panel/60 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted">SMA 20</div>
              <div className="mt-1 text-lg font-semibold">{result.indicators?.sma20?.toFixed?.(6) || "--"}</div>
            </div>

            <div className="rounded-xl border border-border bg-panel/60 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted">SMA 50</div>
              <div className="mt-1 text-lg font-semibold">{result.indicators?.sma50?.toFixed?.(6) || "--"}</div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-panel/60 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">Factual Source</div>
            <div className="mt-2 text-sm">{result.provider}</div>
          </div>

          <div className="rounded-xl border border-border bg-panel/60 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">AI Analysis</div>
            <div className="mt-3 whitespace-pre-wrap text-sm leading-7">{result.analysis}</div>
          </div>

          <p className="text-xs text-muted">{result.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
