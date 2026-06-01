const providers = [
  {
    name: "Finnhub",
    status: "Online",
    latency: "120ms",
    coverage: "Stocks",
  },
  {
    name: "Twelve Data",
    status: "Online",
    latency: "140ms",
    coverage: "Stocks / Forex",
  },
  {
    name: "Stooq",
    status: "Online",
    latency: "95ms",
    coverage: "Global Markets",
  },
  {
    name: "CoinGecko",
    status: "Online",
    latency: "180ms",
    coverage: "Crypto",
  },
  {
    name: "Binance",
    status: "Online",
    latency: "85ms",
    coverage: "Crypto Exchange",
  },
];

export default function TradeProvidersPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-black mb-8">
        Market Data Providers
      </h1>

      <div className="grid gap-4">
        {providers.map((provider) => (
          <div
            key={provider.name}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {provider.name}
              </h2>

              <span className="rounded-full bg-green-600 px-3 py-1 text-sm">
                {provider.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-zinc-400">
              <div>
                <div className="text-xs uppercase">Latency</div>
                <div>{provider.latency}</div>
              </div>

              <div>
                <div className="text-xs uppercase">Coverage</div>
                <div>{provider.coverage}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
