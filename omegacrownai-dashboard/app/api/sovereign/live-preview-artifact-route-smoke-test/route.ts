import { NextResponse } from "next/server";
import { getLivePreviewArtifactRoute } from "@/lib/sovereign/live-preview-artifact-route";

const requiredSections = [
  "Public Artifact Preview",
  "Admin Preview",
  "Validation Panel",
  "Missing Information Panel",
  "Artifact History Link",
  "Download / Export Action",
];

const requiredRules = [
  "Preview route must be scoped by artifactId.",
  "Preview must clearly show sandbox/demo mode when using sample data.",
  "Preview must not expose raw secrets, tokens, API keys, passwords, private keys, or real .env values.",
  "Preview must show customer-ready status honestly.",
  "Preview must show blocked reasons when customerReady is false.",
  "Preview must link to validation report and missing-info report.",
  "Homepage-only artifacts may preview, but must be labeled draft/not customer-ready.",
];

const requiredChecks = [
  "Public preview route is defined.",
  "Admin preview route is defined.",
  "Project artifact preview route is defined.",
  "Project distribution route integration is defined.",
  "Preview shows validation/customer-ready state.",
  "Preview shows missing-info warnings.",
  "Preview blocks false complete claims.",
  "Preview links artifact history and download/export.",
];

export async function GET() {
  const livePreview = getLivePreviewArtifactRoute();

  const sectionNames = livePreview.previewRuntimeSections.map((item) => item.section);
  const missingSections = requiredSections.filter((item) => !sectionNames.includes(item));
  const missingRules = requiredRules.filter((item) => !livePreview.livePreviewRules.includes(item));
  const missingChecks = requiredChecks.filter(
    (item) => !livePreview.livePreviewCompletenessChecks.includes(item)
  );

  const checks = [
    {
      name: "Live Preview Artifact Route is ready",
      passed: livePreview.status === "live_preview_artifact_route_ready",
      detail: livePreview.status,
    },
    {
      name: "Route plan includes public/admin/project/distribution/download routes",
      passed:
        livePreview.routePlan.publicPreviewRoute === "/preview/[artifactId]" &&
        livePreview.routePlan.adminPreviewRoute === "/preview/[artifactId]/admin" &&
        livePreview.routePlan.projectDistributionRoute === "/projects/[id]/company/distribution" &&
        livePreview.routePlan.projectArtifactPreviewRoute === "/projects/[id]/artifacts/[artifactId]/preview" &&
        livePreview.routePlan.downloadRoute === "/api/projects/[projectId]/artifacts/[artifactId]/download",
      detail: "Route plan complete.",
    },
    {
      name: "Preview runtime sections present",
      passed: missingSections.length === 0,
      detail: missingSections.length ? `Missing: ${missingSections.join(", ")}` : "All preview sections present.",
    },
    {
      name: "Live preview rules present",
      passed: missingRules.length === 0,
      detail: missingRules.length ? `Missing: ${missingRules.join(", ")}` : "Core live preview rules present.",
    },
    {
      name: "Preview artifact record shape present",
      passed:
        Boolean(livePreview.previewArtifactRecordShape.artifactId) &&
        Boolean(livePreview.previewArtifactRecordShape.projectId) &&
        Boolean(livePreview.previewArtifactRecordShape.previewPath) &&
        Boolean(livePreview.previewArtifactRecordShape.downloadPath) &&
        livePreview.previewArtifactRecordShape.redacted === true,
      detail: "Preview artifact record shape defined.",
    },
    {
      name: "Distribution page integration present",
      passed:
        livePreview.distributionPageIntegration.sourceRoute === "/projects/[id]/company/distribution" &&
        livePreview.distributionPageIntegration.expectedBehavior.length >= 7,
      detail: `${livePreview.distributionPageIntegration.expectedBehavior.length} distribution behaviors`,
    },
    {
      name: "Biscuit shop live preview example present",
      passed:
        livePreview.biscuitShopLivePreviewExample.distributionPath ===
          "/projects/cmoyy1gl700004mkqn7or7hxr/company/distribution" &&
        livePreview.biscuitShopLivePreviewExample.expectedVisiblePreview.length >= 8 &&
        livePreview.biscuitShopLivePreviewExample.customerReadyRule.includes("customer-ready must remain false"),
      detail: "Biscuit shop live preview example defined.",
    },
    {
      name: "Live preview completeness checks present",
      passed: missingChecks.length === 0,
      detail: missingChecks.length ? `Missing: ${missingChecks.join(", ")}` : "All live preview checks present.",
    },
    {
      name: "Integration sources present",
      passed:
        livePreview.integrationSources.projectArtifactHistoryStatus === "project_artifact_history_integration_ready" &&
        livePreview.integrationSources.generatedArtifactBundleWriterStatus === "generated_artifact_bundle_writer_ready" &&
        livePreview.integrationSources.websitePreviewSandboxStatus === "website_preview_sandbox_ready" &&
        livePreview.integrationSources.validationRunnerStatus === "website_full_function_validation_runner_ready",
      detail: "History, writer, preview, and validation linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v23.9 Phase 259",
    service: "Live Preview Artifact Route Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    previewRuntimeSectionCount: livePreview.previewRuntimeSections.length,
    livePreviewRuleCount: livePreview.livePreviewRules.length,
    distributionBehaviorCount: livePreview.distributionPageIntegration.expectedBehavior.length,
    biscuitShopPreviewItemCount: livePreview.biscuitShopLivePreviewExample.expectedVisiblePreview.length,
    livePreviewCompletenessCheckCount: livePreview.livePreviewCompletenessChecks.length,
    checks,
  });
}
