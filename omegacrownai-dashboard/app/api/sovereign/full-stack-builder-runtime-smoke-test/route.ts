import { NextResponse } from "next/server";
import { getFullStackBuilderRuntime } from "@/lib/sovereign/full-stack-builder-runtime";

const requiredLayers = [
  "Frontend",
  "Backend/API",
  "Database/Data Model",
  "Admin/Owner Review",
  "Preview Sandbox",
  "Download/Export",
  "Validation",
  "Deployment Guide",
];

const requiredManifestFiles = [
  "README.md",
  "package.json",
  "validation-report.json",
  "missing-info-report.md",
  "artifact-manifest.json",
];

const requiredLanguageCorrections = [
  "Do not say OmegaCrownAI is fully complete.",
  "Do not say the builder is fully functional until generated artifacts include backend, database/data model, preview, export, and validation.",
  "Use: Customer-ready requires 90+ completeness score and all required layers.",
];

export async function GET() {
  const runtime = getFullStackBuilderRuntime();

  const layerNames = runtime.requiredArtifactLayers.map((item) => item.layer);
  const missingLayers = requiredLayers.filter((item) => !layerNames.includes(item));
  const missingManifestFiles = requiredManifestFiles.filter(
    (item) => !runtime.standardOutputFileManifest.includes(item)
  );
  const missingLanguageCorrections = requiredLanguageCorrections.filter(
    (item) => !runtime.productLanguageCorrections.includes(item)
  );

  const checks = [
    {
      name: "Full-stack builder runtime foundation is ready",
      passed: runtime.status === "full_stack_builder_runtime_foundation_ready",
      detail: runtime.status,
    },
    {
      name: "Product truth says builder is not complete yet",
      passed:
        runtime.productTruth.includes("not finished") &&
        runtime.productTruth.includes("customer artifact builder is still being upgraded"),
      detail: runtime.productTruth,
    },
    {
      name: "Required artifact layers present",
      passed: missingLayers.length === 0,
      detail: missingLayers.length ? `Missing: ${missingLayers.join(", ")}` : "All required layers present.",
    },
    {
      name: "Runtime build phases present",
      passed: runtime.runtimeBuildPhases.length >= 12,
      detail: `${runtime.runtimeBuildPhases.length} runtime phases`,
    },
    {
      name: "Standard output manifest present",
      passed: missingManifestFiles.length === 0,
      detail: missingManifestFiles.length
        ? `Missing: ${missingManifestFiles.join(", ")}`
        : "Core manifest files present.",
    },
    {
      name: "Completeness scoring blocks weak artifacts",
      passed:
        runtime.completenessScoring.minimumCustomerReadyScore === 90 &&
        runtime.completenessScoring.customerReadyGate.includes("Do not call an artifact customer-ready"),
      detail: `minimum score ${runtime.completenessScoring.minimumCustomerReadyScore}`,
    },
    {
      name: "Missing functionality report shape present",
      passed:
        runtime.missingFunctionalityReportShape.missingLayers.length >= 7 &&
        Boolean(runtime.missingFunctionalityReportShape.customerReadyBlockedReason),
      detail: `${runtime.missingFunctionalityReportShape.missingLayers.length} missing-layer categories`,
    },
    {
      name: "Generated artifact shape present",
      passed:
        Boolean(runtime.generatedArtifactShape.frontendFiles) &&
        Boolean(runtime.generatedArtifactShape.backendFiles) &&
        Boolean(runtime.generatedArtifactShape.databaseFiles) &&
        Boolean(runtime.generatedArtifactShape.customerReady),
      detail: "Generated artifact shape defined.",
    },
    {
      name: "Product language corrections present",
      passed: missingLanguageCorrections.length === 0,
      detail: missingLanguageCorrections.length
        ? `Missing: ${missingLanguageCorrections.join(", ")}`
        : "Product language corrections present.",
    },
    {
      name: "Biscuit shop expected artifact requires more than homepage",
      passed:
        runtime.biscuitShopExpectedArtifact.expectedLayers.length >= 9 &&
        runtime.biscuitShopExpectedArtifact.notEnough.includes("homepage only is not enough"),
      detail: `${runtime.biscuitShopExpectedArtifact.expectedLayers.length} biscuit shop layers`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v23.0 Phase 250",
    service: "Full-Stack Builder Runtime Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    requiredLayerCount: runtime.requiredArtifactLayers.length,
    runtimePhaseCount: runtime.runtimeBuildPhases.length,
    manifestFileCount: runtime.standardOutputFileManifest.length,
    minimumCustomerReadyScore: runtime.completenessScoring.minimumCustomerReadyScore,
    productLanguageCorrectionCount: runtime.productLanguageCorrections.length,
    biscuitShopExpectedLayerCount: runtime.biscuitShopExpectedArtifact.expectedLayers.length,
    checks,
  });
}
