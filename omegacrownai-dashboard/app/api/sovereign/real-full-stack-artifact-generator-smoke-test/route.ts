import { NextResponse } from "next/server";
import {
  generateRealFullStackArtifact,
  getRealFullStackArtifactGenerator,
} from "@/lib/sovereign/real-full-stack-artifact-generator";

const requiredLayers = [
  "frontend",
  "backend_api",
  "database_schema",
  "admin_review",
  "preview_sandbox",
  "deploy_export",
  "validation_report",
  "missing_info_report",
];

const requiredSafetyRules = [
  "Do not generate .env with real secrets.",
  "Generate .env.example only.",
  "Do not mark homepage-only output customer-ready.",
  "Do not omit backend/API when forms, orders, bookings, or leads exist.",
  "Do not omit validation-report.json.",
  "Do not omit missing-info-report.md.",
];

export async function GET() {
  const generator = getRealFullStackArtifactGenerator();

  const biscuit = generateRealFullStackArtifact({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    prompt:
      "Build a biscuit shop website with menu, contact form, order form, backend, database, admin review, preview, deployment guide, validation report, and missing info report.",
  });

  const business = generateRealFullStackArtifact({
    projectId: "project_demo",
    prompt:
      "Build a professional business website with contact form, leads, backend, database, admin review, preview, and deployment package.",
  });

  const missingLayers = requiredLayers.filter(
    (layer) => !generator.requiredGeneratedLayers.includes(layer)
  );

  const missingSafetyRules = requiredSafetyRules.filter(
    (rule) => !generator.generatorSafetyRules.includes(rule)
  );

  const checks = [
    {
      name: "Real Full-Stack Artifact Generator is ready",
      passed: generator.status === "real_full_stack_artifact_generator_ready",
      detail: generator.status,
    },
    {
      name: "Generator flow present",
      passed: generator.generatorFlow.length >= 13,
      detail: `${generator.generatorFlow.length} flow steps`,
    },
    {
      name: "Supported project types present",
      passed: generator.supportedProjectTypes.length >= 4,
      detail: `${generator.supportedProjectTypes.length} project types`,
    },
    {
      name: "Required generated layers present",
      passed: missingLayers.length === 0,
      detail: missingLayers.length ? `Missing: ${missingLayers.join(", ")}` : "All required layers present.",
    },
    {
      name: "Generator safety rules present",
      passed: missingSafetyRules.length === 0,
      detail: missingSafetyRules.length ? `Missing: ${missingSafetyRules.join(", ")}` : "Core safety rules present.",
    },
    {
      name: "Biscuit shop artifact has full-stack files",
      passed:
        biscuit.artifact?.frontendFiles?.length >= 4 &&
        biscuit.artifact?.backendFiles?.length >= 3 &&
        biscuit.artifact?.databaseFiles?.length >= 3 &&
        biscuit.artifact?.adminFiles?.length >= 3 &&
        biscuit.artifact?.previewFiles?.length >= 3 &&
        biscuit.artifact?.deployFiles?.length >= 6,
      detail: `${biscuit.artifact?.fileCount} generated file descriptors`,
    },
    {
      name: "Biscuit shop artifact validates customer-ready",
      passed:
        biscuit.artifact.customerReady === true &&
        biscuit.artifact.completenessScore === 100,
      detail: `score ${biscuit.artifact.completenessScore}`,
    },
    {
      name: "Business website artifact validates customer-ready",
      passed:
        business.artifact.customerReady === true &&
        business.artifact.completenessScore === 100,
      detail: `score ${business.artifact.completenessScore}`,
    },
    {
      name: "Homepage-only blocked example fails",
      passed:
        generator.homepageOnlyBlockedExample.validation.customerReady === false &&
        generator.homepageOnlyBlockedExample.validation.score === 15,
      detail: `score ${generator.homepageOnlyBlockedExample.validation.score}`,
    },
    {
      name: "Preview and download paths are generated",
      passed:
        biscuit.artifact.previewPath.includes("/artifacts/") &&
        biscuit.artifact.downloadPath.includes("/api/projects/") &&
        biscuit.artifact.adminPreviewPath.includes("/preview/"),
      detail: "Preview/download paths generated.",
    },
    {
      name: "Missing business inputs are reported",
      passed: biscuit.artifact.missingBusinessInputs.length >= 6,
      detail: `${biscuit.artifact.missingBusinessInputs.length} missing business inputs`,
    },
    {
      name: "Integration sources present",
      passed:
        generator.integrationSources.generatedArtifactBundleWriterStatus === "generated_artifact_bundle_writer_ready" &&
        generator.integrationSources.customerDownloadPackageRouteStatus === "customer_download_package_route_ready" &&
        generator.integrationSources.livePreviewArtifactRouteStatus === "live_preview_artifact_route_ready",
      detail: "Writer, download, and preview integrations linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v24.1 Phase 261",
    service: "Real Full-Stack Artifact Generator Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    generatorFlowStepCount: generator.generatorFlow.length,
    supportedProjectTypeCount: generator.supportedProjectTypes.length,
    requiredLayerCount: generator.requiredGeneratedLayers.length,
    safetyRuleCount: generator.generatorSafetyRules.length,
    biscuitFileCount: biscuit.artifact.fileCount,
    biscuitCompletenessScore: biscuit.artifact.completenessScore,
    biscuitCustomerReady: biscuit.artifact.customerReady,
    businessCompletenessScore: business.artifact.completenessScore,
    homepageOnlyScore: generator.homepageOnlyBlockedExample.validation.score,
    homepageOnlyCustomerReady: generator.homepageOnlyBlockedExample.validation.customerReady,
    missingBusinessInputCount: biscuit.artifact.missingBusinessInputs.length,
    checks,
  });
}
