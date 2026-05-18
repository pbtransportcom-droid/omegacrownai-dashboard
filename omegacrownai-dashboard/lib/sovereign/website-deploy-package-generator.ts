import { getFullStackBuilderRuntime } from "@/lib/sovereign/full-stack-builder-runtime";
import { getWebsiteBackendApiGenerator } from "@/lib/sovereign/website-backend-api-generator";
import { getWebsiteDatabaseSchemaGenerator } from "@/lib/sovereign/website-database-schema-generator";
import { getWebsiteAdminPanelGenerator } from "@/lib/sovereign/website-admin-panel-generator";
import { getWebsitePreviewSandbox } from "@/lib/sovereign/website-preview-sandbox";

export function getWebsiteDeployPackageGenerator() {
  const runtime = getFullStackBuilderRuntime();
  const backend = getWebsiteBackendApiGenerator();
  const database = getWebsiteDatabaseSchemaGenerator();
  const admin = getWebsiteAdminPanelGenerator();
  const preview = getWebsitePreviewSandbox();

  return {
    system: "OmegaCrownAI Website Deploy Package Generator",
    phase: "v23.5 Phase 255",
    status: "website_deploy_package_generator_ready",
    purpose:
      "Define the deploy/export package generator required for customer-ready website/app artifacts so customers receive a complete runnable package with files, README, env template, build steps, preview, validation, and deployment guidance.",
    corePrinciple:
      "A generated website/app is not customer-ready unless it can be reviewed, exported, installed, built, run, deployed, and validated with clear instructions and no hidden missing layers.",

    deployPackageManifest: {
      packageName: "generated-full-stack-website-app",
      packageType: "full_stack_artifact_bundle",
      requiredTopLevelFiles: [
        "README.md",
        "package.json",
        ".env.example",
        "deployment.md",
        "artifact-manifest.json",
        "validation-report.json",
        "missing-info-report.md",
      ],
      requiredDirectories: [
        "app",
        "app/api",
        "app/admin",
        "components",
        "components/admin",
        "components/preview",
        "lib/generated",
        "prisma or database",
      ],
      optionalDirectories: [
        "public",
        "scripts",
        "docker",
        "tests",
      ],
    },

    generatedProjectFileStructure: [
      "README.md",
      "package.json",
      ".env.example",
      "deployment.md",
      "artifact-manifest.json",
      "validation-report.json",
      "missing-info-report.md",
      "app/page.tsx",
      "app/api/contact/route.ts",
      "app/api/orders/route.ts",
      "app/api/admin/submissions/route.ts",
      "app/admin/page.tsx",
      "app/admin/submissions/page.tsx",
      "components/admin/SubmissionTable.tsx",
      "components/preview/PreviewBanner.tsx",
      "components/preview/PreviewValidationPanel.tsx",
      "lib/generated/types.ts",
      "lib/generated/validation.ts",
      "lib/generated/submission-store.ts",
      "lib/generated/preview-data.ts",
      "prisma/schema.prisma or database/schema.sql",
    ],

    readmeSections: [
      "Project overview",
      "Generated features",
      "Frontend routes",
      "Backend/API routes",
      "Database/schema setup",
      "Admin review workflow",
      "Preview sandbox",
      "Environment variables",
      "Install commands",
      "Build commands",
      "Run commands",
      "Deployment instructions",
      "Validation report",
      "Missing information",
      "Customer-ready status",
    ],

    environmentTemplate: [
      {
        key: "DATABASE_URL",
        requiredWhen: "database persistence is enabled",
        example: "postgresql://user:password@localhost:5432/generated_app",
      },
      {
        key: "NEXT_PUBLIC_SITE_URL",
        requiredWhen: "deployment preview or production URL is needed",
        example: "https://example.com",
      },
      {
        key: "OWNER_EMAIL",
        requiredWhen: "contact/order notifications are enabled",
        example: "owner@example.com",
      },
      {
        key: "ADMIN_AUTH_SECRET",
        requiredWhen: "admin route protection is enabled",
        example: "replace-with-secure-secret",
      },
      {
        key: "PAYMENT_PROVIDER_KEY",
        requiredWhen: "payment provider is configured",
        example: "optional until payment integration is selected",
      },
    ],

    deploymentTargets: [
      {
        target: "Vercel",
        requirements: [
          "push generated package to Git repository",
          "set environment variables",
          "run npm install",
          "run npm run build",
          "deploy Next.js app",
        ],
      },
      {
        target: "Node/PM2 VPS",
        requirements: [
          "copy package to server",
          "install dependencies",
          "configure .env",
          "run npm run build",
          "start with next start or PM2",
          "verify HTTP 200 routes",
        ],
      },
      {
        target: "Docker",
        requirements: [
          "generate Dockerfile",
          "generate docker-compose.yml if database is included",
          "configure .env",
          "docker compose up --build",
          "verify healthcheck route",
        ],
      },
    ],

    artifactExportRules: [
      "Export package must include generated source files.",
      "Export package must include README and deployment instructions.",
      "Export package must include .env.example, never real .env secrets.",
      "Export package must include artifact-manifest.json.",
      "Export package must include validation-report.json.",
      "Export package must include missing-info-report.md.",
      "Export package must include preview instructions.",
      "Export package must not include raw secrets, tokens, API keys, passwords, or private keys.",
      "Export package must not be labeled customer-ready if required layers are missing.",
    ],

    deploymentValidationGate: {
      minimumCustomerReadyScore: 90,
      requiredChecks: [
        "README exists.",
        "package.json exists.",
        ".env.example exists without secrets.",
        "Frontend files exist.",
        "Backend/API files exist.",
        "Database/schema file exists or static-only exemption is documented.",
        "Admin/review files exist.",
        "Preview instructions or preview route exists.",
        "Validation report exists.",
        "Missing-info report exists.",
        "Deployment instructions exist.",
        "Artifact manifest exists.",
      ],
      customerReadyRule:
        "Do not mark artifact customer-ready until deploy package includes source files, backend/API, database/schema or exemption, admin/review, preview, README, env template, validation report, missing-info report, and deployment instructions.",
    },

    biscuitShopDeployPackageExample: {
      projectType: "biscuit shop website",
      requiredFiles: [
        "README.md",
        ".env.example",
        "deployment.md",
        "app/page.tsx",
        "app/api/contact/route.ts",
        "app/api/orders/route.ts",
        "app/admin/orders/page.tsx",
        "prisma/schema.prisma",
        "lib/generated/seed-data.ts",
        "validation-report.json",
        "missing-info-report.md",
        "artifact-manifest.json",
      ],
      deploymentNotes: [
        "Set business address and hours.",
        "Replace demo menu items with real items and prices.",
        "Configure owner email.",
        "Choose payment provider before live checkout.",
        "Confirm pickup/delivery rules.",
        "Run build and route smoke tests before launch.",
      ],
      customerReadyRule:
        "A biscuit shop artifact without deployable source, backend/order APIs, schema, admin review, preview, README, env template, validation, and missing-info report is not customer-ready.",
    },

    deploymentCompletenessChecks: [
      "Deploy package manifest exists.",
      "README sections are present.",
      ".env.example is present and contains no real secrets.",
      "Deployment target instructions are present.",
      "Artifact export rules block secrets.",
      "Validation gate requires 90+ customer-ready score.",
      "Biscuit shop deploy package includes backend, schema, admin, preview, and validation files.",
      "Integration sources confirm runtime/backend/database/admin/preview layers are ready.",
    ],

    integrationSources: {
      fullStackRuntimeStatus: runtime.status,
      backendGeneratorStatus: backend.status,
      databaseGeneratorStatus: database.status,
      adminGeneratorStatus: admin.status,
      previewSandboxStatus: preview.status,
      minimumCustomerReadyScore: runtime.completenessScoring.minimumCustomerReadyScore,
    },

    nextImplementationPhases: [
      "Website Full-Function Validation Runner",
      "Generated Artifact Bundle Writer",
      "Project Artifact History Integration",
      "Live Preview Artifact Route",
      "Customer Download Package Route",
    ],
  };
}
