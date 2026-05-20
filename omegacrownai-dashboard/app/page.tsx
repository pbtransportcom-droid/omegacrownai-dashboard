import Link from "next/link";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

const buildPaths = [
  {
    title: "Website",
    href: "/create?type=website" as const,
    detail: "Create a customer-ready website with pages, copy, structure, and launch support.",
  },
  {
    title: "App",
    href: "/create?type=app" as const,
    detail: "Start a dashboard, SaaS tool, portal, or business application.",
  },
  {
    title: "Automation",
    href: "/automate" as const,
    detail: "Build workflows, agents, repeatable tasks, and business automations.",
  },
  {
    title: "Trading",
    href: "/trade" as const,
    detail: "Open King Trading System tools for market intelligence and strategy workflows.",
  },
];

const workflow = ["Choose what to build", "Generate the first version", "Review and improve", "Launch or export"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-16 text-center">
        <OmegaLogo className="h-20 w-auto object-contain" />

        <p className="mt-8 text-xs font-black uppercase tracking-[0.32em] text-cyan-300">
          OmegaCrownAI
        </p>

        <h1 className="mt-5 max-w-5xl text-5xl font-black leading-tight md:text-7xl">
          Build, automate, trade, and launch with one AI company OS.
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
          Start with a website, app, automation, or trading workspace. OmegaCrownAI guides the build from idea to production-ready output without exposing the complexity upfront.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/build" className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300">
            Start Building
          </Link>
          <Link href="/projects" className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-6 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-500/20">
            Open Dashboard
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-8 md:grid-cols-4">
        {buildPaths.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-left transition hover:border-cyan-400/50 hover:bg-slate-900"
          >
            <h2 className="text-2xl font-black">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
            <span className="mt-5 inline-flex text-sm font-black text-cyan-300">
              Start →
            </span>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-7">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
            Simple workflow
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {workflow.map((step, index) => (
              <div key={step} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Step {index + 1}
                </div>
                <div className="mt-2 text-lg font-black text-white">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 py-8 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-xl font-black">Production-ready</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Built for real outputs, review checkpoints, exports, and launch workflows.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-xl font-black">Flexible by design</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Start simple, then unlock deeper tools for teams, agents, workflows, and company operations.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-xl font-black">Enterprise controls</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Reliability, observability, governance, safety policies, and admin controls remain available inside the OS.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-center">
          <p className="text-sm text-slate-300">
            Advanced tools are still available for operators and administrators.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/runtime" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white hover:bg-white/10">
              Runtime
            </Link>
            <Link href="/observability" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white hover:bg-white/10">
              Observability
            </Link>
            <Link href="/admin/customers" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white hover:bg-white/10">
              Admin
            </Link>
            <Link href="/trust-center" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white hover:bg-white/10">
              Trust Center
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 px-6 py-10 text-sm text-slate-400">
        <Link href="/login" className="hover:text-white">Login</Link>
        <Link href="/signup" className="hover:text-white">Sign Up</Link>
        <Link href="/pricing" className="hover:text-white">Pricing</Link>
        <Link href="/docs" className="hover:text-white">Docs</Link>
        <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>
        <Link href="/legal/terms" className="hover:text-white">Terms</Link>
      </footer>
    </main>
  );
}
