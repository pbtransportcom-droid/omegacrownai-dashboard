const departments = {
  website: {
    title: "Website Department",
    badge: "Website Builder",
    description:
      "Build premium business websites, landing pages, service pages, funnels, SEO-ready pages, and launch-ready customer experiences.",
    primaryHref: "/create?type=website",
    primaryLabel: "Start Website Builder",
    secondaryHref: "/projects",
    systems: [
      "Landing page builder",
      "Business website builder",
      "Service page builder",
      "SEO-ready content structure",
      "Customer conversion sections",
      "Launch-readiness checklist",
    ],
  },
  app: {
    title: "App Department",
    badge: "App Builder",
    description:
      "Build dashboards, SaaS apps, portals, internal tools, customer apps, and full-stack product workflows.",
    primaryHref: "/create?type=app",
    primaryLabel: "Start App Builder",
    secondaryHref: "/projects",
    systems: [
      "Dashboard builder",
      "SaaS app planner",
      "Customer portal builder",
      "Internal tool builder",
      "Data flow planning",
      "Production UI workspace",
    ],
  },
  coding: {
    title: "Coding Department",
    badge: "Coding Workspace",
    description:
      "Generate, edit, debug, review, refactor, test, and ship production code through OmegaCrownAI project workspaces.",
    primaryHref: "/create?type=coding",
    primaryLabel: "Start Coding Workspace",
    secondaryHref: "/projects",
    systems: [
      "Code generation",
      "Code review",
      "Bug fixing",
      "Feature implementation",
      "Build/test guidance",
      "Safe deployment workflow",
    ],
  },
  automation: {
    title: "Automation Department",
    badge: "Automation Builder",
    description:
      "Build AI agents, business workflows, scheduled jobs, execution pipelines, lead follow-ups, reporting systems, and operations automations.",
    primaryHref: "/create?type=automation",
    primaryLabel: "Start Automation Builder",
    secondaryHref: "/automate",
    systems: [
      "Workflow builder",
      "Agent execution planning",
      "Scheduled jobs",
      "Business process automation",
      "Run logs",
      "Operational safety checks",
    ],
  },
  trading: {
    title: "Trading Department",
    badge: "King Trading System",
    description:
      "Build King Trading System dashboards, market discovery, watchlists, forecast quality controls, alerts, and trading research tools.",
    primaryHref: "/create?type=trading",
    primaryLabel: "Start Trading Builder",
    secondaryHref: "/trade",
    systems: [
      "Market discovery",
      "Watchlist quality ranking",
      "Forecast quality controls",
      "Stock and crypto scanner",
      "Risk discipline",
      "Educational trading dashboard",
    ],
  },
  creative: {
    title: "Creative Department",
    badge: "Creative Studio",
    description:
      "Build content systems, videos, image prompts, brand assets, campaigns, scripts, and production-ready creative pipelines.",
    primaryHref: "/creative/directors-room",
    primaryLabel: "Open Creative Studio",
    secondaryHref: "/creative/asset-pipeline",
    systems: [
      "Directors room",
      "Scene planning",
      "Asset pipeline",
      "Video workflow",
      "Brand creative",
      "Prompt production quality",
    ],
  },
  marketing: {
    title: "Marketing Department",
    badge: "Marketing Engine",
    description:
      "Build campaigns, funnels, customer acquisition systems, copy, landing strategies, distribution plans, and growth workflows.",
    primaryHref: "/distribution/campaigns",
    primaryLabel: "Open Marketing Engine",
    secondaryHref: "/distribution/pipeline",
    systems: [
      "Campaign planning",
      "Distribution pipeline",
      "Variant testing",
      "KPI tracking",
      "Customer copy alignment",
      "Growth workflow design",
    ],
  },
  finance: {
    title: "Finance Department",
    badge: "Finance Ops",
    description:
      "Build revenue tracking, payment flows, provider management, billing readiness, financial dashboards, and business controls.",
    primaryHref: "/payments/providers",
    primaryLabel: "Open Finance Ops",
    secondaryHref: "/pricing",
    systems: [
      "Payment providers",
      "External payment readiness",
      "Billing policies",
      "Provider disclosure",
      "Revenue controls",
      "Finance operations dashboard",
    ],
  },
  support: {
    title: "Support Department",
    badge: "Customer Ops",
    description:
      "Build customer support workflows, onboarding, help systems, customer operations, readiness checks, and response pipelines.",
    primaryHref: "/customer",
    primaryLabel: "Open Customer Ops",
    secondaryHref: "/customer-launch-readiness",
    systems: [
      "Customer onboarding",
      "Support workflows",
      "Launch readiness",
      "Customer operations",
      "Team workflows",
      "Response pipeline",
    ],
  },
  security: {
    title: "Security & Governance",
    badge: "Governance",
    description:
      "Build safety policies, audit trails, access controls, identity verification, compliance evidence, and governance workflows.",
    primaryHref: "/security/admin-controls",
    primaryLabel: "Open Security Controls",
    secondaryHref: "/compliance/evidence",
    systems: [
      "Admin controls",
      "Access review",
      "Audit logs",
      "Tenant isolation",
      "Compliance evidence",
      "Policy registry",
    ],
  },
  reliability: {
    title: "Reliability Department",
    badge: "Reliability",
    description:
      "Build monitoring, incident response, replay systems, job reliability, cost controls, and production-grade operational checks.",
    primaryHref: "/observability",
    primaryLabel: "Open Reliability Dashboard",
    secondaryHref: "/reliability/replay",
    systems: [
      "Observability summary",
      "Incident response",
      "Replay tools",
      "Job reliability",
      "Cost controls",
      "Production monitoring",
    ],
  },
  workspaces: {
    title: "Projects & Workspaces",
    badge: "Workspace OS",
    description:
      "Open the full workspace layer where Sovereign AI Company projects, departments, memory, execution, and build history live.",
    primaryHref: "/projects",
    primaryLabel: "Open Projects",
    secondaryHref: "/project-os/dashboard",
    systems: [
      "Project dashboard",
      "Build history",
      "Memory",
      "Execution logs",
      "Project OS",
      "Workspace routing",
    ],
  },
};

function normalizeDepartment(value?: string) {
  if (!value) return "website";
  if (value in departments) return value as keyof typeof departments;
  return "website";
}

export default async function SovereignDepartmentPage({
  params,
}: {
  params: Promise<{ department: string }>;
}) {
  const resolvedParams = await params;
  const key = normalizeDepartment(resolvedParams.department);
  const department = departments[key];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        <a
          href="/build"
          className="inline-flex rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-black text-cyan-100 hover:bg-cyan-500/20"
        >
          ← Back to Sovereign AI Company OS
        </a>

        <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-slate-900 to-purple-500/10 p-8 shadow-2xl shadow-cyan-950/30">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
            {department.badge}
          </p>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            {department.title}
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300">
            {department.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={department.primaryHref}
              className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-black hover:bg-cyan-300"
            >
              {department.primaryLabel}
            </a>
            <a
              href={department.secondaryHref}
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/20"
            >
              Open Related Workspace
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
            <h2 className="text-2xl font-black">Department Systems</h2>
            <div className="mt-5 grid gap-3">
              {department.systems.map((system) => (
                <div
                  key={system}
                  className="rounded-xl border border-slate-700 bg-black/30 p-4 text-sm font-bold text-slate-200"
                >
                  {system}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-6">
            <h2 className="text-2xl font-black text-yellow-100">
              Built for full capacity
            </h2>
            <p className="mt-4 text-sm leading-7 text-yellow-50">
              This department page is a dedicated deep link inside the Sovereign AI Company OS.
              It can expand into dashboards, agents, memory, execution logs, quality controls,
              project history, permissions, and production readiness systems without limiting
              the larger OmegaCrownAI architecture.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
