import { NextResponse } from "next/server";
import { getWebsiteBackendApiGenerator } from "@/lib/sovereign/website-backend-api-generator";

const requiredCapabilities = [
  "Contact API",
  "Lead/Inquiry API",
  "Order Request API",
  "Booking Request API",
  "Newsletter API",
  "Admin Review API",
];

const requiredFiles = [
  "app/api/contact/route.ts",
  "app/api/orders/route.ts",
  "app/api/admin/submissions/route.ts",
  "lib/generated/validation.ts",
  "lib/generated/submission-store.ts",
  "lib/generated/types.ts",
];

const requiredChecks = [
  "At least one public submission API exists when the site has forms or customer actions.",
  "Admin review API exists for submitted records.",
  "Validation helper exists.",
  "Submission store/persistence adapter exists.",
  "Generated README explains backend routes.",
  "Validation report confirms backend layer present.",
];

export async function GET() {
  const backend = getWebsiteBackendApiGenerator();

  const capabilityNames = backend.requiredBackendCapabilities.map((item) => item.capability);
  const missingCapabilities = requiredCapabilities.filter((item) => !capabilityNames.includes(item));
  const missingFiles = requiredFiles.filter((item) => !backend.generatedBackendFileManifest.includes(item));
  const missingChecks = requiredChecks.filter((item) => !backend.backendCompletenessChecks.includes(item));

  const checks = [
    {
      name: "Website Backend/API Generator is ready",
      passed: backend.status === "website_backend_api_generator_ready",
      detail: backend.status,
    },
    {
      name: "Required backend capabilities present",
      passed: missingCapabilities.length === 0,
      detail: missingCapabilities.length ? `Missing: ${missingCapabilities.join(", ")}` : "All capabilities present.",
    },
    {
      name: "Route template shape present",
      passed:
        Boolean(backend.generatedRouteTemplateShape.validation) &&
        Boolean(backend.generatedRouteTemplateShape.persistence) &&
        Boolean(backend.generatedRouteTemplateShape.security),
      detail: "Route template shape defined.",
    },
    {
      name: "Validation rules present",
      passed: backend.validationRules.length >= 8,
      detail: `${backend.validationRules.length} validation rules`,
    },
    {
      name: "Persistence plan present",
      passed: backend.persistencePlan.length >= 6,
      detail: `${backend.persistencePlan.length} persistence steps`,
    },
    {
      name: "Admin review flow present",
      passed: backend.adminReviewFlow.length >= 5,
      detail: `${backend.adminReviewFlow.length} admin review steps`,
    },
    {
      name: "Generated backend manifest present",
      passed: missingFiles.length === 0,
      detail: missingFiles.length ? `Missing: ${missingFiles.join(", ")}` : "Core backend files present.",
    },
    {
      name: "Biscuit shop backend requires order/contact/admin",
      passed:
        backend.biscuitShopBackendExample.requiredRoutes.includes("app/api/orders/route.ts") &&
        backend.biscuitShopBackendExample.requiredRoutes.includes("app/api/contact/route.ts") &&
        backend.biscuitShopBackendExample.requiredRoutes.includes("app/api/admin/submissions/route.ts") &&
        backend.biscuitShopBackendExample.customerReadyRule.includes("not customer-ready"),
      detail: `${backend.biscuitShopBackendExample.requiredRoutes.length} biscuit backend routes`,
    },
    {
      name: "Backend completeness checks present",
      passed: missingChecks.length === 0,
      detail: missingChecks.length ? `Missing: ${missingChecks.join(", ")}` : "All backend checks present.",
    },
    {
      name: "Runtime integration present",
      passed:
        backend.integrationSources.fullStackRuntimeStatus === "full_stack_builder_runtime_foundation_ready" &&
        backend.integrationSources.minimumCustomerReadyScore === 90,
      detail: "Full-stack runtime linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v23.1 Phase 251",
    service: "Website Backend/API Generator Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    backendCapabilityCount: backend.requiredBackendCapabilities.length,
    validationRuleCount: backend.validationRules.length,
    persistenceStepCount: backend.persistencePlan.length,
    adminReviewStepCount: backend.adminReviewFlow.length,
    backendManifestFileCount: backend.generatedBackendFileManifest.length,
    biscuitShopRouteCount: backend.biscuitShopBackendExample.requiredRoutes.length,
    backendCompletenessCheckCount: backend.backendCompletenessChecks.length,
    checks,
  });
}
