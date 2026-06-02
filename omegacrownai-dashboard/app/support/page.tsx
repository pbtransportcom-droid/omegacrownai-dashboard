import Link from "next/link";

const supportItems = [
  {
    title: "Billing Support",
    description: "Questions about upgrades, payments, plans, and account activation.",
  },
  {
    title: "Trading Support",
    description: "Help with King Trading System, Copilot, portfolio, scanner, and journal.",
  },
  {
    title: "Runtime Support",
    description: "Help with generated apps, deployments, artifacts, and Sovereign Runtime.",
  },
  {
    title: "Enterprise Support",
    description: "Custom workflows, private deployments, teams, and business automation.",
  },
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">
          OmegaCrownAI
        </p>

        <h1 className="mt-4 text-5xl font-black">Support Center</h1>

        <p className="mt-4 max-w-3xl text-zinc-400">
          Get help with billing, trading tools, runtime deployments, enterprise automation,
          and OmegaCrownAI platform access.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {supportItems.map((item) => (
            <div key={item.title} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="text-2xl font-black">{item.title}</h2>
              <p className="mt-3 text-zinc-400">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-black">Need direct help?</h2>
          <p className="mt-3 text-zinc-400">
            Email support@omegacrownai.com with your account email, issue type, and any payment confirmation if applicable.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black">
              Contact Support
            </Link>
            <Link href="/account" className="rounded-xl border border-zinc-700 px-5 py-3 font-black">
              Account Dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
