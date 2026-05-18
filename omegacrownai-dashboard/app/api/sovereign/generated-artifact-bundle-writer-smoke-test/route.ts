import { NextResponse } from "next/server";
import { getGeneratedArtifactBundleWriter } from "@/lib/sovereign/generated-artifact-bundle-writer";

const requiredFileGroups = [
  "frontend",
  "backend_api",
  "database_schema",
  "admin_review",
  "preview_sandbox",
  "deploy_export",
];

const requiredReports = [
  "artifact-manifest.json",
  "validation-report.json",
  "missing-info-report.md",
  "deployment.md",
];

const requiredSafetyRules = [
  "Do not write raw secrets into generated files.",
  "Do not include real .env values in export package.",
  "Write .env.example only.",
  "Do not label homepage-only bundles customer-ready.",
  "Do not mark customer-ready if backend/API files are missing.",
  "Do not mark customer-ready if admin/review path is missing.",
  "Do not mark customer-ready if preview/export/validation reports are missing.",
];

export async function GET() {
  const writer = getGeneratedArtifactBundleWriter();

  const fileGroupNames = writer.generatedBundleFileGroups.map((group) => group.group);
  const reportNames = writer.reportWriters.map((report) => report.report);

  const missingFileGroups = requiredFileGroups.filter((group) => !fileGroupNames.includes(group));
  const missingReports = requiredReports.filter((report) => !reportNames.includes(report));
  const missingSafetyRules = requiredSafetyRules.filter(
    (rule) => !writer.writeSafetyRules.includes(rule)
  );

  const checks = [
    {
      name: "Generated Artifact Bundle Writer is ready",
      passed: writer.status === "generated_artifact_bundle_writer_ready",
      detail: writer.status,
    },
    {
      name: "Bundle writer flow present",
      passed: writer.bundleWriterFlow.length >= 14,
      detail: `${writer.bundleWriterFlow.length} flow steps`,
    },
    {
      name: "Required generated file groups present",
      passed: missingFileGroups.length === 0,
      detail: missingFileGroups.length ? `Missing: ${missingFileGroups.join(", ")}` : "All file groups present.",
    },
    {
      name: "Artifact manifest shape present",
      passed:
        Boolean(writer.artifactManifestShape.artifactId) &&
        Boolean(writer.artifactManifestShape.customerReady) &&
        Boolean(writer.artifactManifestShape.completenessScore) &&
        Boolean(writer.artifactManifestShape.downloadPath),
      detail: "Artifact manifest shape defined.",
    },
    {
      name: "Write safety rules present",
      passed: missingSafetyRules.length === 0,
      detail: missingSafetyRules.length ? `Missing: ${missingSafetyRules.join(", ")}` : "Core safety rules present.",
    },
    {
      name: "Report writers present",
      passed: missingReports.length === 0,
      detail: missingReports.length ? `Missing: ${missingReports.join(", ")}` : "All report writers present.",
    },
    {
      name: "Downloadable package plan present",
      passed:
        writer.downloadablePackagePlan.contentType === "application/zip" &&
        writer.downloadablePackagePlan.includes.includes("generated source files") &&
        writer.downloadablePackagePlan.excludes.includes("node_modules") &&
        writer.downloadablePackagePlan.excludes.includes("raw secrets"),
      detail: "Download package plan defined.",
    },
    {
      name: "Biscuit shop bundle includes full-stack files",
      passed:
        writer.biscuitShopBundleExample.generatedFiles.includes("app/api/orders/route.ts") &&
        writer.biscuitShopBundleExample.generatedFiles.includes("prisma/schema.prisma") &&
        writer.biscuitShopBundleExample.generatedFiles.includes("app/admin/orders/page.tsx") &&
        writer.biscuitShopBundleExample.generatedFiles.includes("validation-report.json") &&
        writer.biscuitShopBundleExample.customerReadyRule.includes("homepage"),
      detail: `${writer.biscuitShopBundleExample.generatedFiles.length} biscuit files`,
    },
    {
      name: "Homepage-only bundle fails",
      passed:
        writer.biscuitShopBundleExample.homepageOnlyValidation.customerReady === false &&
        writer.biscuitShopBundleExample.homepageOnlyValidation.score === 15,
      detail: `score ${writer.biscuitShopBundleExample.homepageOnlyValidation.score}`,
    },
    {
      name: "Complete full-stack bundle passes",
      passed:
        writer.biscuitShopBundleExample.completeValidation.customerReady === true &&
        writer.biscuitShopBundleExample.completeValidation.score === 100,
      detail: `score ${writer.biscuitShopBundleExample.completeValidation.score}`,
    },
    {
      name: "Bundle completeness checks present",
      passed: writer.bundleCompletenessChecks.length >= 10,
      detail: `${writer.bundleCompletenessChecks.length} bundle checks`,
    },
    {
      name: "All generator layer integrations present",
      passed:
        writer.integrationSources.fullStackRuntimeStatus === "full_stack_builder_runtime_foundation_ready" &&
        writer.integrationSources.backendGeneratorStatus === "website_backend_api_generator_ready" &&
        writer.integrationSources.databaseGeneratorStatus === "website_database_schema_generator_ready" &&
        writer.integrationSources.adminGeneratorStatus === "website_admin_panel_generator_ready" &&
        writer.integrationSources.previewSandboxStatus === "website_preview_sandbox_ready" &&
        writer.integrationSources.deployPackageGeneratorStatus === "website_deploy_package_generator_ready" &&
        writer.integrationSources.validationRunnerStatus === "website_full_function_validation_runner_ready" &&
        writer.integrationSources.minimumCustomerReadyScore === 90,
      detail: "All generator layers linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v23.7 Phase 257",
    service: "Generated Artifact Bundle Writer Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    bundleWriterFlowStepCount: writer.bundleWriterFlow.length,
    fileGroupCount: writer.generatedBundleFileGroups.length,
    reportWriterCount: writer.reportWriters.length,
    safetyRuleCount: writer.writeSafetyRules.length,
    downloadableIncludeCount: writer.downloadablePackagePlan.includes.length,
    downloadableExcludeCount: writer.downloadablePackagePlan.excludes.length,
    biscuitShopGeneratedFileCount: writer.biscuitShopBundleExample.generatedFiles.length,
    homepageOnlyScore: writer.biscuitShopBundleExample.homepageOnlyValidation.score,
    completeScore: writer.biscuitShopBundleExample.completeValidation.score,
    checks,
  });
}
