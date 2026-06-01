"use client";

import { useState } from "react";

const examples = [
  "Find the best AI stock to paper trade today",
  "Compare NVDA vs AVGO",
  "Create a swing-trade plan for AMD",
  "Find momentum stocks with lower risk",
  "What is the strongest setup under $100?",
  "Analyze my watchlist",
];

export default function TradingChatPage() {
  const [message, setMessage] = useState(examples[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function askBrain(prompt = message) {
    setLoading(true);
    setMessage(prompt);

    const response = await fetch("/api/trading/brain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: prompt,
        accountSize: 10000,
        maxRiskPercent: 1,
      }),
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <section className="mx-auto max-w-6xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">
          King Trading System
        </p>

        <h1 className="mt-4 text-5xl font-black">Trading Brain Chat</h1>

        <p className="mt-4 max-w-3xl text-zinc-400">
          Ask the trading brain to scan markets, compare stocks, build paper-trade plans,
          analyze risk, and explain recommendations.
        </p>

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-14 flex-1 rounded-2xl border border-zinc-800 bg-black px-5 text-white outline-none"
            placeholder="Ask King Trading System..."
          />
          <button
            onClick={() => askBrain()}
            disabled={loading}
            className="rounded-2xl bg-yellow-400 px-8 py-4 font-black text-black disabled:opacity-60"
          >
            {loading ? "Thinking..." : "Ask Brain"}
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {examples.map((prompt) => (
            <button
              key={prompt}
              onClick={() => askBrain(prompt)}
              className="rounded-2xl border border-zinc-800 bg-black p-5 text-left text-zinc-300 hover:border-yellow-400"
            >
              {prompt}
            </button>
          ))}
        </div>

        {result && (
          <section className="mt-10 rounded-3xl border border-zinc-800 bg-black p-6">
            <h2 className="text-2xl font-black">Trading Brain Response</h2>
            <p className="mt-4 text-lg text-zinc-200">{result.answer}</p>

            {result.topPick && (
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-sm text-zinc-500">Top Pick</p>
                  <p className="mt-2 text-2xl font-black">{result.topPick.symbol}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-sm text-zinc-500">Confidence</p>
                  <p className="mt-2 text-2xl font-black">{result.tradePlan?.confidence}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-sm text-zinc-500">Recommendation</p>
                  <p className="mt-2 text-xl font-black">{result.tradePlan?.recommendation}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-sm text-zinc-500">Position Size</p>
                  <p className="mt-2 text-2xl font-black">{result.tradePlan?.positionSize}</p>
                </div>
              </div>
            )}

            <pre className="mt-6 max-h-[420px] overflow-auto rounded-2xl bg-zinc-950 p-5 text-sm text-zinc-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </section>
        )}
      </section>
    </main>
  );
}
