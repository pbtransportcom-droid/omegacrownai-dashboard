"use client";

import { useState } from "react";

export default function TradingCopilotPage() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim()) return;

    setLoading(true);

    const res = await fetch("/api/trading/copilot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        accountSize: 10000,
        maxRiskPercent: 1,
      }),
    });

    const data = await res.json();
    setResponse(data);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen grid-cols-12">

        <aside className="col-span-2 border-r border-zinc-800 p-4">
          <h2 className="mb-4 text-lg font-bold">History</h2>
          <div className="space-y-2 text-sm text-zinc-400">
            <div>Compare NVDA vs AVGO</div>
            <div>Analyze my portfolio</div>
            <div>Find AI opportunities</div>
          </div>
        </aside>

        <section className="col-span-7 p-6">
          <h1 className="mb-6 text-4xl font-black">
            King Trading Copilot
          </h1>

          <div className="flex gap-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask the trading copilot..."
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 p-3"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="rounded-xl bg-yellow-500 px-5 py-3 font-bold text-black"
            >
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>

          {response && (
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <pre className="overflow-auto text-sm">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </section>

        <aside className="col-span-3 border-l border-zinc-800 p-4">
          <h2 className="mb-4 text-lg font-bold">
            Agent Reasoning
          </h2>

          <div className="space-y-2 text-sm text-zinc-400">
            <div>Technical Agent</div>
            <div>News Agent</div>
            <div>Risk Agent</div>
            <div>Portfolio Agent</div>
            <div>Watchlist Agent</div>
            <div>Decision Agent</div>
          </div>
        </aside>

      </div>
    </main>
  );
}
