import { NextResponse } from "next/server";
import {
  getWebsiteFullFunctionValidationRunner,
  runWebsiteFullFunctionValidation,
} from "@/lib/sovereign/website-full-function-validation-runner";

export async function GET() {
  const runner = getWebsiteFullFunctionValidationRunner();

  const complete = runWebsiteFullFunctionValidation({
    frontend: true,
    backend: true,
    database: true,
    admin: true,
    preview: true,
    exportPackage: true,
    deploymentGuide: true,
    validationReport: true,
    missingInfoReport: true,
  });

  const homepageOnly = runWebsiteFullFunctionValidation({
    frontend: true,
  });

  const missingBackend = runWebsiteFullFunctionValidation({
    frontend: true,
    backend: false,
    database: true,
    admin: true,
    preview: true,
    exportPackage: true,
    deploymentGuide: true,
    validationReport: true,
    missingInfoReport: true,
  });

  const checks = [
    {
      name: "Website Full-Function Validation Runner is ready",
      passed: runner.status === "website_full_function_validation_runner_ready",
      detail: runner.status,
    },
    {
      name: "Validation layers total 100 points",
      passed:
        runner.validationLayers.length === 9 &&
        runner.validationLayers.reduce((sum, layer) => sum + layer.points, 0) === 100,
      detail: `${runner.validationLayers.length} layers`,
    },
    {
      name: "Customer-ready gate requires 90 and all layers",
      passed:
        runner.customerReadyGate.minimumScore === 90 &&
        runner.customerReadyGate.requiresAllLayers === true &&
        runner.customerReadyGate.homepageOnlyBlocked === true,
      detail: runner.customerReadyGate.rule,
    },
    {
      name: "Complete full-stack artifact passes",
      passed:
        complete.customerReady === true &&
        complete.score === 100 &&
        complete.missingLayers.length === 0,
      detail: `score ${complete.score}`,
    },
    {
      name: "Homepage-only artifact is blocked",
      passed:
        homepageOnly.customerReady === false &&
        homepageOnly.score === 15 &&
        homepageOnly.missingLayers.includes("Backend/API") &&
        homepageOnly.missingLayers.includes("Database/Data Model") &&
        homepageOnly.verdict === "not_customer_ready_missing_required_functionality",
      detail: `score ${homepageOnly.score}, missing ${homepageOnly.missingLayers.join(", ")}`,
    },
    {
      name: "Missing backend blocks customer-ready",
      passed:
        missingBackend.customerReady === false &&
        missingBackend.missingLayers.includes("Backend/API") &&
        missingBackend.blockedReasons.length > 0,
      detail: missingBackend.blockedReasons.join(" "),
    },
    {
      name: "Validation report shape present",
      passed:
        Boolean(runner.validationReportShape.score) &&
        Boolean(runner.validationReportShape.customerReady) &&
        Boolean(runner.validationReportShape.blockedReasons),
      detail: "Validation report shape defined.",
    },
    {
      name: "Missing functionality report shape present",
      passed:
        Boolean(runner.missingFunctionalityReportShape.missingBackend) &&
        Boolean(runner.missingFunctionalityReportShape.missingDatabase) &&
        runner.missingFunctionalityReportShape.missingBusinessInputs.length >= 6,
      detail: `${runner.missingFunctionalityReportShape.missingBusinessInputs.length} missing business inputs`,
    },
    {
      name: "Biscuit shop homepage-only fails and complete passes",
      passed:
        runner.biscuitShopValidationExample.homepageOnlyValidation.customerReady === false &&
        runner.biscuitShopValidationExample.completeValidation.customerReady === true &&
        runner.biscuitShopValidationExample.customerReadyRule.includes("homepage alone must fail"),
      detail: "Biscuit shop validation rule confirmed.",
    },
    {
      name: "Validation runner completeness checks present",
      passed: runner.validationRunnerCompletenessChecks.length >= 8,
      detail: `${runner.validationRunnerCompletenessChecks.length} runner checks`,
    },
    {
      name: "Runtime/backend/database/admin/preview/deploy integration present",
      passed:
        runner.integrationSources.fullStackRuntimeStatus === "full_stack_builder_runtime_foundation_ready" &&
        runner.integrationSources.backendGeneratorStatus === "website_backend_api_generator_ready" &&
        runner.integrationSources.databaseGeneratorStatus === "website_database_schema_generator_ready" &&
        runner.integrationSources.adminGeneratorStatus === "website_admin_panel_generator_ready" &&
        runner.integrationSources.previewSandboxStatus === "website_preview_sandbox_ready" &&
        runner.integrationSources.deployPackageGeneratorStatus === "website_deploy_package_generator_ready" &&
        runner.integrationSources.minimumCustomerReadyScore === 90,
      detail: "All generator layers linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v23.6 Phase 256",
    service: "Website Full-Function Validation Runner Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    validationLayerCount: runner.validationLayers.length,
    maximumScore: complete.maximumScore,
    completeScore: complete.score,
    homepageOnlyScore: homepageOnly.score,
    completeCustomerReady: complete.customerReady,
    homepageOnlyCustomerReady: homepageOnly.customerReady,
    missingBackendCustomerReady: missingBackend.customerReady,
    missingBusinessInputCount: runner.missingFunctionalityReportShape.missingBusinessInputs.length,
    runnerCompletenessCheckCount: runner.validationRunnerCompletenessChecks.length,
    checks,
  });
}
