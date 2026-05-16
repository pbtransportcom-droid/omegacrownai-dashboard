









const selfImprovementPanels = [
  {
    label: "Self-Repair",
    value: "Build-safe",
    detail: "Detect syntax, build, route, 404, 502, and deployment failures.",
  },
  {
    label: "Evaluation",
    value: "Benchmarked",
    detail: "Score builders for depth, accuracy, syntax, safety, and usefulness.",
  },
  {
    label: "Accuracy",
    value: "Evidence-aware",
    detail: "Separate verified facts, memory, inference, and live-check needs.",
  },
  {
    label: "Guardrails",
    value: "Protected",
    detail: "No PM2 restart before build, no git add ., no unsafe live trading.",
  },
];

const startHereActions = [
  {
    label: "Start Website Builder",
    detail: "Best first step for most customers. Generate website structure, copy, SEO, and deployment checklist.",
    href: "/sovereign/website",
    cta: "Start Website",
  },
  {
    label: "Download Website Starter",
    detail: "Get sovereign-website-starter.zip with HTML pages, CSS, SEO, brand direction, and checklist.",
    href: "/api/sovereign/website-starter-bundle",
    cta: "Download ZIP",
  },
  {
    label: "Open Trading Bundle",
    detail: "Download the paper-trading starter repository. Live trading remains disabled.",
    href: "/api/sovereign/trading-code-bundle",
    cta: "Download Trading",
  },
  {
    label: "Check Readiness",
    detail: "Verify release status, workspace stability, smoke tests, and safety gates.",
    href: "/api/sovereign/release-readiness",
    cta: "Check Status",
  },
];

const websiteStarterSmokeResults = [
  {
    label: "Smoke Test",
    value: "9/9 passed",
    detail: "All Website starter bundle checks passed.",
  },
  {
    label: "Required Files",
    value: "9/9",
    detail: "README, pages, CSS, SEO, brand, and checklist are present.",
  },
  {
    label: "ZIP Bundle",
    value: "Ready",
    detail: "sovereign-website-starter.zip is available for download.",
  },
  {
    label: "SEO + Deployment",
    value: "Ready",
    detail: "SEO metadata and deployment checklist are included.",
  },
];

const tradingCustomerDownloadFlow = [
  {
    step: "01",
    title: "Download ZIP",
    detail: "Get saits-v1.zip with the generated paper-trading starter repository.",
    href: "/api/sovereign/trading-code-bundle",
    cta: "Download",
  },
  {
    step: "02",
    title: "Check README",
    detail: "Verify setup, run, test, dashboard, and safety instructions.",
    href: "/api/sovereign/trading-readme-smoke-check",
    cta: "Check",
  },
  {
    step: "03",
    title: "Smoke Test",
    detail: "Confirm 17/17 generated files, paper mode, and live trading disabled.",
    href: "/api/sovereign/trading-bundle-smoke-test",
    cta: "Validate",
  },
  {
    step: "04",
    title: "Run Locally",
    detail: "Unzip the repo, install dependencies, run main.py, dashboard, and pytest.",
    href: "/api/sovereign/trading-file-content",
    cta: "Inspect",
  },
  {
    step: "05",
    title: "Stay Safe",
    detail: "Keep paper trading only until review, testing, and manual approval are complete.",
    href: "/api/sovereign/release-readiness",
    cta: "Review",
  },
];

const tradingBundleSmokeResults = [
  {
    label: "Smoke Test",
    value: "8/8 passed",
    detail: "All Trading Builder bundle checks passed.",
  },
  {
    label: "Generated Files",
    value: "17/17",
    detail: "All required starter files are present.",
  },
  {
    label: "ZIP Bundle",
    value: "Ready",
    detail: "saits-v1.zip is available for download.",
  },
  {
    label: "Safety Mode",
    value: "Paper only",
    detail: "Live trading remains disabled by default.",
  },
];

const builderOutputDepth = [
  {
    department: "Website",
    mode: "Website pages + copy",
    artifacts: "Page tree, homepage sections, service copy, SEO, deployment checklist",
    href: "/api/sovereign/builder-output-depth?department=website",
  },
  {
    department: "App",
    mode: "Product build spec",
    artifacts: "Screens, user flows, data model, API plan, release checklist",
    href: "/api/sovereign/builder-output-depth?department=app",
  },
  {
    department: "Automation",
    mode: "Workflow execution plan",
    artifacts: "Triggers, actions, approvals, logs, replay, failure handling",
    href: "/api/sovereign/builder-output-depth?department=automation",
  },
  {
    department: "Trading",
    mode: "Paper-trading system package",
    artifacts: "Agents, risk rules, repo plan, backtest plan, live safety gate",
    href: "/api/sovereign/builder-output-depth?department=trading",
  },
  {
    department: "Coding",
    mode: "Implementation repo plan",
    artifacts: "File tree, implementation steps, tests, validation, deployment plan",
    href: "/api/sovereign/builder-output-depth?department=coding",
  },
];

const onboardingSteps = [
  {
    step: "01",
    title: "Login or create your account",
    detail: "Start with a secure account so projects, workspaces, memory, and release checks stay connected.",
    href: "/login",
    cta: "Login",
  },
  {
    step: "02",
    title: "Choose a department",
    detail: "Pick the business area you want to build: Website, App, Automation, Trading, Marketing, Finance, Support, and more.",
    href: "/build",
    cta: "View Departments",
  },
  {
    step: "03",
    title: "Start a department project",
    detail: "Use Start Department Project to create a real project record under the company workspace.",
    href: "/sovereign/website",
    cta: "Start Website Project",
  },
  {
    step: "04",
    title: "Open the routed workspace",
    detail: "OmegaCrownAI automatically sends each project to the correct workspace for building and execution.",
    href: "/api/sovereign/button-flow-matrix",
    cta: "View Routing Matrix",
  },
  {
    step: "05",
    title: "Check release readiness",
    detail: "Use the readiness dashboard to confirm routing, stability, smoke tests, and protected real-run gates.",
    href: "/api/sovereign/release-readiness",
    cta: "Open Readiness API",
  },
];

const releaseReadiness = [
  {
    key: "flow-matrix",
    name: "Sovereign Flow Matrix",
    score: "12/12",
    status: "Passed",
    detail: "All departments route to their correct workspace.",
    href: "/api/sovereign/button-flow-matrix",
  },
  {
    key: "workspace-stability",
    name: "Workspace Stability",
    score: "4/4",
    status: "Passed",
    detail: "Builder data panels are restored for Website, App, Automation, and Trading.",
    href: "/api/sovereign/workspace-stability",
  },
  {
    key: "smoke-dry-run",
    name: "Smoke Test Dry-Run",
    score: "4/4",
    status: "Safe",
    detail: "Default smoke test validates routes without creating project records.",
    href: "/api/sovereign/real-workspace-smoke",
  },
  {
    key: "real-run-gate",
    name: "Real-Run Gate",
    score: "?run=true",
    status: "Protected",
    detail: "Real project creation is intentional and gated.",
    href: "/api/sovereign/real-workspace-smoke?run=true",
  },
];

const workspaceStability = [
  {
    department: "website",
    label: "Website Workspace",
    route: "/build/website/[projectId]",
    dataPanel: "WebsiteBuildWorkspace",
    restoredData: "Project, builds, active build, website draft payload",
    href: "/build/website/preview-project-id",
  },
  {
    department: "app",
    label: "App Workspace",
    route: "/build/app/[projectId]",
    dataPanel: "App project/build history panel",
    restoredData: "Project record and app-domain build history",
    href: "/build/app/preview-project-id",
  },
  {
    department: "automation",
    label: "Automation Workspace",
    route: "/build/automation/[projectId]",
    dataPanel: "AutomationWorkspace",
    restoredData: "Project, builds, active build, automation flow payload",
    href: "/build/automation/preview-project-id",
  },
  {
    department: "trading",
    label: "Trading Workspace",
    route: "/build/trading/[projectId]",
    dataPanel: "TradingWorkspace",
    restoredData: "Project, builds, active build, strategy draft payload",
    href: "/build/trading/preview-project-id",
  },
];

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

        <div className="mt-8 rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 via-slate-950 to-cyan-500/10 p-6 shadow-2xl shadow-emerald-950/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
                Start Here
              </p>
              <h2 className="mt-2 text-4xl font-black text-white">
                New customer? Start with this path.
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
                The Sovereign OS now has many departments, artifacts, downloads, and validation checks.
                Use this simple path first: build a website, download a starter, then verify readiness.
              </p>
            </div>
            <a
              href="/sovereign/website"
              className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-black shadow-lg shadow-emerald-950/30 hover:bg-emerald-300"
            >
              Start Website Builder
            </a>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {startHereActions.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className={[
                  "rounded-2xl border p-5 transition",
                  "min-h-44 flex flex-col justify-between",
                  index === 0
                    ? "border-emerald-300/50 bg-emerald-500/15 shadow-xl shadow-emerald-950/20 hover:bg-emerald-500/20"
                    : "border-slate-700 bg-black/30 hover:border-emerald-300/60 hover:bg-emerald-500/10",
                ].join(" ")}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-100">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {index === 0 ? (
                      <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-black">
                        Recommended
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-4 text-xs font-black uppercase tracking-wide text-emerald-300">
                    {item.cta}
                  </p>
                  <h3 className="mt-2 text-lg font-black text-white">
                    {item.label}
                  </h3>
                  <p className="mt-3 text-xs leading-6 text-slate-400">
                    {item.detail}
                  </p>
                </div>

                <p className="mt-4 text-xs font-black uppercase tracking-wide text-emerald-300">
                  Open →
                </p>
              </a>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-cyan-300">
              Customer journey
            </p>
            <p className="mt-2 text-sm font-black text-white">
              Choose department → Generate artifact → Download starter → Validate checks → Launch or continue building
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
            <p className="text-sm font-black text-emerald-100">
              Recommended first move
            </p>
            <p className="mt-2 text-xs leading-6 text-slate-300">
              Start with the Website Builder first. It is the easiest customer-facing artifact to understand,
              download, inspect, and deploy. Then use the Trading Builder only when paper-trading safety is understood.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/15 via-slate-950 to-cyan-500/10 p-6 shadow-2xl shadow-fuchsia-950/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-fuchsia-300">
                Self-Improvement Engine
              </p>
              <h2 className="mt-2 text-4xl font-black text-white">
                OmegaCrownAI learns safely, repairs syntax, and validates before release.
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
                This control layer turns lessons from build errors, broken routes, shallow outputs,
                and unsafe workflows into stronger validation rules, better builder prompts,
                and safer upgrade discipline.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="/api/sovereign/self-improvement-engine"
                className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-black text-fuchsia-100 hover:bg-fuchsia-500/20"
              >
                Open Engine API
              </a>
              <a
                href="/api/sovereign/self-improvement-smoke-test"
                className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-100 hover:bg-emerald-500/20"
              >
                Run Engine Smoke Test
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {selfImprovementPanels.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-700 bg-black/30 p-5"
              >
                <p className="text-xs font-black uppercase tracking-wide text-fuchsia-300">
                  {item.label}
                </p>
                <p className="mt-2 text-xl font-black text-white">
                  {item.value}
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-yellow-200">
              Production rule
            </p>
            <p className="mt-2 text-sm font-black text-white">
              Build first → smoke test → restart PM2 → verify production → commit targeted files.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-slate-950 to-purple-500/10 p-6 shadow-2xl shadow-cyan-950/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
                Customer Onboarding
              </p>
              <h2 className="mt-2 text-4xl font-black text-white">
                Start building with Sovereign AI Company OS
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
                Follow this flow to move from account access to department selection, project creation,
                routed workspace execution, and release readiness validation.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href="/login"
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/20"
              >
                Login
              </a>
              <a
                href="/signup"
                className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-black text-black hover:bg-cyan-300"
              >
                Sign Up
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            {onboardingSteps.map((item) => (
              <a
                key={item.step}
                href={item.href}
                className="rounded-2xl border border-slate-700 bg-black/30 p-5 transition hover:border-cyan-300/60 hover:bg-cyan-500/10"
              >
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-black text-cyan-100">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-black text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-xs leading-6 text-slate-400">
                  {item.detail}
                </p>
                <p className="mt-4 text-xs font-black uppercase tracking-wide text-cyan-300">
                  {item.cta} →
                </p>
              </a>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
            <p className="text-sm font-black text-cyan-100">
              Recommended first path
            </p>
            <p className="mt-2 text-xs leading-6 text-slate-300">
              Sign up, open the Website Department, start a department project, then follow the routed workspace.
              After that, use the Release Readiness dashboard to confirm the system is ready.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 via-slate-950 to-cyan-500/10 p-6 shadow-2xl shadow-emerald-950/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
                Release Readiness
              </p>
              <h2 className="mt-2 text-4xl font-black text-white">
                Sovereign OS release status: Ready
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
                The core Sovereign builder flow is now validated across department routing, workspace stability,
                dry-run smoke testing, and protected real-run project creation.
              </p>
            </div>
            <a
              href="/api/sovereign/release-readiness"
              className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-100 hover:bg-emerald-500/20"
            >
              Open Readiness API
            </a>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {releaseReadiness.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="rounded-2xl border border-slate-700 bg-black/30 p-5 transition hover:border-emerald-300/60 hover:bg-emerald-500/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-300">
                      {item.status}
                    </p>
                    <h3 className="mt-2 text-lg font-black text-white">
                      {item.name}
                    </h3>
                  </div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-100">
                    {item.score}
                  </span>
                </div>
                <p className="mt-4 text-xs leading-6 text-slate-400">
                  {item.detail}
                </p>
              </a>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
            <p className="text-sm font-black text-emerald-100">
              Release gate: green
            </p>
            <p className="mt-2 text-xs leading-6 text-slate-300">
              Routine smoke checks are dry-run safe. Real project creation remains protected behind explicit ?run=true.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-500/15 via-slate-950 to-cyan-500/10 p-6 shadow-2xl shadow-purple-950/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-purple-300">
                Builder Output Depth
              </p>
              <h2 className="mt-2 text-4xl font-black text-white">
                Move from blueprint-only to real build artifacts
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
                Each Sovereign builder department should produce structured outputs that can become real websites,
                apps, automations, code repositories, or paper-trading systems — not only planning text.
              </p>
            </div>
            <a
              href="/api/sovereign/builder-output-depth"
              className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-black text-purple-100 hover:bg-purple-500/20"
            >
              Open Output Depth API
            </a>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {builderOutputDepth.map((item) => (
              <a
                key={item.department}
                href={item.href}
                className="rounded-2xl border border-slate-700 bg-black/30 p-5 transition hover:border-purple-300/60 hover:bg-purple-500/10"
              >
                <p className="text-xs font-black uppercase tracking-wide text-purple-300">
                  {item.department}
                </p>
                <h3 className="mt-2 text-lg font-black text-white">
                  {item.mode}
                </h3>
                <p className="mt-3 text-xs leading-6 text-slate-400">
                  {item.artifacts}
                </p>
              </a>
            ))}
          </div>

          <p className="mt-4 text-xs leading-6 text-slate-400">
            Phase 158 upgrade target: every builder should create artifacts, next actions, and readiness checks.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-slate-950 to-blue-500/10 p-6 shadow-2xl shadow-cyan-950/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
                Website Builder Artifact Depth
              </p>
              <h2 className="mt-2 text-4xl font-black text-white">
                Website Builder now produces real launch artifacts
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
                The Website Builder output now includes page tree, homepage sections, starter copy,
                SEO metadata, brand direction, conversion plan, deployment checklist, and next actions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="/api/sovereign/website-starter-bundle"
                className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-black text-black hover:bg-cyan-300"
              >
                Download Website Starter
              </a>
              <a
                href="/api/sovereign/website-builder-artifact"
                className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-black text-cyan-100 hover:bg-cyan-500/20"
              >
                Open Website Artifact
              </a>
              <a
                href="/api/sovereign/website-starter-smoke-test"
                className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-100 hover:bg-emerald-500/20"
              >
                Run Website Smoke Test
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              "Page tree",
              "Starter copy",
              "SEO metadata",
              "Deployment checklist",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-700 bg-black/30 p-5"
              >
                <p className="text-sm font-black text-cyan-100">{item}</p>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Included in the Website Builder artifact package.
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-5">
            <p className="text-sm font-black text-cyan-100">
              Customer-ready website path
            </p>
            <p className="mt-2 text-xs leading-6 text-slate-300">
              Prompt → Website artifact → page copy → preview layout → SEO/readiness check → deployment.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-emerald-100">
                  Website starter smoke-test results
                </p>
                <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-300">
                  The downloadable Website Builder starter bundle has passed validation:
                  required files are present, SEO metadata exists, and the deployment checklist is included.
                </p>
              </div>
              <a
                href="/api/sovereign/website-starter-smoke-test"
                className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-100 hover:bg-emerald-500/20"
              >
                Open Website Smoke-Test JSON
              </a>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {websiteStarterSmokeResults.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-700 bg-black/30 p-4"
                >
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-300">
                    {item.label}
                  </p>
                  <p className="mt-2 text-xl font-black text-white">
                    {item.value}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-lime-400/20 bg-gradient-to-br from-lime-500/15 via-slate-950 to-emerald-500/10 p-6 shadow-2xl shadow-lime-950/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-lime-300">
                Trading Code Artifact
              </p>
              <h2 className="mt-2 text-4xl font-black text-white">
                Generate the paper-trading repository plan
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
                The Trading Builder now has a concrete code-repository artifact plan with agents,
                config, risk engine, backtest engine, dashboard starter, Docker files, and README.
                Live trading remains locked behind explicit safety review.
              </p>
            </div>
            <a
              href="/api/sovereign/trading-repo-artifact"
              className="rounded-xl border border-lime-400/30 bg-lime-500/10 px-4 py-2 text-sm font-black text-lime-100 hover:bg-lime-500/20"
            >
              Open Trading Repo Artifact
            </a>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              "Agent files",
              "Risk engine",
              "Backtest engine",
              "Paper-trading lock",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-700 bg-black/30 p-5"
              >
                <p className="text-sm font-black text-lime-100">{item}</p>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Included in the Trading Builder repository artifact plan.
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-lime-400/20 bg-lime-500/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-lime-100">
                  Actual starter file contents are ready
                </p>
                <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-300">
                  The next generator returns real starter code for main.py, agents, risk engine,
                  dashboard, backtest engine, Docker files, tests, config, and README.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/api/sovereign/trading-code-bundle"
                  className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-black text-black shadow-lg shadow-lime-950/30 hover:bg-lime-300"
                >
                  Download saits-v1.zip
                </a>
                <a
                  href="/api/sovereign/trading-bundle-smoke-test"
                  className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-100 hover:bg-emerald-500/20"
                >
                  View 8/8 Smoke Test
                </a>
                <a
                  href="/api/sovereign/trading-file-content"
                  className="rounded-xl border border-lime-400/30 bg-lime-500/10 px-4 py-3 text-sm font-black text-lime-100 hover:bg-lime-500/20"
                >
                  Inspect File JSON
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-cyan-100">
                  How to run the generated repo
                </p>
                <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-300">
                  After downloading saits-v1.zip, unzip it and run the starter system locally in paper-trading mode.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/api/sovereign/trading-code-bundle"
                  className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-black text-black hover:bg-cyan-300"
                >
                  Download ZIP
                </a>
                <a
                  href="/api/sovereign/trading-readme-smoke-check"
                  className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-black text-cyan-100 hover:bg-cyan-500/20"
                >
                  Check README
                </a>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-700 bg-black/30 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-cyan-300">
                  Setup
                </p>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs leading-6 text-slate-200">{`unzip saits-v1.zip
cd saits-v1
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt`}</pre>
              </div>

              <div className="rounded-xl border border-slate-700 bg-black/30 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-cyan-300">
                  Run
                </p>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs leading-6 text-slate-200">{`python main.py
streamlit run dashboard.py
pytest`}</pre>
              </div>

              <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-300">
                  Safety
                </p>
                <p className="mt-3 text-xs leading-6 text-slate-300">
                  The generated repository is paper-trading only. Live trading is disabled by default.
                  Do not add real broker keys until code review, paper testing, risk review, and manual approval are complete.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-lime-400/20 bg-gradient-to-br from-lime-500/10 via-black/30 to-cyan-500/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-lime-100">
                  Customer download flow
                </p>
                <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-300">
                  Follow this simple path after generating the Trading Builder repository. Download first,
                  validate the README and smoke test, then run locally in paper-trading mode.
                </p>
              </div>
              <a
                href="/api/sovereign/trading-code-bundle"
                className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-black text-black shadow-lg shadow-lime-950/30 hover:bg-lime-300"
              >
                Download saits-v1.zip
              </a>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-5">
              {tradingCustomerDownloadFlow.map((item) => (
                <a
                  key={item.step}
                  href={item.href}
                  className="rounded-xl border border-slate-700 bg-black/30 p-4 transition hover:border-lime-300/60 hover:bg-lime-500/10"
                >
                  <span className="rounded-full border border-lime-400/30 bg-lime-500/10 px-3 py-1 text-xs font-black text-lime-100">
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-sm font-black text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {item.detail}
                  </p>
                  <p className="mt-4 text-xs font-black uppercase tracking-wide text-lime-300">
                    {item.cta} →
                  </p>
                </a>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-500/10 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-yellow-200">
                Safety reminder
              </p>
              <p className="mt-2 text-xs leading-6 text-yellow-50">
                This generated bundle is for paper trading only. Live trading is disabled by default.
                Do not add real broker keys until paper testing, code review, risk review, and manual approval are complete.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-emerald-100">
                  Bundle smoke-test results
                </p>
                <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-300">
                  The downloadable Trading Builder bundle has passed structural validation:
                  required files are present, paper-trading safety is active, and live trading is disabled.
                </p>
              </div>
              <a
                href="/api/sovereign/trading-bundle-smoke-test"
                className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-100 hover:bg-emerald-500/20"
              >
                Open Smoke-Test JSON
              </a>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {tradingBundleSmokeResults.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-700 bg-black/30 p-4"
                >
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-300">
                    {item.label}
                  </p>
                  <p className="mt-2 text-xl font-black text-white">
                    {item.value}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
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

        <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                Workspace Stability
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">
                4 builder workspaces have restored data panels
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
                The Website, App, Automation, and Trading workspaces now keep the premium customer-ready layout
                while restoring project-backed builder data, build history, active build context, and draft outputs.
              </p>
            </div>
            <a
              href="/api/sovereign/workspace-stability"
              className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-black text-cyan-100 hover:bg-cyan-500/20"
            >
              Open Stability API
            </a>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workspaceStability.map((item) => (
              <a
                key={item.department}
                href={item.href}
                className="rounded-2xl border border-slate-700 bg-black/30 p-5 transition hover:border-cyan-300/60 hover:bg-cyan-500/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-cyan-300">
                      {item.department}
                    </p>
                    <h3 className="mt-2 text-xl font-black text-white">
                      {item.label}
                    </h3>
                  </div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-100">
                    Stable
                  </span>
                </div>

                <p className="mt-4 break-all font-mono text-xs text-cyan-100">
                  {item.route}
                </p>

                <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Data Panel
                  </p>
                  <p className="mt-1 text-sm font-black text-white">
                    {item.dataPanel}
                  </p>
                </div>

                <p className="mt-3 text-xs leading-6 text-slate-400">
                  {item.restoredData}
                </p>
              </a>
            ))}
          </div>

          <p className="mt-4 text-xs leading-6 text-slate-400">
            Stability result from Phase 146: 4 builder departments checked, 4 passed.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-fuchsia-300">
                Real Project Smoke Test
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">
                Verify real created projects open real workspaces
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
                This smoke test now opens in safe dry-run mode by default. It verifies route shape without creating records. Add ?run=true only when you intentionally want to create real smoke-test projects.
              </p>
            </div>
            <a
              href="/api/sovereign/real-workspace-smoke"
              className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-black text-fuchsia-100 hover:bg-fuchsia-500/20"
            >
              Open Dry-Run Smoke Test
            </a>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {["Website", "App", "Automation", "Trading"].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-700 bg-black/30 p-5"
              >
                <p className="text-xs font-black uppercase tracking-wide text-fuchsia-300">
                  {item}
                </p>
                <h3 className="mt-2 text-lg font-black text-white">
                  Real Workspace
                </h3>
                <p className="mt-3 text-xs leading-6 text-slate-400">
                  Dry-run checks route shape by default. Real project creation requires ?run=true.
                </p>
                <span className="mt-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-100">
                  Smoke-test ready
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs leading-6 text-slate-400">
            Use dry-run mode for routine checks. Use /api/sovereign/real-workspace-smoke?run=true only before major releases when real test project creation is intentional.
          </p>
        </div>
      </section>
    </main>
  );
}
