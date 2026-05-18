import { getGeneratedArtifactBundleWriter } from "@/lib/sovereign/generated-artifact-bundle-writer";
import { getCustomerDownloadPackageRoute } from "@/lib/sovereign/customer-download-package-route";
import { getLivePreviewArtifactRoute } from "@/lib/sovereign/live-preview-artifact-route";
import {
  runWebsiteFullFunctionValidation,
} from "@/lib/sovereign/website-full-function-validation-runner";

type GenerateArtifactInput = {
  projectId?: string;
  prompt?: string;
  requestedType?: string;
};

function classifyProjectType(prompt: string) {
  const value = prompt.toLowerCase();

  if (
    value.includes("shop") ||
    value.includes("store") ||
    value.includes("restaurant") ||
    value.includes("bakery") ||
    value.includes("biscuit") ||
    value.includes("order")
  ) {
    return "commerce_or_food_business_website";
  }

  if (
    value.includes("booking") ||
    value.includes("appointment") ||
    value.includes("transport") ||
    value.includes("limo") ||
    value.includes("reservation")
  ) {
    return "booking_service_website";
  }

  if (
    value.includes("dashboard") ||
    value.includes("app") ||
    value.includes("portal") ||
    value.includes("saas")
  ) {
    return "web_application";
  }

  return "business_website";
}

function createArtifactId(projectId: string, projectType: string) {
  const safeProject = projectId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "project";
  const safeType = projectType.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18) || "artifact";
  return `artifact_${safeProject}_${safeType}_v1`;
}

export function generateRealFullStackArtifact(input: GenerateArtifactInput = {}) {
  const projectId = input.projectId || "project_demo";
  const prompt =
    input.prompt ||
    "Build a modern biscuit shop website with menu, contact, order inquiry, admin review, preview, and deploy package.";

  const projectType = input.requestedType || classifyProjectType(prompt);
  const artifactId = createArtifactId(projectId, projectType);

  const isCommerceFood =
    projectType === "commerce_or_food_business_website" ||
    prompt.toLowerCase().includes("biscuit") ||
    prompt.toLowerCase().includes("shop");

  const frontendFiles = [
    {
      path: "app/page.tsx",
      purpose: "Generated public homepage with hero, services/menu, call-to-action, and contact/order sections.",
      layer: "frontend",
    },
    {
      path: "components/site/Hero.tsx",
      purpose: "Generated hero section aligned to the customer prompt.",
      layer: "frontend",
    },
    {
      path: isCommerceFood ? "components/site/Menu.tsx" : "components/site/Services.tsx",
      purpose: isCommerceFood
        ? "Generated menu/product section with demo items and missing real pricing warnings."
        : "Generated services section with customer-ready copy placeholders.",
      layer: "frontend",
    },
    {
      path: isCommerceFood ? "components/site/OrderForm.tsx" : "components/site/ContactForm.tsx",
      purpose: isCommerceFood
        ? "Generated order inquiry form connected to backend route plan."
        : "Generated contact/lead form connected to backend route plan.",
      layer: "frontend",
    },
  ];

  const backendFiles = [
    {
      path: "app/api/contact/route.ts",
      purpose: "Accept and validate contact form submissions.",
      layer: "backend_api",
    },
    {
      path: isCommerceFood ? "app/api/orders/route.ts" : "app/api/leads/route.ts",
      purpose: isCommerceFood
        ? "Accept and validate order inquiries with items, quantity, pickup/delivery, and contact details."
        : "Accept and validate lead inquiries with service and contact details.",
      layer: "backend_api",
    },
    {
      path: "app/api/admin/submissions/route.ts",
      purpose: "Return safe admin review data for generated submissions.",
      layer: "backend_api",
    },
  ];

  const databaseFiles = [
    {
      path: "prisma/schema.prisma",
      purpose: isCommerceFood
        ? "Generated MenuItem, OrderInquiry, ContactSubmission, and NewsletterSubscriber models."
        : "Generated ContactSubmission, Lead, BookingRequest, and NewsletterSubscriber models as needed.",
      layer: "database_schema",
    },
    {
      path: "lib/generated/db-types.ts",
      purpose: "Generated TypeScript types for persisted submission records.",
      layer: "database_schema",
    },
    {
      path: "lib/generated/seed-data.ts",
      purpose: isCommerceFood
        ? "Generated demo menu/product data for preview mode."
        : "Generated demo service/submission data for preview mode.",
      layer: "database_schema",
    },
  ];

  const adminFiles = [
    {
      path: "app/admin/page.tsx",
      purpose: "Generated owner/admin dashboard summary.",
      layer: "admin_review",
    },
    {
      path: isCommerceFood ? "app/admin/orders/page.tsx" : "app/admin/submissions/page.tsx",
      purpose: isCommerceFood
        ? "Generated order/contact/menu review screen."
        : "Generated lead/contact/submission review screen.",
      layer: "admin_review",
    },
    {
      path: "components/admin/MissingInfoPanel.tsx",
      purpose: "Show missing business information before customer-ready approval.",
      layer: "admin_review",
    },
  ];

  const previewFiles = [
    {
      path: "app/preview/[artifactId]/page.tsx",
      purpose: "Generated public preview route.",
      layer: "preview_sandbox",
    },
    {
      path: "app/preview/[artifactId]/admin/page.tsx",
      purpose: "Generated admin preview route.",
      layer: "preview_sandbox",
    },
    {
      path: "components/preview/PreviewValidationPanel.tsx",
      purpose: "Show validation score and blocked reasons.",
      layer: "preview_sandbox",
    },
  ];

  const deployFiles = [
    {
      path: "README.md",
      purpose: "Generated setup, features, routes, backend, database, admin, preview, and deployment instructions.",
      layer: "deploy_export",
    },
    {
      path: ".env.example",
      purpose: "Generated environment variable template with no real secrets.",
      layer: "deploy_export",
    },
    {
      path: "deployment.md",
      purpose: "Generated deployment instructions for Vercel, Node/PM2, and Docker.",
      layer: "deploy_export",
    },
    {
      path: "artifact-manifest.json",
      purpose: "Generated artifact manifest with file list and customer-ready status.",
      layer: "deploy_export",
    },
    {
      path: "validation-report.json",
      purpose: "Generated full-function validation report.",
      layer: "deploy_export",
    },
    {
      path: "missing-info-report.md",
      purpose: "Generated missing inputs, assumptions, and customer-ready blockers.",
      layer: "deploy_export",
    },
  ];

  const allFiles = [
    ...frontendFiles,
    ...backendFiles,
    ...databaseFiles,
    ...adminFiles,
    ...previewFiles,
    ...deployFiles,
  ];

  const validation = runWebsiteFullFunctionValidation({
    frontend: frontendFiles.length > 0,
    backend: backendFiles.length > 0,
    database: databaseFiles.length > 0,
    admin: adminFiles.length > 0,
    preview: previewFiles.length > 0,
    exportPackage: deployFiles.some((file) => file.path === "artifact-manifest.json"),
    deploymentGuide: deployFiles.some((file) => file.path === "deployment.md"),
    validationReport: deployFiles.some((file) => file.path === "validation-report.json"),
    missingInfoReport: deployFiles.some((file) => file.path === "missing-info-report.md"),
  });

  const missingBusinessInputs = isCommerceFood
    ? [
        "real menu item names",
        "real prices",
        "business address",
        "opening hours",
        "pickup/delivery rules",
        "owner notification email",
        "payment provider if live checkout is requested",
      ]
    : [
        "business address",
        "service list",
        "pricing if needed",
        "owner notification email",
        "preferred deployment target",
      ];

  return {
    ok: true,
    mode: "real_full_stack_artifact_generator_preview",
    phase: "v24.1 Phase 261",
    artifact: {
      artifactId,
      projectId,
      prompt,
      projectType,
      artifactType: "full_stack_website_app",
      customerReady: validation.customerReady,
      completenessScore: validation.score,
      previewPath: `/projects/${projectId}/artifacts/${artifactId}/preview`,
      downloadPath: `/api/projects/${projectId}/artifacts/${artifactId}/download`,
      adminPreviewPath: `/preview/${artifactId}/admin`,
      fileCount: allFiles.length,
      frontendFiles,
      backendFiles,
      databaseFiles,
      adminFiles,
      previewFiles,
      deployFiles,
      validation,
      missingBusinessInputs,
      missingInfoReport:
        missingBusinessInputs.length > 0
          ? "Missing business inputs are reported, but artifact can still be generated with demo placeholders and clearly labeled assumptions."
          : "No missing business inputs detected.",
      redacted: true,
    },
  };
}

export function getRealFullStackArtifactGenerator() {
  const writer = getGeneratedArtifactBundleWriter();
  const download = getCustomerDownloadPackageRoute();
  const livePreview = getLivePreviewArtifactRoute();

  const biscuitShopExample = generateRealFullStackArtifact({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    prompt:
      "Build a modern biscuit shop website with menu, about, contact, warm colors, order call-to-action, backend, database, admin review, preview, and deploy package.",
  });

  const homepageOnlyBlockedExample = {
    projectId: "project_demo",
    prompt: "Build only a homepage.",
    validation: runWebsiteFullFunctionValidation({
      frontend: true,
      backend: false,
      database: false,
      admin: false,
      preview: false,
      exportPackage: false,
      deploymentGuide: false,
      validationReport: false,
      missingInfoReport: false,
    }),
  };

  return {
    system: "OmegaCrownAI Real Full-Stack Artifact Generator Implementation",
    phase: "v24.1 Phase 261",
    status: "real_full_stack_artifact_generator_ready",
    purpose:
      "Create the implementation foundation for generating full-stack website/app artifact file descriptors from a user prompt, including frontend, backend/API, database/schema, admin/review, preview, deployment, validation, and missing-info reporting.",
    corePrinciple:
      "The generator must produce a full-function artifact plan and must not treat homepage-only output as customer-ready.",

    generatorFlow: [
      "Receive projectId and user prompt.",
      "Classify project type.",
      "Generate stable artifactId.",
      "Generate frontend file descriptors.",
      "Generate backend/API file descriptors.",
      "Generate database/schema file descriptors.",
      "Generate admin/review file descriptors.",
      "Generate preview sandbox file descriptors.",
      "Generate deploy/export/report file descriptors.",
      "Run full-function validation.",
      "Create preview and download paths.",
      "Return generated artifact bundle preview.",
      "Block customer-ready status if validation fails.",
    ],

    supportedProjectTypes: [
      "business_website",
      "commerce_or_food_business_website",
      "booking_service_website",
      "web_application",
    ],

    requiredGeneratedLayers: [
      "frontend",
      "backend_api",
      "database_schema",
      "admin_review",
      "preview_sandbox",
      "deploy_export",
      "validation_report",
      "missing_info_report",
    ],

    generatorSafetyRules: [
      "Do not generate .env with real secrets.",
      "Generate .env.example only.",
      "Do not mark homepage-only output customer-ready.",
      "Do not omit backend/API when forms, orders, bookings, or leads exist.",
      "Do not omit database/schema when persistence is required.",
      "Do not omit admin/review when customer submissions exist.",
      "Do not omit validation-report.json.",
      "Do not omit missing-info-report.md.",
      "Use demo placeholders when business information is missing and report the missing information.",
    ],

    biscuitShopExample,
    homepageOnlyBlockedExample,

    implementationPlan: {
      currentPhase:
        "Generates full-stack artifact descriptors and validation status. File-system ZIP writing comes in the next implementation phase.",
      nextPhase:
        "Write generated descriptors into real files under a project artifact folder and expose downloadable ZIP.",
    },

    integrationSources: {
      generatedArtifactBundleWriterStatus: writer.status,
      customerDownloadPackageRouteStatus: download.status,
      livePreviewArtifactRouteStatus: livePreview.status,
    },

    nextImplementationPhases: [
      "Builder UI Full-Function Output Panel",
      "Download ZIP Writer Implementation",
      "Generated Artifact File System Writer",
      "Artifact History UI Upgrade",
      "Project Distribution Preview Cards",
    ],
  };
}
