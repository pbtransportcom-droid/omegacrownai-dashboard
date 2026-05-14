import { analyzeSymbolV2 } from "@/lib/trading-v2/engine";
import { fetchBinanceCryptoCandles } from "@/lib/trading/providers/binance-provider";

export type LiveMarketDataStatus =
  | "live_data"
  | "provider_error"
  | "unsupported_symbol"
  | "provider_required";

export async function getLiveMarketData({
  symbol,
  timeframe,
  marketType,
}: {
  symbol: string;
  timeframe?: string;
  marketType?: string;
}) {
  const cleanSymbol = String(symbol || "").trim().toUpperCase();
  const cleanTimeframe = String(timeframe || "1h");
  const cleanMarketType = String(marketType || "auto");

  if (!cleanSymbol) {
    return {
      ok: false,
      status: "unsupported_symbol" as LiveMarketDataStatus,
      symbol: cleanSymbol,
      timeframe: cleanTimeframe,
      marketType: cleanMarketType,
      provider: "none",
      message: "Missing symbol.",
      candles: [],
    };
  }

  try {
    const providerErrors: string[] = [];

    const isCrypto =
      cleanMarketType === "crypto" ||
      cleanSymbol.includes("USDT") ||
      cleanSymbol.includes("-USD") ||
      cleanSymbol.includes("BTC") ||
      cleanSymbol.includes("ETH") ||
      cleanSymbol.includes("SOL");

    if (isCrypto) {
      try {
        const binance = await fetchBinanceCryptoCandles({
          symbol: cleanSymbol,
          timeframe: cleanTimeframe,
          limit: 300,
        });

        if (binance.candles.length) {
          return {
            ok: true,
            status: "live_data" as LiveMarketDataStatus,
            symbol: cleanSymbol,
            timeframe: cleanTimeframe,
            marketType: cleanMarketType,
            provider: binance.provider,
            providerChain: ["binance-public-market-data", "trading-v2-engine-fallback"],
            providerErrors,
            message: "Live crypto candles loaded from Binance public market data.",
            candles: binance.candles,
            price: binance.candles[binance.candles.length - 1]?.close || null,
          };
        }

        providerErrors.push("Binance returned no candles.");
      } catch (error: any) {
        providerErrors.push(error?.message || "Binance provider failed.");
      }
    }

    const result = await analyzeSymbolV2({
      symbol: cleanSymbol,
      timeframe: cleanTimeframe,
      marketType: cleanMarketType,
    } as any);

    const safeResult = result as any;

    return {
      ok: true,
      status: "live_data" as LiveMarketDataStatus,
      symbol: cleanSymbol,
      timeframe: cleanTimeframe,
      marketType: cleanMarketType,
      provider: safeResult?.provider || "trading-v2-engine",
      providerChain: isCrypto
        ? ["binance-public-market-data-attempted", safeResult?.provider || "trading-v2-engine", "yahoo-chart-public-data-fallback"]
        : [safeResult?.provider || "trading-v2-engine", "yahoo-chart-public-data-fallback"],
      providerErrors,
      message: "Live market data loaded from configured public/provider engine.",
      result,
      candles: safeResult?.candles || [],
      signal: safeResult?.signal || null,
      confidence: safeResult?.confidence || null,
      price: safeResult?.price || null,
      changePercent: safeResult?.changePercent || null,
      profile: safeResult?.profile || null,
      indicators: safeResult?.indicators || null,
      supportResistance: safeResult?.supportResistance || null,
      powerCandles: safeResult?.powerCandles || null,
      summary: safeResult?.summary || null,
      disclaimer: safeResult?.disclaimer || null,
    };
  } catch (error: any) {
    return {
      ok: false,
      status: "provider_error" as LiveMarketDataStatus,
      symbol: cleanSymbol,
      timeframe: cleanTimeframe,
      marketType: cleanMarketType,
      provider: "trading-v2-engine",
      message: error?.message || "Live market data provider failed.",
      candles: [],
    };
  }
}
