import { CreateDepartmentProjectButton } from "@/components/sovereign/CreateDepartmentProjectButton";

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
  const createHref = department.primaryHref.includes("?")
    ? `${department.primaryHref}&department=${key}`
    : `/create?type=${key}&department=${key}`;

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

        <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                Department Dashboard
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">
                Start, manage, and verify this department
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                These panels connect this department to project creation, execution readiness,
                workspace routing, memory, build history, and governance systems.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-right">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-300">
                Department Status
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-100">Online</p>
              <p className="mt-1 text-xs text-emerald-50/80">
                Workspace route active
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-700 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Mode</p>
              <p className="mt-1 text-lg font-black text-white">Sovereign</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Department</p>
              <p className="mt-1 text-lg font-black text-white">{key}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Systems</p>
              <p className="mt-1 text-lg font-black text-white">{department.systems.length}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Readiness</p>
              <p className="mt-1 text-lg font-black text-white">Ready to build</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <CreateDepartmentProjectButton
              department={key}
              projectType={key}
              label="Create Department Project"
            />

            <a
              href={department.secondaryHref}
              className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-lg shadow-black/20 transition hover:border-cyan-300/60"
            >
              <p className="text-xs font-black uppercase tracking-wide text-cyan-300">
                Workspace
              </p>
              <h3 className="mt-2 text-xl font-black text-white">Open Department Workspace</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Jump into the active dashboard or operational workspace for this department.
              </p>
            </a>

            <a
              href={`/launch-validation/go-no-go?department=${key}`}
              className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5 shadow-lg shadow-black/20 transition hover:border-emerald-300/60"
            >
              <p className="text-xs font-black uppercase tracking-wide text-emerald-300">
                Readiness
              </p>
              <h3 className="mt-2 text-xl font-black text-white">Run Readiness Check</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Verify launch quality, blockers, risk, and go/no-go readiness.
              </p>
            </a>

            <a
              href={`/projects?department=${key}`}
              className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-5 shadow-lg shadow-black/20 transition hover:border-purple-300/60"
            >
              <p className="text-xs font-black uppercase tracking-wide text-purple-300">
                Projects
              </p>
              <h3 className="mt-2 text-xl font-black text-white">View Build History</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Review department projects, previous builds, executions, and workspace history.
              </p>
            </a>

            <a
              href={`/projects?department=${key}&view=memory`}
              className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5 shadow-lg shadow-black/20 transition hover:border-blue-300/60"
            >
              <p className="text-xs font-black uppercase tracking-wide text-blue-300">
                Memory
              </p>
              <h3 className="mt-2 text-xl font-black text-white">View Department Memory</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Open the knowledge, context, decisions, and persistent memory for this department.
              </p>
            </a>

            <a
              href={`/security/admin-controls?department=${key}`}
              className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-5 shadow-lg shadow-black/20 transition hover:border-yellow-300/60"
            >
              <p className="text-xs font-black uppercase tracking-wide text-yellow-300">
                Governance
              </p>
              <h3 className="mt-2 text-xl font-black text-white">Open Safety & Governance</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Review permissions, audit controls, policy checks, and operational guardrails.
              </p>
            </a>
          </div>
        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-300">
            Sovereign Build Pipeline
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Department execution flow
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {[
              "Brief",
              "Plan",
              "Build",
              "Verify",
              "Launch"
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-xl border border-purple-400/20 bg-purple-500/10 p-4"
              >
                <p className="text-xs font-black uppercase tracking-wide text-purple-300">
                  Step {index + 1}
                </p>
                <p className="mt-2 text-lg font-black text-white">{step}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {step === "Brief" && "Capture department goals, constraints, and required output."}
                  {step === "Plan" && "Convert the brief into tasks, systems, and quality gates."}
                  {step === "Build" && "Create the assets, code, workflows, dashboards, or systems."}
                  {step === "Verify" && "Run readiness, safety, quality, and production checks."}
                  {step === "Launch" && "Move the department output into customer-ready operation."}
                </p>
              </div>
            ))}
          </div>
        </div>

        </div>
      </section>
    </main>
  );
}
