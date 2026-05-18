import { NextResponse } from "next/server";
import { getWebsiteAdminPanelGenerator } from "@/lib/sovereign/website-admin-panel-generator";

const requiredCapabilities = [
  "Admin Dashboard",
  "Submission Review",
  "Order Review",
  "Booking Review",
  "Lead Review",
  "Subscriber Review",
  "Content/Menu Review",
];

const requiredFiles = [
  "app/admin/page.tsx",
  "app/admin/submissions/page.tsx",
  "app/admin/orders/page.tsx",
  "components/admin/SubmissionTable.tsx",
  "components/admin/MissingInfoPanel.tsx",
  "README.md admin section",
  "validation-report.json admin checks",
];

const requiredSafeRules = [
  "Admin panel should not expose secrets.",
  "Admin panel should not expose raw tokens, API keys, passwords, authorization headers, or private keys.",
  "Admin routes should be protected in production.",
  "Public users must not access admin submissions.",
  "Admin review must show missing information before customer-ready approval.",
];

const requiredChecks = [
  "Admin dashboard exists when project has backend submissions.",
  "Submission review table exists.",
  "Status workflow exists.",
  "Missing information panel exists.",
  "Admin route protection plan is documented.",
  "README explains admin review workflow.",
  "Validation report confirms admin/review layer present.",
];

export async function GET() {
  const admin = getWebsiteAdminPanelGenerator();

  const capabilityNames = admin.requiredAdminCapabilities.map((item) => item.capability);
  const missingCapabilities = requiredCapabilities.filter((item) => !capabilityNames.includes(item));
  const missingFiles = requiredFiles.filter((item) => !admin.generatedAdminFileManifest.includes(item));
  const missingSafeRules = requiredSafeRules.filter((item) => !admin.safeAdminRules.includes(item));
  const missingChecks = requiredChecks.filter((item) => !admin.adminCompletenessChecks.includes(item));

  const checks = [
    {
      name: "Website Admin Panel Generator is ready",
      passed: admin.status === "website_admin_panel_generator_ready",
      detail: admin.status,
    },
    {
      name: "Required admin capabilities present",
      passed: missingCapabilities.length === 0,
      detail: missingCapabilities.length ? `Missing: ${missingCapabilities.join(", ")}` : "All capabilities present.",
    },
    {
      name: "Generated admin views present",
      passed: admin.generatedAdminViews.length >= 4,
      detail: `${admin.generatedAdminViews.length} admin views`,
    },
    {
      name: "Status workflow present",
      passed:
        admin.statusWorkflow.includes("new") &&
        admin.statusWorkflow.includes("reviewed") &&
        admin.statusWorkflow.includes("contacted") &&
        admin.statusWorkflow.includes("completed") &&
        admin.statusWorkflow.includes("archived"),
      detail: `${admin.statusWorkflow.length} status states`,
    },
    {
      name: "Safe admin rules present",
      passed: missingSafeRules.length === 0,
      detail: missingSafeRules.length ? `Missing: ${missingSafeRules.join(", ")}` : "Core safe admin rules present.",
    },
    {
      name: "Protected route plan present",
      passed: admin.protectedRoutePlan.length >= 5,
      detail: `${admin.protectedRoutePlan.length} route-protection steps`,
    },
    {
      name: "Generated admin file manifest present",
      passed: missingFiles.length === 0,
      detail: missingFiles.length ? `Missing: ${missingFiles.join(", ")}` : "Core admin files present.",
    },
    {
      name: "Biscuit shop admin requires order/contact/subscriber/menu review",
      passed:
        admin.biscuitShopAdminExample.requiredAdminViews.includes("menu/product review") &&
        admin.biscuitShopAdminExample.requiredAdminViews.includes("order inquiry review") &&
        admin.biscuitShopAdminExample.requiredAdminViews.includes("contact submission review") &&
        admin.biscuitShopAdminExample.requiredAdminViews.includes("newsletter subscriber review") &&
        admin.biscuitShopAdminExample.customerReadyRule.includes("not customer-ready"),
      detail: `${admin.biscuitShopAdminExample.requiredAdminViews.length} biscuit admin views`,
    },
    {
      name: "Admin completeness checks present",
      passed: missingChecks.length === 0,
      detail: missingChecks.length ? `Missing: ${missingChecks.join(", ")}` : "All admin checks present.",
    },
    {
      name: "Runtime/backend/database integration present",
      passed:
        admin.integrationSources.fullStackRuntimeStatus === "full_stack_builder_runtime_foundation_ready" &&
        admin.integrationSources.backendGeneratorStatus === "website_backend_api_generator_ready" &&
        admin.integrationSources.databaseGeneratorStatus === "website_database_schema_generator_ready" &&
        admin.integrationSources.minimumCustomerReadyScore === 90,
      detail: "Runtime, backend, and database linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v23.3 Phase 253",
    service: "Website Admin Panel Generator Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    adminCapabilityCount: admin.requiredAdminCapabilities.length,
    generatedAdminViewCount: admin.generatedAdminViews.length,
    statusWorkflowCount: admin.statusWorkflow.length,
    safeAdminRuleCount: admin.safeAdminRules.length,
    protectedRouteStepCount: admin.protectedRoutePlan.length,
    adminManifestFileCount: admin.generatedAdminFileManifest.length,
    biscuitShopAdminViewCount: admin.biscuitShopAdminExample.requiredAdminViews.length,
    adminCompletenessCheckCount: admin.adminCompletenessChecks.length,
    checks,
  });
}
