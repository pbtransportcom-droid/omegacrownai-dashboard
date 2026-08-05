import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Boxes,
  Check,
  Code2,
  Crown,
  Download,
  Eye,
  FileCheck2,
  Gauge,
  Globe2,
  Layers3,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";

const buildCategories = [
  {
    title: "Website Systems",
    eyebrow: "Customer experience",
    description:
      "Authentic industry websites with conversion flows, editable content, customer intake, admin review, APIs, and deployment files.",
    href: "/create?type=website",
    icon: Globe2,
    capabilities: ["Industry blueprint", "Customer intake", "Admin operations"],
  },
  {
    title: "Business Applications",
    eyebrow: "Full-stack software",
    description:
      "Customer portals and operating applications with APIs, databases, authentication foundations, workflows, and source code.",
    href: "/create?type=app",
    icon: Code2,
    capabilities: ["Portal UX", "API layer", "Data models"],
  },
  {
    title: "Automation Operations",
    eyebrow: "Workflow execution",
    description:
      "Trigger-and-action systems with request intake, run history, status tracking, operational review, and delivery documentation.",
    href: "/create?type=automation",
    icon: Workflow,
    capabilities: ["Trigger maps", "Run history", "Admin review"],
  },
  {
    title: "Campaign Intelligence",
    eyebrow: "Growth systems",
    description:
      "Connected offers, campaign pages, lead capture, email sequences, advertising assets, calendars, and approval workflows.",
    href: "/create?type=marketing",
    icon: Rocket,
    capabilities: ["Campaign offer", "Lead flow", "Content calendar"],
  },
  {
    title: "Trading Intelligence",
    eyebrow: "Market systems",
    description:
      "Research, forecasting, portfolio intelligence, strategy workspaces, journaling, provider integrations, and AI-assisted analysis.",
    href: "/trade",
    icon: Gauge,
    capabilities: ["Market research", "Portfolio tools", "AI copilot"],
  },
  {
    title: "Creative Production",
    eyebrow: "Multimodal studios",
    description:
      "Connected production spaces for images, video, music, podcasting, brand assets, storyboards, and export-ready creative work.",
    href: "/studio",
    icon: Sparkles,
    capabilities: ["Visual studio", "Audio production", "Creator exports"],
  },
];

const platformLayers = [
  ["Prompt intelligence", "Preserves explicit requirements and business intent."],
  ["Authentic domain engine", "Uses industry-specific terminology, workflows, pages, and features."],
  ["Full-stack artifact builder", "Creates frontend, API routes, storage, admin tools, and documentation."],
  ["Universal validation", "Checks requested pages, application files, APIs, data readiness, and delivery."],
  ["Runtime preview", "Lets customers review generated work before downloading or deploying."],
  ["Delivery package", "Produces validated source files, README, launch checklist, and downloadable ZIP."],
];

const workflowSteps = [
  {
    number: "01",
    title: "Describe the business",
    text: "Enter the actual business, audience, pages, services, workflows, integrations, and delivery expectations.",
  },
  {
    number: "02",
    title: "Generate the complete system",
    text: "OmegaCrownAI creates the build specification, frontend, backend, admin workflow, storage, and documentation.",
  },
  {
    number: "03",
    title: "Preview, validate, and deliver",
    text: "Review the runtime preview, inspect files, run validation, request improvements, and download the finished package.",
  },
];

const proofItems = [
  "Prompt requirements preserved",
  "Industry classification protected",
  "Functional admin workflow",
  "API and data persistence",
  "Requested-page validation",
  "Production build verification",
  "Downloadable source ZIP",
  "README and launch checklist",
];

export const metadata = {
  title: "OmegaCrownAI Premium Homepage Preview",
  description:
    "Preview the premium OmegaCrownAI homepage experience before production activation.",
};

export default function PremiumHomepagePreview() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-12rem] top-[-10rem] h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute right-[-10rem] top-[8rem] h-[30rem] w-[30rem] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute bottom-[-16rem] left-1/3 h-[34rem] w-[34rem] rounded-full bg-violet-600/10 blur-[150px]" />
      </div>

      <header className="relative z-20 border-b border-white/10 bg-[#02040a]/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 shadow-[0_0_35px_rgba(34,211,238,0.12)]">
              <Crown className="h-5 w-5 text-cyan-200" />
            </span>
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.3em] text-cyan-200">
                OmegaCrownAI
              </span>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.22em] text-white/40">
                Sovereign Production System
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {[
              ["Platform", "#platform"],
              ["Capabilities", "#capabilities"],
              ["Process", "#process"],
              ["Delivery", "#delivery"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="rounded-xl px-4 py-2 text-sm font-bold text-white/55 transition hover:bg-white/5 hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-xl border border-white/10 px-4 py-2.5 text-sm font-black text-white/75 transition hover:border-cyan-300/25 hover:text-cyan-100 sm:inline-flex"
            >
              Login
            </Link>
            <Link
              href="/create?type=website"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-black text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.18)] transition hover:bg-cyan-200"
            >
              Start Building
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(103,232,249,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(103,232,249,0.35) 1px, transparent 1px)",
            backgroundSize: "46px 46px",
            maskImage:
              "linear-gradient(to bottom, black, transparent 88%)",
          }}
        />
        <div className="mx-auto grid min-h-[820px] max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-100">
              <Zap className="h-3.5 w-3.5" />
              Prompt to production
            </div>

            <h1 className="mt-8 max-w-5xl text-5xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-[5.7rem]">
              Build the business system,
              <span className="block bg-gradient-to-r from-cyan-200 via-white to-blue-300 bg-clip-text text-transparent">
                not just the page.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              OmegaCrownAI turns a business prompt into a functional digital
              product with authentic industry intelligence, frontend, backend,
              admin operations, validation, preview, documentation, and a
              downloadable delivery package.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/create?type=website"
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-300 px-7 py-4 font-black text-slate-950 shadow-[0_0_45px_rgba(34,211,238,0.2)] transition hover:-translate-y-0.5 hover:bg-cyan-200"
              >
                <Play className="h-5 w-5 fill-current" />
                Create a production build
              </Link>

              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] px-7 py-4 font-black text-white transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-cyan-300/[0.07]"
              >
                <Eye className="h-5 w-5" />
                Open projects
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["Prompt fidelity", "Preserved"],
                ["Validation", "Full-stack"],
                ["Delivery", "Source ZIP"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                    {label}
                  </p>
                  <p className="mt-2 font-black text-cyan-100">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-cyan-400/5 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#07101d]/90 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
                    Sovereign runtime
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    Production Build Console
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-black text-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />
                  Ready
                </span>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">
                  Build request
                </p>
                <p className="mt-3 leading-7 text-white/80">
                  Build a premium transportation booking and dispatch platform
                  with customer portal, fleet operations, payments, admin
                  dashboard, API routes, database, preview, and downloadable ZIP.
                </p>
              </div>

              <div className="mt-4 grid gap-3">
                {[
                  [Bot, "Business intelligence", "Prompt and industry understood"],
                  [Layers3, "Full-stack generation", "Frontend, APIs, data, and admin"],
                  [ShieldCheck, "Validation engine", "Requested pages and delivery verified"],
                  [Download, "Customer package", "Preview, source, docs, and ZIP ready"],
                ].map(([Icon, title, detail]) => {
                  const Component = Icon as typeof Bot;

                  return (
                    <div
                      key={String(title)}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
                        <Component className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-black">{String(title)}</span>
                        <span className="mt-1 block text-sm text-white/45">
                          {String(detail)}
                        </span>
                      </span>
                      <Check className="h-5 w-5 text-emerald-300" />
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Runtime", "Online", "Generation engine available"],
                  ["Validation", "Connected", "Full-stack checks enabled"],
                  ["Delivery", "Ready", "Preview, source, docs, and ZIP"],
                ].map(([label, value, detail]) => (
                  <div
                    key={label}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-4"
                  >
                    <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.85)]" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                      {label}
                    </p>
                    <p className="mt-2 text-xl font-black text-cyan-100">
                      {value}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/35">
                      {detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="relative z-10 border-y border-white/10 bg-white/[0.018]">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-200">
              One sovereign platform
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              The complete generation stack is already connected.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {platformLayers.map(([title, description], index) => (
              <article
                key={title}
                className="group rounded-[1.75rem] border border-white/10 bg-[#07101d] p-6 transition hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-[#091526]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-cyan-200">
                    0{index + 1}
                  </span>
                  <Boxes className="h-5 w-5 text-white/25 transition group-hover:text-cyan-200" />
                </div>
                <h3 className="mt-8 text-xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-white/45">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="capabilities" className="relative z-10 mx-auto max-w-7xl px-5 py-24">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-200">
              Production departments
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              Build across the entire digital company.
            </h2>
          </div>
          <p className="max-w-xl leading-7 text-white/45">
            Start from the department that matches the work. Each build follows
            the same prompt-preservation, validation, preview, and delivery
            standard.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {buildCategories.map(
            ({
              title,
              eyebrow,
              description,
              href,
              icon: Icon,
              capabilities,
            }) => (
              <Link
                key={title}
                href={href as any}
                className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.055] to-white/[0.02] p-7 transition duration-300 hover:-translate-y-1.5 hover:border-cyan-300/30 hover:shadow-[0_25px_70px_rgba(8,145,178,0.12)]"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/0 blur-3xl transition duration-500 group-hover:bg-cyan-300/10" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                      {eyebrow}
                    </span>
                  </div>

                  <h3 className="mt-8 text-2xl font-black">{title}</h3>
                  <p className="mt-4 min-h-24 leading-7 text-white/45">
                    {description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {capabilities.map((capability) => (
                      <span
                        key={capability}
                        className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-bold text-white/55"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>

                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-black text-cyan-200">
                    Enter department
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )
          )}
        </div>
      </section>

      <section className="relative z-10 border-y border-white/10 bg-[#030711]">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-200">
                Generated in OmegaCrownAI
              </p>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                Review real runtime projects, not placeholder mockups.
              </h2>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-black text-cyan-200"
            >
              Open all projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {[
              {
                eyebrow: "Transportation",
                title: "Booking and Dispatch Platform",
                description:
                  "Airport transfers, fleet selection, customer booking, dispatcher operations, invoices, APIs, storage, admin tools, and delivery files.",
                href: "/runtime-preview/OC-CTPT8HE5",
                tags: ["Fleet", "Dispatch", "Customer portal"],
              },
              {
                eyebrow: "Service Operations",
                title: "Plumbing Lead and Quote System",
                description:
                  "Emergency services, customer requests, message compatibility, phone persistence, lead status workflow, admin filtering, and downloadable source.",
                href: "/runtime-preview/OC-SH4G9UND",
                tags: ["Quotes", "Lead status", "Admin workflow"],
              },
              {
                eyebrow: "Authentic Generation",
                title: "Transportation Domain Build",
                description:
                  "A boundary-safe transportation build preserving fleet, booking, customer portal, dispatcher dashboard, admin requirements, and domain terminology.",
                href: "/runtime-preview/OC-6BRGORFI",
                tags: ["Prompt fidelity", "Validation", "ZIP delivery"],
              },
            ].map((project) => (
              <Link
                key={project.href}
                href={project.href as any}
                className="group rounded-[2rem] border border-white/10 bg-[#08111f] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                    {project.eyebrow}
                  </span>
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                    Runtime available
                  </span>
                </div>

                <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-300/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/60" />
                  </div>
                  <div className="mt-5 space-y-3">
                    <div className="h-3 w-2/3 rounded-full bg-cyan-200/25" />
                    <div className="h-2 w-full rounded-full bg-white/10" />
                    <div className="h-2 w-4/5 rounded-full bg-white/10" />
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="h-14 rounded-xl bg-cyan-300/10" />
                      <div className="h-14 rounded-xl bg-blue-300/10" />
                      <div className="h-14 rounded-xl bg-violet-300/10" />
                    </div>
                  </div>
                </div>

                <h3 className="mt-7 text-2xl font-black">{project.title}</h3>
                <p className="mt-4 leading-7 text-white/45">
                  {project.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="mt-7 inline-flex items-center gap-2 text-sm font-black text-cyan-200">
                  Open runtime preview
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="relative z-10 border-y border-white/10 bg-[#050914]">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-200">
              Production workflow
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              From business intent to validated delivery.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {workflowSteps.map((step) => (
              <article
                key={step.number}
                className="rounded-[2rem] border border-white/10 bg-[#08111f] p-7"
              >
                <p className="text-5xl font-black text-cyan-300/75">
                  {step.number}
                </p>
                <h3 className="mt-10 text-2xl font-black">{step.title}</h3>
                <p className="mt-4 leading-7 text-white/45">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="delivery" className="relative z-10 mx-auto max-w-7xl px-5 py-24">
        <div className="overflow-hidden rounded-[2.5rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-400/10 via-[#07101d] to-blue-500/10 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.45)] sm:p-12">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
                <FileCheck2 className="h-4 w-4" />
                Full-function delivery standard
              </div>

              <h2 className="mt-7 text-4xl font-black tracking-[-0.045em] sm:text-6xl">
                Not a homepage mockup.
                <span className="block text-cyan-200">
                  A reviewable production package.
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/55">
                Every paid build is designed to include the customer experience,
                operations layer, source package, validation results, deployment
                guidance, and a clear launch path.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/create?type=website"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 font-black text-slate-950 transition hover:bg-cyan-100"
                >
                  Start a complete build
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-7 py-4 font-black text-white transition hover:border-cyan-300/30 hover:bg-white/5"
                >
                  Review projects
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {proofItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-300/10">
                    <Check className="h-4 w-4 text-emerald-300" />
                  </span>
                  <span className="text-sm font-bold text-white/75">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-10 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-cyan-200" />
            <span className="font-black tracking-[0.16em] text-white">
              OMEGACROWNAI
            </span>
          </div>
          <p className="text-sm text-white/35">
            Sovereign AI production systems for complete digital businesses.
          </p>
          <div className="flex gap-5 text-sm font-bold text-white/45">
            <Link href="/pricing" className="hover:text-cyan-100">
              Pricing
            </Link>
            <Link href="/docs" className="hover:text-cyan-100">
              Documentation
            </Link>
            <Link href="/support" className="hover:text-cyan-100">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
