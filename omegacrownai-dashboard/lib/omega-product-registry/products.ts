import type {
  OmegaProduct,
} from "./types";

export const omegaProducts: OmegaProduct[] = [
  {
    id: "living-ai-os",
    name: "Living AI Operating System",
    shortName: "Living AI OS",
    description:
      "Authoritative blueprint-driven application generation with industry-specific composition, runtime validation, compliance, delivery, and production artifacts.",
    area: "build",
    href: "/create",
    status: "live",
    visible: true,
    featured: true,
    aliases: [
      "Sovereign Builder",
      "Business System Builder",
      "Full Stack Builder",
    ],
    capabilities: [
      "Prompt-to-blueprint generation",
      "Industry-specific application generation",
      "Frontend generation",
      "Backend generation",
      "API generation",
      "Database generation",
      "Admin workflows",
      "Customer workflows",
      "Runtime preview",
      "Validation",
      "ZIP delivery",
    ],
    relatedRoutes: [
      "/create",
      "/api/runtime-execution/create",
      "/runtime-preview/:projectId",
      "/runtime-studio/:projectId",
    ],
  },

  {
    id: "sovereign-runtime",
    name: "Sovereign Runtime",
    description:
      "Execution, artifact generation, compliance validation, preview, delivery, deployment, and downloadable production package runtime.",
    area: "runtime",
    href: "/live-runtime",
    status: "live",
    visible: true,
    featured: true,
    capabilities: [
      "Run execution",
      "Artifact generation",
      "Blueprint compliance",
      "Behavioral compliance",
      "Artifact validation",
      "Runtime preview",
      "Deployment",
      "ZIP download",
    ],
    relatedRoutes: [
      "/live-runtime",
      "/runtime-preview/:projectId",
      "/deployed/:projectId",
      "/artifacts/:projectId",
    ],
  },

  {
    id: "super-agent",
    name: "OmegaCrown Super Agent",
    description:
      "Multi-agent planning, architecture, building, validation, delivery, execution, memory, and task coordination.",
    area: "agents",
    href: "/chat",
    status: "live",
    visible: true,
    featured: true,
    capabilities: [
      "Planner Agent",
      "Architect Agent",
      "Builder Agent",
      "Validator Agent",
      "Delivery Agent",
      "Memory",
      "Task routing",
      "Consensus",
      "Agent coordination",
    ],
    relatedRoutes: [
      "/chat",
      "/api/ai/command",
      "/api/task-routing/dispatch",
      "/api/cognitive-mesh/consensus",
    ],
  },

  {
    id: "automation-studio",
    name: "Automation Studio",
    description:
      "Workflow automation with triggers, conditions, actions, execution, scheduling, recovery, webhooks, and monitoring.",
    area: "automation",
    href: "/automate",
    status: "live",
    visible: true,
    featured: true,
    capabilities: [
      "Workflow builder",
      "Triggers",
      "Conditions",
      "Actions",
      "Schedules",
      "Execution engine",
      "Retries",
      "Recovery",
      "Webhooks",
    ],
    relatedRoutes: [
      "/automate",
      "/api/task-routing/dispatch",
    ],
  },

  {
    id: "creative-studio",
    name: "Creative Studio",
    description:
      "AI-assisted creative production for video, audio, campaigns, assets, editing, distribution, and content workflows.",
    area: "creative",
    href: "/studio",
    status: "live",
    visible: true,
    featured: true,
    capabilities: [
      "Creative projects",
      "Video generation",
      "Asset management",
      "Editors Room",
      "Sound Room",
      "Render jobs",
      "Distribution",
      "Publishing",
    ],
    relatedRoutes: [
      "/studio",
      "/assets",
      "/render-queue",
    ],
  },

  {
    id: "king-trading-intelligence",
    name: "King Trading Intelligence",
    shortName: "King Trading",
    description:
      "AI-assisted market intelligence, research, forecasting, portfolio analysis, trade planning, paper trading, journaling, and strategy workspaces.",
    area: "trading",
    href: "/trade",
    status: "live",
    visible: true,
    featured: true,
    capabilities: [
      "Trading Command Center",
      "Trading Copilot",
      "Market intelligence",
      "Forecasting",
      "Portfolio intelligence",
      "Watchlists",
      "Journaling",
      "Paper trading",
      "Risk planning",
    ],
    relatedRoutes: [
      "/trade",
      "/trade/chat",
      "/trade/copilot",
      "/trade/command-center",
    ],
  },

  {
    id: "company-os",
    name: "Sovereign AI Company OS",
    shortName: "Company OS",
    description:
      "Departmental operations, workforce, memory, tasks, governance, sales, executive command, QA, distribution, identity, and company-wide orchestration.",
    area: "company-os",
    href: "/projects",
    status: "live",
    visible: true,
    featured: true,
    capabilities: [
      "Departments",
      "Workforce",
      "Company memory",
      "Tasks",
      "KPIs",
      "Sales pipelines",
      "Governance",
      "Executive command",
      "QA improvement",
      "Distribution",
      "Versioning",
    ],
    relatedRoutes: [
      "/projects/:id/company",
      "/projects/:id/company/departments",
      "/projects/:id/company/executive",
      "/projects/:id/company/sales",
      "/projects/:id/company/governance",
    ],
  },

  {
    id: "executive-command",
    name: "Executive Command Center",
    description:
      "Strategic planning, global orchestration, sales command, priorities, review, resource allocation, and executive intelligence.",
    area: "executive",
    href: "/executive-autopilot/plan",
    status: "live",
    visible: true,
    capabilities: [
      "Strategic planning",
      "Priority management",
      "Executive review",
      "Consensus",
      "Resource allocation",
      "Global orchestration",
    ],
    relatedRoutes: [
      "/executive-autopilot/plan",
      "/executive-autopilot/priorities",
      "/executive-autopilot/review",
    ],
  },

  {
    id: "marketplace",
    name: "AI Marketplace",
    description:
      "Marketplace for agents, tools, templates, providers, connectors, permissions, verification, and integrations.",
    area: "marketplace",
    href: "/marketplace",
    status: "live",
    visible: true,
    featured: true,
    capabilities: [
      "Agents",
      "Tools",
      "Templates",
      "Connectors",
      "Providers",
      "Installation",
      "Permissions",
      "Verification",
    ],
  },

  {
    id: "project-os",
    name: "Project Operating System",
    shortName: "Project OS",
    description:
      "Unified project dashboard for assets, queues, browser/cloud execution, history, memory, runbooks, settings, and company operations.",
    area: "business-os",
    href: "/project-os/dashboard",
    status: "live",
    visible: true,
    capabilities: [
      "Project dashboard",
      "Project assets",
      "Queues",
      "Browser execution",
      "Cloud jobs",
      "Memory",
      "History",
      "Runbooks",
      "Safety controls",
    ],
    relatedRoutes: [
      "/project-os/dashboard",
      "/project-os/projects",
      "/project-os/assets",
      "/project-os/queues",
    ],
  },

  {
    id: "trust-security",
    name: "Trust & Security Center",
    description:
      "Governance, compliance, audit, identity protection, policy enforcement, reliability, observability, and production trust controls.",
    area: "security",
    href: "/trust-center",
    status: "live",
    visible: true,
    capabilities: [
      "Trust center",
      "Audit trails",
      "Compliance evidence",
      "Identity",
      "Policy enforcement",
      "Reliability",
      "Incident response",
      "Observability",
    ],
    relatedRoutes: [
      "/trust-center",
      "/audit",
      "/compliance/evidence",
      "/observability",
      "/policy/engine",
    ],
  },

  {
    id: "industry-solutions",
    name: "Industry Application Systems",
    shortName: "Industry Solutions",
    description:
      "Industry-specific generation for transportation, legal, healthcare, restaurant, commerce, SaaS, finance, bookstore, automation, and general business.",
    area: "solutions",
    href: "/create",
    status: "live",
    visible: true,
    featured: true,
    capabilities: [
      "Transportation",
      "Legal",
      "Healthcare",
      "Restaurant",
      "Commerce",
      "SaaS",
      "Finance",
      "Bookstore",
      "Automation",
      "General business",
    ],
  },

  {
    id: "billing-entitlements",
    name: "Billing & Entitlements",
    description:
      "Pricing, Stripe checkout, subscription management, plan enforcement, usage controls, customer billing, and paid artifact access.",
    area: "business-os",
    href: "/account",
    status: "live",
    visible: true,
    capabilities: [
      "Plans",
      "Stripe checkout",
      "Billing portal",
      "Usage",
      "Entitlements",
      "Artifact access control",
    ],
    relatedRoutes: [
      "/account",
      "/account/upgrade",
      "/api/stripe/checkout",
      "/api/stripe/portal",
    ],
  },

  {
    id: "production-control",
    name: "Production & Launch Control",
    description:
      "Launch readiness, production completion, release validation, deployment runbooks, rollback, monitoring, and go/no-go controls.",
    area: "runtime",
    href: "/launch/control-room",
    status: "live",
    visible: true,
    capabilities: [
      "Launch readiness",
      "Go/no-go",
      "Smoke tests",
      "Release readiness",
      "Deployment runbook",
      "Rollback",
      "Production completion",
    ],
    relatedRoutes: [
      "/launch/control-room",
      "/launch",
      "/release/readiness",
      "/release/runbook",
      "/release/rollback",
    ],
  },
];

export function getOmegaProduct(
  id: string
) {
  return omegaProducts.find(
    product => product.id === id
  );
}

export function getProductsByArea(
  area: OmegaProduct["area"]
) {
  return omegaProducts.filter(
    product => product.area === area
  );
}

export function getVisibleOmegaProducts() {
  return omegaProducts.filter(
    product => product.visible
  );
}

export function getFeaturedOmegaProducts() {
  return omegaProducts.filter(
    product =>
      product.visible &&
      product.featured
  );
}
