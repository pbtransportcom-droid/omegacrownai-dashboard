import type {
  OmegaProductArea,
} from "./types";

export type OmegaProductFamily = {
  id: string;
  name: string;
  description: string;
  area: OmegaProductArea;
  href: string;
  visible: boolean;
  priority: number;
  routePrefixes: string[];
  keywords: string[];
};

export const omegaProductFamilies:
  OmegaProductFamily[] = [
  {
    id: "build",
    name: "Build",
    description:
      "Living AI OS, full-stack application generation, websites, business systems, and authoritative blueprint execution.",
    area: "build",
    href: "/create",
    visible: true,
    priority: 10,
    routePrefixes: [
      "/create",
      "/build",
      "/api/sovereign",
      "/api/runtime-execution",
    ],
    keywords: [
      "builder",
      "build",
      "artifact",
      "website",
      "full-stack",
      "blueprint",
    ],
  },

  {
    id: "agents",
    name: "Agents",
    description:
      "Super Agent, agent swarm, cognitive mesh, multi-agent spine, negotiation, memory, and task routing.",
    area: "agents",
    href: "/agents",
    visible: true,
    priority: 20,
    routePrefixes: [
      "/agents",
      "/chat",
      "/spine",
      "/api/agent",
      "/api/agent-swarm",
      "/api/agent-negotiation",
      "/api/cognitive-mesh",
      "/api/task-routing",
    ],
    keywords: [
      "agent",
      "swarm",
      "consensus",
      "orchestrate",
      "memory",
    ],
  },

  {
    id: "automation",
    name: "Automation",
    description:
      "Workflow automation, state machines, execution planning, schedules, recovery, webhooks, and runtime orchestration.",
    area: "automation",
    href: "/automate",
    visible: true,
    priority: 30,
    routePrefixes: [
      "/automate",
      "/automation",
      "/api/automation",
      "/api/workflow-engine",
      "/api/workflow-state-machine",
      "/api/execution-planner",
    ],
    keywords: [
      "workflow",
      "automation",
      "schedule",
      "execution",
      "recover",
    ],
  },

  {
    id: "creative",
    name: "Creative Intelligence",
    description:
      "Creative Studio, video, voice, podcast, asset pipeline, Editors Room, Directors Room, Sound Room, rendering, and distribution.",
    area: "creative",
    href: "/studio",
    visible: true,
    priority: 40,
    routePrefixes: [
      "/studio",
      "/video-studio",
      "/voice",
      "/assets",
      "/render-queue",
      "/creative",
      "/api/creative",
      "/api/company/:companyId/video",
      "/api/company/:companyId/podcast",
      "/api/company/:companyId/creative-studio",
    ],
    keywords: [
      "creative",
      "video",
      "voice",
      "podcast",
      "asset",
      "render",
      "director",
      "editor",
      "sound",
    ],
  },

  {
    id: "trading",
    name: "King Trading Intelligence",
    description:
      "Market intelligence, forecasts, portfolio analysis, paper trading, Copilot, scanner, watchlists, journal, and provider integrations.",
    area: "trading",
    href: "/trade",
    visible: true,
    priority: 50,
    routePrefixes: [
      "/trade",
      "/api/trading",
      "/api/ai/trading",
    ],
    keywords: [
      "trading",
      "market",
      "portfolio",
      "forecast",
      "scanner",
      "watchlist",
      "broker",
    ],
  },

  {
    id: "company-os",
    name: "Company OS",
    description:
      "Departments, workforce, company memory, workspaces, finance, sales, marketing, operations, support, governance, identity, and versioning.",
    area: "company-os",
    href: "/projects",
    visible: true,
    priority: 60,
    routePrefixes: [
      "/projects/:id/company",
      "/api/company",
    ],
    keywords: [
      "company",
      "department",
      "workforce",
      "sales",
      "finance",
      "marketing",
      "operations",
      "support",
      "workspace",
    ],
  },

  {
    id: "executive",
    name: "Executive Intelligence",
    description:
      "Executive Autopilot, strategic planning, decision rooms, global orchestration, resource allocation, priorities, and executive review.",
    area: "executive",
    href: "/executive-autopilot/plan",
    visible: true,
    priority: 70,
    routePrefixes: [
      "/executive-autopilot",
      "/api/executive-autopilot",
      "/api/executive-command-center",
      "/api/executive-intelligence",
      "/api/strategy-engine",
      "/api/resource-allocation",
    ],
    keywords: [
      "executive",
      "strategy",
      "priority",
      "decision",
      "resource allocation",
    ],
  },

  {
    id: "project-os",
    name: "Project OS",
    description:
      "Projects, assets, builds, queues, browser/cloud execution, history, memory, validation, roles, runbooks, and safety.",
    area: "business-os",
    href: "/project-os/dashboard",
    visible: true,
    priority: 80,
    routePrefixes: [
      "/project-os",
      "/projects",
      "/api/project-os",
      "/api/projects",
    ],
    keywords: [
      "project",
      "build",
      "asset",
      "queue",
      "history",
      "runbook",
    ],
  },

  {
    id: "marketplace",
    name: "Marketplace & Connectors",
    description:
      "Agents, tools, templates, providers, connectors, verification, sandboxing, credentials, and integrations.",
    area: "marketplace",
    href: "/marketplace",
    visible: true,
    priority: 90,
    routePrefixes: [
      "/marketplace",
      "/marketplace-ecosystem",
      "/api/marketplace",
      "/api/marketplace-ecosystem",
      "/api/connectors",
    ],
    keywords: [
      "marketplace",
      "connector",
      "provider",
      "template",
      "tool",
    ],
  },

  {
    id: "runtime",
    name: "Runtime & Deployment",
    description:
      "Sovereign Runtime, previews, execution, telemetry, deployment, release, downloads, runtime control, and recovery.",
    area: "runtime",
    href: "/live-runtime",
    visible: true,
    priority: 100,
    routePrefixes: [
      "/runtime",
      "/runtime-preview",
      "/runtime-studio",
      "/deployed",
      "/artifacts",
      "/api/runtime",
      "/api/runtime-proxy",
      "/api/runtime-orchestrator",
      "/api/runtime-recovery",
      "/api/runtime-supervisor",
      "/api/runtime-telemetry",
    ],
    keywords: [
      "runtime",
      "deploy",
      "preview",
      "artifact",
      "telemetry",
    ],
  },

  {
    id: "trust-security",
    name: "Trust, Security & Governance",
    description:
      "Trust Center, compliance, policy enforcement, identity, audit, reliability, observability, access controls, and tenant isolation.",
    area: "security",
    href: "/trust-center",
    visible: true,
    priority: 110,
    routePrefixes: [
      "/trust-center",
      "/security",
      "/compliance",
      "/policy",
      "/identity",
      "/audit",
      "/observability",
      "/reliability",
      "/api/security",
      "/api/compliance",
      "/api/policy",
      "/api/identity",
      "/api/trust-center",
    ],
    keywords: [
      "security",
      "trust",
      "audit",
      "compliance",
      "identity",
      "policy",
      "reliability",
    ],
  },

  {
    id: "launch",
    name: "Production & Launch",
    description:
      "Launch control, go/no-go, production completion, final verification, release readiness, rollback, and launch smoke testing.",
    area: "runtime",
    href: "/launch/control-room",
    visible: true,
    priority: 120,
    routePrefixes: [
      "/launch",
      "/launch-validation",
      "/release",
      "/production-completion",
      "/final-verification",
      "/api/launch",
      "/api/launch-validation",
      "/api/release",
      "/api/production-completion",
      "/api/final-verification",
    ],
    keywords: [
      "launch",
      "release",
      "production",
      "verification",
      "go-no-go",
    ],
  },

  {
    id: "customer-platform",
    name: "Customer Platform",
    description:
      "Customer organizations, billing, teams, publishing, storage, provider credentials, API keys, permissions, and onboarding.",
    area: "business-os",
    href: "/customer",
    visible: true,
    priority: 130,
    routePrefixes: [
      "/customer",
      "/customer-org",
      "/account",
      "/onboarding",
      "/api/customer",
      "/api/customer-org",
      "/api/account",
      "/api/onboarding",
    ],
    keywords: [
      "customer",
      "organization",
      "team",
      "billing",
      "storage",
      "onboarding",
    ],
  },

  {
    id: "public-platform",
    name: "Public Platform",
    description:
      "Pricing, documentation, support, legal, platform disclosures, contact, signup, and public product information.",
    area: "public",
    href: "/",
    visible: true,
    priority: 140,
    routePrefixes: [
      "/pricing",
      "/docs",
      "/support",
      "/contact",
      "/legal",
      "/platform",
      "/signup",
      "/login",
    ],
    keywords: [
      "pricing",
      "docs",
      "support",
      "legal",
      "public",
    ],
  },
];

export function getOmegaProductFamily(
  id: string
) {
  return omegaProductFamilies.find(
    family => family.id === id
  );
}
