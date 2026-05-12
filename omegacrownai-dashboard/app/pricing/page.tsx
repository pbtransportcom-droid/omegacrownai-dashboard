import { getPublicMarketingData } from "@/lib/sugent/marketing/publicMarketingEngine";
import { OmegaLogo } from "@/components/brand/OmegaLogo";

function formatPrice(cents: number, tier: string) {
  if (tier === "enterprise") return "Custom";
  if (!cents) return "$0";
  return `$${Math.round(cents / 100)}`;
}

export default async function PricingPage() {
  const data = await getPublicMarketingData();

  return (
    <main className="mx-auto max-w-7xl space-y-10 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          OmegaCrownAI Commercial Launch
        </p>

        <h1 className="mt-4 text-5xl font-black text-white">
          Pricing built for sovereign AI companies
        </h1>

        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-200">
          Start with manual billing, optional payment providers, customer dashboards, creator exports, publishing records, premium providers, storage tracking, and launch-ready SaaS operations.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="/onboarding" className="rounded-xl bg-cyan-600 px-6 py-3 text-sm font-black text-white hover:bg-cyan-500">
            Start Onboarding
          </a>
          <a href="#contact" className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-6 py-3 text-sm font-black text-yellow-100 hover:bg-yellow-500/20">
            Contact Sales
          </a>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-5">
        {data.plans.map((plan: any) => (
          <div key={plan.tier} className="rounded-3xl border border-border bg-panel/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black text-white">{plan.name}</h2>
              {plan.badge && (
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                  {plan.badge}
                </span>
              )}
            </div>

            <div className="mt-4">
              <span className="text-4xl font-black text-white">{formatPrice(plan.monthlyPriceCents, plan.tier)}</span>
              {plan.tier !== "enterprise" && <span className="text-sm text-muted"> / month</span>}
            </div>

            <p className="mt-3 text-sm font-bold text-cyan-200">{plan.headline}</p>
            <p className="mt-2 min-h-20 text-sm leading-6 text-muted">{plan.description}</p>

            <a href={plan.ctaHref || "/onboarding"} className="mt-5 inline-flex w-full justify-center rounded-xl bg-cyan-600 px-4 py-3 text-sm font-black text-white hover:bg-cyan-500">
              {plan.ctaLabel || "Start"}
            </a>

            <ul className="mt-5 space-y-2 text-sm text-slate-200">
              {(plan.featuresJson || []).map((feature: string) => (
                <li key={feature}>✓ {feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <h2 className="text-3xl font-black text-white">Feature Matrix</h2>

        <div className="mt-5 overflow-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="p-3">Feature</th>
                <th className="p-3">Free</th>
                <th className="p-3">Starter</th>
                <th className="p-3">Pro</th>
                <th className="p-3">Studio</th>
                <th className="p-3">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {data.featureMatrix.map((row: any) => (
                <tr key={row.feature} className="border-b border-border/60">
                  <td className="p-3 font-bold text-white">{row.feature}</td>
                  <td className="p-3 text-slate-200">{String(row.free)}</td>
                  <td className="p-3 text-slate-200">{String(row.starter)}</td>
                  <td className="p-3 text-slate-200">{String(row.pro)}</td>
                  <td className="p-3 text-slate-200">{String(row.studio)}</td>
                  <td className="p-3 text-slate-200">{String(row.enterprise)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="contact" className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-yellow-400/30 bg-yellow-500/10 p-6">
          <h2 className="text-3xl font-black text-white">Talk to OmegaCrownAI</h2>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            Tell us your business, plan interest, and launch needs. This creates a marketing lead for follow-up.
          </p>
        </div>

        <form action="/api/public/leads" method="POST" className="rounded-3xl border border-border bg-panel/70 p-6">
          <div className="grid gap-3">
            <input name="name" placeholder="Name" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="email" type="email" placeholder="Email" required className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
            <input name="companyName" placeholder="Company name" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <select name="planInterest" defaultValue="pro" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="studio">Studio</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <textarea name="message" placeholder="What do you want OmegaCrownAI to help you launch?" className="min-h-28 rounded-xl border border-border bg-slate-950 px-4 py-3 text-sm text-white outline-none" />

            <button className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-black text-black hover:bg-yellow-400">
              Submit Lead
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <h2 className="text-3xl font-black text-white">FAQ</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {data.faq.map((item: any) => (
            <div key={item.question} className="rounded-2xl border border-border bg-black/20 p-4">
              <h3 className="text-sm font-black text-white">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
