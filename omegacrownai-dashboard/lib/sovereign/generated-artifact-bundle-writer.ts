import { getFullStackBuilderRuntime } from "@/lib/sovereign/full-stack-builder-runtime";
import { getWebsiteBackendApiGenerator } from "@/lib/sovereign/website-backend-api-generator";
import { getWebsiteDatabaseSchemaGenerator } from "@/lib/sovereign/website-database-schema-generator";
import { getWebsiteAdminPanelGenerator } from "@/lib/sovereign/website-admin-panel-generator";
import { getWebsitePreviewSandbox } from "@/lib/sovereign/website-preview-sandbox";
import { getWebsiteDeployPackageGenerator } from "@/lib/sovereign/website-deploy-package-generator";
import {
  getWebsiteFullFunctionValidationRunner,
  runWebsiteFullFunctionValidation,
} from "@/lib/sovereign/website-full-function-validation-runner";

export function getGeneratedArtifactBundleWriter() {
  const runtime = getFullStackBuilderRuntime();
  const backend = getWebsiteBackendApiGenerator();
  const database = getWebsiteDatabaseSchemaGenerator();
  const admin = getWebsiteAdminPanelGenerator();
  const preview = getWebsitePreviewSandbox();
  const deploy = getWebsiteDeployPackageGenerator();
  const validationRunner = getWebsiteFullFunctionValidationRunner();

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
  });

  return {
    system: "OmegaCrownAI Generated Artifact Bundle Writer",
    phase: "v23.7 Phase 257",
    status: "generated_artifact_bundle_writer_ready",
    purpose:
      "Define the bundle writer that turns a generated website/app plan into a complete file bundle with frontend, backend/API, database/schema, admin review, preview sandbox, deployment guide, validation report, missing-info report, and artifact manifest.",
    corePrinciple:
      "OmegaCrownAI must write complete customer-ready artifact bundles, not just summaries or homepage mockups. Bundle writing must preserve the full-function standard and block incomplete outputs from customer-ready status.",

    bundleWriterFlow: [
      "Receive generated artifact plan.",
      "Create stable artifactId and project folder.",
      "Write frontend files.",
      "Write backend/API files.",
      "Write database/schema files or static-only exemption.",
      "Write admin/review files.",
      "Write preview sandbox files.",
      "Write README and deployment guide.",
      "Write .env.example without secrets.",
      "Write artifact-manifest.json.",
      "Write validation-report.json.",
      "Write missing-info-report.md.",
      "Run full-function validation.",
      "Mark customer-ready only if validation passes.",
      "Expose download/export package path.",
    ],

    generatedBundleFileGroups: [
      {
        group: "frontend",
        required: true,
        files: [
          "app/page.tsx",
          "app/layout.tsx",
          "components/site/Hero.tsx",
          "components/site/Services.tsx",
          "components/site/ContactForm.tsx",
        ],
      },
      {
        group: "backend_api",
        required: true,
        files: [
          "app/api/contact/route.ts",
          "app/api/orders/route.ts",
          "app/api/leads/route.ts",
          "app/api/admin/submissions/route.ts",
        ],
      },
      {
        group: "database_schema",
        required: true,
        files: [
          "prisma/schema.prisma",
          "lib/generated/db-types.ts",
          "lib/generated/seed-data.ts",
        ],
      },
      {
        group: "admin_review",
        required: true,
        files: [
          "app/admin/page.tsx",
          "app/admin/submissions/page.tsx",
          "components/admin/SubmissionTable.tsx",
          "components/admin/MissingInfoPanel.tsx",
        ],
      },
      {
        group: "preview_sandbox",
        required: true,
        files: [
          "app/preview/[artifactId]/page.tsx",
          "app/preview/[artifactId]/admin/page.tsx",
          "components/preview/PreviewBanner.tsx",
          "components/preview/PreviewValidationPanel.tsx",
        ],
      },
      {
        group: "deploy_export",
        required: true,
        files: [
          "README.md",
          ".env.example",
          "deployment.md",
          "package.json",
          "artifact-manifest.json",
          "validation-report.json",
          "missing-info-report.md",
        ],
      },
    ],

    artifactManifestShape: {
      artifactId: "stable generated artifact id",
      projectId: "source project id",
      artifactType: "full_stack_website_app",
      generatedAt: "ISO timestamp",
      customerReady: "boolean",
      completenessScore: "0-100",
      fileGroups: "frontend/backend/database/admin/preview/deploy groups",
      downloadPath: "download/export route",
      previewPath: "preview route",
      adminPreviewPath: "admin preview route",
      validationReportPath: "validation-report.json",
      missingInfoReportPath: "missing-info-report.md",
    },

    writeSafetyRules: [
      "Do not write raw secrets into generated files.",
      "Do not include real .env values in export package.",
      "Write .env.example only.",
      "Do not label homepage-only bundles customer-ready.",
      "Do not mark customer-ready if backend/API files are missing.",
      "Do not mark customer-ready if database/schema is missing without documented static-only exemption.",
      "Do not mark customer-ready if admin/review path is missing.",
      "Do not mark customer-ready if preview/export/validation reports are missing.",
    ],

    reportWriters: [
      {
        report: "artifact-manifest.json",
        purpose: "List generated files, file groups, preview/download paths, and customer-ready status.",
      },
      {
        report: "validation-report.json",
        purpose: "Store full-function validation checks, score, missing layers, and verdict.",
      },
      {
        report: "missing-info-report.md",
        purpose: "Explain missing business inputs, assumptions, and blocked customer-ready reasons.",
      },
      {
        report: "deployment.md",
        purpose: "Explain setup, environment variables, build, run, deploy, and rollback.",
      },
    ],

    downloadablePackagePlan: {
      routePattern: "/api/projects/[projectId]/artifacts/[artifactId]/download",
      contentType: "application/zip",
      includes: [
        "generated source files",
        "README.md",
        ".env.example",
        "deployment.md",
        "artifact-manifest.json",
        "validation-report.json",
        "missing-info-report.md",
      ],
      excludes: [
        ".env",
        "raw secrets",
        "tokens",
        "API keys",
        "passwords",
        "private keys",
        "node_modules",
      ],
    },

    biscuitShopBundleExample: {
      projectType: "biscuit shop website",
      generatedFiles: [
        "app/page.tsx",
        "components/site/Menu.tsx",
        "components/site/OrderForm.tsx",
        "app/api/contact/route.ts",
        "app/api/orders/route.ts",
        "app/api/admin/submissions/route.ts",
        "prisma/schema.prisma",
        "lib/generated/seed-data.ts",
        "app/admin/orders/page.tsx",
        "app/preview/[artifactId]/page.tsx",
        "README.md",
        ".env.example",
        "deployment.md",
        "artifact-manifest.json",
        "validation-report.json",
        "missing-info-report.md",
      ],
      requiredBusinessInputs: [
        "real menu items",
        "prices",
        "business address",
        "opening hours",
        "pickup/delivery rules",
        "owner notification email",
        "payment provider if live checkout is requested",
      ],
      completeValidation,
      homepageOnlyValidation,
      customerReadyRule:
        "A biscuit shop bundle must fail if it only contains a homepage. It passes only when full-stack files, reports, preview, deployment guide, and validation are included.",
    },

    bundleCompletenessChecks: [
      "Bundle writer flow includes file writing, reports, validation, and export path.",
      "Generated bundle file groups include frontend, backend/API, database, admin, preview, and deploy/export.",
      "Artifact manifest shape includes customer-ready status and score.",
      "Write safety rules block secrets and partial outputs.",
      "Report writers include manifest, validation, missing-info, and deployment reports.",
      "Downloadable package plan excludes secrets and node_modules.",
      "Biscuit shop example includes full-stack bundle files.",
      "Homepage-only validation fails.",
      "Complete full-stack validation passes.",
      "Integration sources confirm all generator layers are ready.",
    ],

    integrationSources: {
      fullStackRuntimeStatus: runtime.status,
      backendGeneratorStatus: backend.status,
      databaseGeneratorStatus: database.status,
      adminGeneratorStatus: admin.status,
      previewSandboxStatus: preview.status,
      deployPackageGeneratorStatus: deploy.status,
      validationRunnerStatus: validationRunner.status,
      minimumCustomerReadyScore: runtime.completenessScoring.minimumCustomerReadyScore,
    },

    nextImplementationPhases: [
      "Project Artifact History Integration",
      "Live Preview Artifact Route",
      "Customer Download Package Route",
      "Real Full-Stack Artifact Generator Implementation",
      "Builder UI Full-Function Output Panel",
    ],
  };
}
