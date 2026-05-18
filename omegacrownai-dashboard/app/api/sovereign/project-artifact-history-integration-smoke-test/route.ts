import { NextResponse } from "next/server";
import { getProjectArtifactHistoryIntegration } from "@/lib/sovereign/project-artifact-history-integration";

const requiredShapeFields = [
  "artifactId",
  "projectId",
  "version",
  "customerReady",
  "completenessScore",
  "previewPath",
  "downloadPath",
  "validationReportPath",
  "missingInfoReportPath",
];

const requiredHistorySections = [
  "Artifact Summary",
  "Preview / Download",
  "Reports",
  "Validation Result",
  "Version Lineage",
];

const requiredCustomerReadyRules = [
  "Do not hide failed or draft artifacts.",
  "Do not call an artifact customer-ready unless validation score is 90+ and all required layers pass.",
  "Show blocked reasons when customerReady is false.",
  "Show missing-info report link for every artifact.",
  "Show validation report link for every artifact.",
  "Preserve previous customer-ready versions after rebuilds.",
];

export async function GET() {
  const history = getProjectArtifactHistoryIntegration();

  const missingShapeFields = requiredShapeFields.filter(
    (field) => !(field in history.artifactHistoryRecordShape)
  );

  const sectionNames = history.historyDisplaySections.map((section) => section.section);
  const missingSections = requiredHistorySections.filter((section) => !sectionNames.includes(section));

  const missingCustomerReadyRules = requiredCustomerReadyRules.filter(
    (rule) => !history.customerReadyHistoryRules.includes(rule)
  );

  const failedSample = history.sampleHistoryRecords.find((record) => record.customerReady === false);
  const passingSample = history.sampleHistoryRecords.find((record) => record.customerReady === true);

  const checks = [
    {
      name: "Project Artifact History Integration is ready",
      passed: history.status === "project_artifact_history_integration_ready",
      detail: history.status,
    },
    {
      name: "Artifact history record shape present",
      passed: missingShapeFields.length === 0,
      detail: missingShapeFields.length ? `Missing: ${missingShapeFields.join(", ")}` : "Core history fields present.",
    },
    {
      name: "History integration flow present",
      passed: history.historyIntegrationFlow.length >= 12,
      detail: `${history.historyIntegrationFlow.length} flow steps`,
    },
    {
      name: "Versioning rules present",
      passed: history.versioningRules.length >= 6,
      detail: `${history.versioningRules.length} versioning rules`,
    },
    {
      name: "History display sections present",
      passed: missingSections.length === 0,
      detail: missingSections.length ? `Missing: ${missingSections.join(", ")}` : "All display sections present.",
    },
    {
      name: "Artifact history API plan present",
      passed:
        history.artifactHistoryApiPlan.saveRoute === "/api/projects/[projectId]/artifacts/history" &&
        history.artifactHistoryApiPlan.listRoute === "/api/projects/[projectId]/artifacts/history" &&
        history.artifactHistoryApiPlan.detailRoute === "/api/projects/[projectId]/artifacts/[artifactId]",
      detail: "Save/list/detail routes defined.",
    },
    {
      name: "Customer-ready history rules present",
      passed: missingCustomerReadyRules.length === 0,
      detail: missingCustomerReadyRules.length
        ? `Missing: ${missingCustomerReadyRules.join(", ")}`
        : "Customer-ready history rules present.",
    },
    {
      name: "Sample history includes failed and passing artifacts",
      passed:
        Boolean(failedSample) &&
        Boolean(passingSample) &&
        failedSample?.completenessScore === 15 &&
        passingSample?.completenessScore === 100,
      detail: "Failed and passing sample artifacts present.",
    },
    {
      name: "History completeness checks present",
      passed: history.historyCompletenessChecks.length >= 8,
      detail: `${history.historyCompletenessChecks.length} history checks`,
    },
    {
      name: "Runtime/bundle/validation integration present",
      passed:
        history.integrationSources.fullStackRuntimeStatus === "full_stack_builder_runtime_foundation_ready" &&
        history.integrationSources.generatedArtifactBundleWriterStatus === "generated_artifact_bundle_writer_ready" &&
        history.integrationSources.validationRunnerStatus === "website_full_function_validation_runner_ready" &&
        history.integrationSources.minimumCustomerReadyScore === 90,
      detail: "Runtime, writer, and validation linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v23.8 Phase 258",
    service: "Project Artifact History Integration Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    historyFlowStepCount: history.historyIntegrationFlow.length,
    versioningRuleCount: history.versioningRules.length,
    historyDisplaySectionCount: history.historyDisplaySections.length,
    customerReadyHistoryRuleCount: history.customerReadyHistoryRules.length,
    sampleHistoryRecordCount: history.sampleHistoryRecords.length,
    historyCompletenessCheckCount: history.historyCompletenessChecks.length,
    checks,
  });
}
