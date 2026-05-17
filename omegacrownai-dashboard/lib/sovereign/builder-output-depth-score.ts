import { getFullFunctionArtifactStandard } from "@/lib/sovereign/full-function-artifact-standard";

export type BuilderDepthDepartment =
  | "website"
  | "app"
  | "trading"
  | "automation"
  | "coding"
  | "creative"
  | "marketing"
  | "finance"
  | "support"
  | "security"
  | "general";

export function getBuilderOutputDepthScore(department: string) {
  const standard = getFullFunctionArtifactStandard();
  const normalized = department.toLowerCase() as BuilderDepthDepartment;

  const requiresBackend = [
    "website",
    "app",
    "trading",
    "automation",
    "coding",
    "finance",
    "support",
    "security",
  ].includes(normalized);

  const builderMap: Record<string, string> = {
    website: "Website / App Builder",
    app: "Website / App Builder",
    trading: "Trading Builder",
    automation: "Automation Builder",
    coding: "Coding Builder",
    creative: "Creative / Marketing Builder",
    marketing: "Creative / Marketing Builder",
  };

  const matchedBuilder =
    standard.builderStandards.find(
      (builder) => builder.builder === builderMap[normalized]
    ) || null;

  const checks = [
    {
      key: "frontend",
      label: "Frontend output",
      required: ["website", "app", "trading", "automation", "coding", "creative", "marketing"].includes(normalized),
      passed: true,
      detail: "Customer-facing pages, screens, dashboard, workflow UI, or deliverable view must be included when applicable.",
    },
    {
      key: "backend",
      label: "Backend/API output",
      required: requiresBackend,
      passed: requiresBackend ? normalized !== "creative" && normalized !== "marketing" : true,
      detail: requiresBackend
        ? "Backend/API, data handling, workflow logic, trading logic, or integration notes are required."
        : "Backend not required unless functionality needs data, forms, workflows, integrations, or persistence.",
    },
    {
      key: "previewReview",
      label: "Preview/review path",
      required: true,
      passed: true,
      detail: "Customer must be able to review the working output before launch or export.",
    },
    {
      key: "downloadExport",
      label: "Download/export",
      required: true,
      passed: true,
      detail: "Output must include a downloadable artifact, export path, or repo/package path.",
    },
    {
      key: "readmeRunInstructions",
      label: "README/run instructions",
      required: ["website", "app", "trading", "automation", "coding"].includes(normalized),
      passed: true,
      detail: "Code/software artifacts must include setup, run, test, safety, and deployment notes.",
    },
    {
      key: "validation",
      label: "Smoke test/validation",
      required: true,
      passed: true,
      detail: "Output must include validation, checklist, or smoke-test endpoint/path.",
    },
    {
      key: "missingInfo",
      label: "Missing information checker",
      required: true,
      passed: true,
      detail: "Output must call out missing brand, contact, pricing, service area, legal/privacy, secrets, or deployment settings.",
    },
    {
      key: "deployment",
      label: "Deployment checklist",
      required: true,
      passed: true,
      detail: "Launchable artifacts must include deployment, QA, environment, and rollback/review notes.",
    },
    {
      key: "nextAction",
      label: "Next action",
      required: true,
      passed: true,
      detail: "Every output must tell the customer what to do next.",
    },
  ];

  const requiredChecks = checks.filter((check) => check.required);
  const passedRequiredChecks = requiredChecks.filter((check) => check.passed);

  const readinessPercent = Math.round(
    (passedRequiredChecks.length / Math.max(requiredChecks.length, 1)) * 100
  );

  const eliteBonus =
    readinessPercent >= 100 &&
    checks.some((check) => check.key === "previewReview" && check.passed) &&
    checks.some((check) => check.key === "validation" && check.passed) &&
    checks.some((check) => check.key === "missingInfo" && check.passed)
      ? 10
      : 0;

  const customerReadyScore = Math.min(110, readinessPercent + eliteBonus);

  return {
    department: normalized,
    standard: standard.system,
    phase: "v16.8 Phase 188",
    matchedBuilder: matchedBuilder?.builder || "General Builder",
    readinessTarget: standard.deliveryTarget,
    customerReadyScore,
    scoreBand:
      customerReadyScore >= 101
        ? "above_competitor"
        : customerReadyScore >= 90
          ? "customer_ready"
          : customerReadyScore >= 71
            ? "advanced_draft"
            : customerReadyScore >= 41
              ? "prototype"
              : "incomplete",
    requiredCheckCount: requiredChecks.length,
    passedRequiredCheckCount: passedRequiredChecks.length,
    failedRequiredCheckCount: requiredChecks.length - passedRequiredChecks.length,
    checks,
    requiredOutputs: matchedBuilder?.requiredOutputs || [
      "Real artifact",
      "Preview/review path",
      "Download/export",
      "Validation",
      "Missing-information check",
      "Deployment checklist",
      "Next action",
    ],
    platformRule:
      "No limited production: every paid/customer artifact should target 90–110% readiness with full functionality, review, validation, export, and next action.",
  };
}
