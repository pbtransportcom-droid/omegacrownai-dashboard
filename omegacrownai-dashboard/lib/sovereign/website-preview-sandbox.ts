import { getFullStackBuilderRuntime } from "@/lib/sovereign/full-stack-builder-runtime";
import { getWebsiteBackendApiGenerator } from "@/lib/sovereign/website-backend-api-generator";
import { getWebsiteDatabaseSchemaGenerator } from "@/lib/sovereign/website-database-schema-generator";
import { getWebsiteAdminPanelGenerator } from "@/lib/sovereign/website-admin-panel-generator";

export function getWebsitePreviewSandbox() {
  const runtime = getFullStackBuilderRuntime();
  const backend = getWebsiteBackendApiGenerator();
  const database = getWebsiteDatabaseSchemaGenerator();
  const admin = getWebsiteAdminPanelGenerator();

  return {
    system: "OmegaCrownAI Website Preview Sandbox",
    phase: "v23.4 Phase 254",
    status: "website_preview_sandbox_ready",
    purpose:
      "Define the preview sandbox layer required for customer-ready website/app artifacts so customers can inspect frontend pages, backend/API behavior, demo data, admin review flows, and validation status before launch.",
    corePrinciple:
      "A generated website/app must include a safe preview path before it can be called customer-ready. Preview must show the working frontend, simulated backend submissions, demo persistence, admin review, missing-info warnings, and export readiness.",

    previewRoutePlan: {
      routePattern: "/preview/[artifactId]",
      adminRoutePattern: "/preview/[artifactId]/admin",
      apiRoutePattern: "/preview/[artifactId]/api/*",
      downloadRoutePattern: "/preview/[artifactId]/download",
      purpose:
        "Provide isolated preview URLs for generated artifacts without mixing preview data into production.",
    },

    requiredPreviewCoverage: [
      {
        area: "Frontend Preview",
        requirement:
          "Show generated public pages with responsive layout, navigation, content sections, forms, calls-to-action, and brand styling.",
      },
      {
        area: "Backend/API Preview",
        requirement:
          "Allow demo form/order/booking/contact submissions to hit generated preview handlers or mocked safe adapters.",
      },
      {
        area: "Database/Data Preview",
        requirement:
          "Use demo seed data or preview storage adapter so customers can see menu/products/submissions without production data.",
      },
      {
        area: "Admin Preview",
        requirement:
          "Show owner/admin review dashboard with demo submissions, status workflow, missing-info panel, and safe review actions.",
      },
      {
        area: "Validation Preview",
        requirement:
          "Show completeness score, missing layers, smoke-test status, and customer-ready gate.",
      },
      {
        area: "Export Preview",
        requirement:
          "Show artifact manifest and download/export readiness.",
      },
    ],

    previewModeRules: [
      "Preview mode must be clearly labeled.",
      "Preview data must be demo/sample data unless connected to a real project database.",
      "Preview submissions must not be treated as real customer production records.",
      "Preview must not expose secrets, tokens, API keys, private keys, or internal stack traces.",
      "Preview admin routes must show demo protection warning until real auth is configured.",
      "Preview must show missing information before customer-ready approval.",
      "Preview must show whether backend/API, database, admin, export, and validation layers are present.",
      "Preview must block customer-ready status when required layers are missing.",
    ],

    sandboxIsolationRules: [
      "Preview artifact data should be scoped by artifactId.",
      "Preview storage should be isolated from production customer data.",
      "Preview API routes should use generated safe handlers or demo adapters.",
      "Preview admin actions should update demo status only unless production persistence is explicitly configured.",
      "Preview routes should not require live payment, live trading, or destructive external actions.",
      "Preview logs should not include raw secrets.",
    ],

    generatedPreviewFileManifest: [
      "app/preview/[artifactId]/page.tsx",
      "app/preview/[artifactId]/admin/page.tsx",
      "app/preview/[artifactId]/download/route.ts",
      "app/preview/[artifactId]/api/contact/route.ts",
      "app/preview/[artifactId]/api/orders/route.ts",
      "components/preview/PreviewBanner.tsx",
      "components/preview/PreviewValidationPanel.tsx",
      "components/preview/PreviewMissingInfoPanel.tsx",
      "lib/generated/preview-data.ts",
      "lib/generated/preview-store.ts",
      "validation-report.json preview checks",
      "README.md preview section",
    ],

    previewValidationGate: {
      minimumCustomerReadyScore: 90,
      requiredPreviewChecks: [
        "Public preview route exists.",
        "Admin preview route exists.",
        "Demo submission flow exists for generated public forms.",
        "Preview data is isolated by artifactId.",
        "Missing-info panel is visible.",
        "Validation/completeness panel is visible.",
        "Download/export preview route exists.",
        "Preview mode does not expose secrets.",
      ],
      customerReadyRule:
        "Do not mark generated artifact customer-ready until preview route, admin review, backend/API demo flow, database/demo data, validation panel, and export path are present.",
    },

    biscuitShopPreviewExample: {
      projectType: "biscuit shop website",
      publicPreview: [
        "homepage",
        "menu section with demo biscuit items",
        "order inquiry form",
        "contact form",
        "newsletter signup",
      ],
      adminPreview: [
        "new order inquiry",
        "contact submission",
        "subscriber list",
        "menu/product review",
        "missing pricing/payment/pickup rules",
      ],
      demoData: [
        "Classic Butter Biscuit",
        "Honey Glazed Biscuit",
        "Savory Cheddar Biscuit",
        "sample order inquiry",
        "sample contact submission",
      ],
      customerReadyRule:
        "A biscuit shop artifact without a working preview of menu, order/contact forms, admin review, missing-info warnings, and export path is not customer-ready.",
    },

    previewCompletenessChecks: [
      "Preview route exists.",
      "Admin preview route exists.",
      "Preview banner labels sandbox/demo mode.",
      "Demo data exists where useful.",
      "Generated forms connect to preview backend handlers or safe adapters.",
      "Admin preview can review demo submissions.",
      "Missing-info panel is visible.",
      "Validation panel is visible.",
      "Download/export preview route exists.",
      "No secrets are exposed in preview.",
    ],

    integrationSources: {
      fullStackRuntimeStatus: runtime.status,
      backendGeneratorStatus: backend.status,
      databaseGeneratorStatus: database.status,
      adminGeneratorStatus: admin.status,
      minimumCustomerReadyScore: runtime.completenessScoring.minimumCustomerReadyScore,
    },

    nextImplementationPhases: [
      "Website Deploy Package Generator",
      "Website Full-Function Validation Runner",
      "Generated Artifact Bundle Writer",
      "Project Artifact History Integration",
      "Live Preview Artifact Route",
    ],
  };
}
