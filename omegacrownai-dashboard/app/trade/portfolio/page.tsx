"use client";

import { useState } from "react";

export default function PortfolioPage() {
  const [result, setResult] = useState<any>(null);

  async function runDemo() {
    const res = await fetch("/api/trading/portfolio-dashboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cash: 5000,
        positions: [
          {
            symbol: "NVDA",
            shares: 10,
            costBasis: 120,
            currentPrice: 135,
          },
          {
            symbol: "MSFT",
            shares: 5,
            costBasis: 420,
            currentPrice: 430,
          },
        ],
      }),
    });

    setResult(await res.json());
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-5xl font-black">
        Portfolio Dashboard
      </h1>

      <button
        onClick={runDemo}
        className="mt-6 rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
      >
        Load Portfolio Analysis
      </button>

      {result && (
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card title="Market Value" value={`$${result.totalMarketValue}`} />
            <Card title="Cash" value={`$${result.cash}`} />
            <Card title="Portfolio Value" value={`$${result.totalPortfolioValue}`} />
            <Card title="PnL" value={`$${result.totalPnL}`} />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-2xl font-black">
              AI Recommendations
            </h2>

            <div className="mt-4 space-y-3">
              {result.aiRecommendations.map((item: any) => (
                <div
                  key={item.symbol}
                  className="rounded-xl border border-zinc-800 bg-black p-4"
                >
                  <strong>{item.symbol}</strong>
                  <div>{item.recommendation}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="text-sm text-zinc-500">{title}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}
