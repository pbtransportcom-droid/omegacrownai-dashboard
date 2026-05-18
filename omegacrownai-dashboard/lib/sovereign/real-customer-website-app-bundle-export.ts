import { getProjectDistributionPreviewCards } from "@/lib/sovereign/project-distribution-preview-cards";
import { getGeneratedArtifactFileSystemWriter } from "@/lib/sovereign/generated-artifact-file-system-writer";
import { getDownloadZipWriterImplementation } from "@/lib/sovereign/download-zip-writer";
import { generateRealFullStackArtifact } from "@/lib/sovereign/real-full-stack-artifact-generator";

export function getRealCustomerWebsiteAppBundleExport() {
  const distribution = getProjectDistributionPreviewCards();
  const fileWriter = getGeneratedArtifactFileSystemWriter();
  const zipWriter = getDownloadZipWriterImplementation();

  const biscuit = generateRealFullStackArtifact({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    prompt:
      "Build a customer-ready biscuit shop website/app with menu, order inquiry, contact, backend, database, admin review, preview, deployment package, validation report, and missing-info report.",
  });

  return {
    system: "OmegaCrownAI Real Customer Website/App Bundle Export",
    phase: "v24.7 Phase 267",
    status: "real_customer_website_app_bundle_export_ready",
    purpose:
      "Define the real customer export layer that packages generated website/app artifacts into downloadable, validated, customer-labeled bundles connected to preview, history, distribution, ZIP writing, and file-system planning.",
    corePrinciple:
      "A customer export must be a usable full-stack bundle with source files, reports, validation, preview/download/history links, safe redaction, and honest customer-ready or draft labeling.",

    exportPackageContract: {
      packageType: "real_customer_website_app_bundle",
      outputFormat: "zip",
      contentType: "application/zip",
      requiredReports: [
        "README.md",
        "artifact-manifest.json",
        "validation-report.json",
        "missing-info-report.md",
        "deployment.md",
      ],
      requiredSourceLayers: [
        "frontend",
        "backend_api",
        "database_schema",
        "admin_review",
        "preview_sandbox",
        "deploy_export",
      ],
      mustExclude: [
        ".env",
        "raw secrets",
        "OAuth tokens",
        "API keys",
        "passwords",
        "private keys",
        "node_modules",
        ".next",
        "logs",
      ],
    },

    exportLabels: [
      {
        label: "customer_ready_full_function_artifact",
        condition:
          "completenessScore is 90 or higher, customerReady is true, required layers exist, reports exist, and ZIP is redacted.",
      },
      {
        label: "draft_not_customer_ready",
        condition:
          "download is allowed but customerReady is false or required information/functionality remains missing.",
      },
      {
        label: "blocked_missing_required_functionality",
        condition:
          "export should not be promoted until missing core layers are fixed.",
      },
    ],

    exportFlow: [
      "Generate full-stack artifact descriptors.",
      "Run full-function validation.",
      "Create file-system write plan.",
      "Create ZIP package.",
      "Attach manifest, validation report, missing-info report, README, and deployment guide.",
      "Apply export label based on validation.",
      "Expose preview path.",
      "Expose admin preview path.",
      "Expose download path.",
      "Expose artifact history path.",
      "Expose distribution path.",
      "Return customer export receipt.",
    ],

    customerExportReceiptShape: {
      exportId: "stable export event id",
      projectId: "project id",
      artifactId: "artifact id",
      packageFilename: "zip filename",
      packageType: "real_customer_website_app_bundle",
      exportLabel: "customer_ready_full_function_artifact | draft_not_customer_ready | blocked_missing_required_functionality",
      customerReady: "boolean",
      completenessScore: "0-100",
      fileCount: "number",
      zipSizeBytes: "number",
      previewPath: "preview URL",
      adminPreviewPath: "admin preview URL",
      downloadPath: "download URL",
      historyPath: "artifact history URL",
      distributionPath: "project distribution URL",
      validationReportPath: "validation-report.json",
      missingInfoReportPath: "missing-info-report.md",
      redacted: true,
    },

    biscuitShopExportExample: {
      projectId: biscuit.artifact.projectId,
      artifactId: biscuit.artifact.artifactId,
      packageFilename: `omegacrownai-artifact-${biscuit.artifact.artifactId}.zip`,
      exportLabel: biscuit.artifact.customerReady
        ? "customer_ready_full_function_artifact"
        : "draft_not_customer_ready",
      customerReady: biscuit.artifact.customerReady,
      completenessScore: biscuit.artifact.completenessScore,
      fileCount: biscuit.artifact.fileCount,
      previewPath: biscuit.artifact.previewPath,
      adminPreviewPath: biscuit.artifact.adminPreviewPath,
      downloadPath: biscuit.artifact.downloadPath,
      historyPath: "/projects/cmoyy1gl700004mkqn7or7hxr/artifacts/history",
      distributionPath:
        "/projects/cmoyy1gl700004mkqn7or7hxr/company/distribution",
      includes: [
        "menu/homepage frontend",
        "contact API",
        "order inquiry API",
        "database schema",
        "admin review",
        "preview sandbox",
        "README",
        "deployment guide",
        "artifact manifest",
        "validation report",
        "missing-info report",
      ],
      customerReadyRule:
        "The biscuit shop export is customer-ready only when the generated ZIP includes frontend, backend, database, admin, preview, deploy files, validation report, missing-info report, and safe redaction.",
      redacted: true,
    },

    exportSafetyRules: [
      "Never export .env.",
      "Never export raw secrets, tokens, API keys, passwords, or private keys.",
      "Never export node_modules.",
      "Never export .next build cache.",
      "Never export server or PM2 logs.",
      "Always include .env.example instead of real environment values.",
      "Always include validation-report.json.",
      "Always include missing-info-report.md.",
      "Always label draft exports honestly.",
    ],

    exportCompletenessChecks: [
      "Export package contract exists.",
      "Export labels distinguish customer-ready, draft, and blocked.",
      "Export flow connects generator, validation, file plan, ZIP, preview, history, and distribution.",
      "Customer export receipt shape includes score, label, paths, and redaction.",
      "Biscuit shop export example is customer-ready and full-stack.",
      "Safety rules exclude secrets and runtime folders.",
      "Integration sources confirm distribution cards, file writer, and ZIP writer are ready.",
    ],

    integrationSources: {
      projectDistributionPreviewCardsStatus: distribution.status,
      generatedArtifactFileSystemWriterStatus: fileWriter.status,
      downloadZipWriterStatus: zipWriter.status,
    },

    nextImplementationPhases: [
      "Persistent Artifact Storage",
      "Artifact Rebuild/Rollback Controls",
      "Production Artifact Writer Integration",
      "Project Distribution Live Data Binding",
      "Customer Export Audit Trail",
    ],
  };
}
