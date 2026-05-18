import { NextResponse } from "next/server";
import { getWebsiteDeployPackageGenerator } from "@/lib/sovereign/website-deploy-package-generator";

const requiredTopLevelFiles = [
  "README.md",
  "package.json",
  ".env.example",
  "deployment.md",
  "artifact-manifest.json",
  "validation-report.json",
  "missing-info-report.md",
];

const requiredExportRules = [
  "Export package must include generated source files.",
  "Export package must include README and deployment instructions.",
  "Export package must include .env.example, never real .env secrets.",
  "Export package must include artifact-manifest.json.",
  "Export package must include validation-report.json.",
  "Export package must include missing-info-report.md.",
  "Export package must not include raw secrets, tokens, API keys, passwords, or private keys.",
  "Export package must not be labeled customer-ready if required layers are missing.",
];

const requiredGateChecks = [
  "README exists.",
  "package.json exists.",
  ".env.example exists without secrets.",
  "Frontend files exist.",
  "Backend/API files exist.",
  "Admin/review files exist.",
  "Preview instructions or preview route exists.",
  "Validation report exists.",
  "Missing-info report exists.",
  "Deployment instructions exist.",
  "Artifact manifest exists.",
];

export async function GET() {
  const deploy = getWebsiteDeployPackageGenerator();

  const missingTopLevelFiles = requiredTopLevelFiles.filter(
    (item) => !deploy.deployPackageManifest.requiredTopLevelFiles.includes(item)
  );
  const missingExportRules = requiredExportRules.filter(
    (item) => !deploy.artifactExportRules.includes(item)
  );
  const missingGateChecks = requiredGateChecks.filter(
    (item) => !deploy.deploymentValidationGate.requiredChecks.includes(item)
  );

  const checks = [
    {
      name: "Website Deploy Package Generator is ready",
      passed: deploy.status === "website_deploy_package_generator_ready",
      detail: deploy.status,
    },
    {
      name: "Required top-level files present",
      passed: missingTopLevelFiles.length === 0,
      detail: missingTopLevelFiles.length
        ? `Missing: ${missingTopLevelFiles.join(", ")}`
        : "All top-level files present.",
    },
    {
      name: "Generated project file structure present",
      passed: deploy.generatedProjectFileStructure.length >= 20,
      detail: `${deploy.generatedProjectFileStructure.length} generated files`,
    },
    {
      name: "README sections present",
      passed: deploy.readmeSections.length >= 14,
      detail: `${deploy.readmeSections.length} README sections`,
    },
    {
      name: "Environment template present",
      passed: deploy.environmentTemplate.length >= 5,
      detail: `${deploy.environmentTemplate.length} env vars`,
    },
    {
      name: "Deployment targets present",
      passed: deploy.deploymentTargets.length >= 3,
      detail: `${deploy.deploymentTargets.length} deployment targets`,
    },
    {
      name: "Artifact export rules present",
      passed: missingExportRules.length === 0,
      detail: missingExportRules.length ? `Missing: ${missingExportRules.join(", ")}` : "Core export rules present.",
    },
    {
      name: "Deployment validation gate present",
      passed:
        deploy.deploymentValidationGate.minimumCustomerReadyScore === 90 &&
        missingGateChecks.length === 0 &&
        deploy.deploymentValidationGate.customerReadyRule.includes("Do not mark artifact customer-ready"),
      detail: `${deploy.deploymentValidationGate.requiredChecks.length} gate checks`,
    },
    {
      name: "Biscuit shop deploy package requires full-stack files",
      passed:
        deploy.biscuitShopDeployPackageExample.requiredFiles.includes("app/api/orders/route.ts") &&
        deploy.biscuitShopDeployPackageExample.requiredFiles.includes("prisma/schema.prisma") &&
        deploy.biscuitShopDeployPackageExample.requiredFiles.includes("app/admin/orders/page.tsx") &&
        deploy.biscuitShopDeployPackageExample.customerReadyRule.includes("not customer-ready"),
      detail: `${deploy.biscuitShopDeployPackageExample.requiredFiles.length} biscuit files`,
    },
    {
      name: "Deployment completeness checks present",
      passed: deploy.deploymentCompletenessChecks.length >= 8,
      detail: `${deploy.deploymentCompletenessChecks.length} deployment checks`,
    },
    {
      name: "Runtime/backend/database/admin/preview integration present",
      passed:
        deploy.integrationSources.fullStackRuntimeStatus === "full_stack_builder_runtime_foundation_ready" &&
        deploy.integrationSources.backendGeneratorStatus === "website_backend_api_generator_ready" &&
        deploy.integrationSources.databaseGeneratorStatus === "website_database_schema_generator_ready" &&
        deploy.integrationSources.adminGeneratorStatus === "website_admin_panel_generator_ready" &&
        deploy.integrationSources.previewSandboxStatus === "website_preview_sandbox_ready" &&
        deploy.integrationSources.minimumCustomerReadyScore === 90,
      detail: "Runtime, backend, database, admin, and preview linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v23.5 Phase 255",
    service: "Website Deploy Package Generator Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    topLevelFileCount: deploy.deployPackageManifest.requiredTopLevelFiles.length,
    generatedProjectFileCount: deploy.generatedProjectFileStructure.length,
    readmeSectionCount: deploy.readmeSections.length,
    envTemplateCount: deploy.environmentTemplate.length,
    deploymentTargetCount: deploy.deploymentTargets.length,
    exportRuleCount: deploy.artifactExportRules.length,
    validationGateCheckCount: deploy.deploymentValidationGate.requiredChecks.length,
    biscuitShopDeployFileCount: deploy.biscuitShopDeployPackageExample.requiredFiles.length,
    deploymentCompletenessCheckCount: deploy.deploymentCompletenessChecks.length,
    checks,
  });
}
