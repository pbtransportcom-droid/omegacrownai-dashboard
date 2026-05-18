export function getRealConnectorInstallStore() {
  return {
    system: "OmegaCrownAI Real Connector Install Store",
    phase: "v18.2 Phase 202",
    status: "install_store_blueprint_ready",
    purpose:
      "Define durable connector installation records so OmegaCrownAI can track installed connectors, permissions, credential references, healthchecks, disconnects, and audit linkage without storing raw secrets.",
    corePrinciple:
      "Connector installs must be persisted with scoped permissions, review status, audit linkage, credential references, health state, and safe disconnect/revoke paths.",

    tables: [
      {
        name: "connector_installs",
        purpose: "Canonical installed connector record.",
        fields: [
          "id",
          "connector_id",
          "workspace_id",
          "installed_by",
          "install_status",
          "risk_level",
          "auth_type",
          "credential_ref",
          "created_at",
          "updated_at",
          "disconnected_at",
        ],
      },
      {
        name: "connector_permission_grants",
        purpose: "Stores approved connector permission scopes.",
        fields: [
          "id",
          "connector_install_id",
          "permission",
          "approval_gate",
          "approved_by",
          "approved_at",
          "expires_at",
          "revoked_at",
        ],
      },
      {
        name: "connector_healthchecks",
        purpose: "Stores connector healthcheck results.",
        fields: [
          "id",
          "connector_install_id",
          "status",
          "checked_at",
          "latency_ms",
          "error_class",
          "details_json",
        ],
      },
      {
        name: "connector_disconnect_events",
        purpose: "Stores disconnect/revoke events and cleanup status.",
        fields: [
          "id",
          "connector_install_id",
          "requested_by",
          "revocation_status",
          "cache_cleanup_status",
          "audit_event_id",
          "created_at",
        ],
      },
    ],

    installStatuses: [
      "ready_for_review",
      "validation_failed",
      "approval_required",
      "approved_for_install",
      "installed_limited",
      "installed_active",
      "healthcheck_failed",
      "disconnected",
      "blocked",
    ],

    credentialStorageRules: [
      "Do not store raw OAuth tokens in connector install records.",
      "Do not store API keys, passwords, webhook secrets, or private credentials in app tables.",
      "Store credential_ref pointing to a server-side secret manager or encrypted vault.",
      "credential_ref must be opaque and non-sensitive.",
      "Disconnect must revoke provider access where possible.",
      "Audit install, permission grant, healthcheck failure, and disconnect events.",
    ],

    installRecordShape: {
      installId: "stable connector install id",
      connectorId: "connector identifier such as github",
      workspaceId: "workspace or tenant id",
      installedBy: "actor/user id",
      installStatus: "ready_for_review | installed_active | blocked | disconnected",
      riskLevel: "low | medium | high | blocked_by_default",
      authType: "oauth | api_key | service_account | webhook_secret | local",
      credentialRef: "opaque secret reference only, never raw secret",
      permissions: [
        {
          permission: "connector_read",
          approvalGate: "read_only",
          approvedBy: "admin",
          approvedAt: "ISO timestamp",
        },
      ],
      healthcheck: {
        status: "not_run | healthy | degraded | failed",
        checkedAt: "ISO timestamp",
        errorClass: "optional",
      },
      auditEventIds: ["linked audit event ids"],
    },

    sampleInstalls: [
      {
        connectorId: "github",
        installStatus: "installed_limited",
        riskLevel: "medium",
        authType: "oauth",
        credentialRef: "secret_ref/github/workspace/demo",
        permissions: ["connector_read", "connector_write_draft"],
        healthcheckStatus: "healthy",
      },
      {
        connectorId: "stripe",
        installStatus: "approval_required",
        riskLevel: "blocked_by_default",
        authType: "api_key",
        credentialRef: "secret_ref/stripe/workspace/demo",
        permissions: ["connector_read"],
        healthcheckStatus: "not_run",
      },
    ],

    requiredInstallFlow: [
      "Validate connector manifest.",
      "Show install review UI.",
      "Run permission gate decision.",
      "Create install record with no raw secrets.",
      "Store credential reference only.",
      "Create permission grant records.",
      "Run connector healthcheck.",
      "Create audit event link.",
      "Expose disconnect/revoke path.",
    ],

    nextImplementationPhases: [
      "GitHub OAuth Connector Implementation",
      "Execution Runner Persistent Action Log",
      "Connector Install Database Migration",
      "Connector Install UI",
      "Connector Disconnect API",
    ],
  };
}
