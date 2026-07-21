import Link from "next/link";

const buildTypes = [
  "Business websites",
  "Customer portals",
  "Booking systems",
  "Admin dashboards",
  "Automation workflows",
  "Downloadable launch packages",
];

const steps = [
  {
    title: "Describe the business",
    text: "Tell OmegaCrownAI what the customer needs: website, app, booking flow, dashboard, automation, or full launch package.",
  },
  {
    title: "Review the generated build",
    text: "Get a live preview with customer pages, admin workflow, source files, delivery guide, and launch checklist.",
  },
  {
    title: "Launch or download",
    text: "Use the preview, request changes, or download the ZIP package with source files and documentation.",
  },
];

const proof = [
  "Preview page",
  "Source files",
  "Admin area",
  "README",
  "Delivery guide",
  "Launch checklist",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#080604] text-[#fff8ec]">
      <section className="relative overflow-hidden border-b border-[#d6a85f]/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(214,168,95,0.24),_transparent_32%),radial-gradient(circle_at_80%_10%,_rgba(99,102,241,0.16),_transparent_30%)]" />
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link href="/" className="text-xl font-black tracking-[0.28em] text-[#f6d28b]">
            OMEGACROWNAI
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-[#e9dcc5] md:flex">
            <a href="#builds">What We Build</a>
            <a href="#process">How It Works</a>
            <a href="#proof">Proof</a>
            <Link href="/login">Login</Link>
          </nav>
          <Link
            href="/create?type=website"
            className="rounded-full border border-[#f6d28b]/50 bg-[#f6d28b] px-5 py-3 text-sm font-black text-[#120d05] shadow-[0_0_30px_rgba(246,210,139,0.22)]"
          >
            Start Building
          </Link>
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-6 inline-flex rounded-full border border-[#d6a85f]/30 bg-white/5 px-4 py-2 text-sm font-bold text-[#f6d28b]">
              Customer-ready websites, apps, workflows, and launch packages
            </p>
            <h1 className="max-w-5xl text-5xl font-black leading-[0.96] tracking-[-0.05em] text-white md:text-7xl">
              Build a business system from one prompt.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#e9dcc5]">
              Describe the customer’s business. OmegaCrownAI generates a polished front page,
              customer flow, admin area, source files, ZIP package, delivery guide, and launch checklist.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/create?type=website"
                className="rounded-full bg-[#f6d28b] px-7 py-4 text-center font-black text-[#120d05]"
              >
                Start Building
              </Link>
              <a
                href="#builds"
                className="rounded-full border border-white/15 px-7 py-4 text-center font-black text-white"
              >
                See What It Builds
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d6a85f]/25 bg-[#14100b]/80 p-5 shadow-2xl shadow-black/40">
            <div className="rounded-[1.5rem] border border-white/10 bg-[#fff8ec] p-5 text-[#160f07]">
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9a6b1f]">
                    Live Build Preview
                  </p>
                  <h2 className="mt-1 text-2xl font-black">Customer Website Package</h2>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                  Ready
                </span>
              </div>

              <div className="mt-6 grid gap-3">
                {proof.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3"
                  >
                    <span className="font-bold">{item}</span>
                    <span className="text-sm font-black text-green-700">Included</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-[#120d05] p-5 text-white">
                <p className="text-sm font-bold text-[#f6d28b]">Generated output</p>
                <p className="mt-2 text-3xl font-black">Preview + ZIP + Docs</p>
                <p className="mt-2 text-sm leading-6 text-[#e9dcc5]">
                  Built for review, download, and launch instead of just a static page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="builds" className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f6d28b]">What we build</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">
            Classic business output with real working parts.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {buildTypes.map((item) => (
            <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="mb-5 h-10 w-10 rounded-full bg-[#f6d28b]" />
              <h3 className="text-xl font-black text-white">{item}</h3>
              <p className="mt-3 text-sm leading-6 text-[#d8c8af]">
                Generated as a customer-ready package with preview, source files, admin workflow, and delivery notes.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="process" className="border-y border-white/10 bg-[#100b06]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f6d28b]">How it works</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-[#d6a85f]/20 bg-[#181008] p-7">
                <p className="text-5xl font-black text-[#f6d28b]">0{index + 1}</p>
                <h3 className="mt-8 text-2xl font-black text-white">{step.title}</h3>
                <p className="mt-4 leading-7 text-[#d8c8af]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[2rem] border border-[#d6a85f]/25 bg-[#f6d28b] p-8 text-[#120d05] md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em]">Delivery standard</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-5xl">
                Not just a page. A launch package.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8">
                Every customer-ready build is designed for review, handoff, editing, and launch.
                OmegaCrownAI keeps SaaS power underneath but gives customers a simple front door.
              </p>
            </div>
            <div className="grid gap-3">
              {proof.map((item) => (
                <div key={item} className="rounded-2xl bg-[#120d05] px-5 py-4 font-black text-white">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center md:p-14">
          <h2 className="text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
            Ready to build the next customer project?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#d8c8af]">
            Start with a prompt. Review the preview. Download the package.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/create?type=website" className="rounded-full bg-[#f6d28b] px-8 py-4 font-black text-[#120d05]">
              Start Building
            </Link>
            <Link href="/login" className="rounded-full border border-white/15 px-8 py-4 font-black text-white">
              Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
