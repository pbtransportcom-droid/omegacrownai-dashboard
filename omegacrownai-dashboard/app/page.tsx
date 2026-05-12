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
      </section>
    </main>
  );
}
