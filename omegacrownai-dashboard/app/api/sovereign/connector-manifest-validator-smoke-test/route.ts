import { NextResponse } from "next/server";
import {
  getConnectorManifestValidator,
  getSampleGitHubConnectorManifest,
  validateConnectorManifest,
} from "@/lib/sovereign/connector-manifest-validator";

export async function GET() {
  const validator = getConnectorManifestValidator();
  const sampleManifest = getSampleGitHubConnectorManifest();
  const validResult = validateConnectorManifest(sampleManifest);

  const invalidFinancialManifest = {
    ...sampleManifest,
    connectorId: "unsafe-payments",
    name: "Unsafe Payments",
    category: "payments_billing",
    permissionsRequested: ["connector_read", "connector_financial_action"],
    riskLevel: "medium",
    actions: [
      {
        actionId: "payments.charge_card",
        name: "Charge customer card",
        inputSchema: "customerId, amount",
        outputSchema: "charge result",
        approvalGate: "external_write",
        auditRequired: true,
      },
    ],
  };

  const invalidResult = validateConnectorManifest(invalidFinancialManifest);

  const checks = [
    {
      name: "Validator is ready",
      passed: validator.status === "validator_ready",
      detail: validator.status,
    },
    {
      name: "Required manifest fields present",
      passed: validator.requiredManifestFields.length >= 11,
      detail: `${validator.requiredManifestFields.length} manifest fields`,
    },
    {
      name: "Required action fields present",
      passed: validator.requiredActionFields.length >= 6,
      detail: `${validator.requiredActionFields.length} action fields`,
    },
    {
      name: "Allowed permissions present",
      passed:
        validator.allowedPermissions.includes("connector_read") &&
        validator.allowedPermissions.includes("connector_external_write") &&
        validator.allowedPermissions.includes("connector_financial_action"),
      detail: `${validator.allowedPermissions.length} allowed permissions`,
    },
    {
      name: "Sample GitHub manifest passes",
      passed: validResult.ok,
      detail: validResult.ok ? "GitHub sample passed validation." : validResult.errors.join(", "),
    },
    {
      name: "Unsafe financial manifest is blocked",
      passed: !invalidResult.ok,
      detail: invalidResult.errors.join(", "),
    },
    {
      name: "Blocked validation rules present",
      passed: validator.blockedValidationRules.length >= 7,
      detail: `${validator.blockedValidationRules.length} blocked validation rules`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v17.5 Phase 195",
    service: "Connector Manifest Validator Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    requiredManifestFieldCount: validator.requiredManifestFields.length,
    requiredActionFieldCount: validator.requiredActionFields.length,
    allowedCategoryCount: validator.allowedCategories.length,
    allowedPermissionCount: validator.allowedPermissions.length,
    allowedAuthTypeCount: validator.allowedAuthTypes.length,
    sampleScore: validResult.score,
    invalidBlocked: !invalidResult.ok,
    checks,
  });
}
