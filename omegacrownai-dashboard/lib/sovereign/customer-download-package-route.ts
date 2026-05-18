import { getGeneratedArtifactBundleWriter } from "@/lib/sovereign/generated-artifact-bundle-writer";
import { getLivePreviewArtifactRoute } from "@/lib/sovereign/live-preview-artifact-route";
import { getProjectArtifactHistoryIntegration } from "@/lib/sovereign/project-artifact-history-integration";
import { getWebsiteFullFunctionValidationRunner } from "@/lib/sovereign/website-full-function-validation-runner";

export function getCustomerDownloadPackageRoute() {
  const writer = getGeneratedArtifactBundleWriter();
  const livePreview = getLivePreviewArtifactRoute();
  const history = getProjectArtifactHistoryIntegration();
  const validationRunner = getWebsiteFullFunctionValidationRunner();

  return {
    system: "OmegaCrownAI Customer Download Package Route",
    phase: "v24.0 Phase 260",
    status: "customer_download_package_route_ready",
    purpose:
      "Define the customer download/export route that packages generated full-stack website/app artifacts into a safe downloadable bundle with source files, README, deployment guide, validation report, missing-info report, and manifest.",
    corePrinciple:
      "A customer download must be useful, safe, complete, and honestly labeled. It must include generated source and reports, exclude secrets, and show customer-ready or draft status based on validation.",

    routePlan: {
      downloadRoute: "/api/projects/[projectId]/artifacts/[artifactId]/download",
      previewRoute: "/projects/[id]/artifacts/[artifactId]/preview",
      historyRoute: "/projects/[id]/history",
      method: "GET",
      contentType: "application/zip",
      fallbackContentType: "application/json",
      purpose:
        "Expose a customer-safe download package for generated artifacts, connected to preview, validation, and project history.",
    },

    downloadPackageManifest: {
      packageType: "full_stack_customer_artifact_bundle",
      requiredFiles: [
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
        "prisma/schema.prisma or database/schema.sql",
        "lib/generated/types.ts",
        "lib/generated/validation.ts",
        "lib/generated/submission-store.ts",
        "components/preview/PreviewBanner.tsx",
      ],
      optionalFiles: [
        "Dockerfile",
        "docker-compose.yml",
        "scripts/backup.sh",
        "tests/smoke.test.ts",
        "public/assets",
      ],
    },

    downloadIncludeRules: [
      "Include generated source files.",
      "Include frontend files.",
      "Include backend/API files.",
      "Include database/schema files or static-only exemption report.",
      "Include admin/review files.",
      "Include preview files or preview instructions.",
      "Include README.md.",
      "Include deployment.md.",
      "Include .env.example.",
      "Include artifact-manifest.json.",
      "Include validation-report.json.",
      "Include missing-info-report.md.",
    ],

    downloadExcludeRules: [
      "Do not include .env.",
      "Do not include real secrets.",
      "Do not include OAuth tokens.",
      "Do not include API keys.",
      "Do not include passwords.",
      "Do not include private keys.",
      "Do not include bearer authorization headers.",
      "Do not include node_modules.",
      "Do not include .next build cache.",
      "Do not include server logs.",
      "Do not include PM2 logs.",
    ],

    validationBeforeDownload: {
      allowedDraftDownload: true,
      customerReadyRequiresScore: 90,
      customerReadyRequiresAllLayers: true,
      labels: [
        "customer_ready_full_function_artifact",
        "draft_not_customer_ready",
        "blocked_missing_required_functionality",
      ],
      rule:
        "Downloads may be allowed for drafts, but draft packages must be clearly labeled not customer-ready when validation fails.",
    },

    responseHeadersPlan: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=\"omegacrownai-artifact-{artifactId}.zip\"",
      "Cache-Control": "no-store",
      "X-OmegaCrownAI-Artifact": "customer_full_stack_download_package",
      "X-OmegaCrownAI-Redacted": "true",
    },

    downloadRecordShape: {
      artifactId: "artifact id",
      projectId: "project id",
      downloadId: "download event id",
      packageLabel: "customer_ready_full_function_artifact | draft_not_customer_ready",
      completenessScore: "0-100",
      customerReady: "boolean",
      includedFileCount: "number",
      excludedSecretTypes: "array",
      validationReportPath: "validation-report.json",
      missingInfoReportPath: "missing-info-report.md",
      generatedAt: "ISO timestamp",
      redacted: true,
    },

    biscuitShopDownloadExample: {
      projectType: "biscuit shop website",
      artifactId: "artifact_biscuit_shop_v2",
      packageFilename: "omegacrownai-biscuit-shop-full-stack.zip",
      mustInclude: [
        "homepage/menu UI",
        "contact API",
        "order inquiry API",
        "admin order/contact review",
        "MenuItem schema",
        "OrderInquiry schema",
        "seed biscuit menu data",
        "preview instructions",
        "README.md",
        ".env.example",
        "deployment.md",
        "validation-report.json",
        "missing-info-report.md",
        "artifact-manifest.json",
      ],
      mustExclude: [
        ".env",
        "real payment keys",
        "raw customer secrets",
        "node_modules",
        ".next",
      ],
      customerReadyRule:
        "If the biscuit shop package lacks backend APIs, schema, admin review, preview, deployment guide, validation report, or missing-info report, it may download only as draft_not_customer_ready.",
    },

    customerDownloadCompletenessChecks: [
      "Download route is defined.",
      "Package manifest includes source, reports, env example, deployment guide, backend, schema, admin, and preview files.",
      "Include rules cover full-stack artifact files.",
      "Exclude rules block secrets, node_modules, logs, and build cache.",
      "Validation gate labels customer-ready versus draft downloads.",
      "Response headers use attachment, no-store, and redacted artifact marker.",
      "Download record shape includes score, customerReady, reports, and redaction.",
      "Biscuit shop example includes full-stack downloadable package.",
      "Integration sources confirm bundle writer, preview route, history, and validation runner are ready.",
    ],

    integrationSources: {
      generatedArtifactBundleWriterStatus: writer.status,
      livePreviewArtifactRouteStatus: livePreview.status,
      projectArtifactHistoryStatus: history.status,
      validationRunnerStatus: validationRunner.status,
    },

    nextImplementationPhases: [
      "Real Full-Stack Artifact Generator Implementation",
      "Builder UI Full-Function Output Panel",
      "Artifact History UI Upgrade",
      "Project Distribution Preview Cards",
      "Download ZIP Writer Implementation",
    ],
  };
}
