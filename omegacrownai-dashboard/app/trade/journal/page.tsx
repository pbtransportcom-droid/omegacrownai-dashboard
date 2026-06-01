"use client";

import { useEffect, useState } from "react";

export default function TradeJournalPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [symbol, setSymbol] = useState("NVDA");
  const [entryPrice, setEntryPrice] = useState("120");
  const [shares, setShares] = useState("10");
  const [notes, setNotes] = useState("");

  async function loadJournal() {
    const res = await fetch("/api/trading/journal?userId=default", {
      cache: "no-store",
    });
    const data = await res.json();
    setEntries(data.entries || []);
    setStats(data.stats);
  }

  async function addTrade() {
    await fetch("/api/trading/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "default",
        symbol,
        entryPrice: Number(entryPrice),
        shares: Number(shares),
        notes,
      }),
    });

    setNotes("");
    loadJournal();
  }

  useEffect(() => {
    loadJournal();
  }, []);

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">
          King Trading System
        </p>
        <h1 className="mt-4 text-5xl font-black">Trade Journal</h1>
        <p className="mt-3 text-zinc-400">
          Track paper trades, risk, notes, win rate, and performance.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric label="Total Trades" value={stats?.totalTrades || 0} />
          <Metric label="Open Trades" value={stats?.openTrades || 0} />
          <Metric label="Win Rate" value={`${stats?.winRate || 0}%`} />
          <Metric label="Total PnL" value={`$${stats?.totalPnL || 0}`} />
        </div>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-black">Add Paper Trade</h2>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <input className="rounded-xl border border-zinc-700 bg-black p-3" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
            <input className="rounded-xl border border-zinc-700 bg-black p-3" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} />
            <input className="rounded-xl border border-zinc-700 bg-black p-3" value={shares} onChange={(e) => setShares(e.target.value)} />
            <button onClick={addTrade} className="rounded-xl bg-yellow-400 p-3 font-black text-black">
              Add Trade
            </button>
          </div>

          <textarea
            className="mt-3 w-full rounded-xl border border-zinc-700 bg-black p-3"
            placeholder="Trade notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </section>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-black">Entries</h2>

          <div className="mt-5 space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-zinc-800 bg-black p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black">{entry.symbol}</h3>
                    <p className="text-sm text-zinc-500">{entry.status}</p>
                  </div>
                  <div className="text-right text-sm text-zinc-400">
                    <div>Entry: ${entry.entryPrice}</div>
                    <div>Shares: {entry.shares}</div>
                  </div>
                </div>
                {entry.notes && <p className="mt-3 text-zinc-400">{entry.notes}</p>}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}
