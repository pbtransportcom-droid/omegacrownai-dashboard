export default function TradingAgentPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <section className="mx-auto max-w-5xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">
          King Trading System
        </p>
        <h1 className="mt-4 text-5xl font-black">
          Super Intelligent Trading Agent
        </h1>
        <p className="mt-4 text-zinc-400">
          AI-powered stock discovery, ranking, risk planning, and paper-trading decision engine.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-black p-5">
            <h2 className="font-bold">Find Best Stocks</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Scores momentum, quality, risk, and news signals.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-black p-5">
            <h2 className="font-bold">Risk Control</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Uses max-risk rules before any trade decision.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-black p-5">
            <h2 className="font-bold">Paper First</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Defaults to paper trading. Live broker execution must be enabled separately.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
