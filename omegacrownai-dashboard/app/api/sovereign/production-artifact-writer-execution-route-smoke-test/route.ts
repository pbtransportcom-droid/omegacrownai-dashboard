import { NextResponse } from "next/server";
import {
  executeProductionArtifactWriter,
  getProductionArtifactWriterExecutionRoute,
} from "@/lib/sovereign/production-artifact-writer-execution-route";

const requiredSafetyRules = [
  "Normalize projectId.",
  "Limit prompt length.",
  "Reject null bytes.",
  "Do not write raw .env.",
  "Do not write secrets, tokens, API keys, passwords, or private keys.",
  "Do not write node_modules.",
  "Do not write .next cache.",
  "Do not write logs.",
  "Do not mark artifact customer-ready unless validation passes.",
  "Always return redacted receipt.",
];

export async function GET() {
  const execution = getProductionArtifactWriterExecutionRoute();

  const result = executeProductionArtifactWriter({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    prompt:
      "Build a customer-ready biscuit shop website/app with frontend, backend, database, admin, preview, deployment, validation, missing-info, ZIP export, storage, and audit trail.",
    requestedBy: "system",
  });

  const missingSafetyRules = requiredSafetyRules.filter(
    (rule) => !execution.executionSafetyRules.includes(rule)
  );

  const checks = [
    {
      name: "Production Artifact Writer Execution Route is ready",
      passed: execution.status === "production_artifact_writer_execution_route_ready",
      detail: execution.status,
    },
    {
      name: "Execution routes are present",
      passed:
        execution.executionRoutes.length >= 3 &&
        execution.executionRoutes.some((route) => route.method === "POST" && route.route.includes("execute-production-writer")) &&
        execution.executionRoutes.some((route) => route.method === "POST" && route.route.includes("production-artifact-writer-execution-route")),
      detail: `${execution.executionRoutes.length} routes`,
    },
    {
      name: "Execution input and receipt shapes are present",
      passed:
        Boolean(execution.executionInputShape.projectId) &&
        Boolean(execution.executionInputShape.prompt) &&
        Boolean(execution.executionReceiptShape.receiptId) &&
        Boolean(execution.executionReceiptShape.downloadPath) &&
        execution.executionReceiptShape.redacted === true,
      detail: "Input and receipt shapes defined.",
    },
    {
      name: "Execution flow present",
      passed: execution.executionFlow.length >= 10,
      detail: `${execution.executionFlow.length} flow steps`,
    },
    {
      name: "Execution safety rules present",
      passed: missingSafetyRules.length === 0,
      detail: missingSafetyRules.length ? `Missing: ${missingSafetyRules.join(", ")}` : "Safety rules present.",
    },
    {
      name: "Execution result is customer-ready and full-stack",
      passed:
        result.ok === true &&
        result.receipt.customerReady === true &&
        result.receipt.completenessScore === 100 &&
        result.receipt.fileCount >= 22 &&
        result.artifactSummary.backendCount >= 3 &&
        result.artifactSummary.databaseCount >= 3 &&
        result.artifactSummary.adminCount >= 3,
      detail: `score ${result.receipt.completenessScore}`,
    },
    {
      name: "Execution result includes write plan, ZIP, storage, and audit",
      passed:
        result.receipt.fileWritePlanCreated === true &&
        result.receipt.zipCreated === true &&
        result.receipt.storageReceiptCreated === true &&
        result.receipt.auditEventsPlanned === true &&
        result.receipt.zipSizeBytes > 1000,
      detail: `${result.receipt.zipSizeBytes} zip bytes`,
    },
    {
      name: "Execution result includes live paths and reports",
      passed:
        Boolean(result.receipt.previewPath) &&
        Boolean(result.receipt.adminPreviewPath) &&
        Boolean(result.receipt.downloadPath) &&
        Boolean(result.receipt.historyPath) &&
        Boolean(result.receipt.distributionPath) &&
        Boolean(result.receipt.validationReportPath) &&
        Boolean(result.receipt.missingInfoReportPath),
      detail: "Paths and reports present.",
    },
    {
      name: "Execution result is safe and redacted",
      passed:
        result.safety.rawSecretsWritten === false &&
        result.safety.rawEnvWritten === false &&
        result.safety.nodeModulesWritten === false &&
        result.safety.nextCacheWritten === false &&
        result.safety.logsWritten === false &&
        result.receipt.redacted === true,
      detail: "Safety flags pass.",
    },
    {
      name: "Biscuit shop execution example present",
      passed:
        execution.biscuitShopExecutionExample.receipt.customerReady === true &&
        execution.biscuitShopExecutionExample.receipt.completenessScore === 100 &&
        execution.biscuitShopExecutionExample.artifactSummary.backendCount >= 3,
      detail: "Biscuit shop execution example passes.",
    },
    {
      name: "Completeness checks present",
      passed: execution.executionCompletenessChecks.length >= 7,
      detail: `${execution.executionCompletenessChecks.length} checks`,
    },
    {
      name: "Integration sources present",
      passed:
        execution.integrationSources.productionArtifactWriterIntegrationStatus === "production_artifact_writer_integration_ready" &&
        execution.integrationSources.persistentArtifactStorageStatus === "persistent_artifact_storage_ready" &&
        execution.integrationSources.customerExportAuditTrailStatus === "customer_export_audit_trail_ready",
      detail: "Production writer, storage, and audit linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v25.5 Phase 275",
    service: "Production Artifact Writer Execution Route Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    executionRouteCount: execution.executionRoutes.length,
    executionFlowStepCount: execution.executionFlow.length,
    executionSafetyRuleCount: execution.executionSafetyRules.length,
    completenessCheckCount: execution.executionCompletenessChecks.length,
    executionCustomerReady: result.receipt.customerReady,
    executionScore: result.receipt.completenessScore,
    executionFileCount: result.receipt.fileCount,
    executionZipSizeBytes: result.receipt.zipSizeBytes,
    checks,
  });
}
