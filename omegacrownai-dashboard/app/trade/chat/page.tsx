export default function TradingChatPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <section className="mx-auto max-w-6xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">
          King Trading System
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Trading Brain Chat
        </h1>

        <p className="mt-4 max-w-3xl text-zinc-400">
          Ask the King Trading System to scan markets, compare stocks, create paper-trade plans,
          analyze risk, and explain recommendations.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            "Find the best AI stock to paper trade today",
            "Compare NVDA vs AVGO",
            "Create a swing-trade plan for AMD",
            "Find momentum stocks under $100",
            "Analyze my portfolio risk",
            "What should I watch this week?"
          ].map((prompt) => (
            <div
              key={prompt}
              className="rounded-2xl border border-zinc-800 bg-black p-5 text-zinc-300"
            >
              {prompt}
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
          <h2 className="text-2xl font-black">API Endpoint</h2>
          <code className="mt-4 block rounded-xl bg-zinc-950 p-4 text-sm text-yellow-300">
            POST /api/trading/brain
          </code>
        </section>
      </section>
    </main>
  );
}
