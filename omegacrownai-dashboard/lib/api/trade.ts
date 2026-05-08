import { apiFetch } from "./http";

export interface TradingAnalysis {
  symbol: string;
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  risk: "low" | "medium" | "high";
  analysis: string;
}

export async function analyzeSymbol(symbol: string, token?: string) {
  return apiFetch<TradingAnalysis>("/api/ai/trading/analyze", {
    method: "POST",
    token,
    body: JSON.stringify({ symbol }),
  });
}

export async function generateTradingPlan(symbol: string, token?: string) {
  return apiFetch<TradingAnalysis>("/api/ai/trading/plan", {
    method: "POST",
    token,
    body: JSON.stringify({ symbol }),
  });
}
