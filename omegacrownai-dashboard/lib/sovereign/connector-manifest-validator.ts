import { getConnectorMarketplaceFoundation } from "@/lib/sovereign/connector-marketplace-foundation";

type ConnectorManifestAction = {
  actionId?: string;
  name?: string;
  inputSchema?: string;
  outputSchema?: string;
  approvalGate?: string;
  auditRequired?: boolean;
};

type ConnectorManifest = {
  connectorId?: string;
  name?: string;
  category?: string;
  version?: string;
  authType?: string;
  permissionsRequested?: string[];
  riskLevel?: string;
  actions?: ConnectorManifestAction[];
  healthcheck?: string;
  disconnectPolicy?: string;
  dataRetentionPolicy?: string;
};

const allowedAuthTypes = [
  "oauth",
  "api_key",
  "service_account",
  "webhook_secret",
  "local",
];

const allowedRiskLevels = ["low", "medium", "high", "blocked_by_default"];

const allowedApprovalGates = [
  "read_only",
  "artifact_generation",
  "workspace_write",
  "external_write",
  "blocked_by_default",
];

const highRiskKeywords = [
  "send",
  "publish",
  "charge",
  "refund",
  "transfer",
  "trade",
  "delete",
  "deploy",
  "external write",
];

export function getSampleGitHubConnectorManifest(): ConnectorManifest {
  return {
    connectorId: "github",
    name: "GitHub",
    category: "development",
    version: "0.1.0",
    authType: "oauth",
    permissionsRequested: ["connector_read", "connector_write_draft"],
    riskLevel: "medium",
    actions: [
      {
        actionId: "github.read_issues",
        name: "Read GitHub issues",
        inputSchema: "repository, labels, state",
        outputSchema: "issue list",
        approvalGate: "read_only",
        auditRequired: true,
      },
      {
        actionId: "github.prepare_pull_request",
        name: "Prepare pull request draft",
        inputSchema: "branch, title, body, changed files",
        outputSchema: "pull request draft metadata",
        approvalGate: "workspace_write",
        auditRequired: true,
      },
    ],
    healthcheck: "Verify repository access and scopes.",
    disconnectPolicy: "Revoke OAuth token and remove cached repository metadata.",
    dataRetentionPolicy: "Store only required issue/PR metadata and delete on disconnect.",
  };
}

export function validateConnectorManifest(manifest: ConnectorManifest) {
  const marketplace = getConnectorMarketplaceFoundation();

  const allowedCategories = marketplace.connectorCategories.map((item) => item.category);
  const allowedPermissions = marketplace.permissionModel.map((item) => item.permission);

  const errors: string[] = [];
  const warnings: string[] = [];

  const requiredStringFields: Array<keyof ConnectorManifest> = [
    "connectorId",
    "name",
    "category",
    "version",
    "authType",
    "riskLevel",
    "healthcheck",
    "disconnectPolicy",
    "dataRetentionPolicy",
  ];

  requiredStringFields.forEach((field) => {
    if (!manifest[field] || typeof manifest[field] !== "string") {
      errors.push(`Missing or invalid required field: ${field}`);
    }
  });

  if (manifest.category && !allowedCategories.includes(manifest.category)) {
    errors.push(`Unsupported connector category: ${manifest.category}`);
  }

  if (manifest.authType && !allowedAuthTypes.includes(manifest.authType)) {
    errors.push(`Unsupported auth type: ${manifest.authType}`);
  }

  if (manifest.riskLevel && !allowedRiskLevels.includes(manifest.riskLevel)) {
    errors.push(`Unsupported risk level: ${manifest.riskLevel}`);
  }

  if (!Array.isArray(manifest.permissionsRequested) || manifest.permissionsRequested.length === 0) {
    errors.push("permissionsRequested must include at least one permission.");
  } else {
    const unknownPermissions = manifest.permissionsRequested.filter(
      (permission) => !allowedPermissions.includes(permission)
    );

    if (unknownPermissions.length) {
      errors.push(`Unknown permissions requested: ${unknownPermissions.join(", ")}`);
    }
  }

  if (!Array.isArray(manifest.actions) || manifest.actions.length === 0) {
    errors.push("Manifest must include at least one action.");
  } else {
    manifest.actions.forEach((action, index) => {
      if (!action.actionId) errors.push(`Action ${index + 1} missing actionId.`);
      if (!action.name) errors.push(`Action ${index + 1} missing name.`);
      if (!action.inputSchema) errors.push(`Action ${index + 1} missing inputSchema.`);
      if (!action.outputSchema) errors.push(`Action ${index + 1} missing outputSchema.`);
      if (!action.approvalGate || !allowedApprovalGates.includes(action.approvalGate)) {
        errors.push(`Action ${index + 1} has invalid approvalGate.`);
      }
      if (action.auditRequired !== true) {
        errors.push(`Action ${index + 1} must require audit.`);
      }

      const actionText = `${action.actionId || ""} ${action.name || ""}`.toLowerCase();
      const looksHighRisk = highRiskKeywords.some((keyword) => actionText.includes(keyword));

      if (looksHighRisk && action.approvalGate === "read_only") {
        errors.push(`Action ${index + 1} appears high-risk but uses read_only gate.`);
      }

      if (looksHighRisk && manifest.riskLevel === "low") {
        errors.push(`Action ${index + 1} appears high-risk but connector riskLevel is low.`);
      }
    });
  }

  if (
    manifest.permissionsRequested?.includes("connector_financial_action") &&
    manifest.riskLevel !== "blocked_by_default"
  ) {
    errors.push("Financial connector actions must be blocked_by_default.");
  }

  if (
    manifest.permissionsRequested?.includes("connector_external_write") &&
    manifest.riskLevel === "low"
  ) {
    errors.push("External write permission cannot be low risk.");
  }

  if (manifest.authType === "api_key") {
    warnings.push("API key connectors must use server-side secret storage and least-privilege keys.");
  }

  if (manifest.authType === "webhook_secret") {
    warnings.push("Webhook connectors must verify signatures/secrets and validate payload schemas.");
  }

  const credentialSafetyChecks = marketplace.credentialSafetyRequirements;

  return {
    ok: errors.length === 0,
    manifest,
    errors,
    warnings,
    score: errors.length === 0 ? (warnings.length ? 95 : 100) : Math.max(0, 100 - errors.length * 12),
    allowedCategories,
    allowedPermissions,
    allowedAuthTypes,
    allowedApprovalGates,
    credentialSafetyChecks,
    requiredPolicy:
      "Connector manifests must pass validation before install, execution, external write, marketplace approval, or customer-visible activation.",
  };
}

export function getConnectorManifestValidator() {
  const marketplace = getConnectorMarketplaceFoundation();
  const sampleManifest = getSampleGitHubConnectorManifest();
  const sampleValidation = validateConnectorManifest(sampleManifest);

  return {
    system: "OmegaCrownAI Sovereign Connector Manifest Validator",
    phase: "v17.5 Phase 195",
    status: "validator_ready",
    purpose:
      "Validate connector manifests before install or marketplace approval so integrations remain scoped, auditable, safe, and governed.",
    allowedAuthTypes,
    allowedRiskLevels,
    allowedApprovalGates,
    allowedCategories: marketplace.connectorCategories.map((item) => item.category),
    allowedPermissions: marketplace.permissionModel.map((item) => item.permission),
    requiredManifestFields: [
      "connectorId",
      "name",
      "category",
      "version",
      "authType",
      "permissionsRequested",
      "riskLevel",
      "actions",
      "healthcheck",
      "disconnectPolicy",
      "dataRetentionPolicy",
    ],
    requiredActionFields: [
      "actionId",
      "name",
      "inputSchema",
      "outputSchema",
      "approvalGate",
      "auditRequired",
    ],
    blockedValidationRules: [
      "Financial connector actions must be blocked_by_default.",
      "External write permission cannot be low risk.",
      "High-risk actions cannot use read_only approval gate.",
      "All actions must require audit.",
      "Unknown permissions are rejected.",
      "Unsupported auth types are rejected.",
      "Unsupported connector categories are rejected.",
    ],
    sampleManifest,
    sampleValidation,
  };
}
