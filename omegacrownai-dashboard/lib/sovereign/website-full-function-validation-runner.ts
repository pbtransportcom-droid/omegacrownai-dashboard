import { getFullStackBuilderRuntime } from "@/lib/sovereign/full-stack-builder-runtime";
import { getWebsiteBackendApiGenerator } from "@/lib/sovereign/website-backend-api-generator";
import { getWebsiteDatabaseSchemaGenerator } from "@/lib/sovereign/website-database-schema-generator";
import { getWebsiteAdminPanelGenerator } from "@/lib/sovereign/website-admin-panel-generator";
import { getWebsitePreviewSandbox } from "@/lib/sovereign/website-preview-sandbox";
import { getWebsiteDeployPackageGenerator } from "@/lib/sovereign/website-deploy-package-generator";

type LayerValidationInput = {
  frontend?: boolean;
  backend?: boolean;
  database?: boolean;
  admin?: boolean;
  preview?: boolean;
  exportPackage?: boolean;
  deploymentGuide?: boolean;
  validationReport?: boolean;
  missingInfoReport?: boolean;
};

const layerWeights = [
  { key: "frontend", label: "Frontend", points: 15 },
  { key: "backend", label: "Backend/API", points: 15 },
  { key: "database", label: "Database/Data Model", points: 15 },
  { key: "admin", label: "Admin/Owner Review", points: 10 },
  { key: "preview", label: "Preview Sandbox", points: 10 },
  { key: "exportPackage", label: "Download/Export Package", points: 10 },
  { key: "deploymentGuide", label: "Deployment Guide", points: 10 },
  { key: "validationReport", label: "Validation Report", points: 10 },
  { key: "missingInfoReport", label: "Missing-Information Report", points: 5 },
] as const;

export function runWebsiteFullFunctionValidation(input: LayerValidationInput = {}) {
  const normalized = {
    frontend: input.frontend === true,
    backend: input.backend === true,
    database: input.database === true,
    admin: input.admin === true,
    preview: input.preview === true,
    exportPackage: input.exportPackage === true,
    deploymentGuide: input.deploymentGuide === true,
    validationReport: input.validationReport === true,
    missingInfoReport: input.missingInfoReport === true,
  };

  const checks = layerWeights.map((layer) => ({
    layer: layer.label,
    key: layer.key,
    passed: normalized[layer.key],
    points: normalized[layer.key] ? layer.points : 0,
    maxPoints: layer.points,
  }));

  const score = checks.reduce((sum, check) => sum + check.points, 0);
  const missingLayers = checks.filter((check) => !check.passed).map((check) => check.layer);
  const customerReady = score >= 90 && missingLayers.length === 0;

  return {
    ok: true,
    score,
    maximumScore: 100,
    minimumCustomerReadyScore: 90,
    customerReady,
    missingLayers,
    blockedReasons: customerReady
      ? []
      : [
          ...(score < 90 ? [`Completeness score ${score} is below required 90.`] : []),
          ...(missingLayers.length ? [`Missing required layers: ${missingLayers.join(", ")}.`] : []),
        ],
    checks,
    verdict: customerReady
      ? "customer_ready_full_function_artifact"
      : "not_customer_ready_missing_required_functionality",
  };
}

export function getWebsiteFullFunctionValidationRunner() {
  const runtime = getFullStackBuilderRuntime();
  const backend = getWebsiteBackendApiGenerator();
  const database = getWebsiteDatabaseSchemaGenerator();
  const admin = getWebsiteAdminPanelGenerator();
  const preview = getWebsitePreviewSandbox();
  const deploy = getWebsiteDeployPackageGenerator();

  const completeValidation = runWebsiteFullFunctionValidation({
    frontend: true,
    backend: true,
    database: true,
    admin: true,
    preview: true,
    exportPackage: true,
    deploymentGuide: true,
    validationReport: true,
    missingInfoReport: true,
  });

  const homepageOnlyValidation = runWebsiteFullFunctionValidation({
    frontend: true,
    backend: false,
    database: false,
    admin: false,
    preview: false,
    exportPackage: false,
    deploymentGuide: false,
    validationReport: false,
    missingInfoReport: false,
  });

  const biscuitShopValidation = runWebsiteFullFunctionValidation({
    frontend: true,
    backend: true,
    database: true,
    admin: true,
    preview: true,
    exportPackage: true,
    deploymentGuide: true,
    validationReport: true,
    missingInfoReport: true,
  });

  return {
    system: "OmegaCrownAI Website Full-Function Validation Runner",
    phase: "v23.6 Phase 256",
    status: "website_full_function_validation_runner_ready",
    purpose:
      "Define the validation runner that blocks homepage-only or partial generated websites/apps from being labeled customer-ready unless frontend, backend/API, database/data model, admin review, preview, export, deployment, validation, and missing-info reporting are present.",
    corePrinciple:
      "Customer-ready means full-function. OmegaCrownAI must validate every generated website/app artifact before allowing customer-ready status.",

    validationLayers: layerWeights.map((layer) => ({
      layer: layer.label,
      key: layer.key,
      points: layer.points,
      required: true,
    })),

    customerReadyGate: {
      minimumScore: 90,
      requiresAllLayers: true,
      homepageOnlyBlocked: true,
      rule:
        "Do not mark artifact customer-ready if any required layer is missing or if score is below 90.",
    },

    validationReportShape: {
      artifactId: "generated artifact id",
      projectId: "project id",
      score: "0-100",
      customerReady: "boolean",
      verdict: "customer_ready_full_function_artifact | not_customer_ready_missing_required_functionality",
      checks: "layer-by-layer validation checks",
      missingLayers: "required layers not present",
      blockedReasons: "why customer-ready is blocked",
      generatedAt: "ISO timestamp",
    },

    missingFunctionalityReportShape: {
      missingBackend: "backend/API routes missing or incomplete",
      missingDatabase: "database/data model missing or static-only exemption absent",
      missingAdmin: "owner/admin review path missing",
      missingPreview: "preview sandbox missing",
      missingExport: "download/export package missing",
      missingDeploymentGuide: "README/deployment guide missing",
      missingValidation: "validation report missing",
      missingBusinessInputs: [
        "business address",
        "pricing/menu data",
        "payment provider",
        "opening hours",
        "pickup/delivery rules",
        "owner notification email",
      ],
    },

    validationModes: [
      {
        mode: "strict_customer_ready",
        rule: "Requires score >= 90 and all required layers.",
      },
      {
        mode: "draft_preview",
        rule: "Allows partial output but labels it draft, not customer-ready.",
      },
      {
        mode: "missing_info_review",
        rule: "Shows missing inputs and assumptions before launch.",
      },
    ],

    biscuitShopValidationExample: {
      projectType: "biscuit shop website",
      requiredToPass: [
        "homepage/menu/contact frontend",
        "contact API",
        "order inquiry API",
        "MenuItem model",
        "OrderInquiry model",
        "ContactSubmission model",
        "admin order/contact/menu review",
        "preview sandbox with demo biscuit data",
        "downloadable deploy package",
        "README/deployment guide",
        "validation-report.json",
        "missing-info-report.md",
      ],
      completeValidation,
      homepageOnlyValidation,
      customerReadyRule:
        "A biscuit shop homepage alone must fail validation. It only becomes customer-ready when backend, schema, admin, preview, export, deployment, validation, and missing-info reporting pass.",
    },

    validationRunnerCompletenessChecks: [
      "Validation layers are weighted to 100 points.",
      "Minimum customer-ready score is 90.",
      "All required layers must pass.",
      "Homepage-only output is blocked.",
      "Missing functionality report is generated.",
      "Biscuit shop example proves homepage-only fails.",
      "Complete full-stack artifact passes.",
      "Integration sources confirm runtime/backend/database/admin/preview/deploy layers are ready.",
    ],

    integrationSources: {
      fullStackRuntimeStatus: runtime.status,
      backendGeneratorStatus: backend.status,
      databaseGeneratorStatus: database.status,
      adminGeneratorStatus: admin.status,
      previewSandboxStatus: preview.status,
      deployPackageGeneratorStatus: deploy.status,
      minimumCustomerReadyScore: runtime.completenessScoring.minimumCustomerReadyScore,
    },

    nextImplementationPhases: [
      "Generated Artifact Bundle Writer",
      "Project Artifact History Integration",
      "Live Preview Artifact Route",
      "Customer Download Package Route",
      "Real Full-Stack Artifact Generator Implementation",
    ],
  };
}
