import {
  getSampleGitHubConnectorManifest,
  validateConnectorManifest,
} from "@/lib/sovereign/connector-manifest-validator";
import { getConnectorMarketplaceFoundation } from "@/lib/sovereign/connector-marketplace-foundation";

export function getConnectorInstallReview() {
  const marketplace = getConnectorMarketplaceFoundation();
  const sampleManifest = getSampleGitHubConnectorManifest();
  const validation = validateConnectorManifest(sampleManifest);

  return {
    system: "OmegaCrownAI Connector Install Review UI",
    phase: "v17.6 Phase 196",
    status: "install_review_ready",
    purpose:
      "Show connector permissions, risks, approval gates, credential rules, blocked actions, and validation status before any connector is installed or activated.",
    corePrinciple:
      "No connector should be installed silently. The user/admin must see what it can read, draft, write, publish, store, or block before activation.",

    sampleConnector: {
      connectorId: sampleManifest.connectorId,
      name: sampleManifest.name,
      category: sampleManifest.category,
      version: sampleManifest.version,
      authType: sampleManifest.authType,
      riskLevel: sampleManifest.riskLevel,
      permissionsRequested: sampleManifest.permissionsRequested,
      actionCount: sampleManifest.actions?.length || 0,
      healthcheck: sampleManifest.healthcheck,
      disconnectPolicy: sampleManifest.disconnectPolicy,
      dataRetentionPolicy: sampleManifest.dataRetentionPolicy,
      validationOk: validation.ok,
      validationScore: validation.score,
      validationWarnings: validation.warnings,
      validationErrors: validation.errors,
    },

    reviewSections: [
      {
        section: "Connector identity",
        description:
          "Shows connector name, category, version, auth type, and marketplace listing status.",
      },
      {
        section: "Permission review",
        description:
          "Shows requested permissions and explains read, draft write, external write, financial, and secret-management scopes.",
      },
      {
        section: "Risk review",
        description:
          "Shows low, medium, high, or blocked-by-default risk level before installation.",
      },
      {
        section: "Action review",
        description:
          "Shows each connector action, input/output schema, approval gate, and audit requirement.",
      },
      {
        section: "Credential safety",
        description:
          "Shows OAuth/API-key/webhook safety rules and warns that secrets must stay server-side.",
      },
      {
        section: "Healthcheck and disconnect",
        description:
          "Shows how the connector is tested, revoked, disconnected, and cleaned up.",
      },
      {
        section: "Blocked action review",
        description:
          "Shows actions that cannot run by default: financial actions, destructive deletes, secret exposure, public publishing, and live trading.",
      },
    ],

    installDecisionStates: [
      {
        state: "ready_for_review",
        meaning: "Manifest exists but user/admin has not approved installation.",
      },
      {
        state: "validation_failed",
        meaning: "Manifest failed safety or schema validation and cannot be installed.",
      },
      {
        state: "approval_required",
        meaning: "Connector includes high-risk or external-write capabilities.",
      },
      {
        state: "approved_for_install",
        meaning: "Connector passed validation and user/admin approved scoped installation.",
      },
      {
        state: "installed_limited",
        meaning: "Connector is installed with read/draft permissions only.",
      },
      {
        state: "installed_active",
        meaning: "Connector is installed and active under approved permission gates.",
      },
      {
        state: "blocked",
        meaning: "Connector is blocked due to unsafe permissions, secrets, financial actions, or missing audit requirements.",
      },
    ],

    adminChecklist: [
      "Confirm connector identity and category.",
      "Review requested permissions.",
      "Confirm auth type is allowed.",
      "Review every action and approval gate.",
      "Confirm all actions require audit.",
      "Confirm no secrets are exposed client-side.",
      "Run connector manifest validator.",
      "Run connector healthcheck before activation.",
      "Confirm disconnect and data retention policy.",
      "Approve only the minimum required scope.",
    ],

    uiRequirements: [
      "Show connector risk level prominently.",
      "Show requested permissions as badges.",
      "Show blocked-by-default warnings in red/critical state.",
      "Show validation score before approval.",
      "Show install workflow steps.",
      "Link to manifest validator API.",
      "Link to connector marketplace smoke test.",
      "Explain that external writes require explicit approval.",
      "Explain that financial actions are blocked by default.",
    ],

    marketplaceInstallFlow: marketplace.installReviewWorkflow,

    blockedConnectorActions: marketplace.blockedConnectorActions,

    apiLinks: [
      "/api/sovereign/connector-marketplace-foundation",
      "/api/sovereign/connector-marketplace-smoke-test",
      "/api/sovereign/connector-manifest-validator",
      "/api/sovereign/connector-manifest-validator-smoke-test",
    ],
  };
}
