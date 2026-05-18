import { NextResponse } from "next/server";
import { getProductionArtifactWriterIntegration } from "@/lib/sovereign/production-artifact-writer-integration";

const requiredPipelineSteps = [
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
];

const requiredSafetyRules = [
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
];

const requiredCustomerReadyRequirements = [
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
];

export async function GET() {
  const integration = getProductionArtifactWriterIntegration();

  const missingPipelineSteps = requiredPipelineSteps.filter(
    (item) => !integration.productionWriterPipeline.includes(item)
  );

  const missingSafetyRules = requiredSafetyRules.filter(
    (item) => !integration.productionSafetyRules.includes(item)
  );

  const missingCustomerReadyRequirements = requiredCustomerReadyRequirements.filter(
    (item) => !integration.customerReadyRequirements.includes(item)
  );

  const contractStatuses = integration.integrationContracts.map((contract) => contract.status);

  const checks = [
    {
      name: "Production Artifact Writer Integration is ready",
      passed: integration.status === "production_artifact_writer_integration_ready",
      detail: integration.status,
    },
    {
      name: "Production writer pipeline is complete",
      passed: missingPipelineSteps.length === 0,
      detail: missingPipelineSteps.length ? `Missing: ${missingPipelineSteps.join(", ")}` : "Pipeline complete.",
    },
    {
      name: "Production receipt shape present",
      passed:
        Boolean(integration.productionArtifactReceiptShape.receiptId) &&
        Boolean(integration.productionArtifactReceiptShape.artifactId) &&
        Boolean(integration.productionArtifactReceiptShape.downloadPath) &&
        Boolean(integration.productionArtifactReceiptShape.rebuildRoute) &&
        Boolean(integration.productionArtifactReceiptShape.rollbackRoute) &&
        integration.productionArtifactReceiptShape.redacted === true,
      detail: "Receipt shape defined.",
    },
    {
      name: "Integration contracts present",
      passed:
        integration.integrationContracts.length >= 7 &&
        contractStatuses.includes("real_full_stack_artifact_generator_ready") &&
        contractStatuses.includes("generated_artifact_file_system_writer_ready") &&
        contractStatuses.includes("download_zip_writer_implementation_ready") &&
        contractStatuses.includes("persistent_artifact_storage_ready") &&
        contractStatuses.includes("real_customer_website_app_bundle_export_ready") &&
        contractStatuses.includes("project_distribution_preview_cards_ready") &&
        contractStatuses.includes("artifact_rebuild_rollback_controls_ready"),
      detail: `${integration.integrationContracts.length} contracts`,
    },
    {
      name: "Production safety rules present",
      passed: missingSafetyRules.length === 0,
      detail: missingSafetyRules.length ? `Missing: ${missingSafetyRules.join(", ")}` : "Safety rules present.",
    },
    {
      name: "Customer-ready requirements present",
      passed: missingCustomerReadyRequirements.length === 0,
      detail: missingCustomerReadyRequirements.length
        ? `Missing: ${missingCustomerReadyRequirements.join(", ")}`
        : "Customer-ready requirements present.",
    },
    {
      name: "Biscuit shop production example is full-stack and customer-ready",
      passed:
        integration.biscuitShopProductionExample.expectedPipelineResult.generated === true &&
        integration.biscuitShopProductionExample.expectedPipelineResult.validated === true &&
        integration.biscuitShopProductionExample.expectedPipelineResult.zipCreated === true &&
        integration.biscuitShopProductionExample.expectedPipelineResult.persisted === true &&
        integration.biscuitShopProductionExample.expectedPipelineResult.customerReady === true &&
        integration.biscuitShopProductionExample.expectedPipelineResult.completenessScore === 100,
      detail: "Biscuit shop production example passes.",
    },
    {
      name: "Visible production actions present",
      passed: integration.biscuitShopProductionExample.requiredVisibleActions.length >= 8,
      detail: `${integration.biscuitShopProductionExample.requiredVisibleActions.length} actions`,
    },
    {
      name: "Production completeness checks present",
      passed: integration.productionCompletenessChecks.length >= 6,
      detail: `${integration.productionCompletenessChecks.length} checks`,
    },
    {
      name: "Integration source statuses present",
      passed:
        integration.integrationSources.realFullStackArtifactGeneratorStatus === "real_full_stack_artifact_generator_ready" &&
        integration.integrationSources.generatedArtifactFileSystemWriterStatus === "generated_artifact_file_system_writer_ready" &&
        integration.integrationSources.downloadZipWriterStatus === "download_zip_writer_implementation_ready" &&
        integration.integrationSources.persistentArtifactStorageStatus === "persistent_artifact_storage_ready" &&
        integration.integrationSources.realCustomerBundleExportStatus === "real_customer_website_app_bundle_export_ready" &&
        integration.integrationSources.projectDistributionPreviewCardsStatus === "project_distribution_preview_cards_ready" &&
        integration.integrationSources.artifactRebuildRollbackControlsStatus === "artifact_rebuild_rollback_controls_ready",
      detail: "All source statuses ready.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v25.0 Phase 270",
    service: "Production Artifact Writer Integration Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    pipelineStepCount: integration.productionWriterPipeline.length,
    integrationContractCount: integration.integrationContracts.length,
    safetyRuleCount: integration.productionSafetyRules.length,
    customerReadyRequirementCount: integration.customerReadyRequirements.length,
    visibleActionCount: integration.biscuitShopProductionExample.requiredVisibleActions.length,
    productionCompletenessCheckCount: integration.productionCompletenessChecks.length,
    checks,
  });
}
