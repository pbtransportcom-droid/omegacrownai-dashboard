"use client";

import { useMemo, useState } from "react";

const quickPrompts = [
  "Compare NVDA vs AVGO",
  "Analyze my portfolio",
  "Find best AI opportunities",
  "Analyze my watchlist",
];

const samplePositions = [
  { symbol: "NVDA", shares: 25, costBasis: 105, currentPrice: 120 },
  { symbol: "AVGO", shares: 10, costBasis: 150, currentPrice: 170 },
  { symbol: "PLTR", shares: 100, costBasis: 20, currentPrice: 25 },
];

const sampleSymbols = ["NVDA", "AVGO", "AMD", "PLTR", "MSFT"];

export default function TradingCopilotPage() {
  const [message, setMessage] = useState("Compare NVDA vs AVGO");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showRaw, setShowRaw] = useState(false);

  const statusSteps = useMemo(
    () => [
      "Detecting intent",
      "Routing to trading agents",
      "Analyzing risk",
      "Building response",
    ],
    []
  );

  async function sendMessage(prompt = message) {
    if (!prompt.trim()) return;

    setLoading(true);
    setMessage(prompt);
    setResponse(null);
    setHistory((items) => [prompt, ...items.filter((item) => item !== prompt)].slice(0, 8));

    const body: any = {
      message: prompt,
      accountSize: 10000,
      maxRiskPercent: 1,
    };

    if (prompt.toLowerCase().includes("portfolio")) {
      body.positions = samplePositions;
    }

    if (prompt.toLowerCase().includes("watchlist") || prompt.toLowerCase().includes("opportunit")) {
      body.symbols = sampleSymbols;
    }

    const res = await fetch("/api/trading/copilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setResponse(data);
    setLoading(false);
  }

  const tradePlan = response?.tradePlan;
  const leader = response?.leader;
  const topPick = response?.topPick || leader || response?.topOpportunity;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen grid-cols-12">
        <aside className="col-span-12 border-b border-zinc-800 p-4 md:col-span-2 md:border-b-0 md:border-r">
          <p className="text-xs uppercase tracking-[0.3em] text-yellow-400">King System</p>
          <h2 className="mt-3 text-xl font-black">History</h2>

          <div className="mt-5 space-y-2">
            {(history.length ? history : quickPrompts).map((item) => (
              <button
                key={item}
                onClick={() => sendMessage(item)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-left text-sm text-zinc-300 hover:border-yellow-400"
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        <section className="col-span-12 p-5 md:col-span-7 md:p-8">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">
              Trading Copilot
            </p>
            <h1 className="mt-3 text-4xl font-black">Ask. Analyze. Decide Faster.</h1>
            <p className="mt-3 text-zinc-400">
              One chat interface for comparison, portfolio risk, watchlist opportunities, and trade planning.
            </p>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="Ask the trading copilot..."
                className="min-h-14 flex-1 rounded-2xl border border-zinc-700 bg-black px-5 outline-none focus:border-yellow-400"
              />

              <button
                onClick={() => sendMessage()}
                disabled={loading}
                className="rounded-2xl bg-yellow-400 px-7 py-4 font-black text-black disabled:opacity-60"
              >
                {loading ? "Thinking..." : "Ask Copilot"}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-yellow-400 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="text-xl font-black">Working...</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {statusSteps.map((step) => (
                  <div key={step} className="rounded-2xl border border-zinc-800 bg-black p-4 text-zinc-300">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {response && (
            <div className="mt-6 space-y-5">
              <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
                  {response.intent || "brain"} response
                </p>
                <h2 className="mt-3 text-2xl font-black">{response.answer || response.system}</h2>
                <p className="mt-3 text-sm text-zinc-500">{response.warning}</p>
              </section>

              <div className="grid gap-4 md:grid-cols-4">
                <Metric label="Top Symbol" value={topPick?.symbol || response?.exposure?.largestPosition || "—"} />
                <Metric label="Confidence" value={tradePlan?.confidence || leader?.decision?.confidence || "—"} />
                <Metric label="Risk" value={response?.riskLevel || topPick?.risk?.riskLevel || "—"} />
                <Metric label="Score" value={response?.portfolioScore || response?.watchlistScore || topPick?.aiScore || "—"} />
              </div>

              {response.compared && (
                <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                  <h3 className="text-xl font-black">Comparison</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {response.compared.map((item: any) => (
                      <div key={item.symbol} className="rounded-2xl border border-zinc-800 bg-black p-5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-2xl font-black">{item.symbol}</h4>
                          <span className="rounded-full bg-zinc-900 px-3 py-1 text-sm text-yellow-400">
                            {item.decision?.confidence}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-400">{item.decision?.recommendation}</p>
                        <p className="mt-2 text-sm text-zinc-500">{item.decision?.action}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {response.recommendations && (
                <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                  <h3 className="text-xl font-black">Recommendations</h3>
                  <div className="mt-4 space-y-2">
                    {response.recommendations.map((item: string) => (
                      <div key={item} className="rounded-xl border border-zinc-800 bg-black p-4 text-zinc-300">
                        {item}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <button
                onClick={() => setShowRaw(!showRaw)}
                className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-400 hover:text-white"
              >
                {showRaw ? "Hide raw JSON" : "Show raw JSON"}
              </button>

              {showRaw && (
                <pre className="max-h-[420px] overflow-auto rounded-2xl bg-zinc-950 p-5 text-sm text-zinc-300">
                  {JSON.stringify(response, null, 2)}
                </pre>
              )}
            </div>
          )}
        </section>

        <aside className="col-span-12 border-t border-zinc-800 p-4 md:col-span-3 md:border-l md:border-t-0">
          <h2 className="text-lg font-black">Agent Panel</h2>
          <div className="mt-4 space-y-3 text-sm">
            {["Technical Agent", "News Agent", "Risk Agent", "Portfolio Agent", "Watchlist Agent", "Decision Agent"].map((agent) => (
              <div key={agent} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-300">
                {agent}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-black">{String(value)}</p>
    </div>
  );
}
