import Link from "next/link";

const quickBuilds = [
  {
    label: "Business Website",
    href: "/create?type=website" as const,
    detail: "Generate a customer-ready website with copy, pages, preview, ZIP, and launch checklist.",
  },
  {
    label: "Business App",
    href: "/create?type=app" as const,
    detail: "Create a portal, dashboard, booking system, customer area, or internal tool.",
  },
  {
    label: "Automation",
    href: "/create?type=automation" as const,
    detail: "Build workflows for leads, reminders, operations, content, and business tasks.",
  },
];

const industries = [
  "Construction",
  "Beauty",
  "Restaurant",
  "Transportation",
  "Legal",
  "Store",
  "Clinic",
  "Custom",
];

const included = [
  "Customer-ready preview",
  "Admin dashboard",
  "Customer portal",
  "Editable source files",
  "Downloadable ZIP",
  "Launch checklist",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10 px-6 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_32rem),radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_28rem)]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
              OmegaCrownAI
            </p>

            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">
              Build a real business system from one prompt.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Describe what you want. OmegaCrownAI creates the website, app, admin dashboard,
              customer workflow, source files, ZIP package, and launch checklist.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/create?type=website"
                className="rounded-2xl bg-cyan-300 px-6 py-4 text-sm font-black text-slate-950 hover:bg-cyan-200"
              >
                Build a Website
              </Link>
              <Link
                href="/create?type=app"
                className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-sm font-black text-white hover:bg-white/15"
              >
                Build an App
              </Link>
              <Link
                href="/create?type=automation"
                className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-sm font-black text-white hover:bg-white/15"
              >
                Automate My Business
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/40 p-5 shadow-2xl shadow-cyan-950/20">
            <div className="rounded-[1.5rem] border border-cyan-300/20 bg-slate-950 p-5">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">
                Start here
              </p>
              <h2 className="mt-3 text-2xl font-black">What do you want to build?</h2>

              <form action="/create" className="mt-5 space-y-4">
                <input type="hidden" name="type" value="website" />

                <textarea
                  name="prompt"
                  rows={6}
                  placeholder="Example: Build a premium construction website with estimate requests, project gallery, contractor matching, admin dashboard, and downloadable source package."
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
                />

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-cyan-300 px-5 py-4 text-sm font-black text-slate-950 hover:bg-cyan-200"
                >
                  Generate My System
                </button>
              </form>

              <div className="mt-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                  Quick industries
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {industries.map((industry) => (
                    <Link
                      key={industry}
                      href={`/create?type=website&prompt=${encodeURIComponent(
                        `Build a customer-ready ${industry.toLowerCase()} business website with strong copy, service sections, lead capture, admin review area, mobile layout, ZIP package, and launch checklist.`
                      )}`}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:border-cyan-300/50 hover:bg-cyan-300/10"
                    >
                      {industry}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-3">
            {quickBuilds.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-300/40 hover:bg-cyan-300/5"
              >
                <h3 className="text-xl font-black">{item.label}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{item.detail}</p>
              </Link>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-black/30 p-6">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-200">
              What OmegaCrownAI gives you
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {included.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-bold text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              ["1", "Describe your business"],
              ["2", "Review the preview"],
              ["3", "Edit files if needed"],
              ["4", "Download or launch"],
            ].map(([step, text]) => (
              <div key={step} className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300 text-sm font-black text-slate-950">
                  {step}
                </div>
                <p className="mt-4 text-sm font-black text-white">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6 text-center">
            <h2 className="text-3xl font-black tracking-[-0.04em]">
              Start simple. Add advanced tools later.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              The advanced OmegaCrownAI workspaces are still available, but customers now start with one clear action: describe what they want to build.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/create?type=website"
                className="rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 hover:bg-slate-200"
              >
                Start Building
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
