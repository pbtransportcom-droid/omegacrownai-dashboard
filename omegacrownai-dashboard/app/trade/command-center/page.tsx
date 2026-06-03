import Link from "next/link";

const modules = [
  {
    title: "Trading Copilot",
    description: "AI-powered trading assistant",
    href: "/trade/copilot",
  },
  {
    title: "Portfolio Dashboard",
    description: "Holdings, PnL, allocation and AI analysis",
    href: "/trade/portfolio",
  },
  {
    title: "Trade Journal",
    description: "Track entries, exits and performance",
    href: "/trade/journal",
  },
  {
    title: "Provider Dashboard",
    description: "Market data provider health",
    href: "/trade/providers",
  },
];

export default function TradingCommandCenterPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-yellow-400 uppercase tracking-[0.35em]">
          King Trading System
        </p>

        <h1 className="mt-4 text-6xl font-black">
          King Trading Cockpit
        </h1>

        <p className="mt-4 text-zinc-400 max-w-3xl">
          One cockpit for AI trading chat, market scanning, portfolio analysis, journal tracking, and provider intelligence.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {modules.map((module) => (
            <Link
              key={module.title}
              href={module.href as any}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 hover:border-yellow-400"
            >
              <h2 className="text-3xl font-black">
                {module.title}
              </h2>

              <p className="mt-3 text-zinc-400">
                {module.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          <Metric label="Trading Status" value="Operational" />
          <Metric label="Scanner" value="Online" />
          <Metric label="Providers" value="5 Active" />
          <Metric label="System" value="Healthy" />
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="text-sm text-zinc-500">
        {label}
      </div>

      <div className="mt-2 text-2xl font-black">
        {value}
      </div>
    </div>
  );
}
