import { NextResponse } from "next/server";
import { getWebsiteDatabaseSchemaGenerator } from "@/lib/sovereign/website-database-schema-generator";

const requiredCapabilities = [
  "ContactSubmission model",
  "Lead model",
  "OrderInquiry model",
  "BookingRequest model",
  "NewsletterSubscriber model",
  "MenuItem/Product model",
  "AdminReviewStatus fields",
];

const requiredModels = [
  "ContactSubmission",
  "Lead",
  "OrderInquiry",
  "BookingRequest",
  "NewsletterSubscriber",
  "MenuItem",
];

const requiredFiles = [
  "prisma/schema.prisma",
  "database/schema.sql",
  "lib/generated/db-types.ts",
  "lib/generated/submission-store.ts",
  "lib/generated/seed-data.ts",
  "validation-report.json database checks",
];

const requiredChecks = [
  "Database/data model exists when any backend submission API exists.",
  "Every generated public submission route maps to a schema model or documented storage adapter.",
  "Admin review status fields exist for customer submissions.",
  "Static-only database exemption is documented when no persistence is needed.",
  "README explains database setup and migration steps.",
  "Validation report confirms database layer present or justified.",
];

export async function GET() {
  const database = getWebsiteDatabaseSchemaGenerator();

  const capabilityNames = database.requiredSchemaCapabilities.map((item) => item.capability);
  const modelNames = database.commonPrismaModels.map((item) => item.model);

  const missingCapabilities = requiredCapabilities.filter((item) => !capabilityNames.includes(item));
  const missingModels = requiredModels.filter((item) => !modelNames.includes(item));
  const missingFiles = requiredFiles.filter((item) => !database.generatedSchemaFileManifest.includes(item));
  const missingChecks = requiredChecks.filter((item) => !database.databaseCompletenessChecks.includes(item));

  const totalIndexCount = database.commonPrismaModels.reduce(
    (sum, model) => sum + model.indexes.length,
    0
  );

  const checks = [
    {
      name: "Website Database Schema Generator is ready",
      passed: database.status === "website_database_schema_generator_ready",
      detail: database.status,
    },
    {
      name: "Required schema capabilities present",
      passed: missingCapabilities.length === 0,
      detail: missingCapabilities.length ? `Missing: ${missingCapabilities.join(", ")}` : "All capabilities present.",
    },
    {
      name: "Common Prisma models present",
      passed: missingModels.length === 0,
      detail: missingModels.length ? `Missing: ${missingModels.join(", ")}` : "All models present.",
    },
    {
      name: "Indexes present",
      passed: totalIndexCount >= 15,
      detail: `${totalIndexCount} indexes`,
    },
    {
      name: "Static-only exemption rule present",
      passed:
        database.staticOnlyExemptionRule.includes("no forms") &&
        database.staticOnlyExemptionRule.includes("missing-info report"),
      detail: "Static-only exemption documented.",
    },
    {
      name: "Generated schema manifest present",
      passed: missingFiles.length === 0,
      detail: missingFiles.length ? `Missing: ${missingFiles.join(", ")}` : "Core schema files present.",
    },
    {
      name: "Seed data plan present",
      passed: database.seedDataPlan.length >= 5,
      detail: `${database.seedDataPlan.length} seed-data steps`,
    },
    {
      name: "Biscuit shop schema requires menu/order/contact/subscriber",
      passed:
        database.biscuitShopSchemaExample.requiredModels.includes("MenuItem") &&
        database.biscuitShopSchemaExample.requiredModels.includes("OrderInquiry") &&
        database.biscuitShopSchemaExample.requiredModels.includes("ContactSubmission") &&
        database.biscuitShopSchemaExample.requiredModels.includes("NewsletterSubscriber") &&
        database.biscuitShopSchemaExample.customerReadyRule.includes("not customer-ready"),
      detail: `${database.biscuitShopSchemaExample.requiredModels.length} biscuit models`,
    },
    {
      name: "Database completeness checks present",
      passed: missingChecks.length === 0,
      detail: missingChecks.length ? `Missing: ${missingChecks.join(", ")}` : "All database checks present.",
    },
    {
      name: "Runtime and backend integration present",
      passed:
        database.integrationSources.fullStackRuntimeStatus === "full_stack_builder_runtime_foundation_ready" &&
        database.integrationSources.backendGeneratorStatus === "website_backend_api_generator_ready" &&
        database.integrationSources.minimumCustomerReadyScore === 90,
      detail: "Runtime and backend linked.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v23.2 Phase 252",
    service: "Website Database Schema Generator Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    schemaCapabilityCount: database.requiredSchemaCapabilities.length,
    prismaModelCount: database.commonPrismaModels.length,
    indexCount: totalIndexCount,
    schemaManifestFileCount: database.generatedSchemaFileManifest.length,
    seedDataStepCount: database.seedDataPlan.length,
    biscuitShopModelCount: database.biscuitShopSchemaExample.requiredModels.length,
    databaseCompletenessCheckCount: database.databaseCompletenessChecks.length,
    checks,
  });
}
