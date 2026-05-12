import { OmegaLogo } from "@/components/brand/OmegaLogo";

export default function OnboardingPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex justify-center">
        <OmegaLogo className="h-16 w-auto object-contain" />
      </div>

      <section className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          OmegaCrownAI v4.0
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Start your OmegaCrownAI account
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-200">
          Create your customer account, organization, and starter workspace. Payment is optional and can be connected later through Stripe, Square, SwipeSimple, or manual billing. Phase 62 now creates manual billing and subscription records automatically during onboarding.
        </p>
      </section>

      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <form action="/api/onboarding/start" method="POST" className="grid gap-4">
          <label className="grid gap-2 text-sm text-slate-200">
            Name
            <input name="name" required className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-white outline-none" />
          </label>

          <label className="grid gap-2 text-sm text-slate-200">
            Email
            <input name="email" type="email" required className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-white outline-none" />
          </label>

          <label className="grid gap-2 text-sm text-slate-200">
            Organization Name
            <input name="organizationName" required className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-white outline-none" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-200">
              Plan
              <select name="selectedPlanTier" defaultValue="starter" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-white outline-none">
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="studio">Studio</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm text-slate-200">
              Payment Mode
              <select name="paymentMode" defaultValue="manual" className="rounded-xl border border-border bg-slate-950 px-4 py-3 text-white outline-none">
                <option value="manual">Manual / Later</option>
                <option value="stripe">Stripe Later</option>
                <option value="square">Square Later</option>
                <option value="swipesimple">SwipeSimple Later</option>
              </select>
            </label>
          </div>

          <button className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">
            Start Onboarding
          </button>
        </form>
      </section>
    </main>
  );
}
