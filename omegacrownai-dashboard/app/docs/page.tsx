import { OmegaLogo } from "@/components/brand/OmegaLogo";

const sections = [
  {
    title: "Commercialization Layer",
    body: "v4 turns OmegaCrownAI into a real SaaS platform with onboarding, optional billing, customer dashboards, teams, publishing, providers, storage, admin support, and public marketing.",
  },
  {
    title: "Optional Payments",
    body: "Customers can start with manual billing. Stripe, Square, and SwipeSimple provider records are supported for later connection.",
  },
  {
    title: "Creator Exports",
    body: "Creator v3 completed real MP4/MP3 export workflows, media player UI, render queues, TTS integration, timeline integration, brand kits, distribution, billing, and launch QA.",
  },
  {
    title: "Teams and Permissions",
    body: "Customer organizations support members, roles, invitations, role updates, permission checks, and permission overrides.",
  },
  {
    title: "Publishing and Providers",
    body: "Publishing integrations and premium provider dashboards prepare external platform/provider connections while preserving provider-ready payload and event histories.",
  },
  {
    title: "Storage and Support",
    body: "Storage tracks local/cloud assets, signed URL placeholders, CDN URLs, asset versions, lifecycle status, and admin support workflows.",
  },
];

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          OmegaCrownAI Docs
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">
          Launch-ready platform overview
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          A public overview of the commercial SaaS layers now available in OmegaCrownAI.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <div key={section.title} className="rounded-3xl border border-border bg-panel/70 p-5">
            <h2 className="text-xl font-black text-white">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{section.body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-yellow-400/30 bg-yellow-500/10 p-6 text-center">
        <h2 className="text-2xl font-black text-white">Ready to start?</h2>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a href="/pricing" className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-black text-black hover:bg-yellow-400">
            View Pricing
          </a>
          <a href="/onboarding" className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
            Start Onboarding
          </a>
        </div>
      </section>
    </main>
  );
}
