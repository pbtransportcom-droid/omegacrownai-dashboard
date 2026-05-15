import Link from "next/link";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

const PROJECT_ID = "cmoyekpqe00022dkq7s4jrokk";

const phases = [
  "Executive Autopilot",
  "Native Video Studio",
  "Rendering + Audio",
  "Asset Generation",
  "Timeline Editing",
  "Podcast Mode",
  "Distribution Automation",
  "Versioning + Review",
  "Creative Studio",
  "Workspaces + Permissions",
  "Runtime Pipeline",
  "QA Scorecards",
  "Director's Room",
  "Reliability Layer",
  "Editor's Room",
  "Full Observability Dashboard",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <OmegaLogo className="h-20 w-auto object-contain" />

        <p className="mt-8 text-xs font-black uppercase tracking-[0.32em] text-cyan-300">
          OmegaCrownAI v2.14
        </p>

        <h1 className="mt-4 max-w-5xl text-5xl font-black leading-tight md:text-7xl">
          Sovereign AI Company Operating System
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
          OmegaCrownAI now connects executive autopilot, departments, video,
          podcast, distribution, review, QA, Director&apos;s Room, reliability,
          and Editor&apos;s Room into one production-grade multi-agent studio.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/projects/${PROJECT_ID}/company/executive`}
            className="rounded-xl bg-cyan-600 px-6 py-3 text-sm font-black text-white hover:bg-cyan-500"
          >
            Open Executive Command Center
          </Link>

          <Link
            href="/runtime"
            className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-6 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-500/20"
          >
            Open Runtime Dashboard
          </Link>

          <Link
            href={`/projects/${PROJECT_ID}/company/directors-room`}
            className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-6 py-3 text-sm font-black text-yellow-100 hover:bg-yellow-500/20"
          >
            Director&apos;s Room
          </Link>

          <Link
            href={`/projects/${PROJECT_ID}/company/editors-room`}
            className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-6 py-3 text-sm font-black text-purple-100 hover:bg-purple-500/20"
          >
            Editor&apos;s Room
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-3">
        {phases.map((phase, index) => (
          <div
            key={phase}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5"
          >
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              Phase {index + 15}
            </div>
            <div className="mt-2 text-lg font-black text-white">{phase}</div>
            <div className="mt-3 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-200">
              Completed / Active
            </div>
          </div>
        ))}
      </section>
    
      <section className="mx-auto mt-8 max-w-3xl rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">v4.0 Commercialization</p>
        <h2 className="mt-2 text-2xl font-black text-white">Customer onboarding is live</h2>
        <p className="mt-2 text-sm text-slate-200">Start a customer account, organization, and commercial workspace path.</p>
        <a href="/onboarding" className="mt-4 inline-flex rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
          Start Onboarding
        </a>
              <div className="mt-3">
          <a href="/customer?email=phase62-billing@omegacrownai.com" className="inline-flex rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-500/20">
            Open Customer Dashboard
          </a>
        </div>
              <div className="mt-3">
          <a href="/admin/customers" className="inline-flex rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-100 hover:bg-yellow-500/20">
            Open Admin Console
          </a>
        </div>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="/build" className="inline-flex rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-black hover:bg-cyan-300">
              Builder Hub
            </a>
            <a href="/create?type=website" className="inline-flex rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-500/20">
              Website Builder
            </a>
            <a href="/create?type=app" className="inline-flex rounded-xl border border-purple-400/30 bg-purple-500/10 px-5 py-3 text-sm font-black text-purple-100 hover:bg-purple-500/20">
              App Builder
            </a>
            <a href="/create?type=coding" className="inline-flex rounded-xl border border-slate-400/30 bg-slate-500/10 px-5 py-3 text-sm font-black text-slate-100 hover:bg-slate-500/20">
              Coding Workspace
            </a>
            <a href="/automate" className="inline-flex rounded-xl border border-blue-400/30 bg-blue-500/10 px-5 py-3 text-sm font-black text-blue-100 hover:bg-blue-500/20">
              Automation Builder
            </a>
            <a href="/trade" className="inline-flex rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-100 hover:bg-yellow-500/20">
              Trading Builder
            </a>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="/customer-launch-readiness" className="inline-flex rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-black hover:bg-emerald-400">
            Customer Launch Readiness
          </a>
          <a href="/trust-center" className="inline-flex rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-black hover:bg-cyan-400">
            Trust Center
          </a>
          <a href="/payments/providers" className="inline-flex rounded-xl bg-green-500 px-5 py-3 text-sm font-black text-black hover:bg-green-400">
            Payment Providers
          </a>
          <a href="/trade" className="inline-flex rounded-xl bg-yellow-500 px-5 py-3 text-sm font-black text-black hover:bg-yellow-400">
            Trading
          </a>
          <a href="/automate" className="inline-flex rounded-xl bg-blue-500 px-5 py-3 text-sm font-black text-white hover:bg-blue-400">
            Automation
          </a>
        </div>

              <div className="mt-3 flex flex-wrap justify-center gap-3">
          <a href="/platform/limitations" className="inline-flex rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-500/20">
            Platform Limitations
          </a>
          <a href="/platform/source-reliability" className="inline-flex rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-500/20">
            Source Reliability
          </a>
          <a href="/production-completion/ledger" className="inline-flex rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-100 hover:bg-emerald-500/20">
            Completion Ledger
          </a>
          <a href="/final-verification/routes" className="inline-flex rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-100 hover:bg-emerald-500/20">
            Final Route Audit
          </a>
          <a href="/customer-facing-polish" className="inline-flex rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-100 hover:bg-emerald-500/20">
            Customer Copy Alignment
          </a>
        </div>

              <div className="mt-3 flex flex-wrap justify-center gap-3">
          <a href="/legal/terms" className="inline-flex rounded-xl border border-slate-400/30 bg-slate-500/10 px-5 py-3 text-sm font-black text-slate-100 hover:bg-slate-500/20">
            Terms
          </a>
          <a href="/legal/privacy" className="inline-flex rounded-xl border border-slate-400/30 bg-slate-500/10 px-5 py-3 text-sm font-black text-slate-100 hover:bg-slate-500/20">
            Privacy
          </a>
          <a href="/legal/provider-disclosure" className="inline-flex rounded-xl border border-slate-400/30 bg-slate-500/10 px-5 py-3 text-sm font-black text-slate-100 hover:bg-slate-500/20">
            Provider Disclosure
          </a>
        </div>

              <div className="mt-3 flex flex-wrap justify-center gap-3">
          <a href="/admin/external-payments" className="inline-flex rounded-xl bg-green-500 px-5 py-3 text-sm font-black text-black hover:bg-green-400">
            External Payments Admin
          </a>
          <a href="/admin/provider-secrets" className="inline-flex rounded-xl bg-purple-500 px-5 py-3 text-sm font-black text-white hover:bg-purple-400">
            Provider Secrets Vault
          </a>
          <a href="/admin/premium-providers" className="inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black hover:bg-orange-400">
            Premium Providers Admin
          </a>
        </div>
      </section>
    </main>
  );
}
