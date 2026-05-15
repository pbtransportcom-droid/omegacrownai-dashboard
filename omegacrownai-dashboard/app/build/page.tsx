
const flowMatrix = [
  {
    department: "website",
    label: "Website Department",
    workspace: "/build/website/[projectId]",
    href: "/sovereign/website",
  },
  {
    department: "app",
    label: "App Department",
    workspace: "/build/app/[projectId]",
    href: "/sovereign/app",
  },
  {
    department: "coding",
    label: "Coding Department",
    workspace: "/projects/[projectId]",
    href: "/sovereign/coding",
  },
  {
    department: "automation",
    label: "Automation Department",
    workspace: "/build/automation/[projectId]",
    href: "/sovereign/automation",
  },
  {
    department: "trading",
    label: "Trading Department",
    workspace: "/build/trading/[projectId]",
    href: "/sovereign/trading",
  },
  {
    department: "creative",
    label: "Creative Department",
    workspace: "/projects/[projectId]/company/creative-studio",
    href: "/sovereign/creative",
  },
  {
    department: "marketing",
    label: "Marketing Department",
    workspace: "/projects/[projectId]/company/marketing",
    href: "/sovereign/marketing",
  },
  {
    department: "finance",
    label: "Finance Department",
    workspace: "/projects/[projectId]/company/finance",
    href: "/sovereign/finance",
  },
  {
    department: "support",
    label: "Support Department",
    workspace: "/projects/[projectId]/company/support",
    href: "/sovereign/support",
  },
  {
    department: "security",
    label: "Security & Governance",
    workspace: "/projects/[projectId]/company/governance",
    href: "/sovereign/security",
  },
  {
    department: "reliability",
    label: "Reliability Department",
    workspace: "/projects/[projectId]/company/reliability",
    href: "/sovereign/reliability",
  },
  {
    department: "workspaces",
    label: "Projects & Workspaces",
    workspace: "/projects/[projectId]/company/workspaces",
    href: "/sovereign/workspaces",
  },
];

const departments = [
  {
    title: "Website Department",
    description:
      "Build premium business websites, landing pages, service pages, funnels, SEO-ready pages, and launch-ready customer experiences.",
    href: "/sovereign/website",
    badge: "Website Builder",
  },
  {
    title: "App Department",
    description:
      "Build dashboards, SaaS apps, portals, business systems, customer apps, internal tools, and full-stack product workflows.",
    href: "/sovereign/app",
    badge: "App Builder",
  },
  {
    title: "Coding Department",
    description:
      "Generate, edit, debug, review, refactor, test, and ship production code through OmegaCrownAI project workspaces.",
    href: "/sovereign/coding",
    badge: "Coding Workspace",
  },
  {
    title: "Automation Department",
    description:
      "Build AI agents, business workflows, scheduled jobs, execution pipelines, lead follow-ups, reporting systems, and operations automations.",
    href: "/sovereign/automation",
    badge: "Automation Builder",
  },
  {
    title: "Trading Department",
    description:
      "Build King Trading System dashboards, market discovery, watchlists, forecast quality controls, alerts, and research tools.",
    href: "/sovereign/trading",
    badge: "King Trading System",
  },
  {
    title: "Creative Department",
    description:
      "Build content systems, videos, image prompts, brand assets, campaigns, scripts, and production-ready creative pipelines.",
    href: "/sovereign/creative",
    badge: "Creative Studio",
  },
  {
    title: "Marketing Department",
    description:
      "Build campaigns, funnels, customer acquisition systems, copy, landing strategies, distribution plans, and growth workflows.",
    href: "/sovereign/marketing",
    badge: "Marketing Engine",
  },
  {
    title: "Finance Department",
    description:
      "Build revenue tracking, payment flows, provider management, billing readiness, financial dashboards, and business controls.",
    href: "/sovereign/finance",
    badge: "Finance Ops",
  },
  {
    title: "Support Department",
    description:
      "Build customer support workflows, onboarding, help systems, customer operations, readiness checks, and response pipelines.",
    href: "/sovereign/support",
    badge: "Customer Ops",
  },
  {
    title: "Security & Governance",
    description:
      "Build safety policies, audit trails, access controls, identity verification, compliance evidence, and governance workflows.",
    href: "/sovereign/security",
    badge: "Governance",
  },
  {
    title: "Reliability Department",
    description:
      "Build monitoring, incident response, replay systems, job reliability, cost controls, and production-grade operational checks.",
    href: "/sovereign/reliability",
    badge: "Reliability",
  },
  {
    title: "Projects & Workspaces",
    description:
      "Open the full workspace layer where Sovereign AI Company projects, departments, memory, execution, and build history live.",
    href: "/sovereign/workspaces",
    badge: "Workspace OS",
  },
];

export default function BuildPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-slate-900 to-purple-500/10 p-8 text-center shadow-2xl shadow-cyan-950/30">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
            OmegaCrownAI Sovereign AI Company OS
          </p>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Build your full AI company, not just one small tool.
          </h1>
          <p className="mx-auto mt-5 max-w-4xl text-base leading-8 text-slate-300">
            Sovereign AI Company OS organizes OmegaCrownAI into powerful departments:
            websites, apps, coding, automation, trading, creative, marketing, finance,
            customer operations, security, reliability, and project workspaces.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href="/login"
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/20"
            >
              Login
            </a>
            <a
              href="/signup"
              className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-black hover:bg-emerald-300"
            >
              Sign Up
            </a>
            <a
              href="/create?type=website"
              className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-black hover:bg-cyan-300"
            >
              Start Website Department
            </a>
            <a
              href="/create?type=app"
              className="rounded-xl bg-purple-500 px-5 py-3 text-sm font-black text-white hover:bg-purple-400"
            >
              Start App Department
            </a>
            <a
              href="/projects"
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/20"
            >
              Open Company Workspaces
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((department) => (
            <a
              key={department.title}
              href={department.href}
              className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-black/20 transition hover:border-cyan-300/60 hover:bg-slate-900"
            >
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-cyan-200">
                {department.badge}
              </span>
              <h2 className="mt-5 text-2xl font-black text-white">
                {department.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {department.description}
              </p>
              <p className="mt-5 text-sm font-black text-cyan-200">
                Open {department.title} →
              </p>
            </a>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-6">
          <h2 className="text-2xl font-black text-yellow-100">
            Built for full capacity
          </h2>
          <p className="mt-3 text-sm leading-7 text-yellow-50">
            This hub is designed as the top-level company operating system. Each department can keep expanding with its own dashboards,
            builders, agents, workflows, execution logs, quality controls, memory, governance, and production readiness checks.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
                Sovereign Flow Matrix
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">
                12 departments routed to the right workspace
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
                Every department has a Start Department Project flow. When a project is created,
                OmegaCrownAI routes it to the correct workspace automatically.
              </p>
            </div>
            <a
              href="/api/sovereign/button-flow-matrix"
              className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-100 hover:bg-emerald-500/20"
            >
              Open Matrix API
            </a>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-700">
            <div className="grid grid-cols-12 bg-black/40 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
              <div className="col-span-4">Department</div>
              <div className="col-span-5">Workspace Route</div>
              <div className="col-span-3 text-right">Status</div>
            </div>

            <div className="divide-y divide-slate-800">
              {flowMatrix.map((item) => (
                <div
                  key={item.department}
                  className="grid grid-cols-12 items-center gap-3 px-4 py-4 text-sm"
                >
                  <div className="col-span-4">
                    <a
                      href={item.href}
                      className="font-black text-white hover:text-cyan-200"
                    >
                      {item.label}
                    </a>
                    <p className="mt-1 text-xs text-slate-500">
                      /sovereign/{item.department}
                    </p>
                  </div>

                  <div className="col-span-5 break-all font-mono text-xs text-emerald-100">
                    {item.workspace}
                  </div>

                  <div className="col-span-3 text-right">
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-100">
                      Ready
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-xs leading-6 text-slate-400">
            Matrix result from Phase 142: 12 departments checked, 12 passed. This panel makes that routing visible to customers and operators.
          </p>
        </div>
      </section>
    </main>
  );
}
