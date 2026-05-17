import { NextResponse } from "next/server";
import { getConnectorMarketplaceFoundation } from "@/lib/sovereign/connector-marketplace-foundation";

const requiredCategories = [
  "communication",
  "crm_sales",
  "storage_files",
  "development",
  "payments_billing",
  "marketing_distribution",
  "model_compute",
  "automation_webhooks",
];

const requiredPermissions = [
  "connector_read",
  "connector_write_draft",
  "connector_external_write",
  "connector_financial_action",
  "connector_secret_management",
];

const requiredBlockedActions = [
  "No connector may expose secrets in logs, commits, artifacts, or UI.",
  "No connector may publish public content without review.",
  "No connector may charge, refund, transfer funds, or place trades by default.",
  "No connector may delete customer data without explicit owner approval and rollback plan.",
];

export async function GET() {
  const marketplace = getConnectorMarketplaceFoundation();

  const categoryNames = marketplace.connectorCategories.map((item) => item.category);
  const permissionNames = marketplace.permissionModel.map((item) => item.permission);

  const missingCategories = requiredCategories.filter((item) => !categoryNames.includes(item));
  const missingPermissions = requiredPermissions.filter((item) => !permissionNames.includes(item));
  const missingBlockedActions = requiredBlockedActions.filter(
    (item) => !marketplace.blockedConnectorActions.includes(item)
  );

  const checks = [
    {
      name: "Marketplace foundation is ready",
      passed: marketplace.status === "marketplace_foundation_ready",
      detail: marketplace.status,
    },
    {
      name: "Connector categories present",
      passed: missingCategories.length === 0,
      detail: missingCategories.length
        ? `Missing: ${missingCategories.join(", ")}`
        : "All connector categories present.",
    },
    {
      name: "Permission model present",
      passed: missingPermissions.length === 0,
      detail: missingPermissions.length
        ? `Missing: ${missingPermissions.join(", ")}`
        : "All connector permissions present.",
    },
    {
      name: "Credential safety requirements present",
      passed: marketplace.credentialSafetyRequirements.length >= 7,
      detail: `${marketplace.credentialSafetyRequirements.length} credential safety requirements`,
    },
    {
      name: "Connector manifest shape present",
      passed: Boolean(
        marketplace.connectorManifestShape.connectorId &&
          marketplace.connectorManifestShape.permissionsRequested &&
          marketplace.connectorManifestShape.actions.length >= 1
      ),
      detail: "Connector manifest schema defined.",
    },
    {
      name: "Marketplace listing shape present",
      passed: Boolean(
        marketplace.marketplaceListingShape.listingId &&
          marketplace.marketplaceListingShape.requiredPermissions &&
          marketplace.marketplaceListingShape.setupSteps.length >= 3
      ),
      detail: "Marketplace listing schema defined.",
    },
    {
      name: "Webhook rules present",
      passed: marketplace.webhookRules.length >= 6,
      detail: `${marketplace.webhookRules.length} webhook rules`,
    },
    {
      name: "Install review workflow present",
      passed: marketplace.installReviewWorkflow.length >= 8,
      detail: `${marketplace.installReviewWorkflow.length} install workflow steps`,
    },
    {
      name: "Blocked connector actions present",
      passed: missingBlockedActions.length === 0,
      detail: missingBlockedActions.length
        ? `Missing: ${missingBlockedActions.join(", ")}`
        : "Core blocked connector actions present.",
    },
    {
      name: "Initial marketplace connectors present",
      passed: marketplace.initialMarketplaceConnectors.length >= 5,
      detail: `${marketplace.initialMarketplaceConnectors.length} initial connectors`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v17.4 Phase 194",
    service: "Connector Marketplace Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    connectorCategoryCount: marketplace.connectorCategories.length,
    permissionCount: marketplace.permissionModel.length,
    credentialSafetyCount: marketplace.credentialSafetyRequirements.length,
    webhookRuleCount: marketplace.webhookRules.length,
    installWorkflowStepCount: marketplace.installReviewWorkflow.length,
    initialConnectorCount: marketplace.initialMarketplaceConnectors.length,
    checks,
  });
}
