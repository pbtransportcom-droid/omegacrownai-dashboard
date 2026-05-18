import { getRealFullStackArtifactGenerator } from "@/lib/sovereign/real-full-stack-artifact-generator";
import { getGeneratedArtifactFileSystemWriter } from "@/lib/sovereign/generated-artifact-file-system-writer";
import { getDownloadZipWriterImplementation } from "@/lib/sovereign/download-zip-writer";
import { getPersistentArtifactStorage } from "@/lib/sovereign/persistent-artifact-storage";
import { getProjectDistributionPreviewCards } from "@/lib/sovereign/project-distribution-preview-cards";
import { getArtifactRebuildRollbackControls } from "@/lib/sovereign/artifact-rebuild-rollback-controls";
import { getRealCustomerWebsiteAppBundleExport } from "@/lib/sovereign/real-customer-website-app-bundle-export";

export function getProductionArtifactWriterIntegration() {
  const generator = getRealFullStackArtifactGenerator();
  const fileWriter = getGeneratedArtifactFileSystemWriter();
  const zipWriter = getDownloadZipWriterImplementation();
  const storage = getPersistentArtifactStorage();
  const distribution = getProjectDistributionPreviewCards();
  const rebuildRollback = getArtifactRebuildRollbackControls();
  const exportLayer = getRealCustomerWebsiteAppBundleExport();

  return {
    system: "OmegaCrownAI Production Artifact Writer Integration",
    phase: "v25.0 Phase 270",
    status: "production_artifact_writer_integration_ready",
    purpose:
      "Unify the full-stack artifact generator, file-system write plan, ZIP writer, persistent storage, project history, distribution preview cards, rebuild/rollback controls, and real customer export contract into one production artifact writing pipeline.",
    corePrinciple:
      "A customer-paid artifact must move through one connected production pipeline: generate, validate, write, package, persist, preview, export, history, distribution, rebuild, and rollback.",

    productionWriterPipeline: [
      "Receive projectId, prompt, and requested artifact type.",
      "Generate full-stack artifact descriptors.",
      "Run full-function validation.",
      "Block homepage-only customer-ready status.",
      "Create file-system write plan.",
      "Write source/report files to project-scoped artifact root.",
      "Create ZIP package.",
      "Create persistent storage record.",
      "Create artifact history record.",
      "Expose live preview path.",
      "Expose customer download path.",
      "Expose distribution preview card.",
      "Expose rebuild and rollback controls.",
      "Return production artifact receipt.",
    ],

    productionArtifactReceiptShape: {
      receiptId: "production artifact write receipt id",
      projectId: "project id",
      artifactId: "artifact id",
      version: "artifact version",
      artifactType: "full_stack_website_app",
      customerReady: "boolean",
      completenessScore: "0-100",
      exportLabel:
        "customer_ready_full_function_artifact | draft_not_customer_ready | blocked_missing_required_functionality",
      generated: "boolean",
      validated: "boolean",
      filesWritten: "boolean",
      zipCreated: "boolean",
      persisted: "boolean",
      historyRecorded: "boolean",
      previewPath: "preview URL",
      adminPreviewPath: "admin preview URL",
      downloadPath: "download URL",
      historyPath: "history URL",
      distributionPath: "distribution URL",
      rebuildRoute: "rebuild API route",
      rollbackRoute: "rollback API route",
      validationReportPath: "validation-report.json",
      missingInfoReportPath: "missing-info-report.md",
      redacted: true,
    },

    integrationContracts: [
      {
        layer: "Generator",
        status: generator.status,
        responsibility:
          "Create full-stack artifact descriptors and validation-ready bundle preview.",
      },
      {
        layer: "File System Writer",
        status: fileWriter.status,
        responsibility:
          "Plan/write source files, reports, and artifact folder paths safely.",
      },
      {
        layer: "ZIP Writer",
        status: zipWriter.status,
        responsibility:
          "Create downloadable customer ZIP package with reports and generated source.",
      },
      {
        layer: "Persistent Storage",
        status: storage.status,
        responsibility:
          "Persist artifact metadata, source/report/ZIP paths, and storage receipt.",
      },
      {
        layer: "Customer Export",
        status: exportLayer.status,
        responsibility:
          "Label export as customer-ready, draft, or blocked and expose export receipt.",
      },
      {
        layer: "Distribution Cards",
        status: distribution.status,
        responsibility:
          "Show preview/download/history/status on the project distribution page.",
      },
      {
        layer: "Rebuild/Rollback",
        status: rebuildRollback.status,
        responsibility:
          "Create new versions, preserve old versions, and allow safe rollback.",
      },
    ],

    productionSafetyRules: [
      "Build must pass before PM2 restart.",
      "Do not use git add .",
      "Only targeted git add is allowed.",
      "Do not write raw .env secrets.",
      "Do not export node_modules, .next, logs, tokens, private keys, or passwords.",
      "Do not mark homepage-only artifacts customer-ready.",
      "Do not overwrite customer-ready versions with draft rebuilds.",
      "Do not delete old versions during rebuild or rollback.",
      "Every production artifact must include validation-report.json.",
      "Every production artifact must include missing-info-report.md.",
      "Every production artifact must expose preview/download/history paths when generated.",
    ],

    customerReadyRequirements: [
      "Frontend files exist.",
      "Backend/API files exist.",
      "Database/schema files exist.",
      "Admin/review files exist.",
      "Preview sandbox exists.",
      "Download ZIP exists.",
      "Deployment guide exists.",
      "Validation report exists.",
      "Missing-info report exists.",
      "Persistent storage record exists.",
      "Artifact history record exists.",
      "Distribution card exists.",
      "Completeness score is at least 90.",
      "Required layers pass validation.",
    ],

    biscuitShopProductionExample: {
      projectId: "cmoyy1gl700004mkqn7or7hxr",
      artifactType: "full_stack_website_app",
      scenario: "Biscuit shop website/app customer-ready export",
      expectedPipelineResult: {
        generated: true,
        validated: true,
        filesWritten: true,
        zipCreated: true,
        persisted: true,
        historyRecorded: true,
        distributionCardVisible: true,
        rebuildRollbackAvailable: true,
        customerReady: true,
        completenessScore: 100,
      },
      requiredVisibleActions: [
        "Preview",
        "Admin Preview",
        "Download ZIP",
        "View History",
        "View Validation Report",
        "View Missing Info Report",
        "Rebuild",
        "Rollback",
      ],
      blockedHomepageOnlyRule:
        "A biscuit shop homepage alone must remain blocked and cannot enter customer-ready distribution.",
    },

    productionCompletenessChecks: [
      "Production writer pipeline includes generate, validate, write, ZIP, persist, history, preview, download, distribution, rebuild, and rollback.",
      "Receipt shape includes customer-ready status, score, paths, reports, persistence, rebuild, rollback, and redaction.",
      "Integration contracts link generator, file writer, ZIP writer, storage, export, distribution, and rebuild/rollback.",
      "Production safety rules block secrets, unsafe git, unsafe restarts, and false customer-ready status.",
      "Customer-ready requirements cover frontend, backend, database, admin, preview, download, deployment, validation, missing-info, storage, history, and distribution.",
      "Biscuit shop production example is full-stack, customer-ready, and blocks homepage-only output.",
    ],

    integrationSources: {
      realFullStackArtifactGeneratorStatus: generator.status,
      generatedArtifactFileSystemWriterStatus: fileWriter.status,
      downloadZipWriterStatus: zipWriter.status,
      persistentArtifactStorageStatus: storage.status,
      realCustomerBundleExportStatus: exportLayer.status,
      projectDistributionPreviewCardsStatus: distribution.status,
      artifactRebuildRollbackControlsStatus: rebuildRollback.status,
    },

    nextImplementationPhases: [
      "Project Distribution Live Data Binding",
      "Customer Export Audit Trail",
      "Persistent Artifact Database Migration",
      "Rebuild/Rollback API Implementation",
      "Production Artifact Writer Execution Route",
    ],
  };
}
