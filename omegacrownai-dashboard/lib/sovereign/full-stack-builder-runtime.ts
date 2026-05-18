export function getFullStackBuilderRuntime() {
  return {
    system: "OmegaCrownAI Full-Stack Website/App Builder Runtime",
    phase: "v23.0 Phase 250",
    status: "full_stack_builder_runtime_foundation_ready",
    productTruth:
      "OmegaCrownAI is not finished as a full-function application builder yet. It has enterprise blueprint layers and audit/connectors foundations, but the customer artifact builder is still being upgraded into a real full-stack runtime.",
    purpose:
      "Define the runtime standard that forces website/app builds to generate customer-ready full-stack artifacts instead of only a homepage, mockup, or prompt summary.",
    corePrinciple:
      "A customer-ready website/app artifact must include frontend, backend/API logic, data model or database plan, user/customer workflows, admin/review path, preview, downloadable export, README/deployment instructions, validation, and missing-information reporting.",

    requiredArtifactLayers: [
      {
        layer: "Frontend",
        required: true,
        output:
          "Responsive UI pages, routes, components, styles, customer-facing content, accessibility basics, and call-to-action flow.",
      },
      {
        layer: "Backend/API",
        required: true,
        output:
          "Server routes or API handlers for form submissions, orders/bookings, contact requests, content operations, and project-specific business logic.",
      },
      {
        layer: "Database/Data Model",
        required: true,
        output:
          "Schema, entities, fields, relationships, seed/sample data, and persistence plan. Static-only projects must explicitly explain why a database is not required.",
      },
      {
        layer: "Admin/Owner Review",
        required: true,
        output:
          "Admin/review panel or owner workflow for reviewing leads, orders, bookings, submitted forms, generated content, and artifact state.",
      },
      {
        layer: "Preview Sandbox",
        required: true,
        output:
          "Preview route or instructions to run and inspect the generated artifact before launch.",
      },
      {
        layer: "Download/Export",
        required: true,
        output:
          "Downloadable package manifest with generated files, README, deployment notes, and validation output.",
      },
      {
        layer: "Validation",
        required: true,
        output:
          "Smoke test checklist, route checks, completeness score, missing functionality report, and production-readiness verdict.",
      },
      {
        layer: "Deployment Guide",
        required: true,
        output:
          "README with setup, env vars, install, build, run, deploy, and rollback instructions.",
      },
    ],

    runtimeBuildPhases: [
      "Classify project type and required functionality.",
      "Extract missing information and assumptions.",
      "Generate frontend file plan.",
      "Generate backend/API file plan.",
      "Generate database/data model plan.",
      "Generate admin/review workflow.",
      "Generate preview route plan.",
      "Generate downloadable artifact manifest.",
      "Generate README/deployment guide.",
      "Run completeness validation.",
      "Block customer-ready label if required layers are missing.",
      "Save generated artifact summary to project history.",
    ],

    standardOutputFileManifest: [
      "README.md",
      "package.json",
      "app/page.tsx or src/pages/Home.tsx",
      "app/api/contact/route.ts or backend/contact handler",
      "app/api/orders/route.ts or backend/order handler when applicable",
      "schema.prisma or database-schema.sql when persistence is needed",
      "admin/review page or owner dashboard component",
      "preview route or preview instructions",
      "deployment.md",
      "validation-report.json",
      "missing-info-report.md",
      "artifact-manifest.json",
    ],

    completenessScoring: {
      maximumScore: 100,
      minimumCustomerReadyScore: 90,
      scoringRules: [
        "Frontend layer present: 15 points",
        "Backend/API layer present: 15 points",
        "Database/data model present or justified: 15 points",
        "Admin/review workflow present: 10 points",
        "Preview path present: 10 points",
        "Download/export manifest present: 10 points",
        "README/deployment instructions present: 10 points",
        "Validation/smoke test present: 10 points",
        "Missing-info report present: 5 points",
      ],
      customerReadyGate:
        "Do not call an artifact customer-ready if score is below 90 or any required layer is missing.",
    },

    missingFunctionalityReportShape: {
      projectPrompt: "original user request",
      inferredProjectType: "website | app | workflow | trading | automation | mixed",
      missingInputs: [
        "business address if needed",
        "brand assets if needed",
        "service/product list if needed",
        "pricing/menu data if needed",
        "payment/booking provider if needed",
      ],
      missingLayers: [
        "frontend",
        "backend/API",
        "database/data model",
        "admin/review path",
        "preview",
        "download/export",
        "validation",
      ],
      assumptionsUsed: "safe assumptions used to continue building",
      customerReadyBlockedReason: "reason if artifact cannot be marked customer-ready",
    },

    generatedArtifactShape: {
      artifactId: "stable artifact id",
      projectId: "project id",
      prompt: "user build request",
      artifactType: "full_stack_website_app",
      frontendFiles: "array of generated frontend file descriptors",
      backendFiles: "array of generated backend/API file descriptors",
      databaseFiles: "array of generated schema/data model file descriptors",
      adminFiles: "array of admin/review file descriptors",
      previewPath: "preview URL or route",
      downloadPath: "download/export URL",
      completenessScore: "0-100",
      customerReady: "true only when score >= 90 and required layers pass",
      validationReport: "route/build/layer checks",
      missingInfoReport: "missing inputs and assumptions",
    },

    productLanguageCorrections: [
      "Do not say OmegaCrownAI is fully complete.",
      "Do not say the builder is fully functional until generated artifacts include backend, database/data model, preview, export, and validation.",
      "Use: OmegaCrownAI enterprise foundation is active, and the full-function artifact builder is being upgraded.",
      "Use: This output is a draft until full-stack validation passes.",
      "Use: Customer-ready requires 90+ completeness score and all required layers.",
    ],

    biscuitShopExpectedArtifact: {
      prompt:
        "Build me a modern biscuit shop website with menu, about section, contact section, warm colors, and order call-to-action.",
      expectedLayers: [
        "Homepage with biscuit shop branding",
        "Menu/products data model",
        "Contact form API",
        "Order inquiry or order request API",
        "Admin/review page for submitted leads/orders",
        "Preview path",
        "Downloadable project bundle",
        "README/deployment guide",
        "Validation report",
        "Missing-info report for pricing, address, payment provider, pickup/delivery rules",
      ],
      notEnough:
        "A homepage only is not enough and must not be labeled customer-ready.",
    },

    nextImplementationPhases: [
      "Website Backend/API Generator",
      "Website Database Schema Generator",
      "Website Admin Panel Generator",
      "Website Preview Sandbox",
      "Website Deploy Package Generator",
      "Website Full-Function Validation Runner",
    ],
  };
}
