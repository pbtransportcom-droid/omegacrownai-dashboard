export const FULL_SUPER_AGENT_PROJECT_BLUEPRINT_VERSION =
  "v26.9 Phase 289 — Full Super Agent Project Blueprint";

export const fullSuperAgentProjectBlueprint = {
  ok: true,
  version: FULL_SUPER_AGENT_PROJECT_BLUEPRINT_VERSION,
  purpose:
    "Define the full-function OmegaCrownAI Super Agent project blueprint: not limited, production-aware, customer-ready, memory-enabled, tool-using, queue-safe, and operator-controlled.",
  standards: [
    "Full project understanding before action",
    "Frontend and backend awareness",
    "Customer-ready output by default",
    "No partial paid deliverables",
    "Memory and project history usage",
    "Safe tool and action execution",
    "Queue, retry, and DLQ protection",
    "Preview, review, export, and launch paths",
    "Admin and operator override controls",
  ],
  superAgentCapabilities: {
    planning: true,
    codeGeneration: true,
    frontendGeneration: true,
    backendGeneration: true,
    databaseAwareness: true,
    apiRouteCreation: true,
    workflowAutomation: true,
    tradingSystemSupport: true,
    artifactGeneration: true,
    deploymentGuidance: true,
    smokeTesting: true,
    rollbackPlanning: true,
    observability: true,
    customerOnboarding: true,
    adminGovernance: true,
  },
  operatingModes: [
    "Beginner guided mode",
    "Advanced builder mode",
    "Operator/admin mode",
    "Autonomous repair mode",
    "Customer delivery mode",
  ],
  projectBlueprintModules: [
    "Project intake",
    "Requirement expansion",
    "Architecture planning",
    "Task breakdown",
    "Full-stack generation",
    "Artifact packaging",
    "Safety validation",
    "Queue execution",
    "Review workflow",
    "Deployment readiness",
    "Customer handoff",
  ],
  productionRules: [
    "Run npm build before PM2 restart",
    "Use targeted git add only",
    "Never use git add . for production patches",
    "Protect against missing database records",
    "Do not use findUniqueOrThrow in queue processors",
    "Return structured recoverable failures",
    "Use DLQ for unsupported jobs",
    "Expose admin visibility without overwhelming customers",
  ],
};

export function getFullSuperAgentProjectBlueprint() {
  return fullSuperAgentProjectBlueprint;
}
